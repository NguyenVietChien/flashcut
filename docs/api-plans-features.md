# Plans Features API — Desktop App Integration

## Endpoint

```
GET https://flashcut.vn/api/plans/features
```

No auth required. Cached 1 hour.

## Response

```json
{
  "plans": [
    {
      "slug": "basic",
      "name": "Basic",
      "priceVnd": 299000,
      "priceUsd": 12,
      "features": {
        "vi": [
          {
            "group": "Tạo video",
            "icon": "film",
            "items": [
              "Có kịch bản → ra video chỉ trong vài phút",
              "Ghép video, text & audio dễ dàng",
              "Tự động sắp xếp & sắp thứ tự file media"
            ]
          }
        ],
        "en": [
          {
            "group": "Create",
            "icon": "film",
            "items": [
              "Script in → finished video out, in minutes",
              "Combine video, text & audio effortlessly",
              "Auto-organize & sequence your media files"
            ]
          }
        ]
      },
      "display": {
        "taglineVi": "Có kịch bản? 1 click ra video hoàn chỉnh",
        "taglineEn": "Got a script? One click to a finished video",
        "highlightVi": "Bộ công cụ cốt lõi",
        "highlightEn": "Core toolkit",
        "ctaVi": "Bắt Đầu",
        "ctaEn": "Get Started",
        "emoji": "⚡",
        "sortOrder": 0,
        "isFeatured": false
      }
    }
  ]
}
```

## Desktop App Usage

### 1. Fetch once on startup, cache locally

```python
import requests, json, os

CACHE_FILE = "plan_features_cache.json"
API_URL = "https://flashcut.vn/api/plans/features"

def get_plan_features():
    # Try cache first (< 1 hour old)
    if os.path.exists(CACHE_FILE):
        age = time.time() - os.path.getmtime(CACHE_FILE)
        if age < 3600:
            with open(CACHE_FILE) as f:
                return json.load(f)

    # Fetch from API
    resp = requests.get(API_URL, timeout=5)
    data = resp.json()

    # Cache to disk
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f)

    return data
```

### 2. Show upsell popup when feature is locked

```python
def show_upsell(feature_key: str, current_plan: str):
    """
    Called when user tries to use a locked feature.
    Shows what they're missing + upgrade CTA.
    """
    data = get_plan_features()
    plans = data["plans"]
    lang = get_user_language()  # "vi" or "en"

    # Find the plan that has this feature
    upgrade_plan = None
    matching_items = []

    for plan in plans:
        if plan["slug"] == current_plan:
            continue  # skip current plan
        features = plan["features"].get(lang, [])
        for group in features:
            for item in group["items"]:
                if feature_key.lower() in item.lower():
                    matching_items.append(item)
                    upgrade_plan = plan
                    break

    if upgrade_plan:
        display = upgrade_plan["display"]
        tagline = display.get(f"tagline{lang.title()}", "")
        cta = display.get(f"cta{lang.title()}", "Upgrade")
        emoji = display.get("emoji", "🚀")

        # Show dialog with:
        # - emoji + plan name
        # - tagline
        # - matching feature items (with ✅)
        # - CTA button → open checkout URL
```

### 3. Feature key mapping

Map desktop app feature IDs to searchable keywords:

| App Feature ID | Search Keywords |
|---|---|
| `tts` | `giọng nói`, `voices from text` |
| `subtitle_auto` | `phụ đề`, `subtitles` |
| `ai_multi_model` | `4 AI model`, `models working` |
| `batch_effects` | `hiệu ứng`, `effects to all clips` |
| `templates` | `template`, `tái sử dụng` |
| `ai_sfx` | `SFX`, `sound effects` |
| `ai_director` | `mô tả`, `describe` |

## Data Fields Reference

| Field | Type | Description |
|---|---|---|
| `slug` | string | Plan identifier: `basic`, `pro`, `ultra` |
| `name` | string | Display name |
| `priceVnd` | int | Price in VND |
| `priceUsd` | int? | Price in USD (nullable) |
| `features.vi[]` | array | Vietnamese feature groups |
| `features.en[]` | array | English feature groups |
| `features.*.group` | string | Group heading: "AI Brain", "Tạo video" |
| `features.*.icon` | string | Icon key: `film`, `brain`, `mic`, `settings`, `cpu`, `plug`, `layers`, `sparkles` |
| `features.*.items` | string[] | Feature descriptions |
| `display.emoji` | string | Plan emoji: ⚡ 🚀 👑 |
| `display.sortOrder` | int | Display order (0, 1, 2) |
| `display.isFeatured` | bool | "Most Popular" badge |
| `display.taglineVi/En` | string | Plan tagline |
| `display.ctaVi/En` | string | CTA button text |
