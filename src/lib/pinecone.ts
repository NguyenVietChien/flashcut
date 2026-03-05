import { Pinecone } from "@pinecone-database/pinecone";

let _client: Pinecone | null = null;

function getClient(): Pinecone {
    if (!_client) {
        const apiKey = process.env.PINECONE_API_KEY;
        if (!apiKey) throw new Error("PINECONE_API_KEY is not set");
        _client = new Pinecone({ apiKey });
    }
    return _client;
}

const INDEX_NAME = process.env.PINECONE_INDEX || "sfx-library";
const NAMESPACE = "sfx";

/**
 * Upsert an SFX record into Pinecone with integrated inference.
 * Pinecone auto-embeds the "text" field using multilingual-e5-large.
 */
export async function upsertSfxVector(sfx: {
    id: string;
    name: string;
    category?: string | null;
    subcategory?: string | null;
    mood?: string | null;
    intensity?: string | null;
    tags?: string | null;
    description?: string | null;
    useCases?: string | null;
}) {
    try {
        const pc = getClient();
        const index = pc.index(INDEX_NAME);

        // Build rich text for embedding
        const parts = [sfx.name];
        if (sfx.category) parts.push(sfx.category);
        if (sfx.subcategory) parts.push(sfx.subcategory);
        if (sfx.mood) parts.push(sfx.mood);
        if (sfx.description) parts.push(sfx.description);
        if (sfx.useCases) parts.push(sfx.useCases);
        if (sfx.tags) {
            try {
                const tagArr = JSON.parse(sfx.tags);
                if (Array.isArray(tagArr)) parts.push(tagArr.join(", "));
            } catch {
                parts.push(sfx.tags);
            }
        }

        await index.namespace(NAMESPACE).upsertRecords({
            records: [{
                _id: sfx.id,
                text: parts.join(" | "),
                category: sfx.category || "",
                mood: sfx.mood || "",
                intensity: sfx.intensity || "",
            }],
        } as any);

        console.log(`[Pinecone] Upserted: ${sfx.id}`);
    } catch (error) {
        console.error("[Pinecone] Upsert failed:", error);
        // Non-blocking — don't throw
    }
}

/**
 * Delete an SFX record from Pinecone.
 */
export async function deleteSfxVector(id: string) {
    try {
        const pc = getClient();
        const index = pc.index(INDEX_NAME);
        await index.namespace(NAMESPACE).deleteOne({ id });
        console.log(`[Pinecone] Deleted: ${id}`);
    } catch (error) {
        console.error("[Pinecone] Delete failed:", error);
    }
}

/**
 * Semantic search for SFX using Pinecone integrated inference.
 * Returns array of { id, score }.
 */
export async function searchSfxVectors(query: string, topK = 10, filters?: Record<string, string>) {
    try {
        const pc = getClient();
        const index = pc.index(INDEX_NAME);

        const searchOpts: any = {
            query: { topK, inputs: { text: query } },
            fields: ["text", "category", "mood", "intensity"],
        };

        // Add metadata filters if provided
        if (filters && Object.keys(filters).length > 0) {
            const filterObj: Record<string, any> = {};
            for (const [k, v] of Object.entries(filters)) {
                if (v) filterObj[k] = { $eq: v };
            }
            if (Object.keys(filterObj).length > 0) {
                searchOpts.query.filter = filterObj;
            }
        }

        const results = await index.namespace(NAMESPACE).searchRecords(searchOpts);

        return (results.result?.hits || []).map((hit: any) => ({
            id: hit._id,
            score: hit._score,
        }));
    } catch (error) {
        console.error("[Pinecone] Search failed:", error);
        return [];
    }
}
