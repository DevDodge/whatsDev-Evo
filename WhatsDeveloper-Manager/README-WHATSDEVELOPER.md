# WhatsDeveloper Manager

> Modern WhatsApp management dashboard powered by Evolution API

**Built by DK-Octobot** | Forked from [Evolution Manager v2](https://github.com/evolution-foundation/evolution-manager-v2)

---

## 🚀 Features

- ✅ **Multi-instance management** — Manage multiple WhatsApp sessions
- ✅ **Real-time messaging** — Send/receive text, images, videos, audio, documents
- ✅ **Group management** — Create, update, manage members
- ✅ **Contact management** — View and organize contacts
- ✅ **Message history** — Browse conversations and search
- ✅ **Webhook configuration** — Set up event notifications
- ✅ **Session monitoring** — Track connection status and health
- ✅ **Dark mode** — Modern UI with theme toggle
- ✅ **Multi-language** — English, Portuguese, Spanish, French

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** — Fast build tool
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Component library
- **React Query** — Data fetching
- **i18next** — Internationalization

## 📦 Installation

### Prerequisites

- Node.js 18+
- Evolution API running (see [DK-Octobot Evolution API](https://github.com/DevDodge/DK-Octobot_evolution-api))

### Setup

```bash
# Clone the repository
git clone https://github.com/DevDodge/DK-Octobot_WhatsDeveloper-Manager.git
cd DK-Octobot_WhatsDeveloper-Manager

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in `dist/` directory.

## 🔧 Configuration

The manager connects to Evolution API. Configure the API URL in the login screen:

- **Server URL**: `http://localhost:8080` (or your Evolution API URL)
- **API Key**: Your Evolution API global key

## 🎨 Customization

### Branding

- **Logo**: Update logo URLs in `src/components/sidebar.tsx` and `src/pages/Home.tsx`
- **Title**: Already changed to "WhatsDeveloper Manager"
- **Colors**: Modify Tailwind config in `tailwind.config.js`
- **Favicon**: Update `index.html` favicon link

### API Integration

To connect to your custom backend (instead of Evolution API directly):

1. Create an API proxy layer in your backend
2. Update API calls in `src/lib/` to point to your backend
3. Keep the same API contract for compatibility

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (instance, theme, etc.)
├── pages/          # Page components
├── routes/         # Route definitions
├── translate/      # i18n translations
├── lib/            # Utilities and helpers
└── types/          # TypeScript type definitions
```

## 🔐 Security Notes

- Never expose Evolution API directly to the internet
- Use your backend as a proxy layer
- Implement proper authentication and authorization
- Keep API keys secret

## 📄 License

Apache 2.0 — Same as Evolution Manager v2

### Attribution

This project is a fork of [Evolution Manager v2](https://github.com/evolution-foundation/evolution-manager-v2) by the Evolution API Team.

**Original Copyright**: Evolution API Team  
**Fork Maintainer**: DK-Octobot / DevDodge

## 🤝 Contributing

This is a private fork customized for DK-Octobot platform. For Evolution Manager contributions, see the [upstream repository](https://github.com/evolution-foundation/evolution-manager-v2).

## 📞 Support

- **Evolution API Issues**: [evolution-api/issues](https://github.com/evolution-foundation/evolution-api/issues)
- **Platform Issues**: Contact DK-Octobot team

---

**Powered by Evolution API** | **Built by DK-Octobot**
