import { ContentItem } from "../types/product";

export interface VectorEntry {
    id: string;
    vector: number[];
    product: ContentItem;
}

export class VectorStore {
    private store: VectorEntry[] = [];

    add(id: string, vector: number[], product: ContentItem) {
        this.store.push({ id, vector, product });
    }

    async search(queryVector: number[], k: number = 3): Promise<VectorEntry[]> {
        const results = this.store.map(entry => ({
            ...entry,
            similarity: this.cosineSimilarity(queryVector, entry.vector)
        }));

        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, k);
    }

    private cosineSimilarity(v1: number[], v2: number[]): number {
        const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
        const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
        const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
        if (mag1 === 0 || mag2 === 0) return 0;
        return dotProduct / (mag1 * mag2);
    }

    clear() {
        this.store = [];
    }
}
