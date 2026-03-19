<div align="center">

<img src="apps/web/public/logo.svg" alt="AI Inbox Logo" width="72" height="72" />

# AI Inbox

**One inbox for all your customer conversations**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql)](https://www.prisma.io/)
[![Claude AI](https://img.shields.io/badge/Claude-Haiku_4.5-D97706?style=flat-square&logo=anthropic)](https://www.anthropic.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?style=flat-square&logo=turborepo)](https://turbo.build/)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [Environment Variables](#-environment-variables) · [Project Structure](#-project-structure)



<img src="apps/web/public/apps.png" alt="AI Inbox Logo" width="100%" height="100%" />

</div>



## ✨ Features

### 📬 Unified Inbox
- Aggregate messages from **Telegram**, **WhatsApp**, **Facebook Messenger** and **Email (IMAP/SMTP)** into a single, clean interface
- Real-time message delivery via WebSocket — no page refresh needed
- Unread counters, conversation previews and last-message timestamps always up-to-date
- Filter by platform (All · Chats · Email), read state (All · Unread · Archived) or lifecycle status
- Archive / unarchive conversations with auto-unarchive on new client message

### 🤖 Claude AI Assistant
- **Suggested replies** — Claude analyses the conversation and proposes 3 context-aware replies in one click
- **Auto-reply mode** — fully automated responses with configurable confidence threshold
- **Text translation** — translate any message to/from any language on the fly
- **Knowledge Base (RAG)** — upload PDF documents; Claude reads them and answers questions grounded in your content
- Powered by **Claude Haiku 4.5** (`claude-haiku-4-5`) — fast, accurate, cost-efficient

### 📊 Analytics Dashboard
- Token usage over time (input / output / total)
- Per-model cost tracking in USD (real Anthropic pricing)
- Message volume charts by platform
- All data scoped per authenticated user

### 👥 Contacts
- Unified contact list aggregated from all platforms
- Search by name, username or platform
- Lifecycle status management: `NEW_LEAD → CONTACTED → QUALIFIED → CUSTOMER → CHURNED`
- Contact details: email, phone, country, language
- One-click jump from contact to conversation

### 🔗 Platform Connections
- Guided step-by-step setup wizard for every platform
- Telegram: long-polling (dev) + webhook (production)
- WhatsApp Business Cloud API with webhook instructions & one-click copy
- Facebook Messenger Graph API with webhook configuration guide
- Email: Gmail / Outlook / Custom IMAP+SMTP with advanced server overrides

### 🎨 Design System
- **Light / Dark / System** theme with zero flash on load
- Full CSS variable design token system (`--accent-primary`, `--bg-surface`, etc.)
- Radix UI primitives (Dialog, Dropdown, Popover, Tooltip, Select, Tabs…)
- Collapsible sidebar with tooltip navigation in compact mode
- Fully responsive layout

### 🖥️ Desktop App
- Native **Electron** wrapper for macOS, Windows and Linux
- Distributed as DMG (macOS), NSIS installer (Windows), AppImage (Linux)

---

## 🛠 Tech Stack

### Monorepo
| Tool | Version | Purpose |
|---|---|---|
| [Turborepo](https://turbo.build/) | 2.x | Monorepo build orchestration & task caching |
| [npm Workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) | — | Package management |

### Frontend — `apps/web`
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 | React framework (App Router) |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | latest | Accessible headless components |
| [Lucide React](https://lucide.dev/) | 0.555 | Icon system |
| [TanStack Query](https://tanstack.com/query) | 5 | Async state & server caching |
| [Axios](https://axios-http.com/) | 1.x | HTTP client with interceptors |
| [Socket.IO Client](https://socket.io/) | 4.x | Real-time WebSocket connection |
| [Recharts](https://recharts.org/) | 3.x | Analytics charts |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.x | Email HTML sanitisation |

### Backend — `apps/api`
| Technology | Version | Purpose |
|---|---|---|
| [NestJS](https://nestjs.com/) | 11 | Modular Node.js framework |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Prisma ORM](https://www.prisma.io/) | 7 | Type-safe database access |
| [PostgreSQL](https://www.postgresql.org/) | — | Primary database |
| [Socket.IO](https://socket.io/) | 4.x | Real-time WebSocket gateway |
| [Passport.js](https://www.passportjs.org/) | — | Auth strategies (JWT, Google, Microsoft) |
| [Argon2](https://github.com/ranisalt/node-argon2) | — | Password hashing |
| [@anthropic-ai/sdk](https://github.com/anthropic-ai/anthropic-sdk-typescript) | 0.79 | Claude AI integration |
| [Nodemailer](https://nodemailer.com/) | 8.x | SMTP email sending |
| [ImapFlow](https://imapflow.com/) | 1.x | IMAP email receiving |
| [mailparser](https://nodemailer.com/extras/mailparser/) | 3.x | Email HTML/plain-text parsing |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | 1.x | PDF text extraction for RAG |

### Desktop — `apps/desktop`
| Technology | Version | Purpose |
|---|---|---|
| [Electron](https://www.electronjs.org/) | 34 | Cross-platform desktop wrapper |
| [electron-builder](https://www.electron.build/) | — | macOS / Windows / Linux packaging |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- **PostgreSQL** ≥ 14 running locally (or a remote connection string)
- An **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com/settings/keys)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/zottis-monorepo.git
cd zottis-monorepo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in every value — see [Environment Variables](#-environment-variables) below for the full reference.

### 4. Set up the database

```bash
# Apply all migrations
cd apps/api
npx prisma migrate deploy

# (Optional) Seed demo data
npx prisma db seed

# Regenerate the Prisma client after schema changes
npx prisma generate
```

### 5. Start development servers

```bash
# From the monorepo root — starts API (3001) + Web (3000) in parallel
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (NestJS) | http://localhost:3001 |
| Prisma Studio | `npx prisma studio` (port 5555) |

### 6. Build for production

```bash
npm run build
```

### 7. (Optional) Run the desktop app

```bash
npm run dev:desktop
```

---

## 🗺 Architecture

```
zottis-monorepo/
├── apps/
│   ├── api/          ← NestJS REST + WebSocket backend  (port 3001)
│   ├── web/          ← Next.js 16 frontend              (port 3000)
│   └── desktop/      ← Electron desktop wrapper
├── turbo.json        ← Turborepo task pipeline
└── package.json      ← Root workspace
```

### Data Flow

```
Client Browser / Electron
       │
       ├─ HTTP (Axios)  ──────────────►  NestJS REST API  ──►  PostgreSQL (Prisma)
       │                                       │
       └─ WebSocket (Socket.IO)  ◄────────────┤
                                    push events │
                                  newMessage    │
                                  newConversation│
                                               │
                          Platform webhooks ───┤
                          (Telegram / WA /      │
                           Messenger / Email)   │
                                               │
                          Anthropic Claude ─────┘
```

### Backend Modules

| Module | Responsibility |
|---|---|
| `AuthModule` | JWT auth, Google & Microsoft OAuth, user registration/login |
| `ChatModule` | Socket.IO gateway — authenticated rooms, `getConversations`, `getMessages`, push events |
| `TelegramModule` | Webhook handler + long-polling fallback, bot token management |
| `WhatsappModule` | Meta Cloud API webhook, credentials stored per user |
| `MessengerModule` | Facebook Messenger Graph API webhook |
| `EmailModule` | IMAP polling + SMTP reply, multi-provider support |
| `AiAssistantModule` | Claude integration — suggested replies, auto-reply, translation, RAG |
| `KnowledgeBaseModule` | PDF upload, storage, Claude document API for Q&A |
| `AnalyticsModule` | Token usage logs, cost aggregation per user |
| `ConversationsModule` | Archive/unarchive, lifecycle status, contact info updates |

### Frontend Architecture

```
app/
├── (marketing)/          ← Landing page
├── (authentication)/     ← Login, signup, OAuth callback
└── (dashboard)/          ← Protected area (AppShell + sidebar)
    ├── inbox/            ← Main chat interface
    ├── contacts/         ← Contact list
    ├── ai-assistant/     ← AI config, knowledge base, suggestions
    ├── connect-platforms/← Platform onboarding wizard
    └── analytics/        ← Cost, messages, token-usage charts
```

**Key patterns:**
- **Services layer** — domain-scoped classes (`ConversationsService`, `AiAssistantService`, etc.) wrap all HTTP calls
- **Query keys** — `@lukemorales/query-key-factory` for consistent TanStack Query cache keys
- **Auth interceptor** — auto-attaches `Bearer` token; 401 → clears token + redirects to `/auth/login`
- **Socket singleton** — `lib/socket.ts` creates one Socket.IO connection per session, authenticated via JWT handshake

---

## 🔑 Environment Variables

### Backend — `apps/api/.env`

```bash
# ── Database ───────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/alinbox"

# ── JWT ────────────────────────────────────────────────
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="7d"

# ── App URLs ───────────────────────────────────────────
FRONTEND_URL="http://localhost:3000"
APP_URL="http://localhost:3001"

# ── Google OAuth ───────────────────────────────────────
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# ── Microsoft OAuth ────────────────────────────────────
# https://portal.azure.com
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
MICROSOFT_CALLBACK_URL="http://localhost:3001/auth/microsoft/callback"
MICROSOFT_TENANT_ID="common"

# ── Telegram ───────────────────────────────────────────
# Set to "true" in dev to use long-polling instead of webhooks
SKIP_WEBHOOK_REGISTRATION="true"

# ── WhatsApp Cloud API ─────────────────────────────────
# https://developers.facebook.com/apps/
WHATSAPP_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_VERIFY_TOKEN="your_verify_token"
WHATSAPP_API_BASE="https://graph.facebook.com/v20.0"

# ── Facebook Messenger ─────────────────────────────────
MESSENGER_VERIFY_TOKEN="your_messenger_verify_token"
MESSENGER_PAGE_ACCESS_TOKEN=""
MESSENGER_PAGE_ID=""
MESSENGER_GRAPH_API_BASE="https://graph.facebook.com/v20.0"

# ── Anthropic / Claude AI ──────────────────────────────
# https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=""
CLAUDE_MODEL="claude-haiku-4-5"
```

### Frontend — `apps/web/.env.local`

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"

# Must match backend values
NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN="your_verify_token"
NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL="http://localhost:3001/webhooks/whatsapp"
NEXT_PUBLIC_MESSENGER_VERIFY_TOKEN="your_messenger_verify_token"
NEXT_PUBLIC_MESSENGER_WEBHOOK_URL="http://localhost:3001/webhooks/messenger"
```

---

## 📁 Project Structure

```
zottis-monorepo/
│
├── apps/
│   │
│   ├── api/                          ← NestJS backend
│   │   ├── src/
│   │   │   ├── ai-assistant/         ← Claude AI service + controller
│   │   │   ├── analytics/            ← Token usage + cost analytics
│   │   │   ├── auth/                 ← JWT, Google/Microsoft OAuth
│   │   │   ├── chat/                 ← Socket.IO gateway
│   │   │   ├── common/               ← Constants, DTOs, helpers
│   │   │   ├── conversations/        ← Conversation CRUD
│   │   │   ├── email/                ← IMAP + SMTP module
│   │   │   ├── knowledge-base/       ← PDF upload + Claude RAG
│   │   │   ├── messenger/            ← Facebook Messenger
│   │   │   ├── prisma/               ← PrismaService
│   │   │   ├── telegram/             ← Telegram bot + polling
│   │   │   ├── whatsapp/             ← WhatsApp Cloud API
│   │   │   └── app.module.ts
│   │   └── prisma/
│   │       └── schema.prisma         ← Database schema
│   │
│   ├── web/                          ← Next.js 16 frontend
│   │   ├── app/
│   │   │   ├── (marketing)/          ← Landing page
│   │   │   ├── (authentication)/     ← Login / signup / OAuth
│   │   │   └── (dashboard)/          ← Protected app pages
│   │   │       ├── inbox/
│   │   │       ├── contacts/
│   │   │       ├── ai-assistant/
│   │   │       ├── connect-platforms/
│   │   │       └── analytics/
│   │   ├── components/
│   │   │   ├── layout/               ← AppShell, AppSidebar, PageHeader
│   │   │   └── ui/                   ← Reusable UI primitives
│   │   ├── context/                  ← AuthContext, ThemeContext, SidebarContext
│   │   ├── hooks/                    ← useConversations, useMessages
│   │   ├── lib/                      ← socket.ts, axios.ts, types.ts, chatUtils.ts
│   │   └── services/                 ← API service layer (per domain)
│   │
│   └── desktop/                      ← Electron wrapper
│       └── src/main.ts
│
├── turbo.json                        ← Build pipeline config
└── package.json                      ← Workspace root
```

---

## 🗄 Database Schema

```
users
 └──< auth_accounts       (Google / Microsoft OAuth)
 └──< platform_accounts   (Telegram / WhatsApp / Messenger / Email credentials)
       └──< conversations  (one per contact per platform account)
             └──< messages (incoming "client" + outgoing "bot")

ai_usage_logs              (token usage per user per request)
```

---

## 🔄 Real-time Events

All real-time updates use Socket.IO rooms keyed by `user:{userId}`.

| Event | Direction | Payload | Description |
|---|---|---|---|
| `getConversations` | Client → Server | — | Fetch all conversations |
| `conversations` | Server → Client | `conversation[]` | Response to above |
| `getMessages` | Client → Server | `{ conversationId }` | Fetch messages for a conversation |
| `messages` | Server → Client | `message[]` | Response to above |
| `newMessage` | Server → Client | `message` | Pushed on every new inbound/outbound message |
| `newConversation` | Server → Client | `conversation` | Pushed when a brand-new contact writes for the first time |
| `error` | Server → Client | `{ message }` | Operational error |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using **Next.js** & **NestJS** 

</div>
