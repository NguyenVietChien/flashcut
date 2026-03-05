import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { turso } from "@/lib/turso";
import { upsertSfxVector } from "@/lib/pinecone";

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all SFX from Turso
        const results = await turso.execute("SELECT * FROM sfx_library");
        const rows = results.rows as any[];

        if (rows.length === 0) {
            return NextResponse.json({ message: "No SFX records to sync", synced: 0 });
        }

        // Upsert all records to Pinecone
        let synced = 0;
        let failed = 0;

        for (const row of rows) {
            try {
                await upsertSfxVector({
                    id: row.id,
                    name: row.name,
                    category: row.category,
                    subcategory: row.subcategory,
                    mood: row.mood,
                    intensity: row.intensity,
                    tags: row.tags,
                    description: row.description,
                    useCases: row.use_cases,
                });
                synced++;
            } catch {
                failed++;
            }
        }

        return NextResponse.json({
            message: `Synced ${synced}/${rows.length} records to Pinecone`,
            synced,
            failed,
            total: rows.length,
        });
    } catch (error) {
        console.error("Bulk sync error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
