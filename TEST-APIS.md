# API Testing Guide - WhatsDeveloper Evolution
Server: `178.63.34.211`

## Base URLs

### 1. Evolution API (Port 2345)
```
http://178.63.34.211:2345
```

**Test Endpoints:**
- Health Check: `GET http://178.63.34.211:2345/`
- Manager UI: `GET http://178.63.34.211:2345/manager`
- API Docs: `GET http://178.63.34.211:2345/docs`
- Instances List: `GET http://178.63.34.211:2345/instance/fetchInstances`
  - Headers: `apikey: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D`

### 2. WhatsDeveloper Backend (Port 3456)
```
http://178.63.34.211:3456
```

**Test Endpoints:**
- Health Check: `GET http://178.63.34.211:3456/health`
- API Docs: `GET http://178.63.34.211:3456/api-docs`
- Send Message: `POST http://178.63.34.211:3456/api/send-message`
  - Headers:
    ```
    X-API-Token: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D
    X-Device-UUID: test-device-001
    Content-Type: application/json
    ```
  - Body:
    ```json
    {
      "phone": "201234567890",
      "message": "Test message from API"
    }
    ```

### 3. WhatsDeveloper Manager (Port 4567)
```
http://178.63.34.211:4567
```

**Test:**
- Open in browser: `http://178.63.34.211:4567`
- Should load React frontend

---

## Domain Access (via IIS)

When configured with domain `dk.whatsdeveloper.com`:

### Evolution API
```
http://dk.whatsdeveloper.com/evolution/
```

### Backend API
```
http://dk.whatsdeveloper.com/api/
```

### Manager UI
```
http://dk.whatsdeveloper.com/
```

---

## Media URLs

### Evolution API Media Storage
```
http://178.63.34.211:2345/uploads/media/
```

Example:
```
http://178.63.34.211:2345/uploads/media/2024/08/image.jpg
```

### Via Domain (IIS)
```
http://dk.whatsdeveloper.com/evolution/uploads/media/
```

---

## Quick Tests

### 1. Test Evolution API
```bash
curl http://178.63.34.211:2345/
```

### 2. Test Backend API
```bash
curl http://178.63.34.211:3456/health
```

### 3. Test Manager UI
```bash
curl http://178.63.34.211:4567/
```

### 4. Test Evolution API with Auth
```bash
curl -X GET http://178.63.34.211:2345/instance/fetchInstances \
  -H "apikey: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D"
```

### 5. Test Send Message via Backend
```bash
curl -X POST http://178.63.34.211:3456/api/send-message \
  -H "Content-Type: application/json" \
  -H "X-API-Token: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D" \
  -H "X-Device-UUID: test-device-001" \
  -d '{
    "phone": "201234567890",
    "message": "Test message"
  }'
```

---

## Troubleshooting

### Port Check
```bash
# Check if ports are open
netstat -ano | findstr "2345"
netstat -ano | findstr "3456"
netstat -ano | findstr "4567"
```

### Process Status
```bash
# Windows Task Manager or:
tasklist | findstr "node"
```

### Logs Location
- Evolution API: `evolution-api/logs/`
- Backend: Console output
- Manager: Browser console (F12)

---

## Database Connection

Since database is on same server (178.63.34.211), it's configured as `localhost` in `.env` files:

```env
DATABASE_CONNECTION_URI=postgresql://postgres:password@localhost:5432/evolution
```

Make sure PostgreSQL is running:
```bash
# Check PostgreSQL service
sc query postgresql-x64-15
```

---

## API Authentication

**API Key (used in all requests):**
```
B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D
```

**Header Names:**
- Evolution API: `apikey`
- Backend API: `X-API-Token`

**Device UUID (Backend only):**
```
X-Device-UUID: test-device-001
```

---

## Next Steps

1. ✅ Start all services using `start-all.bat`
2. ✅ Test each API endpoint
3. ✅ Configure IIS with `web.config`
4. ✅ Point domain to IIS site
5. ✅ Test domain URLs
6. ✅ Create WhatsApp instance via Manager UI
7. ✅ Test message sending
