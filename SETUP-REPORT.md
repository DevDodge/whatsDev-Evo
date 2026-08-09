# تقرير إعداد المشروع - WhatsDeveloper Evolution
**Server:** 178.63.34.211  
**Date:** 2026-08-08

---

## ✅ الملفات المُنشأة

### 1. ملفات التكوين (.env)

| Project | File | Port | Status |
|---------|------|------|--------|
| Evolution API | `evolution-api/.env` | 2345 | ✅ تم الإنشاء |
| Backend Bridge | `whatsdeveloper-backend/.env` | 3456 | ✅ تم الإنشاء |
| Manager UI | `WhatsDeveloper-Manager/.env` | 4567 | ✅ تم الإنشاء |

### 2. سكريبتات التشغيل

| Script | Purpose | Platform |
|--------|---------|----------|
| `start-all.bat` | تشغيل جميع المشاريع | Windows |
| `start-all.sh` | تشغيل جميع المشاريع | Linux/Mac |
| `stop-all.sh` | إيقاف جميع المشاريع | Linux/Mac |
| `install-deps.bat` | تثبيت Dependencies | Windows |
| `install-deps.sh` | تثبيت Dependencies | Linux/Mac |

### 3. ملفات التوثيق

| File | Description |
|------|-------------|
| `web.config` | IIS Reverse Proxy Configuration |
| `TEST-APIS.md` | دليل اختبار الـ APIs بالتفصيل |
| `QUICK-START.md` | دليل البدء السريع بالعربي |
| `SETUP-REPORT.md` | هذا التقرير |

---

## 🔧 التكوينات المطبقة

### Database Configuration
```env
DATABASE_CONNECTION_URI=postgresql://postgres:password@localhost:5432/evolution
```
**⚠️ تذكير:** غير password في الـ `.env` بالباسورد الحقيقي للـ PostgreSQL

### API Key
```
B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D
```

### Ports Mapping

| Service | Port | URL |
|---------|------|-----|
| Evolution API | 2345 | http://178.63.34.211:2345 |
| Backend Bridge | 3456 | http://178.63.34.211:3456 |
| Manager UI | 4567 | http://178.63.34.211:4567 |

### CORS Settings
تم تكوين CORS للسماح بالاتصال بين المشاريع الثلاثة:
- Evolution API: `*` (جميع المصادر)
- Backend: `http://178.63.34.211:4567, http://localhost:4567, http://dk.whatsdeveloper.com`

---

## 📋 خطوات التشغيل

### Windows:

```bash
# 1. تثبيت Dependencies
install-deps.bat

# 2. تحديث password الداتابيز
# افتح evolution-api/.env وغير password في DATABASE_CONNECTION_URI

# 3. تشغيل المشاريع
start-all.bat
```

### Linux/Mac:

```bash
# 1. تثبيت Dependencies
chmod +x install-deps.sh
./install-deps.sh

# 2. تحديث password الداتابيز
nano evolution-api/.env
# غير password في DATABASE_CONNECTION_URI

# 3. تشغيل المشاريع
chmod +x start-all.sh
./start-all.sh
```

---

## 🌐 إعداد IIS (للدومين)

### 1. نسخ web.config
```bash
# انسخ الملف إلى موقع IIS
copy web.config C:\inetpub\wwwroot\dk.whatsdeveloper.com\
```

### 2. تأكد من تثبيت URL Rewrite Module
- افتح IIS Manager
- اختر Server → Add or Remove Modules
- ثبت "URL Rewrite" إذا لم يكن مثبت

### 3. URLs بعد تكوين IIS
- Evolution API: `http://dk.whatsdeveloper.com/evolution/`
- Backend API: `http://dk.whatsdeveloper.com/api/`
- Manager UI: `http://dk.whatsdeveloper.com/`

---

## 🧪 اختبار الـ APIs

### Quick Tests (بعد التشغيل)

```bash
# 1. Test Evolution API
curl http://178.63.34.211:2345/

# 2. Test Backend API
curl http://178.63.34.211:3456/health

# 3. Test Manager UI (في المتصفح)
http://178.63.34.211:4567
```

### API Documentation URLs

| Service | Documentation URL |
|---------|------------------|
| Evolution API | http://178.63.34.211:2345/docs |
| Backend API | http://178.63.34.211:3456/api-docs |
| Evolution Manager | http://178.63.34.211:2345/manager |

---

## ⚠️ مهم قبل التشغيل

### 1. PostgreSQL Database
تأكد من:
- [ ] PostgreSQL مثبت وشغال
- [ ] Database اسمه `evolution` موجود
- [ ] Password محدث في `evolution-api/.env`

```sql
-- إنشاء الداتابيز
CREATE DATABASE evolution;
CREATE USER evolutionuser WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE evolution TO evolutionuser;
```

### 2. Firewall Rules
تأكد من فتح البورتات:
```bash
# Windows Firewall
netsh advfirewall firewall add rule name="Evolution API" dir=in action=allow protocol=TCP localport=2345
netsh advfirewall firewall add rule name="WhatsDev Backend" dir=in action=allow protocol=TCP localport=3456
netsh advfirewall firewall add rule name="WhatsDev Manager" dir=in action=allow protocol=TCP localport=4567
```

### 3. Node.js Version
Required: Node.js 18+
```bash
node --version  # should be v18.x or higher
```

---

## 📊 هيكل المشروع

```
whatsDev-Evo/
├── evolution-api/           # Evolution API (Port 2345)
│   ├── .env                # ✅ تم الإنشاء
│   ├── src/
│   └── package.json
│
├── whatsdeveloper-backend/ # Backend Bridge (Port 3456)
│   ├── .env                # ✅ تم الإنشاء
│   ├── src/
│   └── package.json
│
├── WhatsDeveloper-Manager/ # Manager UI (Port 4567)
│   ├── .env                # ✅ تم الإنشاء
│   ├── src/
│   └── package.json
│
├── web.config              # ✅ IIS Configuration
├── start-all.bat           # ✅ Windows Startup
├── start-all.sh            # ✅ Linux/Mac Startup
├── stop-all.sh             # ✅ Stop Services
├── install-deps.bat        # ✅ Install Dependencies (Windows)
├── install-deps.sh         # ✅ Install Dependencies (Linux)
├── TEST-APIS.md            # ✅ API Testing Guide
├── QUICK-START.md          # ✅ Quick Start Guide (Arabic)
└── SETUP-REPORT.md         # ✅ This Report
```

---

## 🔍 Troubleshooting

### المشاريع ما بتشتغل؟

1. **تحقق من البورتات:**
```bash
netstat -ano | findstr "2345 3456 4567"
```

2. **تحقق من الـ Logs:**
```bash
# في Windows: شوف نوافذ CMD
# في Linux: شوف ملفات logs/
tail -f logs/evolution-api.log
```

3. **تحقق من الداتابيز:**
```bash
# Test PostgreSQL connection
psql -U postgres -d evolution
```

### Media URLs مش شغالة؟

تأكد من:
- `LOCAL_STORAGE_ENABLED=true` في `evolution-api/.env`
- المجلد `evolution-api/uploads/media/` موجود
- Permissions صحيحة على المجلد

---

## 📚 الخطوات التالية

1. ✅ **تثبيت Dependencies** → `install-deps.bat/sh`
2. ✅ **تحديث Database Password** → في `evolution-api/.env`
3. ✅ **تشغيل المشاريع** → `start-all.bat/sh`
4. ⏳ **اختبار APIs** → استخدم `TEST-APIS.md`
5. ⏳ **إعداد IIS** → نسخ `web.config`
6. ⏳ **إنشاء Instance** → من Manager UI
7. ⏳ **اختبار إرسال رسالة** → من API Docs

---

## 🆘 Support & Documentation

- **Quick Start:** [QUICK-START.md](QUICK-START.md)
- **API Testing:** [TEST-APIS.md](TEST-APIS.md)
- **Full Documentation:** [README.md](README.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Setup completed successfully! 🎉**  
**Next:** Run `install-deps.bat` then `start-all.bat`
