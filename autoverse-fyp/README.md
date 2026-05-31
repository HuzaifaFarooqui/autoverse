<p align="center">
  <img src="https://img.shields.io/npm/v/autoverse-fyp?color=667eea&style=for-the-badge&labelColor=0a0a1a" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/autoverse-fyp?color=764ba2&style=for-the-badge&labelColor=0a0a1a" alt="downloads" />
  <img src="https://img.shields.io/badge/license-MIT-34d399?style=for-the-badge&labelColor=0a0a1a" alt="license" />
</p>

<h1 align="center"> Autoverse Agent</h1>

<p align="center">
  <strong>Zero-config AI customer service chatbot for any website.</strong><br/>
  Auto-scrapes your site, learns your products, handles orders, and talks like a real human.<br/>
  Powered by Groq LLMs.
</p>

---

## ✨ Features

-**One-line install** — `import "autoverse-fyp"` and the widget appears
-**Auto-learns your site** — Scrapes products, pages, and APIs automatically
-**Order automation** — Collects customer details and places orders step-by-step
-**Fully customizable** — Colors, theme, position, tone via admin dashboard
-**Bilingual** — English + Urdu with auto-detection
-**Multi-tenant** — One server, unlimited chatbots with unique Bot IDs
-**Network interception** — Auto-indexes API responses for richer context
-**Human-like tone** — Sounds like a luxury store concierge, not a robot

---

## Quick Start

- ### 1. Install the package

```bash
npm install autoverse-fyp
```

- ### 2. Add one line to your app

```typescript
import "autoverse-fyp";
```

That's it. A chat bubble appears on your website. Click it, enter your **Bot ID**, and your AI assistant is live.

---

## How It Works

This project is built using a highly decoupled, production-ready microservices architecture. It separates client-side embeds, administrative controls, and core RAG operations to achieve extreme performance, security, and scalability:

```
Customer Website (Host Environment)
        │
        ▼
autoverse-agent widget (Injected client bundle)
        │
        ▼
api.autoverse.com (High-speed API gateway / autoverse-server)
        │
        ├─ AI responses (Groq Llama-3.1 + local vector RAG)
        ├─ chat history
        ├─ bot configs
        └─ sessions
        │
        ▼
Database (Persistence Layer)
        │
        ▼
Vercel Dashboard (Decoupled Admin Panel)
```

1. **Deploy the backend API server (`autoverse-server`)** to **Railway** (mapping to `api.autoverse.com`)
2. **Deploy the Admin Dashboard (`dashboard`)** to **Vercel**
3. **Configure your Database** for storing bot configurations, chat logs, and sessions
4. **Create a bot** in the Vercel dashboard to receive a unique Bot ID
5. **Install the npm package (`autoverse-fyp`)** or inject the script tag on any customer website
6. **Connect the widget** with your Bot ID, and your custom AI concierge goes live!

---

## 🔧 Integration Methods

### Method 1: NPM Package (Recommended)

```bash
npm install autoverse-fyp
```

**Zero-config (setup via widget):**
```typescript
import "autoverse-fyp";
```

**Pre-configured (skip setup screen):**
```typescript
import { initWidget } from "autoverse-fyp";

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
import "autoverse-fyp";
```

### Method 4: Express Middleware

```typescript
import express from "express";
import { autoverse } from "autoverse-fyp";

const app = express();
app.use(autoverse());
app.listen(3000);
```

---

## Admin Dashboard

The Autoverse dashboard lets you manage multiple chatbots from one place.

### Features

| Tab | What You Can Do |
|-----|----------------|
| **Appearance** | Primary/accent colors, dark/light theme, position, bubble size, welcome message |
| **Tone** | Language preference, response length, custom system prompt |
| **Integration** | Copy-paste embed codes, view Bot ID, creation date |

### Live Preview

Changes are applied **instantly** — no redeployment needed. The widget fetches its configuration from the server on every load.

---

## Order Automation

The chatbot handles the full order flow automatically:

```
Customer: "I want to buy the Swiss Army Knife"

Bot: "Great choice! The Swiss Army Knife is $49.99.
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
      Product: Swiss Army Knife x 2
      Total: $99.98
      Name: Ahmed Khan
      Phone: 0300-1234567
      Address: House 12, Street 5, DHA Phase 2, Lahore
      Payment: Cash on Delivery
      Shall I place this order for you?"

Customer: "Yes"

Bot: "Order Placed Successfully!
      Order #AV-482916
      Your order will be processed shortly.
      By the way, you might also love these..."
```

---

## Server Setup (autoverse-server)

### Running Locally

```bash
# Clone the repository
git clone https://github.com/your-repo/autoverse-agent.git
cd autoverse-agent-main

# Install dependencies for both projects
cd autoverse-server && npm install
cd ../dashboard && npm install

# Start the backend server in development mode
cd ../autoverse-server && npm run dev

# Start the admin dashboard in development mode
cd ../dashboard && npm run dev
```

- Backend API runs at: **http://localhost:3000**
- Local Dashboard opens at: **http://localhost:5173**

### Environment Variables

Create a `.env` file in the `autoverse-server` directory:

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

## Deploy to Production

### 1. Deploy Backend API to Railway

1. Link your GitHub repository to [Railway](https://railway.app).
2. Deploy the `autoverse-server` subdirectory.
3. Configure the following environment variables:
   ```env
   GROQ_API_KEY=gsk_your_api_key
   PUBLIC_URL=https://api.autoverse.com  # Or your Railway app domain
   PORT=3000
   ```
4. Set the build command:
   ```bash
   npm run build
   ```
5. Set the start command:
   ```bash
   npm start
   ```

### 2. Deploy Admin Dashboard to Vercel

1. Import your workspace in [Vercel](https://vercel.com).
2. Target the `dashboard` folder as the Root Directory.
3. Configure the API build environment variable:
   ```env
   VITE_API_URL=https://api.autoverse.com  # Point to your API gateway
   ```
4. Set the Build Command:
   ```bash
   npm run build
   ```
5. Set the Output Directory:
   ```
   dist
   ```
6. Click **Deploy**. Your dashboard is now live on Vercel's global Edge CDN!

### 3. Deploy NPM Widget Package

1. Sign in to your developer console on the [NPM Registry](https://npmjs.com).
2. Inside the `autoverse-fyp` folder, verify the default `AUTOVERSE_CLOUD_URL` in `src/widget.ts` points to `https://api.autoverse.com`.
3. Build the widget bundle:
   ```bash
   npm run build
   ```
4. Publish the optimized package:
   ```bash
   npm publish --access public
   ```

---

## API Reference

### `initWidget(options?)`

Initialize the chat widget manually.

```typescript
import { initWidget } from "autoverse-fyp";

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
import { autoverse } from "autoverse-fyp";

app.use(autoverse({
  groqModel: "llama3-8b-8192",
  groqBaseUrl: "https://api.groq.com/openai/v1",
  verbose: true
}));
```

### `startServer(config?)`

Start a standalone Autoverse server with built-in dashboard.

```typescript
import { startServer } from "autoverse-fyp";

startServer({
  port: 3000,
  publicUrl: "https://my-server.com",
  groqModel: "llama3-70b-8192"
});
```

---

## REST API Endpoints

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

## How the NPM Package Connects to the Dashboard

```
  Developer's Website                    Your Autoverse Server
  ┌─────────────────┐                   ┌─────────────────────┐
  │                 │                   │                     │
  │  import         │   Bot ID          │   Admin Dashboard   │
  │  "autoverse-    │ ◄──────────────── │   (create bots,     │
  │   fyp"          │                   │    customize look)   │
  │                 │                   │                     │
  │  💬 Widget      │ ──── API ────►    │   AI Engine         │
  │  appears!       │ ◄── Response ──── │   (Groq + RAG)      │
  │                 │                   │                     │
  └─────────────────┘                   └─────────────────────┘
```

1. Admin creates a bot in the dashboard → gets a **Bot ID**
2. Developer installs `autoverse-fyp` on their website
3. Widget auto-appears → user enters the Bot ID
4. Widget connects to the server → AI starts helping customers
5. Admin can change appearance/tone anytime from the dashboard — changes apply instantly

---

## License

MIT © [Autoverse](https://github.com/your-repo/autoverse-fyp)
