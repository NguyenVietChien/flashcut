# FlashCut SFX Client Integration Guide

> **Version:** 1.0  
> **Last Updated:** 2026-03-05  
> **Base URL:** `https://flashcut.ai` (production) · `http://localhost:3000` (dev)  
> **Audience:** PC Client developers (Python/PyQt6)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Reference](#2-api-reference)
   - 2.1 [Search SFX](#21-search-sfx)
   - 2.2 [Catalog Sync](#22-catalog-sync)
3. [Data Schema](#3-data-schema)
4. [Client-Side Integration](#4-client-side-integration)
   - 4.1 [SFX Service Class](#41-sfx-service-class)
   - 4.2 [Local SQLite Cache](#42-local-sqlite-cache)
   - 4.3 [Hybrid Search Flow](#43-hybrid-search-flow)
   - 4.4 [Audio Cache Management](#44-audio-cache-management)
5. [Search Behavior & Tiers](#5-search-behavior--tiers)
6. [Error Handling & Resilience](#6-error-handling--resilience)
7. [Performance Guidelines](#7-performance-guidelines)
8. [Migration & Versioning](#8-migration--versioning)

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│  FlashCut PC Client                                    │
│                                                        │
│  ┌──────────────────────┐   ┌───────────────────────┐  │
│  │  Local SQLite Cache  │   │  Audio File Cache     │  │
│  │  sfx_catalog.db      │   │  AppData/.../sfx/     │  │
│  │  ├ sfx_library       │   │  ├ abc123.mp3         │  │
│  │  ├ sfx_fts (FTS5)    │   │  ├ def456.mp3         │  │
│  │  ├ favorites         │   │  └ ...                │  │
│  │  └ search_history    │   └───────────────────────┘  │
│  └──────────┬───────────┘                              │
│             │ offline search                           │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SFX Service (sfx_service.py)                    │  │
│  │                                                   │  │
│  │  search(query) ──→ ① Local FTS (offline, <5ms)   │  │
│  │                  ──→ ② API search (online, ~300ms)│  │
│  │                       POST /api/sfx/search        │  │
│  │                       (FTS → LIKE → Pinecone)     │  │
│  │                                                   │  │
│  │  sync()       ──→ GET /api/sfx/catalog            │  │
│  │  download()   ──→ GET cloudinary_url              │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ↓
┌────────────────────────────────────────────────────────┐
│  FlashCut Web Server (Next.js / Vercel)                │
│                                                        │
│  /api/sfx/search    → Turso FTS + LIKE + Pinecone     │
│  /api/sfx/catalog   → Turso (paginated metadata)      │
│                                                        │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │  Turso   │   │  Pinecone    │   │  Cloudinary   │  │
│  │  (SQL)   │   │  (Vectors)   │   │  (Audio CDN)  │  │
│  └──────────┘   └──────────────┘   └───────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Key Principle:** Online-first, offline-capable. Khi có internet, client gọi API để tận dụng full 3-tier search (bao gồm Pinecone semantic). Khi offline, fallback sang local FTS trên SQLite cache.

---

## 2. API Reference

### 2.1 Search SFX

Tìm kiếm SFX với cơ chế 3-tier tự động: Full-Text Search → Pattern Matching → Pinecone Semantic Search.

```
POST /api/sfx/search
Content-Type: application/json
```

#### Request Body

| Field   | Type   | Required | Default | Description                      |
|---------|--------|----------|---------|----------------------------------|
| `query` | string | ✅       | —       | Từ khóa hoặc mô tả tự nhiên     |
| `limit` | number | ❌       | `20`    | Số kết quả tối đa (1–50)        |

#### Request Example

```json
{
  "query": "tiếng kiếm sắc bén",
  "limit": 15
}
```

#### Response

```json
{
  "results": [
    {
      "id": "sfx_01jce8k2m5n7p",
      "name": "Sword Slash Metal",
      "filename": "sword_slash_metal.mp3",
      "cloudinary_url": "https://res.cloudinary.com/xxx/video/upload/v123/sfx/sword_slash_metal.mp3",
      "duration_sec": 1.2,
      "category": "weapon",
      "subcategory": "sword",
      "mood": "dramatic",
      "intensity": "high",
      "tags": "[\"sword\",\"slash\",\"metal\",\"kiếm\",\"chém\"]",
      "description": "Sharp metallic sword slash with resonant ring. Âm thanh chém kiếm sắc bén kèm tiếng kim loại vang.",
      "use_cases": "action movie, anime battle, game combat, phim hành động, cảnh đánh kiếm",
      "is_loop": 0
    }
  ],
  "method": "fts",
  "total": 8
}
```

#### Response Fields

| Field     | Type     | Description                                                |
|-----------|----------|------------------------------------------------------------|
| `results` | array    | Danh sách SFX items (xem [Data Schema](#3-data-schema))   |
| `method`  | string   | Tier đã sử dụng: `"fts"`, `"like"`, `"pinecone"`, `"none"` |
| `total`   | number   | Tổng số kết quả trả về                                    |

#### Method Values

| Method     | Meaning                                       | Latency  |
|------------|-----------------------------------------------|----------|
| `fts`      | Full-Text Search match — chính xác nhất       | ~50ms    |
| `like`     | Pattern matching — partial match              | ~100ms   |
| `pinecone` | Semantic search — AI hiểu ngữ nghĩa          | ~300ms   |
| `none`     | Không tìm thấy kết quả nào                   | —        |

#### Error Responses

| Status | Body                                  | Cause                  |
|--------|---------------------------------------|------------------------|
| `400`  | `{"error": "Query is required"}`      | Missing/invalid query  |
| `500`  | `{"error": "Search failed"}`          | Server internal error  |

---

### 2.2 Catalog Sync

Trả về toàn bộ SFX metadata cho client cache local. Hỗ trợ cursor-based pagination để incremental sync.

```
GET /api/sfx/catalog?limit=200&after=2026-03-05T12:00:00
```

#### Query Parameters

| Param   | Type   | Required | Default | Description                                         |
|---------|--------|----------|---------|-----------------------------------------------------|
| `limit` | number | ❌       | `200`   | Số items mỗi page (1–500)                           |
| `after` | string | ❌       | —       | ISO timestamp cursor — chỉ lấy records updated sau  |

#### Response

```json
{
  "items": [
    {
      "id": "sfx_01jce8k2m5n7p",
      "name": "Sword Slash Metal",
      "filename": "sword_slash_metal.mp3",
      "cloudinary_url": "https://res.cloudinary.com/xxx/...",
      "duration_sec": 1.2,
      "category": "weapon",
      "subcategory": "sword",
      "mood": "dramatic",
      "intensity": "high",
      "tags": "[\"sword\",\"slash\",\"metal\"]",
      "description": "Sharp sword slash...",
      "use_cases": "action movie, anime battle...",
      "is_loop": 0,
      "updated_at": "2026-03-05 14:30:00"
    }
  ],
  "count": 200,
  "nextCursor": "2026-03-05 14:30:00"
}
```

#### Pagination Logic

```python
# Full sync (lần đầu)
cursor = None
all_items = []

while True:
    url = f"{BASE_URL}/api/sfx/catalog?limit=200"
    if cursor:
        url += f"&after={cursor}"
    
    resp = requests.get(url).json()
    all_items.extend(resp["items"])
    
    if resp["nextCursor"] is None:
        break  # Hết data
    cursor = resp["nextCursor"]

# Incremental sync (các lần sau)
# Lưu cursor cuối → dùng làm "after" cho lần sync tiếp
```

---

## 3. Data Schema

### SFX Item

| Field            | Type           | Nullable | Description                                          |
|------------------|----------------|----------|------------------------------------------------------|
| `id`             | `string`       | No       | Unique ID (nanoid format, ví dụ `sfx_01jce8k2m5n7p`) |
| `name`           | `string`       | No       | Tên hiển thị SFX                                     |
| `filename`       | `string`       | No       | Tên file gốc                                         |
| `cloudinary_url` | `string`       | No       | URL download/stream audio từ Cloudinary CDN          |
| `duration_sec`   | `number\|null` | Yes      | Thời lượng audio (giây)                              |
| `category`       | `string\|null` | Yes      | Danh mục chính: `weapon`, `nature`, `ui`, `ambient`... |
| `subcategory`    | `string\|null` | Yes      | Phân loại phụ: `sword`, `rain`, `click`...           |
| `mood`           | `string\|null` | Yes      | Cảm xúc: `dramatic`, `calm`, `tense`, `happy`...    |
| `intensity`      | `string\|null` | Yes      | Cường độ: `low`, `medium`, `high`                    |
| `tags`           | `string\|null` | Yes      | JSON array string: `'["sword","metal","kiếm"]'`     |
| `description`    | `string\|null` | Yes      | Mô tả chi tiết (đa ngữ EN + VI)                     |
| `use_cases`      | `string\|null` | Yes      | Bối cảnh sử dụng (comma-separated)                  |
| `is_loop`        | `number`       | No       | `0` = one-shot, `1` = loop-able                      |
| `updated_at`     | `string`       | Yes      | ISO timestamp (chỉ trong catalog response)           |

### Tags Format

Tags được lưu dạng JSON array string. Client cần parse:

```python
import json

tags_str = '["sword","slash","metal","kiếm","chém"]'
tags_list = json.loads(tags_str)  # → ["sword", "slash", "metal", "kiếm", "chém"]
```

---

## 4. Client-Side Integration

### 4.1 SFX Service Class

```python
"""
sfx_service.py — FlashCut SFX Search & Cache Service

Hybrid search: Online API (3-tier) + Offline local FTS
"""
import json
import sqlite3
import os
import time
import requests
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

# ---------- Configuration ----------

BASE_URL = "https://flashcut.ai"  # hoặc "http://localhost:3000" khi dev
SFX_CACHE_DIR = Path(os.getenv("LOCALAPPDATA", "")) / "FlashCut" / "sfx_cache"
SFX_DB_PATH = SFX_CACHE_DIR / "sfx_catalog.db"
MAX_CACHE_SIZE_MB = 500
CACHE_EXPIRY_DAYS = 30
REQUEST_TIMEOUT = 10  # seconds


@dataclass
class SfxItem:
    """Represents a single SFX entry."""
    id: str
    name: str
    filename: str
    cloudinary_url: str
    duration_sec: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    mood: Optional[str] = None
    intensity: Optional[str] = None
    tags: Optional[str] = None
    description: Optional[str] = None
    use_cases: Optional[str] = None
    is_loop: int = 0
    
    @property
    def tags_list(self) -> list[str]:
        if not self.tags:
            return []
        try:
            return json.loads(self.tags)
        except (json.JSONDecodeError, TypeError):
            return [self.tags]
    
    @property
    def use_cases_list(self) -> list[str]:
        if not self.use_cases:
            return []
        return [uc.strip() for uc in self.use_cases.split(",")]


class SfxService:
    """
    Hybrid SFX search service.
    
    - Online:  POST /api/sfx/search (FTS → LIKE → Pinecone)
    - Offline: Local SQLite FTS5
    - Sync:    GET /api/sfx/catalog (incremental)
    """
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self._db: Optional[sqlite3.Connection] = None
        self._ensure_cache_dir()
        self._init_local_db()
    
    # ==========================================
    # PUBLIC API
    # ==========================================
    
    def search(self, query: str, limit: int = 20) -> list[SfxItem]:
        """
        Hybrid search: API first, fallback to local FTS.
        
        Args:
            query: Search text (keyword or natural language)
            limit: Max results (1-50)
        
        Returns:
            List of SfxItem sorted by relevance
        """
        # Strategy: Try online API first (full 3-tier search)
        try:
            results = self._search_online(query, limit)
            if results:
                return results
        except (requests.ConnectionError, requests.Timeout):
            pass  # Offline — fall through to local
        
        # Fallback: Local FTS search
        return self._search_local(query, limit)
    
    def sync_catalog(self) -> int:
        """
        Incremental sync SFX catalog from server.
        
        Returns:
            Number of items synced
        """
        last_cursor = self._get_last_sync_cursor()
        total_synced = 0
        
        while True:
            url = f"{self.base_url}/api/sfx/catalog?limit=200"
            if last_cursor:
                url += f"&after={last_cursor}"
            
            try:
                resp = requests.get(url, timeout=REQUEST_TIMEOUT)
                resp.raise_for_status()
                data = resp.json()
            except (requests.RequestException, ValueError):
                break
            
            items = data.get("items", [])
            if not items:
                break
            
            self._upsert_items(items)
            total_synced += len(items)
            
            next_cursor = data.get("nextCursor")
            if not next_cursor:
                break
            last_cursor = next_cursor
        
        if last_cursor:
            self._set_last_sync_cursor(last_cursor)
        
        return total_synced
    
    def get_audio_path(self, sfx: SfxItem) -> Optional[Path]:
        """
        Get local path to audio file. Downloads if not cached.
        
        Args:
            sfx: SFX item to get audio for
        
        Returns:
            Path to local audio file, or None if download fails
        """
        cached_path = self._get_cached_audio(sfx.id)
        if cached_path and cached_path.exists():
            self._update_cache_usage(sfx.id)
            return cached_path
        
        # Download from Cloudinary
        try:
            return self._download_audio(sfx)
        except Exception:
            return None
    
    def get_favorites(self) -> list[SfxItem]:
        """Get all favorited SFX items."""
        db = self._get_db()
        rows = db.execute("""
            SELECT s.* FROM sfx_library s
            JOIN favorites f ON s.id = f.sfx_id
            ORDER BY f.added_at DESC
        """).fetchall()
        return [self._row_to_item(r) for r in rows]
    
    def toggle_favorite(self, sfx_id: str) -> bool:
        """Toggle favorite status. Returns True if now favorited."""
        db = self._get_db()
        existing = db.execute(
            "SELECT 1 FROM favorites WHERE sfx_id = ?", (sfx_id,)
        ).fetchone()
        
        if existing:
            db.execute("DELETE FROM favorites WHERE sfx_id = ?", (sfx_id,))
            db.commit()
            return False
        else:
            db.execute(
                "INSERT INTO favorites (sfx_id, added_at) VALUES (?, datetime('now'))",
                (sfx_id,)
            )
            db.commit()
            return True
    
    def cleanup_cache(self):
        """Remove expired/over-limit cached audio files."""
        db = self._get_db()
        
        # Delete files older than CACHE_EXPIRY_DAYS
        expired = db.execute("""
            SELECT sfx_id, local_path FROM audio_cache
            WHERE last_used_at < datetime('now', ?)
        """, (f"-{CACHE_EXPIRY_DAYS} days",)).fetchall()
        
        for row in expired:
            path = Path(row["local_path"])
            if path.exists():
                path.unlink()
            db.execute("DELETE FROM audio_cache WHERE sfx_id = ?", (row["sfx_id"],))
        
        # If still over limit, remove least recently used
        total_bytes = db.execute(
            "SELECT COALESCE(SUM(file_size_bytes), 0) as total FROM audio_cache"
        ).fetchone()["total"]
        
        max_bytes = MAX_CACHE_SIZE_MB * 1024 * 1024
        if total_bytes > max_bytes:
            lru = db.execute("""
                SELECT sfx_id, local_path, file_size_bytes FROM audio_cache
                ORDER BY last_used_at ASC
            """).fetchall()
            
            for row in lru:
                if total_bytes <= max_bytes:
                    break
                path = Path(row["local_path"])
                if path.exists():
                    path.unlink()
                db.execute("DELETE FROM audio_cache WHERE sfx_id = ?", (row["sfx_id"],))
                total_bytes -= row["file_size_bytes"] or 0
        
        db.commit()
    
    # ==========================================
    # PRIVATE — Search
    # ==========================================
    
    def _search_online(self, query: str, limit: int) -> list[SfxItem]:
        """Call server API for full 3-tier search."""
        resp = requests.post(
            f"{self.base_url}/api/sfx/search",
            json={"query": query, "limit": limit},
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        
        results = data.get("results", [])
        return [SfxItem(**{k: v for k, v in r.items() if k != "updated_at"}) for r in results]
    
    def _search_local(self, query: str, limit: int) -> list[SfxItem]:
        """Search local SQLite FTS5 index."""
        db = self._get_db()
        
        # Sanitize query for FTS5
        safe_query = query.replace('"', '')
        
        # Try FTS first
        try:
            rows = db.execute("""
                SELECT s.* FROM sfx_library s
                JOIN sfx_fts f ON s.rowid = f.rowid
                WHERE sfx_fts MATCH ?
                ORDER BY rank
                LIMIT ?
            """, (f'"{safe_query}"', limit)).fetchall()
            
            if rows:
                return [self._row_to_item(r) for r in rows]
        except sqlite3.OperationalError:
            pass  # FTS table may not exist yet
        
        # Fallback: LIKE search
        pattern = f"%{query}%"
        rows = db.execute("""
            SELECT * FROM sfx_library
            WHERE name LIKE ? OR category LIKE ? OR tags LIKE ?
                  OR description LIKE ? OR use_cases LIKE ?
            LIMIT ?
        """, (pattern, pattern, pattern, pattern, pattern, limit)).fetchall()
        
        return [self._row_to_item(r) for r in rows]
    
    # ==========================================
    # PRIVATE — Database
    # ==========================================
    
    def _ensure_cache_dir(self):
        SFX_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        (SFX_CACHE_DIR / "audio").mkdir(exist_ok=True)
    
    def _get_db(self) -> sqlite3.Connection:
        if self._db is None:
            self._db = sqlite3.connect(str(SFX_DB_PATH))
            self._db.row_factory = sqlite3.Row
            self._db.execute("PRAGMA journal_mode=WAL")
        return self._db
    
    def _init_local_db(self):
        db = self._get_db()
        db.executescript("""
            CREATE TABLE IF NOT EXISTS sfx_library (
                id              TEXT PRIMARY KEY,
                name            TEXT NOT NULL,
                filename        TEXT NOT NULL,
                cloudinary_url  TEXT NOT NULL,
                duration_sec    REAL,
                category        TEXT,
                subcategory     TEXT,
                mood            TEXT,
                intensity       TEXT,
                tags            TEXT,
                description     TEXT,
                use_cases       TEXT,
                is_loop         INTEGER DEFAULT 0,
                updated_at      TEXT
            );
            
            CREATE VIRTUAL TABLE IF NOT EXISTS sfx_fts USING fts5(
                name, category, subcategory, mood, tags, description, use_cases,
                content='sfx_library',
                content_rowid='rowid'
            );
            
            CREATE TABLE IF NOT EXISTS favorites (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                sfx_id      TEXT NOT NULL UNIQUE,
                added_at    TEXT DEFAULT (datetime('now'))
            );
            
            CREATE TABLE IF NOT EXISTS audio_cache (
                sfx_id          TEXT PRIMARY KEY,
                local_path      TEXT NOT NULL,
                file_size_bytes INTEGER,
                downloaded_at   TEXT DEFAULT (datetime('now')),
                last_used_at    TEXT DEFAULT (datetime('now')),
                use_count       INTEGER DEFAULT 1
            );
            
            CREATE TABLE IF NOT EXISTS sync_meta (
                key     TEXT PRIMARY KEY,
                value   TEXT
            );
        """)
        db.commit()
    
    def _upsert_items(self, items: list[dict]):
        """Bulk upsert SFX items + rebuild FTS."""
        db = self._get_db()
        for item in items:
            db.execute("""
                INSERT OR REPLACE INTO sfx_library
                (id, name, filename, cloudinary_url, duration_sec, category,
                 subcategory, mood, intensity, tags, description, use_cases,
                 is_loop, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["id"], item["name"], item["filename"],
                item["cloudinary_url"], item.get("duration_sec"),
                item.get("category"), item.get("subcategory"),
                item.get("mood"), item.get("intensity"),
                item.get("tags"), item.get("description"),
                item.get("use_cases"), item.get("is_loop", 0),
                item.get("updated_at"),
            ))
        
        # Rebuild FTS index
        db.execute("DELETE FROM sfx_fts")
        db.execute("""
            INSERT INTO sfx_fts(rowid, name, category, subcategory, mood, tags, description, use_cases)
            SELECT rowid, name, category, subcategory, mood, tags, description, use_cases
            FROM sfx_library
        """)
        db.commit()
    
    def _row_to_item(self, row: sqlite3.Row) -> SfxItem:
        return SfxItem(
            id=row["id"],
            name=row["name"],
            filename=row["filename"],
            cloudinary_url=row["cloudinary_url"],
            duration_sec=row["duration_sec"],
            category=row["category"],
            subcategory=row["subcategory"],
            mood=row["mood"],
            intensity=row["intensity"],
            tags=row["tags"],
            description=row["description"],
            use_cases=row["use_cases"],
            is_loop=row["is_loop"] or 0,
        )
    
    def _get_last_sync_cursor(self) -> Optional[str]:
        db = self._get_db()
        row = db.execute(
            "SELECT value FROM sync_meta WHERE key = 'last_sync_cursor'"
        ).fetchone()
        return row["value"] if row else None
    
    def _set_last_sync_cursor(self, cursor: str):
        db = self._get_db()
        db.execute(
            "INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync_cursor', ?)",
            (cursor,)
        )
        db.commit()
    
    # ==========================================
    # PRIVATE — Audio Cache
    # ==========================================
    
    def _get_cached_audio(self, sfx_id: str) -> Optional[Path]:
        db = self._get_db()
        row = db.execute(
            "SELECT local_path FROM audio_cache WHERE sfx_id = ?", (sfx_id,)
        ).fetchone()
        return Path(row["local_path"]) if row else None
    
    def _update_cache_usage(self, sfx_id: str):
        db = self._get_db()
        db.execute("""
            UPDATE audio_cache
            SET use_count = use_count + 1, last_used_at = datetime('now')
            WHERE sfx_id = ?
        """, (sfx_id,))
        db.commit()
    
    def _download_audio(self, sfx: SfxItem) -> Path:
        """Download audio file from Cloudinary to local cache."""
        resp = requests.get(sfx.cloudinary_url, timeout=30, stream=True)
        resp.raise_for_status()
        
        ext = Path(sfx.filename).suffix or ".mp3"
        local_path = SFX_CACHE_DIR / "audio" / f"{sfx.id}{ext}"
        
        with open(local_path, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)
        
        file_size = local_path.stat().st_size
        
        db = self._get_db()
        db.execute("""
            INSERT OR REPLACE INTO audio_cache
            (sfx_id, local_path, file_size_bytes, downloaded_at, last_used_at, use_count)
            VALUES (?, ?, ?, datetime('now'), datetime('now'), 1)
        """, (sfx.id, str(local_path), file_size))
        db.commit()
        
        return local_path
```

### 4.2 Local SQLite Cache

Client tự tạo local database tại `%LOCALAPPDATA%/FlashCut/sfx_cache/sfx_catalog.db`:

```
%LOCALAPPDATA%/FlashCut/sfx_cache/
├── sfx_catalog.db          ← SQLite: metadata + FTS index
└── audio/                  ← Downloaded audio files
    ├── sfx_01jce8k2m5n7p.mp3
    ├── sfx_02kdf9l3n6o8q.mp3
    └── ...
```

| Table          | Purpose                    | Sync Source        |
|----------------|----------------------------|--------------------|
| `sfx_library`  | SFX metadata cache         | `/api/sfx/catalog` |
| `sfx_fts`      | FTS5 search index          | Rebuilt from data  |
| `favorites`    | User's favorited SFX       | Local only         |
| `audio_cache`  | Downloaded audio tracking  | Local only         |
| `sync_meta`    | Sync cursor storage        | Local only         |

### 4.3 Hybrid Search Flow

```
search("tiếng mưa buồn")
    │
    ├── Online? ──YES──→ POST /api/sfx/search
    │                    Body: {"query": "tiếng mưa buồn", "limit": 20}
    │                    ↓
    │                    Server runs:
    │                    ① FTS:  MATCH '"tiếng mưa buồn"' → ≥5 results? → Return
    │                    ② LIKE: '%tiếng mưa buồn%'       → ≥5 results? → Return
    │                    ③ Pinecone: semantic("tiếng mưa buồn") → Merge & Return
    │                    ↓
    │                    Response: {results: [...], method: "pinecone", total: 12}
    │
    └── Offline? ─YES──→ Local SQLite FTS5
                         MATCH '"tiếng mưa buồn"'
                         ↓
                         Fallback: LIKE '%tiếng mưa buồn%'
                         ↓
                         Return local results
```

### 4.4 Audio Cache Management

| Policy              | Value    | Description                              |
|----------------------|----------|------------------------------------------|
| Max cache size       | 500 MB   | Configurable via `MAX_CACHE_SIZE_MB`     |
| Expiry               | 30 days  | Files unused > 30 days → auto-delete     |
| Eviction strategy    | LRU      | Least Recently Used removed first        |
| User manual clear    | Settings | `sfx_service.cleanup_cache()` or UI      |

---

## 5. Search Behavior & Tiers

Server-side search hoạt động theo 3 tầng tuần tự. Client **không cần biết chi tiết** — chỉ cần gọi 1 API endpoint.

| Tier | Engine          | Trigger điều kiện                | Hiểu gì                                  |
|------|-----------------|----------------------------------|-------------------------------------------|
| 1    | **FTS5**        | Luôn chạy đầu tiên              | Exact & partial keyword match             |
| 1.5  | **LIKE**        | FTS < 5 results                  | Substring match trên name, tags, desc     |
| 3    | **Pinecone**    | FTS + LIKE < 5 results           | Semantic / meaning-based (multilingual)   |

### Semantic Search Examples

| User Query (tiếng Việt)          | Pinecone hiểu → trả về         |
|----------------------------------|---------------------------------|
| "gõ bàn phím"                    | keyboard_typing, key_press      |
| "mưa buồn cho scene chia tay"   | rain_gentle, drizzle_soft       |
| "vũ khí sắc nhọn cổ đại"        | sword_slash, katana_draw        |
| "không gian cô đơn trong vũ trụ"| space_ambient, deep_drone       |

> Pinecone sử dụng model `multilingual-e5-large` — hiểu cả tiếng Việt và tiếng Anh, matching theo ngữ nghĩa chứ không cần keyword chính xác.

---

## 6. Error Handling & Resilience

### Fallback Matrix

```
┌──────────────────┬───────────────┬──────────────────────────────────┐
│ Situation        │ Impact        │ Client Behavior                  │
├──────────────────┼───────────────┼──────────────────────────────────┤
│ Internet down    │ No API search │ Local FTS (offline, <5ms)        │
│ Server error 500 │ API fails     │ Local FTS fallback               │
│ Slow network     │ Timeout       │ Local FTS after REQUEST_TIMEOUT  │
│ Pinecone down    │ No semantic   │ Server auto-falls to FTS+LIKE   │
│ Empty local DB   │ No offline    │ Force sync_catalog() first      │
│ Cloudinary down  │ No download   │ Use audio_cache (if available)  │
└──────────────────┴───────────────┴──────────────────────────────────┘
```

### Recommended Client Error Handling

```python
def search_with_resilience(sfx_service: SfxService, query: str) -> list[SfxItem]:
    try:
        results = sfx_service.search(query)
        if not results:
            # Suggest: Thử từ khóa khác, hoặc tìm theo category
            show_empty_state("Không tìm thấy SFX phù hợp")
        return results
    except Exception as e:
        logger.warning(f"SFX search error: {e}")
        show_toast("Tìm kiếm offline — kết nối mạng để tìm chính xác hơn")
        return sfx_service._search_local(query, 20)
```

---

## 7. Performance Guidelines

### Sync Schedule

| Event              | Action                                        |
|--------------------|-----------------------------------------------|
| App startup        | `sync_catalog()` in background thread         |
| Every 30 minutes   | `sync_catalog()` incremental (if online)      |
| User opens SFX tab | Check `last_sync_cursor` age → sync if stale  |
| App shutdown       | `cleanup_cache()` nếu cache > limit           |

### Search Performance

| Scenario                    | Expected Latency | Notes                         |
|-----------------------------|-------------------|-------------------------------|
| Local FTS (offline)         | < 5ms             | Instant                       |
| API search (FTS match)      | 50–100ms          | Network overhead              |
| API search (LIKE fallback)  | 100–200ms         | Pattern scanning              |
| API search (Pinecone)       | 250–400ms         | Semantic processing           |
| Audio download (first time) | 1–5s              | Depends on file size + CDN    |
| Audio play (cached)         | < 10ms            | Local file read               |

### Memory Considerations

| Item                         | Size Estimate         |
|------------------------------|-----------------------|
| 1,000 SFX metadata (SQLite) | ~500 KB               |
| 10,000 SFX metadata         | ~5 MB                 |
| FTS5 index                   | ~2× metadata size     |
| Audio cache (500 files avg)  | ~150 MB               |

---

## 8. Migration & Versioning

### Schema Compatibility

Server-side schema changes follow these rules:
- **Additive only**: New columns have `DEFAULT` values — old clients still work
- **Never rename/drop**: Column renames or deletions are breaking changes
- Client should `INSERT OR REPLACE` with only known columns → future columns are ignored

### Version Check (Optional)

Client có thể kiểm tra API version qua response header hoặc dedicated endpoint:

```python
def check_api_compatible(self) -> bool:
    """Check if local schema matches server expectations."""
    try:
        resp = requests.get(f"{self.base_url}/api/sfx/catalog?limit=1", timeout=5)
        data = resp.json()
        if data.get("items"):
            server_fields = set(data["items"][0].keys())
            local_fields = {"id", "name", "filename", "cloudinary_url"}
            return local_fields.issubset(server_fields)
    except Exception:
        pass
    return True  # Assume compatible if can't check
```

---

## Appendix A: Quick Start Checklist

```python
# 1. Initialize service
sfx = SfxService(base_url="https://flashcut.ai")

# 2. First-time sync (downloads entire catalog)
synced = sfx.sync_catalog()
print(f"Synced {synced} SFX items")

# 3. Search
results = sfx.search("tiếng kiếm sắc bén")
for item in results:
    print(f"  {item.name} [{item.category}] — {item.duration_sec}s")

# 4. Download & play
if results:
    path = sfx.get_audio_path(results[0])
    if path:
        play_audio(path)  # Your audio player

# 5. Favorites
sfx.toggle_favorite(results[0].id)
favs = sfx.get_favorites()

# 6. Cleanup (call periodically)
sfx.cleanup_cache()
```

## Appendix B: Environment Variables

| Variable       | Required | Default                        | Description                     |
|----------------|----------|--------------------------------|---------------------------------|
| `SFX_BASE_URL` | No       | `https://flashcut.ai`          | API server base URL             |
| `LOCALAPPDATA` | Auto     | Windows provides               | Cache directory root            |

---

> **Document maintained by:** FlashCut Engineering  
> **Questions?** Contact the backend team for API changes or the desktop team for client integration.
