# 🔧 إصلاح مشكلة Webhook Flow

## 🎯 المشكلة الأساسية

الـ webhook payload اللي وصل لـ n8n كان **مباشرة من Evolution API**، مش من الـ Backend Bridge! 

### ❌ الـ Flow الغلط (القديم):
```
WhatsApp → Evolution API → n8n مباشرة
```

الـ payload بيوصل خام من Evolution بدون تحويل أو معالجة!

### ✅ الـ Flow الصحيح (الجديد):
```
WhatsApp → Evolution API → Backend Bridge → n8n
```

الـ Backend Bridge بيحول الـ payload للشكل المطلوب قبل ما يوصل n8n!

---

## 🚀 الحل الكامل

### 1. استخدم الـ `start-all.bat` الجديد

الملف ده اتعدّل عشان:
- ✅ يعمل **build للـ backend أولاً** قبل التشغيل
- ✅ ينظف الـ ports بشكل صحيح
- ✅ يديك تعليمات واضحة بعد التشغيل
- ✅ يشغل الخدمات بالترتيب الصحيح مع timeouts مناسبة

### 2. سجّل الـ Webhooks بالترتيب الصحيح

#### خطوة أ: سجّل n8n في الـ Backend
```bash
POST https://dk.whatsdeveloper.com/api/webhook/register
Content-Type: application/json

{
  "url": "https://n8n.octobot.it.com/webhook/octoboto",
  "enabled": true
}
```

**أو استخدم curl:**
```bash
curl -X POST "https://dk.whatsdeveloper.com/api/webhook/register" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://n8n.octobot.it.com/webhook/octoboto","enabled":true}'
```

#### خطوة ب: اضبط Evolution API عشان يبعت للـ Backend
```bash
POST https://dk.whatsdeveloper.com/evolution/webhook/set/OctoBot
Content-Type: application/json
apikey: YOUR_EVOLUTION_API_KEY

{
  "webhook": {
    "enabled": true,
    "url": "https://dk.whatsdeveloper.com/api/webhook/incoming",
    "events": ["messages.upsert"],
    "webhookByEvents": false
  }
}
```

**أو استخدم curl:**
```bash
curl -X POST "https://dk.whatsdeveloper.com/evolution/webhook/set/OctoBot" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_API_KEY_HERE" \
  -d '{"webhook":{"enabled":true,"url":"https://dk.whatsdeveloper.com/api/webhook/incoming","events":["messages.upsert"],"webhookByEvents":false}}'
```

> **ملاحظة:** استبدل `YOUR_EVOLUTION_API_KEY` بالـ API key الحقيقي من Evolution API settings!

---

## 📋 خطوات التشغيل السريعة

### 1. أوقف كل الخدمات القديمة
```bash
# استخدم stop-all.bat أو أقفل نوافذ CMD يدوياً
```

### 2. شغّل الخدمات بالملف الجديد
```bash
cd f:\whatsDev-Evo
start-all.bat
```

انتظر حتى تظهر رسالة "All Services Started Successfully!"

### 3. سجّل الـ Webhooks
```bash
# اختياري: استخدم configure-webhooks.bat (بعد إضافة API key)
# أو نفّذ الـ curl commands يدوياً كما في الأعلى
```

### 4. اختبر بإرسال رسالة
أرسل رسالة من WhatsApp للرقم المتصل بـ Evolution API

### 5. راقب الـ Logs

#### في Backend Bridge window:
```
[Webhook] Transforming message: {...}
[Webhook] Text message extracted: "يا هلا بالتست"
[Webhook] Final transformed payload: {...}
[Webhook] Sent to https://n8n.octobot.it.com/webhook/octoboto for UUID: OctoBot
```

#### في n8n، الـ payload سيكون:
```json
{
  "uuid": "OctoBot",
  "event": "message.received",
  "timestamp": 1786219688000,
  "data": {
    "from": "201118180845",
    "fromName": "Dev.Dodge 🧑🏻‍💻",
    "to": "201118180845@s.whatsapp.net",
    "messageId": "3B41BF4D3C5CEB3DAF8F",
    "isGroup": false,
    "message": {
      "type": "text",
      "body": "يا هلا بالتست"
    }
  }
}
```

---

## 🔍 التحقق من الإعدادات

### تأكد إن Evolution بيبعت للـ Backend:
```bash
GET https://dk.whatsdeveloper.com/evolution/webhook/find/OctoBot
apikey: YOUR_API_KEY
```

يجب أن يظهر:
```json
{
  "enabled": true,
  "url": "https://dk.whatsdeveloper.com/api/webhook/incoming",
  "events": ["messages.upsert"]
}
```

### تأكد إن Backend مسجل n8n:
```bash
GET https://dk.whatsdeveloper.com/api/webhook/config
```

يجب أن يظهر:
```json
{
  "success": true,
  "uuid": "OctoBot",
  "url": "https://n8n.octobot.it.com/webhook/octoboto",
  "enabled": true
}
```

---

## 📁 الملفات المُحدَّثة

### ✅ تم التعديل:
- `start-all.bat` - script التشغيل الرئيسي مع build تلقائي
- `whatsdeveloper-backend/src/controllers/webhook.controller.ts` - استخراج data من Evolution wrapper
- `whatsdeveloper-backend/src/services/webhook.service.ts` - تحسين transformMessage مع logging

### ✅ تم الإنشاء:
- `configure-webhooks.bat` - script تلقائي لتسجيل الـ webhooks
- `WEBHOOK-PAYLOAD-FIX.md` - توثيق تفصيلي للإصلاحات
- `WEBHOOK-FLOW-FIX.md` - هذا الملف (دليل التشغيل)
- `restart-backend.bat` - إعادة تشغيل Backend فقط

---

## 🐛 استكشاف الأخطاء

### المشكلة: n8n بيستقبل payload خام من Evolution
**الحل:** تأكد إن Evolution webhook URL بيشير للـ Backend:
```
https://dk.whatsdeveloper.com/api/webhook/incoming
```
وليس n8n مباشرة!

### المشكلة: Backend مش بيحول الـ payload
**الحل:** 
1. تأكد إن الـ build تم بنجاح: `cd whatsdeveloper-backend && npm run build`
2. أعد تشغيل Backend: `restart-backend.bat`
3. تحقق من logs في Backend window

### المشكلة: n8n مش بيستقبل حاجة
**الحل:**
1. تأكد إن n8n مسجل في Backend: `GET /api/webhook/config`
2. تحقق من الـ URL صحيح: `https://n8n.octobot.it.com/webhook/octoboto`
3. راجع logs في Backend window

### المشكلة: Backend بيقول "No active webhook configured"
**الحل:** سجّل n8n webhook:
```bash
POST /api/webhook/register
{"url": "https://n8n.octobot.it.com/webhook/octoboto", "enabled": true}
```

---

## 📊 مقارنة الـ Payloads

### ❌ قبل الإصلاح (Evolution خام):
```json
{
  "event": "messages.upsert",
  "instance": "OctoBot",
  "data": {
    "key": {...},
    "message": {"conversation": "يا هلا بالتست"},
    "pushName": "Dev.Dodge 🧑🏻‍💻",
    "messageTimestamp": 1786219688
  },
  "destination": "https://n8n.octobot.it.com/webhook/octoboto",
  "sender": "201505354810@s.whatsapp.net"
}
```

### ✅ بعد الإصلاح (WhatsDeveloper Format):
```json
{
  "uuid": "OctoBot",
  "event": "message.received",
  "timestamp": 1786219688000,
  "data": {
    "from": "201118180845",
    "fromName": "Dev.Dodge 🧑🏻‍💻",
    "message": {
      "type": "text",
      "body": "يا هلا بالتست"
    },
    "messageId": "3B41BF4D3C5CEB3DAF8F",
    "isGroup": false
  }
}
```

### 🎯 الفوائد:
- ✅ `from` نظيف بدون `@s.whatsapp.net`
- ✅ `timestamp` بالـ milliseconds
- ✅ `message.type` واضح (`text`, `image`, `video`, إلخ)
- ✅ `message.body` مباشر وسهل الوصول
- ✅ Structure موحد ومتوافق مع API Docs

---

## 🎓 فهم الـ Architecture

```
┌─────────────┐
│  WhatsApp   │
└──────┬──────┘
       │ Message arrives
       ▼
┌─────────────────────┐
│  Evolution API      │  Port 2345
│  (WhatsApp Bridge)  │  https://dk.whatsdeveloper.com/evolution
└──────┬──────────────┘
       │ Webhook: messages.upsert
       │ POST /api/webhook/incoming
       ▼
┌────────────────────────┐
│  Backend Bridge        │  Port 3456
│  (Transformer)         │  https://dk.whatsdeveloper.com/api
│  ┌──────────────────┐  │
│  │ webhook.service  │  │  - Extract data from wrapper
│  │ transformMessage │  │  - Clean phone numbers
│  │                  │  │  - Detect message type
│  └──────────────────┘  │  - Add metadata
└──────┬─────────────────┘
       │ Transformed payload
       │ POST to registered webhook
       ▼
┌─────────────────┐
│  n8n Webhook    │  https://n8n.octobot.it.com/webhook/octoboto
│  (Automation)   │
└─────────────────┘
```

---

## ✅ Checklist

قبل ما تقول "شغّال":

- [ ] `start-all.bat` يشتغل بدون errors
- [ ] Evolution API webhook URL = `https://dk.whatsdeveloper.com/api/webhook/incoming`
- [ ] Backend مسجل n8n webhook
- [ ] أرسلت رسالة test من WhatsApp
- [ ] شفت في Backend logs: "Transforming message" و "Sent to n8n"
- [ ] n8n استقبل payload بالشكل الصحيح (uuid, event, data.message.type, data.message.body)

---

## 📞 الدعم

إذا واجهتك مشكلة:
1. راجع الـ logs في Backend window
2. تحقق من webhook configurations
3. استخدم `GET /api/webhook/config` للتأكد من التسجيل
4. استخدم `GET /evolution/webhook/find/OctoBot` للتأكد من Evolution settings

---

**آخر تحديث:** 2026-08-08  
**الحالة:** ✅ جاهز للتشغيل
