import express, { Request, Response, NextFunction, Router } from "express";
import cors from "cors";
import path from "path";
import { Autoverse, AutoverseConfig } from "./autoverse";
import { getWidgetHTML } from "./widget";
import { BotStore } from "./store/botStore";
import { HistoryStore } from "./store/historyStore";
import { BotConfig, DEFAULT_APPEARANCE, DEFAULT_TONE } from "./types/bot";
import { GroqConfig } from "./core/groq";

export interface ServerConfig extends AutoverseConfig {
    port?: number;
    publicUrl?: string;
}

/**
 * Express middleware — just add `app.use(autoverse())` and the chat widget
 * auto-appears on every page. No script tags needed.
 */
export function autoverse(config: AutoverseConfig = {}): Router {
    const router = Router();
    const agents = new Map<string, Autoverse>();
    const botStore = new BotStore();
    const historyStore = new HistoryStore();

    router.use(cors());
    router.use(express.json({ limit: "2mb" }));

    // ===== WIDGET JS ENDPOINT =====
    router.get("/autoverse/widget.js", (req, res) => {
        // Determine server's own public URL
        const publicUrl = process.env.PUBLIC_URL
            || `${req.protocol}://${req.headers.host}`;
        const botId = (req.query.botId as string) || "";
        const js = getWidgetHTML(publicUrl, botId);
        res.type("application/javascript").send(js);
    });

    // ===== SERVER INFO (for dashboard to auto-detect its own URL) =====
    router.get("/autoverse/api/server-info", (req, res) => {
        const publicUrl = process.env.PUBLIC_URL
            || `${req.protocol}://${req.headers.host}`;
        return res.json({ publicUrl });
    });

    // ===== BOT CONFIG (PUBLIC — for widget to fetch appearance) =====
    router.get("/autoverse/api/bots/:botId/config", (req, res) => {
        const bot = botStore.get(req.params.botId);
        if (!bot) {
            return res.json({ ...DEFAULT_APPEARANCE });
        }
        return res.json(bot.appearance);
    });

    // ===== DASHBOARD API =====
    router.post("/autoverse/api/dashboard/bots", (req, res) => {
        try {
            const { name, websiteUrl, groqApiKey, groqModel } = req.body;
            if (!name || !websiteUrl) {
                return res.status(400).json({ error: "name and websiteUrl are required" });
            }
            const bot = botStore.create({ name, websiteUrl, groqApiKey, groqModel });
            return res.json(bot);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    });

    router.get("/autoverse/api/dashboard/bots", (_req, res) => {
        return res.json(botStore.getAll());
    });

    router.get("/autoverse/api/dashboard/bots/:botId", (req, res) => {
        const bot = botStore.get(req.params.botId);
        if (!bot) return res.status(404).json({ error: "Bot not found" });
        return res.json(bot);
    });

    router.put("/autoverse/api/dashboard/bots/:botId", (req, res) => {
        const updated = botStore.update(req.params.botId, req.body);
        if (!updated) return res.status(404).json({ error: "Bot not found" });
        return res.json(updated);
    });

    router.delete("/autoverse/api/dashboard/bots/:botId", (req, res) => {
        const deleted = botStore.delete(req.params.botId);
        if (!deleted) return res.status(404).json({ error: "Bot not found" });
        agents.delete(req.params.botId);
        return res.json({ success: true });
    });

    // ===== AGENT INIT =====
    router.post("/autoverse/api/init", async (req, res) => {
        try {
            const { url, botId, sessionId } = req.body;
            if (!url) return res.status(400).json({ success: false, error: "URL required" });

            let history: any[] = [];
            if (sessionId) {
                const session = historyStore.getSession(sessionId);
                if (session) history = session.messages;
            }

            const agentKey = botId || url;
            if (agents.has(agentKey)) return res.json({ status: "ready", history });

            let agentConfig: AutoverseConfig = { ...config };
            if (botId) {
                const bot = botStore.get(botId);
                if (bot) {
                    agentConfig = {
                        ...agentConfig,
                        groqModel: bot.groqModel || agentConfig.groqModel,
                        language: bot.tone?.language || agentConfig.language,
                    };
                    if (bot.groqApiKey) {
                        (agentConfig as any).groqApiKey = bot.groqApiKey;
                    }
                }
            }

            const agent = new Autoverse(agentConfig);
            const targetUrl = botId ? (botStore.get(botId)?.websiteUrl || url) : url;
            await agent.attach(targetUrl);
            agents.set(agentKey, agent);
            return res.json({ status: "ready", items: agent.getItems().length, history });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message || "Failed to initialize agent" });
        }
    });

    // ===== CHAT =====
    router.post("/autoverse/api/chat", async (req, res) => {
        try {
            const { url, botId, pageUrl, query, sessionId } = req.body;
            if (!url || !query) return res.status(400).json({ success: false, error: "URL and query required" });

            const agentKey = botId || url;
            const agent = agents.get(agentKey);
            if (!agent) return res.status(400).json({ success: false, error: "Agent not indexed. Please initialize first." });

            let currentSessionId = sessionId;
            let session = currentSessionId ? historyStore.getSession(currentSessionId) : undefined;
            if (!session) {
                session = historyStore.createSession(botId || "anonymous");
                currentSessionId = session.sessionId;
            }

            let customTone: string | undefined;
            if (botId) {
                const bot = botStore.get(botId);
                if (bot?.tone?.systemPrompt) {
                    customTone = bot.tone.systemPrompt;
                }
            }

            // Provide session history to agent
            const historyObj = session.messages.map(m => ({ role: m.role, content: m.content }));

            const answer = await agent.chat(query, pageUrl, customTone, historyObj);

            // Update persistent history
            historyStore.addMessage(currentSessionId, { role: "user", content: query });
            historyStore.addMessage(currentSessionId, { role: "assistant", content: answer });

            return res.json({ success: true, answer, sessionId: currentSessionId });
        } catch (error: any) {
            console.error("Chat error:", error);
            return res.status(500).json({ success: false, error: error.message || "An unexpected error occurred" });
        }
    });

    // ===== DASHBOARD HISTORY =====
    router.get("/autoverse/api/dashboard/bots/:botId/sessions", (req, res) => {
        const sessions = historyStore.getSessionsForBot(req.params.botId);
        return res.json(sessions);
    });

    router.delete("/autoverse/api/dashboard/bots/:botId/sessions", (req, res) => {
        const count = historyStore.clearSessionsForBot(req.params.botId);
        return res.json({ success: true, count });
    });

    router.get("/autoverse/api/dashboard/sessions/:sessionId", (req, res) => {
        const session = historyStore.getSession(req.params.sessionId);
        if (!session) return res.status(404).json({ error: "Session not found" });
        return res.json(session);
    });

    router.delete("/autoverse/api/dashboard/sessions/:sessionId", (req, res) => {
        const deleted = historyStore.deleteSession(req.params.sessionId);
        if (!deleted) return res.status(404).json({ error: "Session not found" });
        return res.json({ success: true });
    });

    // ===== PASSIVE DATA INDEXING =====
    router.post("/autoverse/api/index-data", (req, res) => {
        setTimeout(async () => {
            try {
                const { url, botId, data } = req.body;
                if (!url || !data) return;
                const agentKey = botId || url;
                const agent = agents.get(agentKey);
                if (agent) await agent.indexRawData(data);
            } catch (e) { }
        }, 0);
        return res.json({ status: "accepted" });
    });

    // ===== HEALTH =====
    router.get("/autoverse/api/health", (_req, res) => {
        res.json({ status: "ok", sites: agents.size, bots: botStore.getAll().length });
    });

    // ===== AUTO-INJECT WIDGET =====
    router.use((_req: Request, res: Response, next: NextFunction) => {
        const originalSend = res.send.bind(res);
        res.send = function (body: any): Response {
            if (typeof body === "string" && body.includes("</body>")) {
                const scriptTag = `<script src="/autoverse/widget.js"></script>`;
                body = body.replace("</body>", `${scriptTag}\n</body>`);
            }
            return originalSend(body);
        };
        next();
    });

    return router;
}

/**
 * Standalone server — serves both the API and admin dashboard.
 * Deploy this as a single service and it handles everything.
 */
export async function startServer(config: ServerConfig = {}) {
    const app = express();
    const port = config.port || parseInt(process.env.PORT || "3000");
    const publicUrl = config.publicUrl || process.env.PUBLIC_URL || `http://localhost:${port}`;

    // Set PUBLIC_URL for the middleware to use
    if (!process.env.PUBLIC_URL) {
        process.env.PUBLIC_URL = publicUrl;
    }

    app.use(autoverse(config));

    // Test page for widget (no botId = shows setup screen)
    app.get("/test-widget", (_req, res) => {
        res.send(`
<!DOCTYPE html>
<html>
<head><title>Widget Test</title></head>
<body style="font-family:sans-serif;padding:40px;background:#f0f0f5">
    <h1>🛍️ My Test Store</h1>
    <p>This is a test page. The Autoverse chat widget should appear in the bottom-right corner.</p>
    <p>Click the bubble, enter your Bot ID from the <a href="/">Dashboard</a>, and start chatting!</p>
    <script src="/autoverse/widget.js"></script>
</body>
</html>
        `);
    });

    // Serve dashboard static files at root
    const dashboardDist = path.join(__dirname, "..", "..", "dashboard", "dist");

    // Dashboard SPA — serve index.html for all non-API routes
    app.use(express.static(dashboardDist));
    app.get("/{*path}", (req, res, next) => {
        // Don't intercept /autoverse API routes
        if (req.path.startsWith("/autoverse")) return next();
        res.sendFile(path.join(dashboardDist, "index.html"));
    });

    app.listen(port, () => {
        console.log(`\n 🤖 Autoverse Agent running on ${publicUrl}`);
        console.log(` 📊 Local Dashboard: ${publicUrl}`);
        console.log(` ☁️  Cloud Dashboard: https://autoverse-sand.vercel.app?connect=${publicUrl}`);
        console.log(`\n 📦 To embed on any website, add this script tag:`);
        console.log(`   <script src="${publicUrl}/autoverse/widget.js?botId=YOUR_BOT_ID"></script>`);
        console.log(`\n 📦 Or with npm:`);
        console.log(`   import { initWidget } from "autoverse-fyp";`);
        console.log(`   initWidget({ botId: "YOUR_BOT_ID" });\n`);
    });

    return app;
}
