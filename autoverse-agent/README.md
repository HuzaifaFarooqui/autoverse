<p align="center">
  <img src="https://img.shields.io/npm/v/autoverse-agent?color=667eea&style=for-the-badge&labelColor=0a0a1a" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/autoverse-agent?color=764ba2&style=for-the-badge&labelColor=0a0a1a" alt="downloads" />
  <img src="https://img.shields.io/badge/license-MIT-34d399?style=for-the-badge&labelColor=0a0a1a" alt="license" />
</p>

<h1 align="center">🤖 Autoverse Agent</h1>

<p align="center">
  <strong>Zero-config AI customer service chatbot for any website.</strong><br/>
  Auto-scrapes your site, learns your products, handles orders, and talks like a real human.<br/>
  Powered by Groq LLMs.
</p>

---

## ✨ Features

- 🚀 **One-line install** — `import "autoverse-agent"` and the widget appears
- 🧠 **Auto-learns your site** — Scrapes products, pages, and APIs automatically
- 🛒 **Order automation** — Collects customer details and places orders step-by-step
- 🎨 **Fully customizable** — Colors, theme, position, tone via admin dashboard
- 🌍 **Bilingual** — English + Urdu with auto-detection
- 🔑 **Multi-tenant** — One server, unlimited chatbots with unique Bot IDs
- 📡 **Network interception** — Auto-indexes API responses for richer context
- 💬 **Human-like tone** — Sounds like a luxury store concierge, not a robot

---

## 🚀 Quick Start

### 1. Install the package

```bash
npm install autoverse-agent
```

### 2. Add one line to your app

```typescript
import "autoverse-agent";
```

That's it. A chat bubble appears on your website. Click it, enter your **Bot ID**, and your AI assistant is live.

---

## 📋 How It Works

```
┌──────────────────────────────────────────────────┐
│            AUTOVERSE SERVER (deploy once)         │
│                                                   │
│   Admin Dashboard  ◄────►  API + AI Engine        │
│   (create & manage bots)   (Groq LLM + RAG)      │
└──────────────────┬───────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
  Website A    Website B    Website C
  botId: abc   botId: def   botId: ghi
  💬 Widget    💬 Widget    💬 Widget
```

1. **Deploy the Autoverse server** once (locally or on Railway/Render/VPS)
2. **Create a bot** in the admin dashboard — get a unique Bot ID
3. **Install the npm package** on any website
4. **Enter the Bot ID** in the widget — your AI assistant starts working

---

## 🔧 Integration Methods

### Method 1: NPM Package (Recommended)

```bash
npm install autoverse-agent
```

**Zero-config (setup via widget):**
```typescript
import "autoverse-agent";
```

**Pre-configured (skip setup screen):**
```typescript
import { initWidget } from "autoverse-agent";

initWidget({ botId: "YOUR_BOT_ID" });
```

### Method 2: Script Tag (No npm needed)

```html
<script src="https://YOUR-SERVER.com/autoverse/widget.js?botId=YOUR_BOT_ID"></script>
```

### Method 3: Meta Tag + Import

```html
<meta name="autoverse-bot-id" content="YOUR_BOT_ID">
```
```typescript
import "autoverse-agent";
```

### Method 4: Express Middleware

```typescript
import express from "express";
import { autoverse } from "autoverse-agent";

const app = express();
app.use(autoverse());
app.listen(3000);
```

---

## 🎛️ Admin Dashboard

The Autoverse dashboard lets you manage multiple chatbots from one place.

### Features

| Tab | What You Can Do |
|-----|----------------|
| 🎨 **Appearance** | Primary/accent colors, dark/light theme, position, bubble size, welcome message |
| 🗣️ **Tone** | Language preference, response length, custom system prompt |
| 🔗 **Integration** | Copy-paste embed codes, view Bot ID, creation date |

### Live Preview

Changes are applied **instantly** — no redeployment needed. The widget fetches its configuration from the server on every load.

---

## 🛒 Order Automation

The chatbot handles the full order flow automatically:

```
Customer: "I want to buy the Swiss Army Knife"

Bot: "Great choice! 🎉 The Swiss Army Knife is $49.99.
      How many would you like?"

Customer: "2 please"

Bot: "Perfect! Could I get your full name for the order?"

Customer: "Ahmed Khan"

Bot: "Thanks Ahmed! And your phone/WhatsApp number?"

Customer: "0300-1234567"

Bot: "What's the delivery address?"

Customer: "House 12, Street 5, DHA Phase 2, Lahore"

Bot: "Would you like Cash on Delivery or online payment?"

Customer: "COD"

Bot: "Let me confirm your order:
      📦 Product: Swiss Army Knife x 2
      💸 Total: $99.98
      👤 Name: Ahmed Khan
      📱 Phone: 0300-1234567
      📍 Address: House 12, Street 5, DHA Phase 2, Lahore
      💳 Payment: Cash on Delivery

      Shall I place this order for you?"

Customer: "Yes"

Bot: "✅ Order Placed Successfully!
      🎉 Order #AV-482916
      Your order will be processed shortly.
      By the way, you might also love these..."
```

---

## 🖥️ Server Setup

### Running Locally

```bash
# Clone the repo
git clone https://github.com/your-repo/autoverse-agent.git
cd autoverse-agent

# Install dependencies
cd autoverse-agent && npm install
cd ../dashboard && npm install

# Build everything
cd ../autoverse-agent && npm run build
cd ../dashboard && npx vite build

# Start the server
cd ../autoverse-agent && npm run serve
```

Dashboard opens at **http://localhost:3000**

### Environment Variables

Create a `.env` file in the `autoverse-agent` directory:

```env
# Required
GROQ_API_KEY=gsk_your_api_key_here

# Optional
GROQ_MODEL=llama3-8b-8192      # AI model (default: llama3-8b-8192)
PORT=3000                       # Server port (default: 3000)
PUBLIC_URL=http://localhost:3000 # Your server's public URL
```

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | — | Your Groq API key ([get one free](https://console.groq.com)) |
| `GROQ_MODEL` | `llama3-8b-8192` | LLM model to use |
| `PORT` | `3000` | Server port |
| `PUBLIC_URL` | `http://localhost:3000` | Public URL (set this when deploying) |

### Supported Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `llama3-8b-8192` | ⚡ Fast | Good | Most use cases |
| `llama3-70b-8192` | Medium | Excellent | Complex queries |
| `mixtral-8x7b-32768` | Medium | Great | Long conversations |
| `gemma-7b-it` | ⚡ Fast | Good | Simple Q&A |

---

## 🚢 Deploy to Production

### Railway

1. Push the repo to GitHub
2. Connect to [Railway](https://railway.app)
3. Set environment variables:
   ```
   GROQ_API_KEY=gsk_...
   PUBLIC_URL=https://your-app.railway.app
   ```
4. Set build command:
   ```
   cd autoverse-agent && npm install && npm run build && cd ../dashboard && npm install && npx vite build
   ```
5. Set start command:
   ```
   cd autoverse-agent && node -e "require('dotenv').config(); require('./dist/server').startServer()"
   ```

### Render / Fly.io / VPS

Same pattern — set `PUBLIC_URL` to your deployed URL, build both projects, and start the server.

> **Important:** After deploying, update the `AUTOVERSE_CLOUD_URL` constant in `widget.ts` to your production URL, rebuild, and republish the npm package. This makes `import "autoverse-agent"` connect to your server automatically.

---

## 📦 API Reference

### `initWidget(options?)`

Initialize the chat widget manually.

```typescript
import { initWidget } from "autoverse-agent";

initWidget({
  botId: "abc123",              // Optional: skip setup screen
  serverUrl: "https://my.server" // Optional: custom server URL
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `botId` | `string` | `""` | Bot ID from dashboard. If empty, shows setup screen |
| `serverUrl` | `string` | Built-in cloud URL | Autoverse server URL |

### `autoverse(config?)`

Express middleware for server-side integration.

```typescript
import { autoverse } from "autoverse-agent";

app.use(autoverse({
  groqModel: "llama3-8b-8192",
  groqBaseUrl: "https://api.groq.com/openai/v1",
  verbose: true
}));
```

### `startServer(config?)`

Start a standalone Autoverse server with built-in dashboard.

```typescript
import { startServer } from "autoverse-agent";

startServer({
  port: 3000,
  publicUrl: "https://my-server.com",
  groqModel: "llama3-70b-8192"
});
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/autoverse/widget.js` | Widget JavaScript (add `?botId=xxx`) |
| `GET` | `/autoverse/api/health` | Server health check |
| `POST` | `/autoverse/api/init` | Initialize agent for a website |
| `POST` | `/autoverse/api/chat` | Send a chat message |
| `GET` | `/autoverse/api/bots/:id/config` | Get bot appearance config |
| `POST` | `/autoverse/api/dashboard/bots` | Create a new bot |
| `GET` | `/autoverse/api/dashboard/bots` | List all bots |
| `GET` | `/autoverse/api/dashboard/bots/:id` | Get bot details |
| `PUT` | `/autoverse/api/dashboard/bots/:id` | Update bot settings |
| `DELETE` | `/autoverse/api/dashboard/bots/:id` | Delete a bot |

---

## 🤝 How the NPM Package Connects to the Dashboard

```
  Developer's Website                    Your Autoverse Server
  ┌─────────────────┐                   ┌─────────────────────┐
  │                 │                   │                     │
  │  import         │   Bot ID          │   Admin Dashboard   │
  │  "autoverse-    │ ◄──────────────── │   (create bots,     │
  │   agent"        │                   │    customize look)   │
  │                 │                   │                     │
  │  💬 Widget      │ ──── API ────►    │   AI Engine         │
  │  appears!       │ ◄── Response ──── │   (Groq + RAG)      │
  │                 │                   │                     │
  └─────────────────┘                   └─────────────────────┘
```

1. Admin creates a bot in the dashboard → gets a **Bot ID**
2. Developer installs `autoverse-agent` on their website
3. Widget auto-appears → user enters the Bot ID
4. Widget connects to the server → AI starts helping customers
5. Admin can change appearance/tone anytime from the dashboard — changes apply instantly

---

## 📝 License

MIT © [Autoverse](https://github.com/your-repo/autoverse-agent)
