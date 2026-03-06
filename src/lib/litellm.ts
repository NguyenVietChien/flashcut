/**
 * LiteLLM Proxy API Client
 * Server-side only — master key is never exposed to the client.
 */

const LITELLM_URL = process.env.LITELLM_URL || "https://llm.flashcutai.com";
const LITELLM_KEY = process.env.LITELLM_MASTER_KEY || "";

interface LiteLLMModel {
    model_id: string;
    model_name: string;
    litellm_params: {
        model: string;
        api_key?: string;
        [key: string]: unknown;
    };
    model_info: {
        id: string;
        db_model: boolean;
        created_at?: string;
        updated_at?: string;
        [key: string]: unknown;
    };
}

interface AddModelPayload {
    model_name: string;
    litellm_params: {
        model: string;
        api_key: string;
        [key: string]: unknown;
    };
    model_info?: Record<string, unknown>;
}

async function litellmFetch(path: string, options: RequestInit = {}) {
    const url = `${LITELLM_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LITELLM_KEY}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LiteLLM API error (${res.status}): ${text}`);
    }

    return res.json();
}

/** Get all models/keys registered in LiteLLM */
export async function getModels(): Promise<LiteLLMModel[]> {
    const data = await litellmFetch("/model/info");
    return data.data || [];
}

/** Add a new model+key to LiteLLM (stored in PostgreSQL) */
export async function addModel(payload: AddModelPayload) {
    return litellmFetch("/model/new", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/** Delete a model+key from LiteLLM */
export async function deleteModel(modelId: string) {
    return litellmFetch("/model/delete", {
        method: "POST",
        body: JSON.stringify({ id: modelId }),
    });
}

/** Mask an API key for display (show first 8 + last 4 chars) */
export function maskKey(key: string): string {
    if (!key || key.length < 16) return "••••••••";
    return `${key.slice(0, 8)}••••${key.slice(-4)}`;
}

/** Known provider configurations */
export const PROVIDERS = [
    { id: "gemini", name: "Google Gemini", prefix: "gemini/", models: ["gemini-2.5-flash", "gemini-2.5-pro"] },
    { id: "openai", name: "OpenAI", prefix: "openai/", models: ["gpt-4o", "gpt-4o-mini"] },
    { id: "anthropic", name: "Anthropic", prefix: "anthropic/", models: ["claude-sonnet-4-20250514"] },
    { id: "groq", name: "Groq", prefix: "groq/", models: ["llama-3.3-70b-versatile"] },
    { id: "deepgram", name: "Deepgram", prefix: "deepgram/", models: ["nova-2"] },
    { id: "elevenlabs", name: "ElevenLabs", prefix: "elevenlabs/", models: ["eleven_multilingual_v2", "scribe_v1"] },
] as const;

export type { LiteLLMModel, AddModelPayload };
