# 🚀 خطوات تشغيل المشروع - WhatsDeveloper Evolution
**Server:** 178.63.34.211  
**Date:** 2026-08-08

---

## ✅ ما تم إنجازه

### 1. تثبيت Dependencies
- ✅ Evolution API - تم التثبيت
- ✅ Backend Bridge - تم التثبيت  
- ✅ Manager UI - تم التثبيت

### 2. ملفات التكوين
- ✅ `evolution-api/.env` - Port 2345, PostgreSQL 10034
- ✅ `whatsdeveloper-backend/.env` - Port 3456
- ✅ `WhatsDeveloper-Manager/.env` - Port 4567
- ✅ `web.config` - IIS Configuration
- ✅ Prisma Client - تم إنشاؤه

### 3. السكريبتات
- ✅ `start-all.bat` - تشغيل جميع المشاريع (Windows)
- ✅ `start-all.sh` - تشغيل جميع المشاريع (Linux)
- ✅ `stop-all.sh` - إيقاف المشاريع
- ✅ `install-deps.bat/sh` - تثبيت Dependencies

---

## ⚠️ خطوة واحدة متبقية قبل التشغيل

### تحديث Password الداتابيز

**الملف:** `evolution-api/.env`  
**السطر 13:**

```env
DATABASE_CONNECTION_URI=postgresql://postgres:password@localhost:10034/evolution?schema=public&sslmode=disable
```

**غير `password` بالباسورد الحقيقي:**

```env
DATABASE_CONNECTION_URI=postgresql://postgres:YourActualPassword@localhost:10034/evolution?schema=public&sslmode=disable
```

---

## 🎯 خطوات التشغيل النهائية

### الخطوة 1: تعديل الباسورد
```bash
# افتح الملف
notepad evolution-api\.env

# أو في Linux
nano evolution-api/.env

# عدل السطر 13 وحط الباسورد الصحيح
```

### الخطوة 2: إنشاء Database (إذا لم يكن موجود)
```bash
cd evolution-api
npm run db:deploy:win
```

إذا ظهر خطأ أن Database موجود - تجاهله وكمل.

### الخطوة 3: تشغيل المشاريع

#### Option A: استخدام السكريبت (موصى به)
```bash
start-all.bat
```

#### Option B: تشغيل يدوي (واحد واحد)

**Terminal 1 - Evolution API:**
```bash
cd evolution-api
npm start
```

**Terminal 2 - Backend:**
```bash
cd whatsdeveloper-backend
npm start
```

**Terminal 3 - Manager:**
```bash
cd WhatsDeveloper-Manager
npm run dev -- --port 4567 --host
```

---

## 🧪 اختبار المشاريع بعد التشغيل

### 1. Evolution API (Port 2345)
```bash
curl http://178.63.34.211:2345/
```
يجب أن يرجع: `{"status":"ok"...}`

**Documentation:** http://178.63.34.211:2345/docs

### 2. Backend API (Port 3456)
```bash
curl http://178.63.34.211:3456/health
```
يجب أن يرجع: `{"status":"healthy"}`

**Documentation:** http://178.63.34.211:3456/api-docs

### 3. Manager UI (Port 4567)
افتح في المتصفح:
```
http://178.63.34.211:4567
```

---

## 📊 البورتات والـ URLs

| Service | Port | Direct URL | Via Domain (IIS) |
|---------|------|------------|------------------|
| Evolution API | 2345 | http://178.63.34.211:2345 | http://dk.whatsdeveloper.com/evolution/ |
| Backend API | 3456 | http://178.63.34.211:3456 | http://dk.whatsdeveloper.com/api/ |
| Manager UI | 4567 | http://178.63.34.211:4567 | http://dk.whatsdeveloper.com/ |
| PostgreSQL | 10034 | localhost:10034 | - |

---

## 🔑 API Key

نفس المفتاح للـ Evolution و Backend:
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

## 🔧 إعداد IIS (للدومين)

### 1. نسخ web.config
```bash
copy web.config C:\inetpub\wwwroot\dk.whatsdeveloper.com\
```

### 2. تأكد من URL Rewrite Module
- IIS Manager → Server → Modules
- تأكد من وجود "URL Rewrite"
- إذا مش موجود، حمله من: https://www.iis.net/downloads/microsoft/url-rewrite

### 3. إعادة تشغيل IIS
```bash
iisreset
```

---

## 📝 ملفات التوثيق

| File | Purpose |
|------|---------|
| `QUICK-START.md` | دليل البدء السريع بالعربي |
| `TEST-APIS.md` | دليل اختبار الـ APIs |
| `DATABASE-PASSWORD.md` | تعليمات تحديث الباسورد |
| `SETUP-REPORT.md` | تقرير الإعداد الكامل |
| `FINAL-STEPS.md` | هذا الملف |

---

## 🆘 Troubleshooting

### Evolution API لا يشتغل؟
```bash
# تحقق من الـ password في .env
# تحقق من PostgreSQL port
netstat -ano | grep 10034

# تحقق من الـ logs
tail -f logs/evolution-api.log
```

### Backend API لا يشتغل؟
```bash
# تحقق أن Evolution API شغال الأول
curl http://localhost:2345/

# شغل Backend
cd whatsdeveloper-backend
npm start
```

### Manager UI لا يفتح؟
```bash
# تحقق من الـ .env file
cat WhatsDeveloper-Manager/.env

# تأكد من البورت متاح
netstat -ano | grep 4567
```

---

## ✅ Checklist

قبل ما تقول "خلصت":

- [ ] عدلت password في `evolution-api/.env`
- [ ] شغلت `npm run db:deploy:win` (إنشاء Database)
- [ ] شغلت Evolution API ونجح
- [ ] شغلت Backend API ونجح
- [ ] شغلت Manager UI ونجح
- [ ] اختبرت الـ 3 URLs
- [ ] نسخت `web.config` لـ IIS (اختياري)
- [ ] اختبرت URLs من خلال الدومين (اختياري)

---

## 🎉 بعد التشغيل الناجح

### إنشاء WhatsApp Instance
1. افتح Manager UI: http://178.63.34.211:4567
2. اضغط "Create Instance"
3. اسكان QR Code بالواتساب
4. ابدأ إرسال رسائل!

### اختبار إرسال رسالة
```bash
curl -X POST http://178.63.34.211:3456/api/send-message \
  -H "Content-Type: application/json" \
  -H "X-API-Token: B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D" \
  -H "X-Device-UUID: test-device-001" \
  -d '{
    "phone": "201234567890",
    "message": "مرحباً! رسالة تجريبية من Evolution API"
  }'
```

---

**🎯 الخطوة التالية:** عدل الباسورد وشغل `start-all.bat`

**📞 للدعم:** شوف ملفات التوثيق في المجلد الرئيسي
