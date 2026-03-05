// Run: node migrations/run.mjs
import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const turso = createClient({
    url: process.env.TURSO_SFX_URL,
    authToken: process.env.TURSO_SFX_TOKEN,
});

// Execute statements individually (triggers need special handling)
const statements = [
    `CREATE TABLE IF NOT EXISTS sfx_library (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        filename        TEXT NOT NULL,
        cloudinary_url  TEXT NOT NULL,
        duration_sec    REAL,
        file_size_bytes INTEGER,
        category        TEXT,
        subcategory     TEXT,
        mood            TEXT,
        intensity       TEXT,
        tags            TEXT,
        description     TEXT,
        is_loop         INTEGER DEFAULT 0,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
    )`,

    `CREATE VIRTUAL TABLE IF NOT EXISTS sfx_fts USING fts5(
        name, category, subcategory, mood, tags, description,
        content='sfx_library',
        content_rowid='rowid'
    )`,

    `CREATE TRIGGER IF NOT EXISTS sfx_ai AFTER INSERT ON sfx_library BEGIN
        INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description)
        VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description);
    END`,

    `CREATE TRIGGER IF NOT EXISTS sfx_ad AFTER DELETE ON sfx_library BEGIN
        INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description)
        VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description);
    END`,

    `CREATE TRIGGER IF NOT EXISTS sfx_au AFTER UPDATE ON sfx_library BEGIN
        INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description)
        VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description);
        INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description)
        VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description);
    END`,
];

console.log(`Running ${statements.length} statements...`);

for (const stmt of statements) {
    try {
        await turso.execute(stmt);
        console.log("✓", stmt.substring(0, 70).replace(/\n/g, " ") + "...");
    } catch (e) {
        console.error("✗", stmt.substring(0, 70).replace(/\n/g, " "));
        console.error("  Error:", e.message);
    }
}

console.log("\nVerifying...");
const tables = await turso.execute("SELECT name FROM sqlite_master WHERE type IN ('table','trigger')");
console.log("Objects:", tables.rows.map(r => r.name));

process.exit(0);
