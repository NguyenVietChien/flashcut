import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getTurso(): Client {
    if (!_client) {
        _client = createClient({
            url: process.env.TURSO_SFX_URL!,
            authToken: process.env.TURSO_SFX_TOKEN!,
        });
    }
    return _client;
}

// Re-export as turso for convenience (getter that lazily creates)
export const turso = new Proxy({} as Client, {
    get(_, prop) {
        const client = getTurso();
        const value = (client as any)[prop];
        return typeof value === "function" ? value.bind(client) : value;
    },
});
