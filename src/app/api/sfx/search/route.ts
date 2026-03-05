import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { searchSfxVectors } from "@/lib/pinecone";

/**
 * Public SFX search API — for PC client & web users
 * 3-tier: FTS → LIKE → Pinecone semantic
 * No Gemini expansion (server-side only, no user key needed)
 */
export async function POST(req: Request) {
    try {
        const { query, limit = 20 } = await req.json();

        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const maxResults = Math.min(Math.max(Number(limit), 1), 50);

        // Tier 1: FTS search
        const ftsQuery = `"${query.replace(/"/g, "")}"`;
        let results = await turso.execute({
            sql: `SELECT s.id, s.name, s.filename, s.cloudinary_url, s.duration_sec, s.category, s.subcategory, s.mood, s.intensity, s.tags, s.description, s.use_cases, s.is_loop
                  FROM sfx_library s
                  JOIN sfx_fts f ON s.rowid = f.rowid
                  WHERE sfx_fts MATCH ?
                  ORDER BY rank
                  LIMIT ?`,
            args: [ftsQuery, maxResults],
        });

        if (results.rows.length >= 5) {
            return NextResponse.json({
                results: results.rows,
                method: "fts",
                total: results.rows.length,
            });
        }

        // Tier 1.5: LIKE fallback
        const likePattern = `%${query}%`;
        results = await turso.execute({
            sql: `SELECT id, name, filename, cloudinary_url, duration_sec, category, subcategory, mood, intensity, tags, description, use_cases, is_loop
                  FROM sfx_library
                  WHERE name LIKE ? OR category LIKE ? OR tags LIKE ? OR description LIKE ? OR subcategory LIKE ? OR use_cases LIKE ?
                  ORDER BY created_at DESC
                  LIMIT ?`,
            args: [likePattern, likePattern, likePattern, likePattern, likePattern, likePattern, maxResults],
        });

        if (results.rows.length >= 5) {
            return NextResponse.json({
                results: results.rows,
                method: "like",
                total: results.rows.length,
            });
        }

        // Tier 3: Pinecone semantic search
        const likeResults = results.rows;
        const existingIds = new Set(likeResults.map((r: any) => r.id));

        try {
            const pineconeHits = await searchSfxVectors(query, 15);

            if (pineconeHits.length > 0) {
                const newIds = pineconeHits
                    .filter(h => !existingIds.has(h.id))
                    .map(h => h.id);

                if (newIds.length > 0) {
                    const placeholders = newIds.map(() => "?").join(", ");
                    const pineconeRows = await turso.execute({
                        sql: `SELECT id, name, filename, cloudinary_url, duration_sec, category, subcategory, mood, intensity, tags, description, use_cases, is_loop
                              FROM sfx_library WHERE id IN (${placeholders})`,
                        args: newIds,
                    });

                    const merged = [...likeResults, ...pineconeRows.rows];
                    return NextResponse.json({
                        results: merged,
                        method: "pinecone",
                        total: merged.length,
                    });
                }
            }
        } catch {
            // Pinecone failed, continue with LIKE results
        }

        return NextResponse.json({
            results: likeResults,
            method: likeResults.length > 0 ? "like" : "none",
            total: likeResults.length,
        });
    } catch (error) {
        console.error("SFX public search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
