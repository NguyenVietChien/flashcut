import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { turso } from "@/lib/turso";
import { searchSfxVectors } from "@/lib/pinecone";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { query, geminiKey, model } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        let searchTerms: string[] = [query];
        const geminiModel = model || "gemini-2.5-flash";

        // Tier 2: If Gemini key provided, expand keywords
        if (geminiKey) {
            try {
                const prompt = `Convert this natural language query into SFX search keywords.
Query: "${query}"
Return a JSON object: { "keywords": ["keyword1", "keyword2", ...], "mood": "optional mood filter" }
Return ONLY the JSON, no markdown.`;

                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
                        }),
                    }
                );

                if (geminiRes.ok) {
                    const data = await geminiRes.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (Array.isArray(parsed.keywords)) {
                            searchTerms = parsed.keywords;
                        }
                    }
                }
            } catch {
                // Fallback to raw query if Gemini fails
            }
        }

        // Tier 1: FTS search
        const ftsQuery = searchTerms.map(t => `"${t.replace(/"/g, "")}"`).join(" OR ");

        let results = await turso.execute({
            sql: `SELECT s.* FROM sfx_library s
                  JOIN sfx_fts f ON s.rowid = f.rowid
                  WHERE sfx_fts MATCH ?
                  ORDER BY rank
                  LIMIT 20`,
            args: [ftsQuery],
        });

        if (results.rows.length > 0) {
            return NextResponse.json({
                results: results.rows,
                searchTerms,
                method: "fts",
            });
        }

        // Tier 1.5: LIKE fallback
        const likePattern = `%${query}%`;
        results = await turso.execute({
            sql: `SELECT * FROM sfx_library
                  WHERE name LIKE ? OR category LIKE ? OR tags LIKE ? OR description LIKE ? OR subcategory LIKE ?
                  ORDER BY created_at DESC
                  LIMIT 20`,
            args: [likePattern, likePattern, likePattern, likePattern, likePattern],
        });

        if (results.rows.length >= 5) {
            return NextResponse.json({
                results: results.rows,
                searchTerms,
                method: "like",
            });
        }

        // Tier 3: Pinecone semantic search
        const likeResults = results.rows;
        const existingIds = new Set(likeResults.map((r: any) => r.id));

        try {
            const pineconeHits = await searchSfxVectors(query, 15);

            if (pineconeHits.length > 0) {
                // Get IDs not already found by LIKE search
                const newIds = pineconeHits
                    .filter(h => !existingIds.has(h.id))
                    .map(h => h.id);

                if (newIds.length > 0) {
                    const placeholders = newIds.map(() => "?").join(", ");
                    const pineconeRows = await turso.execute({
                        sql: `SELECT * FROM sfx_library WHERE id IN (${placeholders})`,
                        args: newIds,
                    });

                    // Merge: LIKE results first, then Pinecone results
                    const merged = [...likeResults, ...pineconeRows.rows];

                    return NextResponse.json({
                        results: merged,
                        searchTerms,
                        method: "pinecone",
                        pineconeMatches: pineconeHits.length,
                    });
                }
            }
        } catch {
            // Pinecone failed, continue with whatever we have
        }

        return NextResponse.json({
            results: likeResults,
            searchTerms,
            method: likeResults.length > 0 ? "like" : "none",
        });
    } catch (error) {
        console.error("SFX search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}

