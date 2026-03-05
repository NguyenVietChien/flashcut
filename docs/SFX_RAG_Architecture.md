# FlashCut SFX RAG System — Architecture Document

## 1. Tổng quan

Hệ thống SFX RAG (Retrieval-Augmented Generation) cho phép FlashCut desktop app **tìm kiếm SFX bằng ngôn ngữ tự nhiên** và **auto-insert vào timeline**. Toàn bộ hệ thống hoạt động **serverless, chi phí $0/tháng**.

### Core Idea
> User mô tả âm thanh cần tìm → AI hiểu ngữ nghĩa → trả SFX phù hợp nhất

```
"tiếng kiếm sắc bén" → tìm được sword, blade, katana, slash...
"mưa buồn cho scene chia tay" → rain_gentle, rain_soft, drizzle...
```

### Competitive Advantage

| Competitor | Search method | FlashCut |
|---|---|---|
| CapCut | Keyword tag thủ công | **Semantic search (AI hiểu ngữ nghĩa)** |
| Adobe | Keyword + filter | **Natural language query** |
| ElevenLabs | AI generate SFX (chất lượng chưa ổn) | **SFX thật + AI search** |
| Veo 3 (Google) | AI generate audio cùng video | **SFX thật chuyên nghiệp + AI search** |

---

## 2. Vai trò từng component

> **Nguyên tắc: Turso = NHÀ KHO (bắt buộc), Pinecone = KÍNH LÚP (tùy chọn)**

| Component | Vai trò | Bắt buộc? | Thay thế? |
|---|---|---|---|
| **Turso** | Lưu data, CRUD, sync offline, FTS | ✅ **BẮT BUỘC** | Phải có DB nào đó |
| **Pinecone** | Semantic vector search | ❌ Nâng cấp | Gemini + FTS thay 90% |
| **Cloudinary** | Lưu + serve audio files qua CDN | ✅ **BẮT BUỘC** | S3, R2... |
| **Gemini** | AI analyze, expand keywords, embed | ✅ **BẮT BUỘC** | OpenAI, Claude... |
| **Vercel** | Host BO Admin | ✅ **BẮT BUỘC** | Netlify, Railway... |

### Nếu không có Pinecone:
> App vẫn chạy 100% — dùng Gemini expand keywords + Turso FTS.
> Chỉ mất ~10% queries trừu tượng tìm kém chính xác hơn.

### Nếu không có Turso:
> ❌ App chết — không có data, không sync, không offline.

---

## 3. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────┐
│  BO Admin (Next.js on Vercel)                         │
│  → CRUD SFX metadata                                  │
│  → Upload audio → Cloudinary                          │
│  → Trigger Gemini analyze                              │
│  → Lưu metadata → Turso                               │
│  → Upsert vectors → Pinecone (optional)                │
│  → Quản lý users, plans, billing                      │
└──────────────────┬──────────────┬────────────────────┘
                   ↓ write        ↓ upsert (optional)
            ┌──────────────┐  ┌─────────────────┐
            │   Turso DB   │  │   Pinecone      │
            │  (libSQL)    │  │  (Vector DB)    │
            │  9GB free    │  │  2GB free       │
            │  metadata    │  │  embeddings     │
            │  + FTS       │  │  + semantic     │
            └──────┬───────┘  └────────┬────────┘
                   ↓ auto sync         ↓ API call (online)
┌──────────────────────────────────────────────────────┐
│  FlashCut App (PC Client)                             │
│                                                       │
│  ┌───────────────────────────────────┐                │
│  │ Turso Embedded Replica (SQLite)   │ ← Local,       │
│  │ SFX Library    (sync từ cloud)    │   read-only,   │
│  │ User Custom SFX (local only)      │   offline OK   │
│  └───────────────────────────────────┘                │
│                                                       │
│  SFX Cache Folder:                                    │
│  └ AppData/Local/FlashCut/sfx_cache/                  │
│    ├ cache_index.json                                 │
│    ├ sword_slash_01.mp3                               │
│    └ rain_loop_05.mp3                                 │
│                                                       │
│  Search Flow:                                         │
│  ① FTS local (offline, <5ms)                          │
│  ② Gemini expand + FTS (online, ~200ms)               │
│  ③ Pinecone semantic search (online, ~250ms, optional)│
│  Preview      → stream Cloudinary CDN                 │
│  Download     → Cloudinary → local cache              │
│  Insert       → từ cache → timeline                   │
└──────────────────────────────────────────────────────┘
```

---

## 4. Tech Stack

| Component | Service | Free Tier | Vai trò | Bắt buộc |
|---|---|---|---|---|
| **BO Admin** | Next.js + Vercel | 100GB bandwidth | CRUD, upload, manage | ✅ |
| **Database** | Turso (libSQL) | 9GB, 24B reads | SFX metadata + sync + FTS | ✅ |
| **Vector Search** | Pinecone | 2GB, unlimited queries | Semantic search | ❌ Optional |
| **Audio CDN** | Cloudinary ×2 accounts | 25GB × 2 = 50GB | Lưu trữ + serve files | ✅ |
| **AI Analysis** | Gemini 2.5 Flash | 15 RPM free | Phân tích audio + expand keywords | ✅ |
| **AI Embedding** | Gemini Embedding | Free tier | Vector cho Pinecone | ❌ Optional |
| **Audio Proxy** | LiteLLM | Self-hosted | Multi-key, routing, logging | ❌ Optional |
| **Tổng chi phí** | | **$0/tháng** | | |

---

## 5. Database Schema

### Turso Cloud (Primary — sync về tất cả clients)

```sql
-- Bảng SFX chính
CREATE TABLE sfx_library (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    filename    TEXT NOT NULL,

    -- Cloudinary info
    cloudinary_url      TEXT NOT NULL,
    cloudinary_account  TEXT DEFAULT 'account1',  -- account1 | account2

    -- Audio properties (FFmpeg measured — chính xác)
    duration_sec    REAL NOT NULL,
    peak_db         REAL,
    rms_db          REAL,
    sample_rate     INTEGER DEFAULT 44100,
    channels        INTEGER DEFAULT 1,
    format          TEXT DEFAULT 'mp3',
    file_size_bytes INTEGER,

    -- AI metadata (Gemini analyzed)
    category        TEXT,       -- "weapon", "weather", "ui", "ambient"
    subcategory     TEXT,       -- "sword", "rain", "click", "forest"
    mood            TEXT,       -- "dramatic", "calm", "tense", "happy"
    intensity       TEXT,       -- "low", "medium", "high"
    scene_context   TEXT,       -- "Phù hợp cho cảnh đánh nhau..."
    tags            TEXT,       -- JSON array: '["sword","metal","slash"]'
    description     TEXT,       -- Mô tả chi tiết từ Gemini

    -- Search
    embedding       BLOB,       -- Vector 768 chiều (Gemini embedding)

    -- Metadata
    is_loop         BOOLEAN DEFAULT FALSE,
    license         TEXT DEFAULT 'royalty-free',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index cho full-text search
CREATE VIRTUAL TABLE sfx_fts USING fts5(
    name, category, subcategory, mood, tags, description,
    content='sfx_library'
);

-- Bảng categories
CREATE TABLE categories (
    id      TEXT PRIMARY KEY,
    name    TEXT NOT NULL,
    icon    TEXT,
    parent_id TEXT REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0
);
```

### FlashCut App — Local Only Tables (không sync)

```sql
-- SFX user tự import
CREATE TABLE user_custom_sfx (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    local_path  TEXT NOT NULL,       -- "C:/Users/.../my_sfx/boom.mp3"

    -- Audio properties (FFmpeg)
    duration_sec    REAL,
    peak_db         REAL,
    rms_db          REAL,

    -- AI metadata (Gemini qua LiteLLM proxy)
    category    TEXT,
    mood        TEXT,
    tags        TEXT,
    description TEXT,
    embedding   BLOB,

    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cache SFX đã download từ library
CREATE TABLE sfx_cache (
    sfx_id          TEXT PRIMARY KEY,       -- trỏ về sfx_library.id
    local_path      TEXT NOT NULL,           -- path trong sfx_cache folder
    downloaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at    DATETIME,
    use_count       INTEGER DEFAULT 0,
    file_size_bytes INTEGER
);

-- Favorites
CREATE TABLE favorites (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    sfx_id  TEXT NOT NULL,
    source  TEXT NOT NULL,   -- "library" | "custom"
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search history
CREATE TABLE search_history (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    query   TEXT NOT NULL,
    results_count INTEGER,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. SFX Indexing Pipeline (BO Admin)

Khi admin thêm SFX mới qua BO:

```
Upload .mp3 → Cloudinary
    ↓
FFmpeg analyze (server-side hoặc Vercel Edge Function)
    → duration: 2.3s
    → peak_db: -3.2
    → rms_db: -18.5
    ↓
Gemini analyze (qua LiteLLM Proxy hoặc direct)
    → category: "weapon"
    → mood: "dramatic"
    → tags: ["sword", "slash", "metal"]
    → scene_context: "Phù hợp cho cảnh chiến đấu, hành động"
    ↓
Gemini Embedding
    → vector 768 chiều
    ↓
┌─────────────────────────────────────────┐
│  Song song:                              │
│  ① INSERT metadata → Turso (bắt buộc)   │
│  ② UPSERT vector → Pinecone (optional)  │
└─────────────────────────────────────────┘
    ↓
Turso auto sync → tất cả FlashCut app clients
```

### Pinecone record format:

```json
{
  "id": "sfx_sword_slash_01",
  "values": [0.12, -0.34, 0.56, ...],  // 768-dim vector
  "metadata": {
    "name": "sword_slash_01",
    "category": "weapon",
    "mood": "dramatic",
    "intensity": "high",
    "duration": 2.1,
    "tags": ["sword", "slash", "metal"]
  }
}
```

### Chi phí indexing 1,000 SFX:

| Bước | Chi phí |
|---|---|
| FFmpeg analyze | $0 (open source) |
| Gemini analyze × 1000 | ~$0.50 |
| Gemini embed × 1000 | ~$0.01 |
| Turso write | $0 (free tier) |
| Pinecone upsert | $0 (free tier) |
| Cloudinary upload | $0 (free tier) |
| **Tổng** | **~$0.51** |

---

## 7. Search Flow (App Client)

App client có **3 tầng search**, tự động fallback:

```
User query: "tiếng mưa nhẹ cho cảnh buồn"
    ↓
┌───────────────────────────────────────┐
│ Tầng 1: FTS Local (offline, <5ms)    │ ← Luôn thử trước
│ Đủ kết quả? → DONE                   │
└───────────────┬───────────────────────┘
                ↓ Không đủ tốt
┌───────────────────────────────────────┐
│ Tầng 2: Gemini + FTS (~200ms)        │ ← Cần internet
│ Gemini expand keywords → FTS local   │
│ Đủ kết quả? → DONE                   │
└───────────────┬───────────────────────┘
                ↓ Cần chính xác hơn
┌───────────────────────────────────────┐
│ Tầng 3: Pinecone (~250ms)            │ ← Optional, cần internet
│ Gemini embed → Pinecone search       │
│ Semantic matching → DONE              │
└───────────────────────────────────────┘
```

### 7.1 Tầng 1: FTS Local (offline, bắt buộc)

```
User: "sword"
    ↓
Query local Turso replica:
    SELECT * FROM sfx_fts WHERE sfx_fts MATCH 'sword'
    ORDER BY rank LIMIT 10
    ↓
Results: instant (<5ms), hoạt động OFFLINE
```

### 7.2 Tầng 2: Gemini Expand Keywords (online)

```
User: "vũ khí sắc nhọn cổ đại"
    ↓
App → Gemini: "Convert to SFX search keywords"
    → {keywords: ["sword","blade","katana"], mood: "dramatic"}
    ↓
Query local DB:
    SELECT * FROM sfx_fts
    WHERE sfx_fts MATCH 'sword OR blade OR katana'
    AND mood = 'dramatic'
    ORDER BY rank LIMIT 10
    ↓
Results: ~200ms (Gemini) + <5ms (local) = ~205ms
```

### 7.3 Tầng 3: Pinecone Semantic Search (online, optional)

```
User: "âm thanh gợi cảm giác cô đơn trong vũ trụ"
    ↓
Gemini Embed query → vector [0.12, -0.34, ...]
    ↓
Pinecone search:
    index.query(vector=query_vector, top_k=10, 
                filter={"intensity": "low"})
    ↓
Results: ~250ms
    → Tìm được "deep_drone", "space_ambient" 
      (semantic match, dù keyword khác hoàn toàn)
```

### 7.4 So sánh 3 tầng:

| Tầng | Tốc độ | Offline | Độ chính xác | Khi nào dùng |
|---|---|---|---|---|
| **FTS Local** | <5ms | ✅ | ⭐⭐⭐ | Keyword rõ ràng |
| **Gemini + FTS** | ~200ms | ❌ | ⭐⭐⭐⭐ | Natural language |
| **Pinecone** | ~250ms | ❌ | ⭐⭐⭐⭐⭐ | Query trừu tượng |

> **90% queries** giải quyết ở Tầng 1-2 (không cần Pinecone)
> **10% queries trừu tượng** cần Tầng 3 để tìm chính xác

---

## 8. SFX Auto-Insert (FlashCut Timeline)

```
User import video vào FlashCut
    ↓
Gemini analyze video audio track:
    → "Video có cảnh đánh nhau, thiếu SFX impact"
    → "Có voiceover, cần background ambient"
    ↓
AI suggest SFX list:
    [
        { sfx: "punch_hit_01", timestamp: 2.3s, reason: "cảnh đấm" },
        { sfx: "body_fall_03", timestamp: 4.1s, reason: "ngã xuống" },
        { sfx: "ambient_city", timestamp: 0s, duration: "full", reason: "background" }
    ]
    ↓
Batch check cache → có 2/3 local, thiếu 1
    ↓
Download 1 file còn thiếu → cache
    ↓
User review suggestions → 1 click approve
    ↓
Auto insert vào timeline đúng timestamp
```

---

## 9. Local Cache Management

```
AppData/Local/FlashCut/sfx_cache/
├── cache_index.json
├── punch_hit_01_abc123.mp3
├── rain_loop_05_def456.mp3
└── ...
```

### Chính sách cache:

| Rule | Giá trị |
|---|---|
| Max cache size | 500 MB |
| Xóa khi | File > 30 ngày không dùng |
| Ưu tiên giữ | use_count cao nhất |
| User clear | Settings → Clear SFX Cache |

### Cache logic:

```python
def get_sfx(sfx_id):
    # 1. Check local cache
    cached = db.query("SELECT local_path FROM sfx_cache WHERE sfx_id = ?", sfx_id)
    if cached and file_exists(cached.local_path):
        db.execute("UPDATE sfx_cache SET use_count = use_count + 1, last_used_at = NOW()")
        return cached.local_path

    # 2. Download từ Cloudinary
    sfx = db.query("SELECT cloudinary_url FROM sfx_library WHERE id = ?", sfx_id)
    local_path = download(sfx.cloudinary_url, CACHE_DIR)

    # 3. Save to cache
    db.execute("INSERT INTO sfx_cache VALUES (?, ?, NOW(), NOW(), 1, ?)",
               sfx_id, local_path, file_size)

    # 4. Cleanup if over limit
    cleanup_cache_if_needed(MAX_CACHE_SIZE=500_MB)

    return local_path
```

---

## 10. User Custom SFX Import

```
User kéo thả "my_explosion.mp3" vào FlashCut
    ↓
1. FFmpeg analyze local     → duration, dB        (~100ms)
2. Gemini analyze via proxy → category, mood, tags (~2s)
3. Gemini embed via proxy   → vector 768d          (~500ms)
4. INSERT vào user_custom_sfx (local SQLite)
    ↓
Search "explosion" → tìm CẢ 2 nguồn:
    - sfx_library (Turso replica)
    - user_custom_sfx (local)
    → Merge + dedup → hiển thị
```

---

## 11. Cloudinary Multi-Account

```
Account 1: res.cloudinary.com/flashcut1/  (25GB)
Account 2: res.cloudinary.com/flashcut2/  (25GB)
                                          = 50GB total

DB chỉ lưu URL, app download từ đúng account:
    sfx_library.cloudinary_url = "https://res.cloudinary.com/flashcut1/audio/sfx/rain.mp3"
    sfx_library.cloudinary_account = "account1"
```

---

## 12. Gemini Capabilities (đã test)

| Capability | Test Result | Ứng dụng |
|---|---|---|
| **STT** (Speech-to-Text) | ✅ Chính xác, viết hoa + dấu câu | Transcribe voiceover |
| **TTS** (Text-to-Speech) | ✅ 24kHz, 8+ voices | AI voiceover |
| **Image Generation** | ✅ Imagen 4.0, character consistency | Thumbnail, assets |
| **Audio Analysis** | ✅ Nhận diện SFX, mood, scene, emotion | SFX classification |
| **Multi-task** | ✅ Transcribe + dịch + phân tích 1 request | Pipeline efficiency |
| **Word Timing** | ⚠️ Estimate (Deepgram chính xác hơn) | Subtitle tham khảo |
| **dB Measurement** | ❌ Cần FFmpeg/pydub | Audio properties |
| **Keyword Expansion** | ✅ Natural lang → structured keywords | SFX search trung gian |

---

## 13. Capacity & Scale

### Storage:

| SFX Count | Audio Files | Turso | Pinecone | Cloudinary |
|---|---|---|---|---|
| 1,000 | ~300 MB | ~1 MB ✅ | ~3.5 MB ✅ | ✅ Free |
| 10,000 | ~3 GB | ~10 MB ✅ | ~35 MB ✅ | ✅ Free |
| 50,000 | ~15 GB | ~50 MB ✅ | ~175 MB ✅ | ✅ Free (2 acc) |
| 100,000 | ~30 GB | ~100 MB ✅ | ~350 MB ✅ | 💰 Paid |
| 600,000 | ~180 GB | ~600 MB ✅ | ~2 GB ⚠️ Max | 💰 Paid |

### Search Performance:

| Method | 10K SFX | 50K SFX | Online? |
|---|---|---|---|
| FTS local (Turso) | <5ms | <10ms | ❌ Offline |
| Gemini expand + FTS | ~200ms | ~200ms | ✅ |
| Pinecone semantic | ~50ms | ~50ms | ✅ |
| Hybrid (Gemini + Pinecone) | ~250ms | ~250ms | ✅ |

---

## 14. Tổng chi phí vận hành

| Service | Monthly Cost |
|---|---|
| Vercel (BO Admin) | $0 |
| Turso (Database + sync) | $0 |
| Pinecone (Vector search) | $0 |
| Cloudinary × 2 (Audio CDN) | $0 |
| Gemini API (search queries) | ~$1-5 (usage-based) |
| Domain (optional) | ~$1 |
| **Tổng** | **~$1-5/tháng** |

> So sánh: Thuê VPS + PostgreSQL + S3 = **$15-30/tháng**
> Tiết kiệm **80-90%** với serverless stack!

---

## 15. Security & Authentication

### 15.1 API Key Management

```
┌─────────────────────────────────────────────────┐
│  KHÔNG BAO GIỜ hardcode API key trong app!      │
│                                                  │
│  App Client                                      │
│  ├ Gemini key    → qua LiteLLM Proxy (server)   │
│  ├ Turso token   → embedded trong app (read-only)│
│  ├ Pinecone key  → qua BO API proxy             │
│  └ Cloudinary    → Signed URLs (có thời hạn)    │
└─────────────────────────────────────────────────┘
```

### 15.2 Cloudinary Signed URLs

```python
# BO Admin generate signed URL (có thời hạn)
import cloudinary.utils

signed_url = cloudinary.utils.cloudinary_url(
    "sfx/sword_slash_01.mp3",
    sign_url=True,
    type="authenticated",
    expires_at=int(time.time()) + 3600  # hết hạn sau 1 giờ
)

# App client nhận URL có chữ ký, không truy cập trực tiếp được
# → "https://res.cloudinary.com/flashcut1/audio/sfx/rain.mp3?signature=abc123&expires=..."
```

### 15.3 Turso Embedded Replica Auth

```python
# App client connect với auth token (read-only)
from libsql_client import create_client

db = create_client(
    url="file:local_replica.db",        # Local SQLite file
    sync_url="libsql://sfx-db.turso.io", # Cloud sync endpoint
    auth_token="eyJ..."                  # Read-only token, rotate monthly
)

# Token chỉ có quyền READ, không thể WRITE/DELETE
# Token rotate qua app update hoặc remote config
```

### 15.4 User Authentication Flow

```
App Start → Check license key (local)
    ↓
Valid? → Fetch user profile từ BO API
    ↓
BO API verify → trả về:
    - user_id
    - plan (trial/basic/pro)
    - sfx_download_quota (monthly)
    - turso_sync_token (read-only)
    ↓
App cache session → hoạt động offline
```

### 15.5 Rate Limiting

| Resource | Limit (Free) | Limit (Pro) |
|---|---|---|
| SFX search/phút | 30 | 120 |
| SFX download/ngày | 10 | 100 |
| Gemini AI search/ngày | 50 | 500 |
| Custom SFX import/ngày | 5 | 50 |

---

## 16. Error Handling & Resilience

### 16.1 Fallback Matrix

```
┌───────────────┬──────────────┬────────────────────────────┐
│ Service Down  │ Impact       │ Fallback                   │
├───────────────┼──────────────┼────────────────────────────┤
│ Gemini API    │ Tầng 2,3     │ Chỉ dùng FTS local (Tầng 1)│
│               │ search down  │ Search vẫn hoạt động       │
├───────────────┼──────────────┼────────────────────────────┤
│ Pinecone      │ Tầng 3       │ Dùng Tầng 1+2 (FTS+Gemini)│
│               │ search down  │ 90% queries vẫn OK         │
├───────────────┼──────────────┼────────────────────────────┤
│ Turso Cloud   │ Không sync   │ Local replica vẫn có data  │
│               │ data mới     │ App hoạt động bình thường  │
├───────────────┼──────────────┼────────────────────────────┤
│ Cloudinary    │ Không tải    │ Hiển thị từ cache local    │
│               │ file mới     │ SFX đã tải vẫn dùng được  │
├───────────────┼──────────────┼────────────────────────────┤
│ Vercel (BO)   │ Admin không  │ App client không ảnh hưởng │
│               │ CRUD được    │ Data đã sync vẫn hoạt động │
├───────────────┼──────────────┼────────────────────────────┤
│ Internet down │ Mất online   │ FTS local + cache = vẫn OK │
│               │ features     │ Core experience giữ nguyên │
└───────────────┴──────────────┴────────────────────────────┘
```

> **Worst case (mất internet hoàn toàn): App vẫn search offline + dùng SFX đã cache!**

### 16.2 Retry Strategy

```python
# Exponential backoff cho API calls
async def search_with_fallback(query):
    # Tầng 1: FTS Local (luôn hoạt động)
    fts_results = await search_fts_local(query)
    if len(fts_results) >= 5:
        return fts_results

    # Tầng 2: Gemini expand (retry 2 lần)
    try:
        expanded = await retry(
            lambda: gemini_expand_keywords(query),
            max_retries=2,
            backoff=[1, 3]  # 1s, 3s
        )
        gemini_results = await search_fts_local(expanded)
        if len(gemini_results) >= 5:
            return merge_results(fts_results, gemini_results)
    except TimeoutError:
        pass  # Skip, dùng FTS results

    # Tầng 3: Pinecone (retry 1 lần)
    try:
        vector = await gemini_embed(query)
        pinecone_results = await retry(
            lambda: pinecone_search(vector),
            max_retries=1,
            backoff=[2]
        )
        return merge_results(fts_results, pinecone_results)
    except Exception:
        pass  # Skip

    return fts_results  # Luôn có kết quả từ FTS
```

### 16.3 Cloudinary Failover (Multi-Account)

```python
async def download_sfx(sfx):
    # Thử account chính
    try:
        return await download(sfx.cloudinary_url, timeout=10)
    except Exception:
        pass

    # Fallback: thử account phụ (nếu mirror)
    if sfx.mirror_url:
        try:
            return await download(sfx.mirror_url, timeout=10)
        except Exception:
            pass

    # Fallback cuối: thông báo user
    raise SFXNotAvailableError("SFX unavailable, try again later")
```

---

## 17. Monitoring & Analytics

### 17.1 Search Analytics (lưu local → batch sync)

```sql
-- Local SQLite
CREATE TABLE search_analytics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    query       TEXT NOT NULL,
    search_tier INTEGER,       -- 1=FTS, 2=Gemini, 3=Pinecone
    results_count INTEGER,
    selected_sfx_id TEXT,      -- User chọn SFX nào
    latency_ms  INTEGER,
    is_offline  BOOLEAN,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced      BOOLEAN DEFAULT FALSE
);

-- Batch sync lên server mỗi 1 giờ (khi online)
-- → Phân tích: query phổ biến, SFX thiếu, search quality
```

### 17.2 Metrics cần track

| Metric | Mục đích | Alert khi |
|---|---|---|
| **Search success rate** | % queries có kết quả | < 80% |
| **Cache hit rate** | % SFX lấy từ cache | < 50% |
| **Avg search latency** | Tốc độ trung bình | > 500ms |
| **Tier distribution** | % queries ở mỗi tầng | Tầng 3 > 30% |
| **Sync lag** | Delay sync Turso | > 5 phút |
| **Download failures** | Cloudinary fail rate | > 5% |
| **Gemini error rate** | API failures | > 10% |

### 17.3 Actionable Insights

```
Search Analytics cho biết:

1. "Tiếng xxx" được search nhiều nhưng 0 results
   → Cần thêm SFX loại "xxx" vào library

2. Cache hit rate thấp (< 30%)
   → Tăng cache size hoặc pre-cache top SFX

3. Tầng 3 (Pinecone) dùng > 30%
   → FTS tags chưa đủ tốt, cần re-index

4. User hay search tiếng Việt
   → Optimize Gemini prompt cho tiếng Việt
```

---

## 18. Migration & Versioning

### 18.1 DB Schema Migration

```python
# Version tracking trong Turso
CREATE TABLE schema_version (
    version   INTEGER PRIMARY KEY,
    name      TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

# Migration files
# migrations/001_initial.sql
# migrations/002_add_subcategory.sql
# migrations/003_add_waveform_url.sql

# BO Admin chạy migration → Turso cloud
# Turso auto sync schema mới → tất cả clients
```

### 18.2 Embedding Model Versioning

```
Khi đổi embedding model (vd: gemini-embedding-001 → 002):

1. Tạo Pinecone index mới: "sfx-library-v2"
2. Re-embed tất cả SFX (batch job)
3. App switch sang index v2
4. Xóa index v1 sau 30 ngày

Tại sao cần index mới?
→ Model khác nhau → vector dimensions/space khác → không so sánh được
```

### 18.3 App Update Compatibility

```
App v1.0 → Turso schema v1, Pinecone index v1
App v1.1 → Turso schema v2 (thêm cột), Pinecone index v1

Nguyên tắc:
├ Schema changes phải backward-compatible
│   → Chỉ ADD column, không DROP/RENAME
│   → New columns có DEFAULT value
├ Pinecone index version track trong Turso
│   → App đọc config: "pinecone_index = sfx-library-v1"
└ Force update khi breaking change
    → BO API trả về minimum_app_version
    → App check → bắt update nếu quá cũ
```

### 18.4 Data Backup Strategy

| Data | Backup | Frequency | Retention |
|---|---|---|---|
| Turso DB | Turso built-in backup | Daily auto | 30 ngày |
| Pinecone index | Export → S3/R2 | Weekly | 4 tuần |
| Cloudinary files | Mirror account 2 | Real-time | Permanent |
| User local data | App export feature | User-triggered | N/A |
| Search analytics | Batch sync → server | Hourly | 90 ngày |

---

## 19. Upgrade Roadmap

| Phase | Stack | Search | Khi nào |
|---|---|---|---|
| **Phase 1 (MVP)** | Turso + Cloudinary + Gemini FTS | Keyword + Gemini expand | Bắt đầu |
| **Phase 2 (Semantic)** | + Pinecone | + Vector search | Khi FTS không đủ |
| **Phase 3 (Scale)** | + Cloud SQL pgvector | + Native vector | >100K SFX |
| **Phase 4 (Enterprise)** | + AlloyDB AI | + Built-in AI | Khi có revenue |

### Phase 1 Checklist:

- [ ] Setup Turso DB + schema
- [ ] Deploy BO Admin trên Vercel
- [ ] Tạo Cloudinary accounts (×2)
- [ ] Build indexing pipeline (FFmpeg + Gemini + Turso)
- [ ] Implement FTS search trong app
- [ ] Implement Gemini keyword expansion
- [ ] Build local cache system
- [ ] Add security layer (auth, signed URLs)
- [ ] Add error handling + fallback
- [ ] Add basic search analytics
- [ ] Index 100 SFX đầu tiên để test
- [ ] User testing + iterate

> **Bắt đầu Phase 1, nâng cấp khi CẦN, không over-engineer!**

---

## 20. Architecture Scorecard

| Tiêu chí | Điểm | Ghi chú |
|---|---|---|
| **Cost Efficiency** | 10/10 | $0-5/tháng serverless |
| **Offline-first** | 9/10 | Turso embedded replica |
| **Search Quality** | 8/10 | 3 tầng fallback |
| **Security** | 8/10 | Signed URLs + auth tokens + rate limit |
| **Resilience** | 9/10 | Graceful degradation, mọi service down vẫn có fallback |
| **Scalability** | 7/10 | OK đến 100K, cần migrate sau |
| **Developer Experience** | 8/10 | Ít moving parts |
| **Monitoring** | 8/10 | Analytics + actionable insights |
| **Tổng** | **8.5/10** | Production-ready cho MVP → Growth |
