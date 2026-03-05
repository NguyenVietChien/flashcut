import { getTranslations } from "next-intl/server";
import { turso } from "@/lib/turso";
import { SfxAdminClient } from "./components";
import { FilterBar } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PAGE_SIZE } from "@/lib/constants";
import { Suspense } from "react";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

async function SfxContent({ searchParams }: { searchParams: SearchParams }) {
    const t = await getTranslations("admin");
    const params = await searchParams;

    let sfxItems: any[] = [];
    let total = 0;
    let error = "";
    let categories: string[] = [];
    let moods: string[] = [];

    try {
        // Build WHERE clauses from URL params
        const conditions: string[] = [];
        const args: any[] = [];

        if (params.category) {
            conditions.push("category = ?");
            args.push(params.category);
        }
        if (params.mood) {
            conditions.push("mood = ?");
            args.push(params.mood);
        }
        if (params.q) {
            // Use FTS5 for text search
            conditions.push("id IN (SELECT id FROM sfx_fts WHERE sfx_fts MATCH ?)");
            args.push(params.q);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Sort
        let orderBy = "ORDER BY created_at DESC";
        if (params.sort === "oldest") orderBy = "ORDER BY created_at ASC";
        if (params.sort === "name_asc") orderBy = "ORDER BY name ASC";
        if (params.sort === "name_desc") orderBy = "ORDER BY name DESC";

        // Pagination
        const page = Math.max(1, parseInt(params.page || "1"));
        const offset = (page - 1) * PAGE_SIZE;

        // Parallel: count + paginated data + distinct categories + distinct moods
        const [countResult, dataResult, catResult, moodResult] = await Promise.all([
            turso.execute({ sql: `SELECT COUNT(*) as cnt FROM sfx_library ${whereClause}`, args }),
            turso.execute({ sql: `SELECT * FROM sfx_library ${whereClause} ${orderBy} LIMIT ? OFFSET ?`, args: [...args, PAGE_SIZE, offset] }),
            turso.execute("SELECT DISTINCT category FROM sfx_library WHERE category IS NOT NULL ORDER BY category"),
            turso.execute("SELECT DISTINCT mood FROM sfx_library WHERE mood IS NOT NULL ORDER BY mood"),
        ]);

        total = (countResult.rows[0]?.cnt as number) || 0;
        categories = catResult.rows.map(r => r.category as string);
        moods = moodResult.rows.map(r => r.mood as string);

        sfxItems = dataResult.rows.map(row => ({
            id: row.id as string,
            name: row.name as string,
            filename: row.filename as string,
            cloudinary_url: row.cloudinary_url as string,
            duration_sec: row.duration_sec as number | null,
            file_size_bytes: row.file_size_bytes as number | null,
            category: row.category as string | null,
            subcategory: row.subcategory as string | null,
            mood: row.mood as string | null,
            intensity: row.intensity as string | null,
            tags: row.tags as string | null,
            description: row.description as string | null,
            is_loop: row.is_loop as number,
            created_at: row.created_at as string,
            updated_at: row.updated_at as string,
        }));
    } catch (e: any) {
        error = e.message || "Failed to fetch SFX data";
    }

    const labels = {
        sfx: t("sfx"),
        sfxSubtitle: t("sfxSubtitle"),
        addSfx: t("addSfx"),
        editSfx: t("editSfx"),
        deleteSfx: t("deleteSfx"),
        sfxName: t("sfxName"),
        filename: t("filename"),
        category: t("category"),
        subcategory: t("subcategory"),
        mood: t("mood"),
        intensity: t("intensity"),
        tags: t("tags"),
        durationSec: t("durationSec"),
        isLoop: t("isLoop"),
        uploadAudio: t("uploadAudio"),
        preview: t("preview"),
        analyze: t("analyze"),
        analyzing: t("analyzing"),
        geminiKey: t("geminiKey"),
        geminiKeyHint: t("geminiKeyHint"),
        searchTest: t("searchTest"),
        searchPlaceholder: t("searchPlaceholder"),
        searchResults: t("searchResults"),
        noSfx: t("noSfx"),
        noResults: t("noResults"),
        uploadFirst: t("uploadFirst"),
        cancel: t("cancel"),
        save: t("save"),
        create: t("create"),
        actions: t("actions"),
        confirm: t("confirm"),
        description: t("description"),
        sfxTotal: t("sfxTotal"),
    };

    return (
        <SfxAdminClient
            initialItems={sfxItems}
            labels={labels}
            dbError={error}
            total={total}
            categories={categories}
            moods={moods}
        />
    );
}

export default async function SfxAdminPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense>
            <SfxContent searchParams={searchParams} />
        </Suspense>
    );
}
