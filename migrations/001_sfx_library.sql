-- FlashCut SFX Library — Turso Schema (Phase 1)
-- Run: turso db shell sfxdb < migrations/001_sfx_library.sql

CREATE TABLE IF NOT EXISTS sfx_library (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    filename        TEXT NOT NULL,

    -- Cloudinary
    cloudinary_url  TEXT NOT NULL,

    -- Audio properties
    duration_sec    REAL,
    file_size_bytes INTEGER,

    -- AI metadata (Gemini analyzed)
    category        TEXT,
    subcategory     TEXT,
    mood            TEXT,
    intensity       TEXT,
    tags            TEXT,
    description     TEXT,
    is_loop         INTEGER DEFAULT 0,

    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

-- FTS5 for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS sfx_fts USING fts5(
    name, category, subcategory, mood, tags, description,
    content='sfx_library',
    content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS sfx_ai AFTER INSERT ON sfx_library BEGIN
    INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description)
    VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description);
END;

CREATE TRIGGER IF NOT EXISTS sfx_ad AFTER DELETE ON sfx_library BEGIN
    INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description)
    VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description);
END;

CREATE TRIGGER IF NOT EXISTS sfx_au AFTER UPDATE ON sfx_library BEGIN
    INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description)
    VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description);
    INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description)
    VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description);
END;
