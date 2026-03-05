import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function POST() {
    try {

        // Run migration: add use_cases column + rebuild FTS
        const statements = [
            `ALTER TABLE sfx_library ADD COLUMN use_cases TEXT`,
            `DROP TRIGGER IF EXISTS sfx_ai`,
            `DROP TRIGGER IF EXISTS sfx_ad`,
            `DROP TRIGGER IF EXISTS sfx_au`,
            `DROP TABLE IF EXISTS sfx_fts`,
            `CREATE VIRTUAL TABLE sfx_fts USING fts5(name, category, subcategory, mood, tags, description, use_cases, content='sfx_library', content_rowid='rowid')`,
            `INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description, use_cases) SELECT rowid, name, category, subcategory, mood, tags, description, use_cases FROM sfx_library`,
            `CREATE TRIGGER sfx_ai AFTER INSERT ON sfx_library BEGIN INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description, use_cases) VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description, new.use_cases); END`,
            `CREATE TRIGGER sfx_ad AFTER DELETE ON sfx_library BEGIN INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description, use_cases) VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description, old.use_cases); END`,
            `CREATE TRIGGER sfx_au AFTER UPDATE ON sfx_library BEGIN INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description, use_cases) VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description, old.use_cases); INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description, use_cases) VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description, new.use_cases); END`,
        ];

        const results = [];
        for (const sql of statements) {
            try {
                await turso.execute(sql);
                results.push({ sql: sql.substring(0, 60), status: "ok" });
            } catch (err: any) {
                // Skip "column already exists" errors
                if (err.message?.includes("duplicate column")) {
                    results.push({ sql: sql.substring(0, 60), status: "skipped (already exists)" });
                } else {
                    results.push({ sql: sql.substring(0, 60), status: "error", error: err.message });
                }
            }
        }

        return NextResponse.json({ message: "Migration complete", results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export { POST as GET };
