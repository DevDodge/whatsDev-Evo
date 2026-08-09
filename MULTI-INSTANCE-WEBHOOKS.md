# 🎯 Multi-Instance Webhook System - دليل الاستخدام

## ✨ النظام الجديد

**الآن البنظام dynamic ويدعم أي عدد من Instances!**

---

## 📋 كيف يعمل النظام؟

### 1. **كل Instance له webhook خاص**
- Instance A → n8n Webhook A
- Instance B → n8n Webhook B
- Instance C → n8n Webhook C

### 2. **Evolution يبعت للـ Backend**
```
Evolution Instance → Backend (يحول الـ payload) → n8n Webhook
```

### 3. **تسجيل Webhooks من أي مكان**
- من Manager UI ✅
- من Postman ✅
- من curl ✅
- تلقائياً من Auto-Config ✅

---

## 🚀 API Endpoints (الجديدة)

### 1. **تسجيل Webhook لـ Instance معين**

#### Method 1: Body parameter
```bash
POST http://localhost:55453/api/webhook/register
Content-Type: application/json

{
  "instanceId": "OctoBot",
  "url": "https://n8n.octobot.it.com/webhook/octoboto",
  "enabled": true
}
```

#### Method 2: URL parameter (أفضل)
```bash
POST http://localhost:55453/api/webhook/register/OctoBot
Content-Type: application/json

{
  "url": "https://n8n.octobot.it.com/webhook/octoboto",
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook registered successfully",
  "instanceId": "OctoBot",
  "url": "https://n8n.octobot.it.com/webhook/octoboto",
  "enabled": true
}
```

---

### 2. **الحصول على Webhook لـ Instance معين**

```bash
GET http://localhost:55453/api/webhook/config/OctoBot
```

**Response:**
```json
{
  "success": true,
  "instanceId": "OctoBot",
  "url": "https://n8n.octobot.it.com/webhook/octoboto",
  "enabled": true
}
```

---

### 3. **استقبال Webhook من Evolution**

Evolution يبعت على واحد من:

#### Option A: بدون instance ID في URL
```
POST http://localhost:55453/api/webhook/incoming
```
الـ Backend يستخرج instance ID من payload

#### Option B: مع instance ID في URL (أفضل)
```
POST http://localhost:55453/api/webhook/incoming/OctoBot
```

---

## 🔧 إعداد Evolution Instance

### لكل Instance جديد:

```bash
# استبدل OctoBot باسم الـ Instance بتاعك
curl -X POST "http://localhost:2345/webhook/set/OctoBot" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_API_KEY" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "http://localhost:55453/api/webhook/incoming/OctoBot",
      "events": ["MESSAGES_UPSERT"],
      "webhookByEvents": false,
      "webhookBase64": false
    }
  }'
```

---

## 📝 مثال عملي: إضافة Instance جديد

لنفترض عندك Instance اسمه `Customer-Support`:

### Step 1: سجّل webhook في Backend
```bash
curl -X POST "http://localhost:55453/api/webhook/register/Customer-Support" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://n8n.company.com/webhook/support",
    "enabled": true
  }'
```

### Step 2: اضبط Evolution webhook
```bash
curl -X POST "http://localhost:2345/webhook/set/Customer-Support" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_API_KEY" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "http://localhost:55453/api/webhook/incoming/Customer-Support",
      "events": ["MESSAGES_UPSERT"],
      "webhookByEvents": false
    }
  }'
```

### Step 3: اختبر
ابعت رسالة من WhatsApp للـ Instance ده، وشوف n8n!

---

## 🗂️ تخزين الـ Webhooks

الـ webhooks بتتخزن في ملف:
```
whatsdeveloper-backend/.webhooks.json
```

**مثال:**
```json
{
  "OctoBot": {
    "url": "https://n8n.octobot.it.com/webhook/octoboto",
    "enabled": true
  },
  "Customer-Support": {
    "url": "https://n8n.company.com/webhook/support",
    "enabled": true
  },
  "Sales-Team": {
    "url": "https://n8n.company.com/webhook/sales",
    "enabled": true
  }
}
```

---

## 🎨 من Manager UI (Evolution Interface)

في صفحة Webhook لكل Instance:

1. اضبط Evolution Webhook URL:
   ```
   http://localhost:55453/api/webhook/incoming/INSTANCE_NAME
   ```

2. سجّل n8n webhook عن طريق API call:
   ```javascript
   fetch('http://localhost:55453/api/webhook/register/INSTANCE_NAME', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       url: 'https://n8n.your-domain.com/webhook/...',
       enabled: true
     })
   })
   ```

---

## 🔍 استكشاف الأخطاء

### المشكلة: Webhook مش بيشتغل لـ Instance معين

**الحل:**
```bash
# 1. تأكد إن الـ webhook مسجل
curl http://localhost:55453/api/webhook/config/INSTANCE_NAME

# 2. تأكد إن Evolution مضبوط صح
curl "http://localhost:2345/webhook/find/INSTANCE_NAME" \
  -H "apikey: YOUR_API_KEY"

# 3. شوف الـ logs في Backend window
```

---

### المشكلة: Instance ID مش بيوصل للـ Backend

**الحل:** استخدم URL مع instance ID:
```
http://localhost:55453/api/webhook/incoming/INSTANCE_NAME
```

بدلاً من:
```
http://localhost:55453/api/webhook/incoming
```

---

## 📊 Payload Structure

الـ payload اللي بيوصل لـ n8n هيكون:

```json
{
  "uuid": "INSTANCE_NAME",
  "event": "message.received",
  "timestamp": 1786223037000,
  "data": {
    "from": "201118180845",
    "fromName": "Customer Name",
    "message": {
      "type": "image",
      "url": "https://dk.whatsdeveloper.com/evolution/media/images/...",
      "caption": "",
      "mimetype": "image/jpeg"
    },
    "messageId": "3BA9E0E65F9526BCAD80",
    "isGroup": false
  }
}
```

**ملاحظة:** `uuid` هيكون اسم الـ Instance!

---

## 🎯 Best Practices

### 1. **استخدم Instance ID في URLs**
✅ `POST /api/webhook/incoming/OctoBot`  
❌ `POST /api/webhook/incoming` (يعتمد على payload)

### 2. **خزّن n8n webhooks منفصلة**
كل instance له n8n webhook مختلف:
- Instance A → `/webhook/instance-a`
- Instance B → `/webhook/instance-b`

### 3. **اختبر كل instance لوحده**
قبل production، اختبر كل instance إنه بيبعت للـ webhook الصحيح

---

## 🔐 Auto-Configuration

الـ Auto-Config (في `.env`) بيشتغل بس لـ `DEFAULT_INSTANCE_NAME`:

```env
DEFAULT_INSTANCE_NAME=OctoBot
N8N_WEBHOOK_URL=https://n8n.octobot.it.com/webhook/octoboto
```

**للـ instances التانية:** لازم تسجلهم يدوياً عن طريق API!

---

## ✅ Checklist - إضافة Instance جديد

- [ ] أنشئ Instance في Evolution
- [ ] سجّل n8n webhook في Backend: `POST /api/webhook/register/INSTANCE_NAME`
- [ ] اضبط Evolution webhook: `POST /webhook/set/INSTANCE_NAME`
- [ ] اختبر بإرسال رسالة
- [ ] تأكد من وصول الـ payload لـ n8n

---

**آخر تحديث:** 2026-08-09  
**الإصدار:** 2.0.0 - Multi-Instance Support  
**الحالة:** ✅ Production Ready
