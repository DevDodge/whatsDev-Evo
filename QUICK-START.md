# WhatsDeveloper-Evolution - Quick Start Guide
**Server:** 178.63.34.211

## 🚀 Quick Start (للتشغيل السريع)

### الخطوة 1: تثبيت Dependencies
```bash
# Windows:
install-deps.bat

# Linux/Mac:
chmod +x install-deps.sh
./install-deps.sh
```

### الخطوة 2: تشغيل المشاريع
```bash
# Windows:
start-all.bat

# Linux/Mac:
chmod +x start-all.sh
./start-all.sh
```

### الخطوة 3: إيقاف المشاريع
```bash
# Linux/Mac:
./stop-all.sh

# Windows: 
# أغلق نوافذ CMD المفتوحة
```

---

## 📍 URLs التشغيل المباشر

| Service | URL | Documentation |
|---------|-----|---------------|
| **Evolution API** | http://178.63.34.211:2345 | http://178.63.34.211:2345/docs |
| **Backend API** | http://178.63.34.211:3456 | http://178.63.34.211:3456/api-docs |
| **Manager UI** | http://178.63.34.211:4567 | - |

---

## 🔑 API Authentication

**API Key (نفس المفتاح للكل):**
```
B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D
```

**Headers للـ Evolution API:**
```
apikey: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D
```

**Headers للـ Backend API:**
```
X-API-Token: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D
X-Device-UUID: test-device-001
```

---

## 🧪 اختبار الـ APIs

### 1. اختبار Evolution API
```bash
curl http://178.63.34.211:2345/
```

### 2. اختبار Backend API
```bash
curl http://178.63.34.211:3456/health
```

### 3. اختبار Manager UI
افتح في المتصفح:
```
http://178.63.34.211:4567
```

### 4. اختبار إرسال رسالة
```bash
curl -X POST http://178.63.34.211:3456/api/send-message \
  -H "Content-Type: application/json" \
  -H "X-API-Token: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D" \
  -H "X-Device-UUID: test-device-001" \
  -d '{
    "phone": "201234567890",
    "message": "Test message from Evolution API"
  }'
```

---

## 🌐 إعداد IIS والدومين

### 1. نقل web.config لموقع IIS
انسخ ملف `web.config` إلى المجلد الرئيسي لموقع IIS:
```
C:\inetpub\wwwroot\dk.whatsdeveloper.com\web.config
```

### 2. تفعيل URL Rewrite في IIS
- افتح IIS Manager
- اختر الموقع
- Install URL Rewrite Module إذا لم يكن مثبت
- أعد تشغيل IIS

### 3. URLs من خلال الدومين

| Service | Domain URL |
|---------|-----------|
| **Evolution API** | http://dk.whatsdeveloper.com/evolution/ |
| **Backend API** | http://dk.whatsdeveloper.com/api/ |
| **Manager UI** | http://dk.whatsdeveloper.com/ |

---

## 📊 Ports Configuration

| Project | Port | Purpose |
|---------|------|---------|
| Evolution API | 2345 | WhatsApp Communication |
| Backend Bridge | 3456 | API Translation Layer |
| Manager Frontend | 4567 | Web Interface |

---

## 💾 Database Configuration

الداتابيز على نفس السيرفر (178.63.34.211) = `localhost`

```env
DATABASE_CONNECTION_URI=postgresql://postgres:password@localhost:5432/evolution
```

**تأكد من PostgreSQL شغال:**
```bash
# Windows:
sc query postgresql-x64-15

# Linux:
sudo systemctl status postgresql
```

---

## 📁 Media Storage

### Evolution API Media:
```
http://178.63.34.211:2345/uploads/media/
```

### من خلال الدومين:
```
http://dk.whatsdeveloper.com/evolution/uploads/media/
```

---

## 🔍 Troubleshooting

### فحص البورتات
```bash
# Windows:
netstat -ano | findstr "2345"
netstat -ano | findstr "3456"
netstat -ano | findstr "4567"

# Linux:
netstat -tuln | grep 2345
netstat -tuln | grep 3456
netstat -tuln | grep 4567
```

### فحص الـ Logs
```bash
# Linux/Mac:
tail -f logs/evolution-api.log
tail -f logs/backend.log
tail -f logs/manager.log

# Windows:
# شوف الـ console في نوافذ CMD المفتوحة
```

### إعادة تشغيل خدمة واحدة
```bash
# مثال: Evolution API
cd evolution-api
npm start
```

---

## 📝 ملفات مهمة

| File | Description |
|------|-------------|
| `web.config` | IIS Reverse Proxy Configuration |
| `TEST-APIS.md` | API Testing Guide |
| `start-all.bat/sh` | Start all services |
| `stop-all.sh` | Stop all services (Linux/Mac) |
| `install-deps.bat/sh` | Install dependencies |

---

## ✅ Checklist للتشغيل الكامل

- [ ] تثبيت Node.js (v18+)
- [ ] تثبيت PostgreSQL
- [ ] إنشاء database: `evolution`
- [ ] تشغيل `install-deps.bat/sh`
- [ ] تحديث password الداتابيز في `.env` files
- [ ] تشغيل `start-all.bat/sh`
- [ ] اختبار URLs المباشرة
- [ ] نقل `web.config` لـ IIS
- [ ] اختبار URLs من خلال الدومين
- [ ] إنشاء WhatsApp instance من Manager UI
- [ ] اختبار إرسال رسالة

---

## 🆘 Support

للمزيد من التفاصيل:
- [TEST-APIS.md](TEST-APIS.md) - دليل اختبار الـ APIs
- [DEPLOYMENT.md](DEPLOYMENT.md) - دليل النشر الكامل
- [README.md](README.md) - الوثائق الكاملة

---

**Built with ❤️ by DevDodge/DK-Octobot**
