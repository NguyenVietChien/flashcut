-- Migration 002: Add use_cases column + update FTS for richer semantic search
-- Run: turso db shell sfxdb < migrations/002_add_use_cases.sql

-- Add use_cases column
ALTER TABLE sfx_library ADD COLUMN use_cases TEXT;

-- Recreate FTS table to include use_cases
DROP TRIGGER IF EXISTS sfx_ai;
DROP TRIGGER IF EXISTS sfx_ad;
DROP TRIGGER IF EXISTS sfx_au;
DROP TABLE IF EXISTS sfx_fts;

CREATE VIRTUAL TABLE sfx_fts USING fts5(
    name, category, subcategory, mood, tags, description, use_cases,
    content='sfx_library',
    content_rowid='rowid'
);

-- Re-populate FTS from existing data
INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description, use_cases)
SELECT rowid, name, category, subcategory, mood, tags, description, use_cases
FROM sfx_library;

-- Recreate triggers with use_cases
CREATE TRIGGER sfx_ai AFTER INSERT ON sfx_library BEGIN
    INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description, use_cases)
    VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description, new.use_cases);
END;

CREATE TRIGGER sfx_ad AFTER DELETE ON sfx_library BEGIN
    INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description, use_cases)
    VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description, old.use_cases);
END;

CREATE TRIGGER sfx_au AFTER UPDATE ON sfx_library BEGIN
    INSERT INTO sfx_fts(sfx_fts, rowid, name, category, subcategory, mood, tags, description, use_cases)
    VALUES('delete', old.rowid, old.name, old.category, old.subcategory, old.mood, old.tags, old.description, old.use_cases);
    INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description, use_cases)
    VALUES (new.rowid, new.name, new.category, new.subcategory, new.mood, new.tags, new.description, new.use_cases);
END;
