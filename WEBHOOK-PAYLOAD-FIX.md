# إصلاح Webhook Payload - Evolution API Integration

## المشكلة

الـ webhook payload القادم من **Evolution API** كان يأتي بهيكل مختلف عن المتوقع في الـ backend:

### Payload الفعلي من Evolution API:
```json
{
  "event": "messages.upsert",
  "instance": "OctoBot",
  "data": {
    "key": {
      "remoteJid": "201118180845@s.whatsapp.net",
      "fromMe": false,
      "id": "3B0D4587223E98AB4CC6"
    },
    "pushName": "Dev.Dodge 🧑🏻‍💻",
    "message": {
      "conversation": "hi"
    },
    "messageTimestamp": 1786219149
  }
}
```

### المشكلة:
- الـ backend كان يتوقع `req.body` يحتوي مباشرة على `key`, `message`, `pushName`
- لكن Evolution API ترسل wrapper يحتوي على `event`, `instance`, و `data`
- كان يجب استخراج الـ `data` أولاً قبل معالجة الرسالة

---

## الحل المُطبّق

### 1. تعديل `webhook.controller.ts`

**الملف:** `whatsdeveloper-backend/src/controllers/webhook.controller.ts`

**التعديلات:**
- استخراج `rawPayload.data` قبل تمريره للـ `transformMessage`
- إضافة fallback: إذا لم يكن هناك `data` wrapper، استخدم الـ payload مباشرة
- تحسين استخراج الـ UUID من مصادر متعددة:
  - `req.deviceUuid` (من middleware)
  - `req.headers['x-device-uuid']`
  - `rawPayload.instance` (اسم الـ instance من Evolution)
  - `rawPayload.data.instanceId`
  - `req.body.uuid`
- إضافة `evolutionEvent` في الـ response للـ debugging

```typescript
const rawPayload = req.body;
const evolutionMessage = rawPayload.data || rawPayload;

const uuid =
  (req as any).deviceUuid ||
  req.headers['x-device-uuid'] ||
  rawPayload.instance ||
  rawPayload.data?.instanceId ||
  req.body.uuid ||
  'default';
```

### 2. تحسين `webhook.service.ts`

**الملف:** `whatsdeveloper-backend/src/services/webhook.service.ts`

**التعديلات:**

#### أ. تحسين `transformMessage`:
- إضافة logging شامل لتتبع عملية التحويل
- استخراج رقم الهاتف من `remoteJid` (إزالة `@s.whatsapp.net` أو `@c.us`)
- معالجة أفضل لـ `messageTimestamp` (تحويل seconds إلى milliseconds)
- إضافة logging لكل نوع رسالة

```typescript
const fromJid = key.remoteJid || '';
const fromPhone = fromJid.split('@')[0];

const payload: WebhookPayload = {
  uuid,
  event: 'message.received',
  timestamp: evolutionMessage.messageTimestamp
    ? (typeof evolutionMessage.messageTimestamp === 'number'
        ? evolutionMessage.messageTimestamp * 1000
        : evolutionMessage.messageTimestamp)
    : Date.now(),
  data: {
    from: fromPhone || fromJid,
    // ...
  }
};
```

#### ب. إضافة Logging:
- Log عند بداية التحويل مع الـ payload الكامل
- Log عند استخراج نص الرسالة
- Log للرسائل من نوع unknown
- Log للـ payload النهائي بعد التحويل

---

## الـ Payload المُحوّل النهائي

بعد التعديلات، الـ webhook المُرسل إلى n8n (أو أي endpoint آخر) سيكون:

```json
{
  "uuid": "OctoBot",
  "event": "message.received",
  "timestamp": 1786219149000,
  "data": {
    "from": "201118180845",
    "fromName": "Dev.Dodge 🧑🏻‍💻",
    "to": "201118180845@s.whatsapp.net",
    "messageId": "3B0D4587223E98AB4CC6",
    "isGroup": false,
    "groupName": "",
    "message": {
      "type": "text",
      "body": "hi"
    }
  }
}
```

### الفروقات الرئيسية:
- ✅ `from` الآن رقم نظيف بدون `@s.whatsapp.net`
- ✅ `timestamp` بالـ milliseconds (مضروب × 1000)
- ✅ `message.type` محدد بوضوح (`text`, `image`, `video`, إلخ)
- ✅ `message.body` يحتوي على نص الرسالة مباشرة

---

## كيفية الاختبار

### 1. إعادة تشغيل الـ Backend

```bash
cd whatsdeveloper-backend
npm run build
npm start
```

### 2. تسجيل Webhook

```bash
curl -X POST http://localhost:3001/api/webhook/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "url": "https://n8n.octobot.it.com/webhook/octoboto",
    "enabled": true
  }'
```

### 3. إرسال رسالة تجريبية

أرسل رسالة من WhatsApp إلى الرقم المتصل بـ Evolution API

### 4. التحقق من Logs

```bash
# في الـ backend logs، ستجد:
[Webhook] Transforming message: {...}
[Webhook] Text message extracted: "hi"
[Webhook] Final transformed payload: {...}
[Webhook] Sent to https://n8n.octobot.it.com/webhook/octoboto for UUID: OctoBot
```

### 5. التحقق من n8n

في n8n webhook، الـ payload سيكون:
- `body.data.message.type` = "text"
- `body.data.message.body` = "hi"
- `body.data.from` = "201118180845" (رقم نظيف)

---

## ملاحظات مهمة

### UUID vs Instance Name
- Evolution API ترسل `instance` (مثل "OctoBot")
- الـ backend يستخدمه كـ `uuid` لتحديد الـ webhook المناسب
- تأكد من تسجيل الـ webhook بنفس اسم الـ instance

### Message Types المدعومة
- ✅ `text` - رسائل نصية
- ✅ `image` - صور مع caption اختياري
- ✅ `video` - فيديوهات مع caption اختياري
- ✅ `audio` - ملفات صوتية / voice notes
- ✅ `document` - ملفات PDF, DOCX, إلخ
- ✅ `location` - مواقع GPS
- ✅ `contact` - بطاقات الاتصال (vCard)

### Ad Detection
الـ backend يحتوي على نظام ذكي لاكتشاف الإعلانات:
- يفحص `isForwarded` و `forwardingScore`
- يبحث عن patterns معينة في النص
- يستخرج URLs ويفحص إذا كانت Facebook ads
- يضيف `isAd: true` و `adMetadata` للـ payload

---

## الخطوات التالية (اختياري)

### 1. تحسين UUID Mapping
إذا كنت تريد استخدام UUID حقيقي بدلاً من instance name:

```typescript
// في Evolution API webhook configuration
{
  "url": "https://your-backend.com/api/webhook/incoming",
  "webhook_by_events": true,
  "events": ["messages.upsert"]
}

// أضف header مخصص في Evolution:
"X-Device-UUID": "actual-uuid-here"
```

### 2. إضافة Message Status Webhooks
لتتبع حالة الرسائل (delivered, read):

```typescript
// في webhook.service.ts
// أضف event types جديدة:
- message.delivered
- message.read
- message.failed
```

### 3. Retry Logic للـ Webhook
إذا فشل إرسال الـ webhook:

```typescript
// في sendWebhook()
// أضف retry mechanism مع exponential backoff
let retries = 3;
while (retries > 0) {
  try {
    await axios.post(config.url, payload);
    break;
  } catch (error) {
    retries--;
    if (retries === 0) throw error;
    await sleep(1000 * (4 - retries));
  }
}
```

---

## التعديلات المُطبّقة

- ✅ `webhook.controller.ts` - استخراج `data` من Evolution wrapper
- ✅ `webhook.service.ts` - تحسين `transformMessage` مع logging
- ✅ Build نجح بدون أخطاء
- ✅ التوثيق الكامل في هذا الملف

**تاريخ الإصلاح:** 2026-08-08  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للاختبار
