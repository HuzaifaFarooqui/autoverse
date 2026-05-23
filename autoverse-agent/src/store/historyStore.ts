import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), ".autoverse-data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

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

export class HistoryStore {
    private sessions: Map<string, Session> = new Map();

    constructor() {
        this.load();
    }

    private load(): void {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (fs.existsSync(HISTORY_FILE)) {
                const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
                const arr: Session[] = JSON.parse(raw);
                for (const session of arr) {
                    this.sessions.set(session.sessionId, session);
                }
            }
        } catch {
            // Start fresh if file is corrupted
        }
    }

    private save(): void {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            const arr = Array.from(this.sessions.values());
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(arr, null, 2), "utf-8");
        } catch (e) {
            console.error("Failed to save history:", e);
        }
    }

    createSession(botId: string): Session {
        const sessionId = uuidv4().replace(/-/g, "").substring(0, 16);
        const now = new Date().toISOString();
        const session: Session = {
            sessionId,
            botId,
            createdAt: now,
            updatedAt: now,
            messages: [],
        };
        this.sessions.set(sessionId, session);
        this.save();
        return session;
    }

    getSession(sessionId: string): Session | undefined {
        return this.sessions.get(sessionId);
    }

    getSessionsForBot(botId: string): Session[] {
        return Array.from(this.sessions.values())
            .filter((s) => s.botId === botId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    addMessage(sessionId: string, message: Omit<ChatMessage, "timestamp">): Session | undefined {
        const session = this.sessions.get(sessionId);
        if (!session) return undefined;

        session.messages.push({
            ...message,
            timestamp: Date.now(),
        });
        session.updatedAt = new Date().toISOString();
        
        this.save();
        return session;
    }

    deleteSession(sessionId: string): boolean {
        const existed = this.sessions.delete(sessionId);
        if (existed) this.save();
        return existed;
    }

    clearSessionsForBot(botId: string): number {
        let deletedCount = 0;
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.botId === botId) {
                this.sessions.delete(sessionId);
                deletedCount++;
            }
        }
        if (deletedCount > 0) this.save();
        return deletedCount;
    }
}
