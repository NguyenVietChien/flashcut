# FlashCut License Server — Tài liệu Chi tiết

> **Ngày tạo:** 22/02/2026
> **Server:** DigitalOcean Droplet — Ubuntu 24.04 LTS

---

## 1. Thông tin Server

| Hạng mục | Giá trị |
|----------|---------|
| **Provider** | DigitalOcean |
| **Plan** | Basic — 1 vCPU / 1 GB RAM / 25 GB SSD |
| **Region** | SGP1 (Singapore) |
| **OS** | Ubuntu 24.04 (LTS) x64 |
| **IP Address** | `157.230.248.149` |
| **Domain** | `api.flashcutai.com` |
| **Cost** | $6/tháng |

---

## 2. Kiến trúc

```
Internet
  │
  ▼
Nginx (port 443/SSL) ──► Gunicorn (127.0.0.1:5000) ──► Flask App (app.py)
                                                            │
                                                            ▼
                                                      SQLite Database
                                              /opt/flashcut-api/data/licenses.db
```

---

## 3. Thông tin Bảo mật

| Key | Value | Vị trí |
|-----|-------|--------|
| **SECRET_KEY** | `FlashCut_License_2026_SuperSecretKey_XkP9mQ` | `.env` |
| **ADMIN_API_KEY** | `fc-admin-2026-secure-key` | `.env` |
| **BASE_SECRET** | `FlashCut_Base_2026_@Secure` | `.env` |
| **JWT_EXPIRATION_DAYS** | `30` | `.env` |
| **SSL Certificate** | Let's Encrypt — hết hạn 23/05/2026 (tự renew) | certbot |

> [!CAUTION]
> Thay đổi `SECRET_KEY`, `ADMIN_API_KEY`, và `BASE_SECRET` bằng giá trị mạnh hơn trước khi go-live thật!

---

## 4. Cấu trúc File trên VPS

```
/opt/flashcut-api/
├── app.py              # Flask API Server chính
├── models.py           # Database models (License, ActivationLog)
├── requirements.txt    # Python dependencies
├── .env                # Environment variables (SECRET)
├── data/
│   └── licenses.db     # SQLite database
└── venv/               # Python virtual environment
```

---

## 5. API Endpoints

### 5.1 Health Check
```
GET /api/v1/status
```
**Response:**
```json
{
  "status": "online",
  "version": "1.0.0",
  "timestamp": "2026-02-22T07:06:45.541178"
}
```

---

### 5.2 Activate License
```
POST /api/v1/license/activate
Headers: X-Signature: <HMAC signature>
```
**Request:**
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "hwid": "abc123...",
  "timestamp": 1234567890
}
```
**Response (thành công):**
```json
{
  "success": true,
  "message": "Activation successful",
  "token": "jwt_token_here",
  "tier": "pro",
  "permissions": ["view_info", "basic_action", "pro_action", "export_data"],
  "expires_at": "2026-08-22T00:00:00"
}
```

---

### 5.3 Validate Token
```
POST /api/v1/license/validate
Headers: X-Signature: <HMAC signature>
```
**Request:**
```json
{
  "token": "jwt_token",
  "hwid": "abc123...",
  "timestamp": 1234567890
}
```
**Response:**
```json
{
  "valid": true,
  "message": "Token valid",
  "tier": "pro",
  "permissions": [...],
  "expires_at": "2026-08-22T00:00:00",
  "needs_refresh": false
}
```

---

### 5.4 Refresh Token
```
POST /api/v1/license/refresh
Headers: X-Signature: <HMAC signature>
```
**Request:**
```json
{
  "token": "old_jwt_token",
  "hwid": "abc123...",
  "timestamp": 1234567890
}
```

---

### 5.5 Heartbeat
```
POST /api/v1/license/heartbeat
Headers: X-Signature: <HMAC signature>
```
**Request:**
```json
{
  "token": "jwt_token",
  "hwid": "abc123...",
  "timestamp": 1234567890
}
```

---

### 5.6 Create License (Admin)
```
POST /api/v1/admin/license/create
Headers: X-Admin-Key: fc-admin-2026-secure-key
```
**Request:**
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "tier": "pro",
  "max_activations": 1,
  "expires_days": 180
}
```
**Response:**
```json
{
  "success": true,
  "license_id": "uuid-here",
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "expires_at": "2026-08-22T00:00:00"
}
```

---

## 6. Bảo mật — HMAC Signature

Mọi request từ desktop app đều cần **HMAC signature** trong header `X-Signature`:

```
1. dynamic_key = SHA256(BASE_SECRET + HWID)
2. json_payload = JSON.dumps(data, sort_keys=True)
3. signature = HMAC-SHA256(dynamic_key, json_payload)
4. Header: X-Signature = signature
```

Kèm **timestamp** để chống replay attack (cửa sổ 5 phút).

---

## 7. Tier & Permissions

| Tier | Permissions |
|------|------------|
| `basic` | `view_info`, `basic_action` |
| `pro` | `view_info`, `basic_action`, `pro_action`, `export_data` |
| `ultra` | Tất cả + `unlimited_access`, `premium_support` |

---

## 8. Lệnh Quản trị VPS

### Kiểm tra status
```bash
systemctl status flashcut-api
```

### Xem logs
```bash
journalctl -u flashcut-api -f
```

### Restart server
```bash
systemctl restart flashcut-api
```

### Stop server
```bash
systemctl stop flashcut-api
```

### Sửa environment variables
```bash
nano /opt/flashcut-api/.env
systemctl restart flashcut-api
```

### Update code
```bash
# Từ máy local (PowerShell):
scp C:\Users\Admin\Documents\MiniApp\server\app.py root@157.230.248.149:/opt/flashcut-api/
scp C:\Users\Admin\Documents\MiniApp\server\models.py root@157.230.248.149:/opt/flashcut-api/

# Trên VPS:
systemctl restart flashcut-api
```

### Backup database
```bash
cp /opt/flashcut-api/data/licenses.db /opt/flashcut-api/data/licenses.db.bak
```

### Tạo license test (trên VPS)
```bash
curl -X POST https://api.flashcutai.com/api/v1/admin/license/create \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: fc-admin-2026-secure-key" \
  -d '{"tier": "pro", "max_activations": 1, "expires_days": 180}'
```

---

## 9. Cấu hình Nginx

**File:** `/etc/nginx/sites-available/flashcut-api`

```nginx
server {
    listen 80;
    server_name api.flashcutai.com;
    # Certbot tự redirect sang HTTPS
}

server {
    listen 443 ssl;
    server_name api.flashcutai.com;

    ssl_certificate /etc/letsencrypt/live/api.flashcutai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.flashcutai.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 10. DNS Records (Cloudflare)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `api` | `157.230.248.149` | DNS only (xám) |

---

## 11. Chi phí Hàng tháng

| Dịch vụ | Chi phí |
|---------|---------|
| DigitalOcean VPS | $6/tháng |
| Domain (flashcutai.com) | ~$12/năm |
| Vercel (Webapp) | FREE |
| Turso (Webapp DB) | FREE |
| Let's Encrypt SSL | FREE |
| **Tổng** | **~$7/tháng** |
