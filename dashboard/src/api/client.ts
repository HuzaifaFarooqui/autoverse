// Auto-detect server URL: use same origin in production, or env variable in dev, or local storage config
export function getApiBase(): string {
  const storedUrl = localStorage.getItem("autoverse_server_url");
  if (storedUrl) return storedUrl.replace(/\/$/, "");
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  return window.location.origin;
}

export function setApiBase(url: string | null) {
  if (url) {
    localStorage.setItem("autoverse_server_url", url.trim().replace(/\/$/, ""));
  } else {
    localStorage.removeItem("autoverse_server_url");
  }
}

export async function testConnection(url: string): Promise<boolean> {
  try {
    const cleanUrl = url.trim().replace(/\/$/, "");
    // Add timeout using AbortController to prevent hanging connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const res = await fetch(`${cleanUrl}/autoverse/api/health`, { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

export interface BotAppearance {
  primaryColor: string;
  accentColor: string;
  position: "left" | "right";
  bubbleSize: number;
  headerTitle: string;
  welcomeMessage: string;
  theme: "dark" | "light" | "system";
  borderRadius: number;
  accentMode: boolean;
  shadowIntensity: "none" | "light" | "medium" | "heavy";
  spacing: "compact" | "comfortable";
  glassmorphism: boolean;
  buttonVariant: "solid" | "outline";
}

export interface BotTone {
  systemPrompt: string;
  language: "en" | "ur" | "both";
  responseLength: "short" | "medium" | "long";
}

export interface BotConfig {
  botId: string;
  name: string;
  websiteUrl: string;
  groqApiKey?: string;
  groqModel?: string;
  appearance: BotAppearance;
  tone: BotTone;
  createdAt: string;
  updatedAt: string;
}

// Cache the public URL from server
let _serverPublicUrl: string | null = null;

export async function getServerUrl(): Promise<string> {
  if (_serverPublicUrl) return _serverPublicUrl;
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/autoverse/api/server-info`);
    const data = await res.json();
    _serverPublicUrl = data.publicUrl || apiBase;
  } catch {
    _serverPublicUrl = apiBase;
  }
  return _serverPublicUrl || apiBase;
}

export async function fetchBots(): Promise<BotConfig[]> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/autoverse/api/dashboard/bots`);
  if (!res.ok) throw new Error("Failed to fetch bots");
  return res.json();
}

export async function fetchBot(botId: string): Promise<BotConfig> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/autoverse/api/dashboard/bots/${botId}`);
  if (!res.ok) throw new Error("Bot not found");
  return res.json();
}

export async function createBot(data: {
  name: string;
  websiteUrl: string;
  groqApiKey?: string;
  groqModel?: string;
}): Promise<BotConfig> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/autoverse/api/dashboard/bots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bot");
  return res.json();
}

export async function updateBot(
  botId: string,
  data: Partial<BotConfig>
): Promise<BotConfig> {
  const apiBase = getApiBase();
  const res = await fetch(
    `${apiBase}/autoverse/api/dashboard/bots/${botId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to update bot");
  return res.json();
}

export async function deleteBot(botId: string): Promise<void> {
  const apiBase = getApiBase();
  const res = await fetch(
    `${apiBase}/autoverse/api/dashboard/bots/${botId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete bot");
}

export function getEmbedScript(botId: string, serverUrl: string): string {
  return `<script src="${serverUrl}/autoverse/widget.js?botId=${botId}"></script>`;
}

export function getEmbedNpm(botId: string): string {
  return `import { initWidget } from "autoverse-fyp";

initWidget({ botId: "${botId}" });`;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Session {
  sessionId: string;
  botId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export async function fetchSessions(botId: string): Promise<Session[]> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/autoverse/api/dashboard/bots/${botId}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function fetchSession(sessionId: string): Promise<Session> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/autoverse/api/dashboard/sessions/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch session details");
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/autoverse/api/dashboard/sessions/${sessionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete session");
}

export async function clearBotHistory(botId: string): Promise<void> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/autoverse/api/dashboard/bots/${botId}/sessions`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear history");
}
