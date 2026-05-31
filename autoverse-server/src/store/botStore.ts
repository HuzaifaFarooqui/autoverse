import * as fs from "fs";
import * as path from "path";
import { BotConfig, DEFAULT_APPEARANCE, DEFAULT_TONE } from "../types/bot";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), ".autoverse-data");
const BOTS_FILE = path.join(DATA_DIR, "bots.json");

export class BotStore {
    private bots: Map<string, BotConfig> = new Map();

    constructor() {
        this.load();
    }

    private load(): void {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (fs.existsSync(BOTS_FILE)) {
                const raw = fs.readFileSync(BOTS_FILE, "utf-8");
                const arr: BotConfig[] = JSON.parse(raw);
                for (const bot of arr) {
                    this.bots.set(bot.botId, bot);
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
            const arr = Array.from(this.bots.values());
            fs.writeFileSync(BOTS_FILE, JSON.stringify(arr, null, 2), "utf-8");
        } catch (e) {
            console.error("Failed to save bots:", e);
        }
    }

    create(data: { name: string; websiteUrl: string; groqApiKey?: string; groqModel?: string }): BotConfig {
        const botId = uuidv4().replace(/-/g, "").substring(0, 12);
        const now = new Date().toISOString();
        const bot: BotConfig = {
            botId,
            name: data.name,
            websiteUrl: data.websiteUrl,
            groqApiKey: data.groqApiKey,
            groqModel: data.groqModel,
            appearance: { ...DEFAULT_APPEARANCE },
            tone: { ...DEFAULT_TONE },
            createdAt: now,
            updatedAt: now,
        };
        this.bots.set(botId, bot);
        this.save();
        return bot;
    }

    get(botId: string): BotConfig | undefined {
        return this.bots.get(botId);
    }

    getAll(): BotConfig[] {
        return Array.from(this.bots.values());
    }

    update(botId: string, updates: Partial<BotConfig>): BotConfig | undefined {
        const existing = this.bots.get(botId);
        if (!existing) return undefined;

        const updated: BotConfig = {
            ...existing,
            ...updates,
            botId: existing.botId, // Never allow botId change
            createdAt: existing.createdAt, // Never allow createdAt change
            updatedAt: new Date().toISOString(),
            appearance: updates.appearance
                ? { ...existing.appearance, ...updates.appearance }
                : existing.appearance,
            tone: updates.tone
                ? { ...existing.tone, ...updates.tone }
                : existing.tone,
        };
        this.bots.set(botId, updated);
        this.save();
        return updated;
    }

    delete(botId: string): boolean {
        const existed = this.bots.delete(botId);
        if (existed) this.save();
        return existed;
    }
}
