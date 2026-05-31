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

export const DEFAULT_APPEARANCE: BotAppearance = {
    primaryColor: "#000000",
    accentColor: "#666666",
    position: "right",
    bubbleSize: 56,
    headerTitle: "Customer Support",
    welcomeMessage: "Hi! How can I help you today?",
    theme: "system",
    borderRadius: 16,
    accentMode: false,
    shadowIntensity: "medium",
    spacing: "comfortable",
    glassmorphism: true,
    buttonVariant: "solid",
};

export const DEFAULT_TONE: BotTone = {
    systemPrompt: "",
    language: "both",
    responseLength: "medium",
};
