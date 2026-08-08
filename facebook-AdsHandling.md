
# How the Platform Handles Incoming Facebook Ads Messages

This document explains how the platform detects, enriches, persists, and forwards messages that originate from **Click-to-WhatsApp (CTWA)** ads — the "Send Message" button on Facebook and Instagram ads that opens a WhatsApp chat with a business.

The entire flow runs inside `_handleIncomingMessage()` in `whatsapp-manager.js` and is triggered for every incoming message. Ad detection is non-blocking: if anything fails during enrichment, the base message still goes through as a normal incoming message.

---

## 1. Overview of the flow

```
Incoming message
      │
      ▼
Build base webhookData (isFromAdvertisement = false, advertisement = null)
      │
      ▼
Ad detection ──► Not an ad ──► Send as normal incoming_message
      │
      ▼ (is an ad)
Normalize ad context (sourceUrl + displayText)
      │
      ▼
Resolve FB short URL ──► fbAdId + caption + media (best-effort)
      │
      ▼
Enrich webhookData.advertisement
      │
      ▼
Save to CRM (ad_campaigns + ad_contacts) — non-critical
      │
      ▼
Send to webhook (source = "advertisement")
```

---

## 2. Ad detection

The platform recognizes an ad message through **three** independent signals, checked in priority order. Any one of them marks the message as an ad.

### 2.1 `ctwaContext` (primary signal)

When a user taps the "Send Message" CTA on a Facebook/Instagram ad, WhatsApp attaches a `ctwaContext` object to the message payload:

```js
const ctwaContext = msg._data?.ctwaContext;
```

This is the richest source — it can carry `sourceUrl`, `displayText`, `mediaType`, `conversionSource`, `conversionData`, and `isSuspiciousActivity`.

### 2.2 `referral` / `externalAdReply` (secondary signal)

Some ad formats deliver the referral metadata under a different key:

```js
const referralContext =
    msg._data?.referral ||
    msg._data?.contextInfo?.externalAdReply ||
    msg._data?.contextInfo?.adReply;
```

These carry equivalent fields under slightly different names (`url`, `title`, `body`, `headline`, `thumbnailUrl`).

### 2.3 URL-in-body fallback (tertiary signal)

Some ad clicks arrive as **plain text** with no metadata at all — just a Facebook short link in the message body, e.g.:

```
https://fb.me/6b2BSJKDp
مرحبًا! هل يمكنني الحصول على مزيد من المعلومات حول هذا؟
```

This is caught by a regex, but only when there is **no** `ctwaContext`/`referral` **and** the message is **not** an echo (`!msg.fromMe`):

```js
const FB_URL_REGEX = /https?:\/\/(?:fb\.me|(?:www\.)?facebook\.com|m\.facebook\.com)\/[^\s]+/i;
const isUrlBasedAd = !adContext && !!fbUrlMatch && !msg.fromMe;
```

| Signal       | Key checked                                                                        | `adSource` value |
| ------------ | ---------------------------------------------------------------------------------- | ------------------ |
| CTWA context | `msg._data.ctwaContext`                                                          | `"ctwaContext"`  |
| Referral     | `msg._data.referral` / `contextInfo.externalAdReply` / `contextInfo.adReply` | `"referral"`     |
| URL in body  | Facebook link in`msg.body`                                                       | `"url_in_body"`  |

---

## 3. Normalization

Regardless of which signal fired, the handler normalizes down to two core values plus the raw context:

```js
if (adContext) {
    adSourceUrl  = ctwaContext?.sourceUrl || referralContext?.sourceUrl
                 || referralContext?.url || referralContext?.thumbnailUrl || null;
    adDisplayText = ctwaContext?.displayText || referralContext?.displayText
                 || referralContext?.title || referralContext?.body || null;
} else {
    // URL-based fallback
    adSourceUrl   = fbUrlMatch[0];
    adDisplayText = bodyForAdCheck.replace(fbUrlMatch[0], '').trim() || null;
}
```

- `adSourceUrl` — the Facebook link that identifies the ad/post.
- `adDisplayText` — for CTWA/referral, the ad's display text; for URL fallback, the message body with the URL stripped out.

---

## 4. FB short-URL resolution (enrichment)

When an `adSourceUrl` is present, the platform attempts to resolve it into real ad metadata via `utils/fbExtractor.js`:

```js
const { extractFacebookPostData } = require('./utils/fbExtractor');
const result = await extractFacebookPostData(adSourceUrl, uploadsDir, BASE_URL);
```

On success it populates:

| Field                           | Source                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `advertisement.fbAdId`        | `result.fbAdId`                                                              |
| `advertisement.fbPostCaption` | `result.caption`                                                             |
| `advertisement.fbAdMediaUrl`  | `result.mediaUrl` (re-hosted under `BASE_URL/uploads/`)                    |
| `advertisement.fbAdMediaUrls` | `result.mediaUrls` (array, for multi-image posts)                            |
| `advertisement.resolvedUrl`   | `result.resolvedUrl` (the expanded destination URL)                          |
| `advertisement.agentQuestion` | Pre-built Arabic prompt combining the ad description + the customer's question |

This step is **best-effort**. If resolution throws (expired cookies, network failure, unsupported URL), it's logged and skipped — `fbAdId`, `fbPostCaption`, and media stay `null` but the message is still flagged as an ad.

> Note: authenticated Puppeteer scraping in `fbExtractor.js` is currently disabled (expired Facebook cookies). URL resolution falls back to what can be obtained without an authenticated session, so `fbAdId`/caption may be `null` for many ads.

### `agentQuestion` format

```
انا شوفت الاعلان بتاع حضراتكم اللي مكتوب فيه
<ad description or caption>
سؤالي لحضراتكم هو :
<customer message body>
```

This is intended to be passed straight to an AI agent / auto-reply flow so it has the ad context together with the customer's actual question.

---

## 5. Advertisement object in the webhook payload

When a message is detected as an ad, the outgoing webhook payload changes as follows:

```jsonc
{
  // ... all standard incoming-message fields ...
  "isFromAdvertisement": true,
  "source": "advertisement",           // "regular" for normal messages
  "advertisementJid": "https://fb.me/6b2BSJKDp",
  "advertisement": {
    "sourceUrl": "https://fb.me/6b2BSJKDp",
    "displayText": "Summer Sale - 50% off",
    "mediaType": null,
    "isSuspiciousActivity": false,
    "conversionSource": null,          // or "FB_URL_in_body" for URL fallback
    "conversionData": null,
    "headLine": null,
    "adBody": null,
    "thumbnailUrl": null,
    "adSource": "ctwaContext",         // "ctwaContext" | "referral" | "url_in_body"
    "fbAdId": "1234567890",            // null if resolution failed
    "fbPostCaption": "...",            // null if resolution failed
    "fbAdMediaUrl": "https://<host>/uploads/ad_xxx.jpg",
    "fbAdMediaUrls": ["https://<host>/uploads/ad_1.jpg", "..."],
    "resolvedUrl": "https://facebook.com/...",
    "agentQuestion": "انا شوفت الاعلان..."
  },
  "rawAdData": {
    "ctwaContext": { /* raw, or null */ },
    "referral": { /* raw, or null */ },
    "contextInfo": { /* raw, or null */ },
    "urlDetected": "https://fb.me/6b2BSJKDp"  // only for URL fallback, else null
  }
}
```

`rawAdData` is included so a downstream consumer (n8n, custom webhook handler) can access every original field even if the normalized ones don't fit their needs.

For normal (non-ad) messages these fields stay at their defaults: `isFromAdvertisement: false`, `source: "regular"`, `advertisement: null`, `advertisementJid: null`, and no `rawAdData`.

---

## 6. CRM persistence

After enrichment, ad data is written to the CRM tables (`models/AdCampaign.js`). This is wrapped in its own try/catch and marked **non-critical** — a failure here never blocks the webhook.

### Tables

**`ad_campaigns`** — one row per ad/post:

| Column                                                            | Notes                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| `user_id`                                                       | resolved from`clients.user_id` for the receiving device |
| `fb_ad_id`                                                      | ad identifier (nullable)                                  |
| `ad_title`, `ad_caption`, `ad_media_url`, `ad_media_urls` | resolved metadata                                         |
| `source_url`, `resolved_url`                                  | original + expanded link                                  |
| `contact_count`, `chat_count`                                 | cached counts                                             |

**`ad_contacts`** — one row per (campaign, phone):

| Column                                                           | Notes                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| `ad_campaign_id`                                               | FK →`ad_campaigns.id`                                      |
| `phone_number`                                                 | sender, stripped of`@c.us` / `@s.whatsapp.net` / `@lid` |
| `push_name`, `profile_id`, `device_name`, `message_body` |                                                               |

Unique constraint `idx_ad_contacts_unique (ad_campaign_id, phone_number)` ensures a repeat contact from the same ad updates rather than duplicates.

### Upsert logic (`AdCampaign.upsertAd`)

1. **Find or create the campaign.**
   - If `fbAdId` is present → match on `(fb_ad_id, user_id)`.
   - Otherwise → match on `(source_url, user_id)`.
   - Existing campaigns get their caption/media/title refreshed via `COALESCE` (new non-null values win, old values preserved otherwise).
2. **Insert the contact** with `ON CONFLICT (ad_campaign_id, phone_number) DO UPDATE`, preserving existing `push_name`/`message_body` when the new one is null.
3. **Recompute counts** for the campaign.

### Sender phone extraction

```js
const senderPhone = resolvedFrom
    .replace('@c.us', '')
    .replace('@s.whatsapp.net', '')
    .replace('@lid', '');
```

The CRM data feeds the Ads CRM UI, served from `routes/adsCRM.js` under `/api/ads-crm` (requires session auth) — endpoints for stats, listing/grouping ads, per-ad contacts, CSV export, clients, and manual re-fetch of ad metadata.

---

## 7. Webhook delivery

Ad messages are delivered through the **same** `_sendToWebhook()` path as normal incoming messages:

- `POST` to the profile's `webhook_url` (via `node-fetch`), 10s timeout, **no retry**, **no HMAC/signature**.
- `webhook_type` is `incoming_message` (or `echo_message` if `msg.fromMe`).
- Group and echo gating still apply: group ad messages only fire if `webhook_include_groups === true`; echoes only if `webhook_echo_enabled`.

The only difference versus a normal message is the enriched `advertisement` block and `source: "advertisement"`.

---

## 8. Failure behavior summary

| Stage             | On failure                                                                     |
| ----------------- | ------------------------------------------------------------------------------ |
| Ad detection      | Wrapped in try/catch — message proceeds as normal incoming                    |
| FB URL resolution | Logged & skipped —`fbAdId`/caption/media stay `null`, still flagged as ad |
| CRM save          | Logged as non-critical — webhook still sent                                   |
| Webhook POST      | No retry; single attempt with 10s timeout                                      |

The design guarantees that ad enrichment is purely **additive** — no enrichment failure ever prevents the underlying message from reaching the webhook consumer.
