import { GroqClient } from "./groq";

export class EmbeddingService {
    private client: GroqClient;

    constructor(client: GroqClient) {
        this.client = client;
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const embedding = await this.client.embed(text);
            if (embedding && embedding.length > 0) {
                return embedding;
            }
            return this.localEmbedding(text);
        } catch {
            return this.localEmbedding(text);
        }
    }

    async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
        return await Promise.all(texts.map(text => this.generateEmbedding(text)));
    }

    /**
     * Simple local embedding fallback using character-level hashing.
     * Not as good as neural embeddings, but functional for basic similarity.
     */
    private localEmbedding(text: string): number[] {
        const dimensions = 128;
        const vector = new Array(dimensions).fill(0);
        const words = text.toLowerCase().split(/\s+/);

        for (const word of words) {
            for (let i = 0; i < word.length; i++) {
                const charCode = word.charCodeAt(i);
                const index = (charCode * (i + 1)) % dimensions;
                vector[index] += 1;
            }
        }

        // Normalize
        const magnitude = Math.sqrt(vector.reduce((sum: number, v: number) => sum + v * v, 0));
        if (magnitude > 0) {
            for (let i = 0; i < dimensions; i++) {
                vector[i] = vector[i] / magnitude;
            }
        }

        return vector;
    }
}
