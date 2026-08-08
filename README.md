# WhatsDeveloper-Evolution Integration

Complete WhatsApp Business solution integrating Evolution API with WhatsDeveloper-compatible backend and manager interface.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  WhatsDeveloper Manager (Frontend) │
│         React + Vite + TS           │
│           Port 5173                 │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│   WhatsDeveloper Backend Bridge    │
│      Express + TypeScript           │
│           Port 3000                 │
│  • Authentication (X-API-Token)     │
│  • Message Sending (8 types)        │
│  • Sequence API (20 messages)       │
│  • Webhook System (n8n)             │
│  • Facebook Ads Detection           │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│         Evolution API               │
│      Baileys + WhatsApp Web         │
│           Port 8080                 │
└─────────────────────────────────────┘
```

---

## 📦 Projects

### 1. [whatsdeveloper-backend](./whatsdeveloper-backend/)
Backend bridge API that translates WhatsDeveloper API calls to Evolution API format.

**Features:**
- ✅ Authentication (X-API-Token + X-Device-UUID)
- ✅ 8 message types (text, image, video, audio, document, location, contact, buttons)
- ✅ Send Sequence API (up to 20 messages with delays)
- ✅ Webhook system for incoming messages
- ✅ Facebook Ads detection with metadata
- ✅ File persistence for webhooks
- ✅ Interactive API documentation

**Tech Stack:** Node.js, TypeScript, Express, Axios

---

### 2. [WhatsDeveloper-Manager](./WhatsDeveloper-Manager/)
Modern web interface for managing WhatsApp instances and messages.

**Features:**
- ✅ Instance management (connect, disconnect, QR code)
- ✅ Chat interface with message history
- ✅ Send messages (text, media, location, contact)
- ✅ Contact management
- ✅ Settings & configuration
- ✅ Responsive UI with Tailwind CSS

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, Zustand

---

### 3. [evolution-api](./evolution-api/)
Evolution API - WhatsApp Web multi-device solution using Baileys.

**Features:**
- ✅ Multi-device support
- ✅ QR code authentication
- ✅ Message sending & receiving
- ✅ Media handling
- ✅ Webhook support
- ✅ Instance management

**Tech Stack:** Node.js, Baileys, Prisma

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (for Evolution API)
- Git

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/YOUR-USERNAME/whatsDev-Evo.git
cd whatsDev-Evo
```

#### 2. Setup Evolution API
```bash
cd evolution-api
npm install
cp .env.example .env
# Configure database and settings
npm run start:prod
```

#### 3. Setup Backend Bridge
```bash
cd ../whatsdeveloper-backend
npm install
cp .env.example .env
# Configure Evolution API URL and credentials
npm run dev
```

#### 4. Setup Manager (Optional)
```bash
cd ../WhatsDeveloper-Manager
npm install
cp .env.example .env
npm run dev
```

---

## 📝 Configuration

### Backend Bridge (.env)
```bash
PORT=3000
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-evolution-api-key
DEFAULT_INSTANCE_NAME=TEST
CORS_ORIGIN=http://localhost:5173
```

### Evolution API (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/evolution
SERVER_PORT=8080
AUTHENTICATION_API_KEY=your-secret-key
```

---

## 📚 API Documentation

### Backend Bridge
Once running, visit: **http://localhost:3000/api-docs**

### Key Endpoints

#### Authentication
All authenticated endpoints require:
```bash
X-Device-UUID: your-device-uuid
X-API-Token: your-evolution-api-key
```

#### Send Message
```bash
POST /api/send-message
{
  "phone": "201234567890",
  "message": "Hello!"
}
```

#### Send Sequence (20 messages)
```bash
POST /api/v1/messages/send-sequence
{
  "to": "201234567890",
  "delayMs": 3000,
  "messages": [
    { "type": "text", "content": "Hello!" },
    { "type": "image", "url": "https://...", "caption": "Photo" }
  ]
}
```

#### Webhook Registration (n8n integration)
```bash
POST /api/webhook/register
{
  "url": "https://your-n8n.com/webhook/whatsapp",
  "enabled": true
}
```

---

## 🎯 Features

### ✅ Implemented

| Feature | Status |
|---------|--------|
| WhatsApp connection via Evolution | ✅ |
| Multi-instance support | ✅ |
| Send text messages | ✅ |
| Send media (image, video, audio, document) | ✅ |
| Send location & contact | ✅ |
| Sequence API (bulk messages) | ✅ |
| Webhook for incoming messages | ✅ |
| Facebook Ads detection | ✅ |
| Message spintax support | ✅ |
| API authentication per request | ✅ |
| File persistence | ✅ |
| Interactive documentation | ✅ |

---

## 🔐 Security

- API key authentication per request
- CORS protection
- Rate limiting (100 req/min)
- Helmet security headers
- Environment variable configuration

---

## 📖 Documentation Files

- [Facebook Ads Handling](./facebook-AdsHandling.md) - Ad detection logic
- [API Docs - Send Message](./ApiDocs-sendMsjs-WhatsDev.md)
- [API Docs - Incoming Webhooks](./ApiDocs-IncomingWebhooksPayload-WhatsDev.md)

---

## 🛠️ Development

### Backend Bridge
```bash
cd whatsdeveloper-backend
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Run production build
```

### Manager Frontend
```bash
cd WhatsDeveloper-Manager
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🚢 Deployment

### VPS Deployment (Production)

#### 1. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

#### 2. Setup Database
```bash
sudo -u postgres psql
CREATE DATABASE evolution;
CREATE USER evolutionuser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE evolution TO evolutionuser;
\q
```

#### 3. Clone & Configure
```bash
git clone https://github.com/YOUR-USERNAME/whatsDev-Evo.git
cd whatsDev-Evo

# Configure each project .env files
```

#### 4. Start Services with PM2
```bash
# Evolution API
cd evolution-api
npm install
npm run build
pm2 start dist/src/main.js --name evolution-api

# Backend Bridge
cd ../whatsdeveloper-backend
npm install
npm run build
pm2 start dist/index.js --name whatsdeveloper-backend

# Save PM2 config
pm2 save
pm2 startup
```

#### 5. Nginx Reverse Proxy (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

ISC

---

## 👨‍💻 Author

**DevDodge / DK-Octobot**

---

## 🔗 Related Projects

- [Evolution API](https://github.com/EvolutionAPI/evolution-api)
- [Baileys](https://github.com/WhiskeySockets/Baileys)

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check documentation in each project folder

---

**Built with ❤️ for WhatsApp Business automation**
