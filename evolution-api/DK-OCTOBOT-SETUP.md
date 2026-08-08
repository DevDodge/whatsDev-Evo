# DK-Octobot Evolution API Setup

This is a fork of [Evolution API](https://github.com/evolution-foundation/evolution-api) customized for the DK-Octobot WhatsApp Session Management Platform.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 22+
- PostgreSQL 18+ (remote or local)
- Redis (optional, recommended for production)

### 2. Environment Setup

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

**Important**: Edit `.env` and fill in:
- `DATABASE_CONNECTION_URI` with your PostgreSQL connection string
- `AUTHENTICATION_API_KEY` with a strong random key (generate with `openssl rand -hex 24`)

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:deploy
```

This will create 37 tables in your PostgreSQL database.

### 5. Start the Server

Development mode:
```bash
npm run dev:server
```

Production mode:
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:8080`

## 🔐 Access the Manager UI

Navigate to `http://localhost:8080/manager` and login with:
- **Server URL**: `http://localhost:8080`
- **API Key**: Your `AUTHENTICATION_API_KEY` from `.env`

## 📡 Architecture

This fork is designed to work as part of a larger platform:

```
Frontend → Your API → Evolution API → Baileys → WhatsApp
                   ↓
              PostgreSQL
              Redis (cache)
              RabbitMQ (queue)
```

Evolution API handles WhatsApp connectivity. Your platform handles:
- Session management
- Message processing
- Business logic
- Multi-tenancy
- Webhooks

## 🔗 Integration Points

### Webhook Configuration

Set webhooks per-instance via API:

```bash
POST http://localhost:8080/webhook/set/{instanceName}
Headers:
  apikey: your-api-key

Body:
{
  "enabled": true,
  "url": "https://your-backend.com/webhooks/evolution",
  "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
}
```

### Message Sending

```bash
POST http://localhost:8080/message/sendText
Headers:
  apikey: your-api-key

Body:
{
  "number": "201xxxxxxxxx",
  "text": "Hello from DK-Octobot!"
}
```

## 🛠️ Customizations

- **Session client name**: Changed to "OctoBot" in `.env`
- **Language**: Set to English (en)
- **Telemetry**: Disabled by default
- **Redis**: Disabled initially (uses local cache fallback)
- **Local Media Storage**: Added as alternative to S3/MinIO (see below)

## 💾 Media Storage Options

Evolution API supports multiple media storage backends:

### Option 1: Local Storage (✅ Enabled by default)

Media files saved to `./uploads/media/` and served via `/media/:filename`.

```bash
LOCAL_STORAGE_ENABLED=true
LOCAL_STORAGE_PATH=./uploads/media
LOCAL_STORAGE_BASE_URL=http://localhost:8080
LOCAL_STORAGE_ORGANIZE_BY_DATE=true
```

**Pros**: Simple, no external dependencies, works immediately  
**Cons**: Not suitable for multi-server deployments

### Option 2: S3 / MinIO (Recommended for production)

Media files stored in S3-compatible object storage.

```bash
S3_ENABLED=true
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=whatsdeveloper-media
```

**Pros**: Scalable, CDN-ready, multi-server support  
**Cons**: Requires external service (AWS S3 or MinIO)

### Option 3: Database only (Not recommended)

Set both `LOCAL_STORAGE_ENABLED=false` and `S3_ENABLED=false` to store only metadata. Media URLs will expire after ~6 hours.

## 📚 Documentation

- [Evolution API Official Docs](https://doc.evolution-api.com)
- [Platform Architecture](../idea.txt)
- [Original Evolution README](README.md)

## 🔒 Security Notes

1. Never commit `.env` to git
2. Keep `AUTHENTICATION_API_KEY` secret
3. Use SSL for database connections in production
4. Don't expose Evolution API publicly — keep it behind your backend

## 🧪 Testing

Create a test instance via Manager UI or API, scan QR code with WhatsApp, and send a test message to verify webhook delivery.

## 📝 Development Workflow

### Making Changes

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin-fork main
```

### Pulling Upstream Updates

```bash
git fetch origin
git merge origin/main
# Resolve conflicts if any
git push origin-fork main
```

## 🆘 Support

For Evolution API issues: https://github.com/evolution-foundation/evolution-api/issues
For DK-Octobot platform issues: Contact your team

---

**Fork maintained by**: DevDodge  
**Original project**: [Evolution API](https://github.com/evolution-foundation/evolution-api)
