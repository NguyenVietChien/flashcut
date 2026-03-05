import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

/**
 * Public SFX catalog API — PC client syncs this to local SQLite
 * Returns all SFX metadata (no file_size_bytes for smaller payload)
 * Supports pagination via cursor (last seen updated_at)
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const after = searchParams.get("after"); // ISO timestamp cursor
        const limit = Math.min(Math.max(Number(searchParams.get("limit") || 200), 1), 500);

        let results;
        if (after) {
            results = await turso.execute({
                sql: `SELECT id, name, filename, cloudinary_url, duration_sec, category, subcategory, mood, intensity, tags, description, use_cases, is_loop, updated_at
                      FROM sfx_library
                      WHERE updated_at > ?
                      ORDER BY updated_at ASC
                      LIMIT ?`,
                args: [after, limit],
            });
        } else {
            results = await turso.execute({
                sql: `SELECT id, name, filename, cloudinary_url, duration_sec, category, subcategory, mood, intensity, tags, description, use_cases, is_loop, updated_at
                      FROM sfx_library
                      ORDER BY updated_at ASC
                      LIMIT ?`,
                args: [limit],
            });
        }

        const rows = results.rows;
        const nextCursor = rows.length === limit ? (rows[rows.length - 1] as any).updated_at : null;

        return NextResponse.json({
            items: rows,
            count: rows.length,
            nextCursor,
        });
    } catch (error) {
        console.error("SFX catalog error:", error);
        return NextResponse.json({ error: "Catalog failed" }, { status: 500 });
    }
}
