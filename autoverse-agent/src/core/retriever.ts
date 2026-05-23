import { VectorStore } from "./vectorStore";
import { EmbeddingService } from "./embeddings";
import { ContentItem } from "../types/product";

export class Retriever {
  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService
  ) { }

  async retrieve(query: string, k: number = 3, pageUrl?: string): Promise<ContentItem[]> {
    const queryVector = await this.embeddingService.generateEmbedding(query);
    const results = await this.vectorStore.search(queryVector, k * 2);

    const tokens = query.toLowerCase().split(/\\s+/).filter(t => t.length > 2);
    
    const reranked = results.map(r => {
       let overlap = 0;
       const p = r.product as any;
       const text = `${p.title || ''} ${p.body || ''} ${p.description || ''}`.toLowerCase();
       tokens.forEach(t => { if (text.includes(t)) overlap += 0.1; });
       
       let finalScore = (((r as any).similarity || 0) * 0.7) + (overlap * 0.3);
       
       // Page awareness boost
       if (pageUrl && p.url === pageUrl) finalScore *= 1.2;
       
       return { product: p, finalScore };
    });

    return reranked
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, k)
        .map(r => r.product);
  }
}
