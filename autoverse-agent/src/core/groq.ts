import axios from "axios";

export interface GroqConfig {
    baseUrl?: string;
    model?: string;
    apiKey?: string;
}

export class GroqClient {
    private baseUrl: string;
    private model: string;
    private apiKey: string;

    constructor(config: GroqConfig = {}) {
        this.baseUrl = (config.baseUrl || "https://api.groq.com/openai/v1").replace(/\/$/, "");
        this.model = "llama-3.1-8b-instant";
        this.apiKey = config.apiKey || process.env.GROQ_API_KEY || "";
    }

    async generate(prompt: string): Promise<string> {
        try {
            const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                model: this.model,
                messages: [{ role: "user", content: prompt }]
            }, {
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            return response.data.choices[0].message.content;
        } catch (error: any) {
            const detail = error.response?.data?.error?.message || error.message || "Unknown error";
            throw new Error(`Groq generation failed (model: ${this.model}): ${detail}`);
        }
    }

    async embed(text: string): Promise<number[]> {
        throw new Error("Embeddings not supported by Groq API. Falling back to local embedding.");
    }
}
