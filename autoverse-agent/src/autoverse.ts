import { Crawler } from "./ingestion/crawler";
import { Extractor } from "./ingestion/extractor";
import { EmbeddingService } from "./core/embeddings";
import { VectorStore } from "./core/vectorStore";
import { Retriever } from "./core/retriever";
import { RAGPipeline } from "./core/rag";
import { Recommender } from "./recommender/ranking";
import { IntentClassifier } from "./agent/intentClassifier";
import { Planner } from "./agent/planner";
import { ActionExecutor } from "./agent/actionExecutor";
import { GroqClient, GroqConfig } from "./core/groq";
import { ContentItem } from "./types/product";

export interface AutoverseConfig {
  groqModel?: string;
  groqBaseUrl?: string;
  groqApiKey?: string;
  language?: "en" | "ur" | "both";
  verbose?: boolean;
}

export class Autoverse {
  private crawler = new Crawler();
  private extractor = new Extractor();
  private embeddingService: EmbeddingService;
  private vectorStore = new VectorStore();
  private retriever: Retriever;
  private rag: RAGPipeline;
  private recommender = new Recommender();
  private intentClassifier: IntentClassifier;
  private planner = new Planner();
  private actionExecutor = new ActionExecutor();
  private client: GroqClient;
  private config: AutoverseConfig;

  private items: ContentItem[] = [];

  constructor(config: AutoverseConfig = {}) {
    this.config = { verbose: false, language: "both", ...config };

    const groqConfig: GroqConfig = {
      model: this.config.groqModel,
      baseUrl: this.config.groqBaseUrl,
      apiKey: this.config.groqApiKey,
    };

    this.client = new GroqClient(groqConfig);
    this.embeddingService = new EmbeddingService(this.client);
    this.retriever = new Retriever(this.vectorStore, this.embeddingService);
    this.rag = new RAGPipeline(this.client);
    this.intentClassifier = new IntentClassifier(this.client);
  }

  async attach(url: string): Promise<void> {
    if (this.config.verbose) console.log(`Attaching to ${url}...`);
    const html = await this.crawler.fetch(url);
    this.items = this.extractor.extract(html, url);
    console.log(this.items)
    if (this.config.verbose) console.log(`Extracted ${this.items.length} items.`);

    this.vectorStore.clear();
    for (const item of this.items) {
      const textToEmbed = `${item.title} ${item.body} ${item.type}`;
      const vector = await this.embeddingService.generateEmbedding(textToEmbed);
      this.vectorStore.add(item.id, vector, item as any);
    }
    if (this.config.verbose) console.log("Vector store indexing complete.");
  }

  async chat(query: string, pageUrl?: string, customTone?: string, history: Array<{ role: string, content: string }> = []): Promise<string> {
    const intent = await this.intentClassifier.classify(query);
    const plan = this.planner.plan(intent, query);
    if (this.config.verbose) console.log(`Plan: ${plan.action} (${intent})`);

    const context = await this.retriever.retrieve(query, 5, pageUrl);
    const rankedContext = this.recommender.rank(context as any, query);

    const recentHistory = history.slice(-6); // Keep last 3 turns
    const answer = await this.rag.generateAnswer(query, rankedContext as any, recentHistory, customTone);

    return answer;
  }

  getItems(): ContentItem[] {
    return this.items;
  }

  getProducts(): ContentItem[] {
    return this.items.filter(i => i.type === "product");
  }

  async indexRawData(data: any): Promise<void> {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      if (text.length > 50000) return; // Ignore massive payloads
      // Extract basic signals or assume dynamic item
      const { v4: uuidv4 } = require("uuid");
      const siteUrl = this.items.length > 0 ? new URL(this.items[0].url).origin : "http://localhost";
      const item: ContentItem = {
        id: uuidv4(),
        title: "Dynamic Network Data: " + (data.name || data.title || "Intercepted Item"),
        body: text.substring(0, 1500),
        type: "product", // Assume product context for network intercept
        url: data.url || siteUrl,
        price: data.price || undefined,
        inStock: data.inStock !== undefined ? data.inStock : undefined
      };
      this.items.push(item);

      const textToEmbed = `${item.title} ${item.body} ${item.type}`;
      const vector = await this.embeddingService.generateEmbedding(textToEmbed);
      this.vectorStore.add(item.id, vector, item);
    } catch (e) {
      // Silently fail as requested by strict fail-safe design
    }
  }

  async executeAction(intent: string, payload: any): Promise<any> {
    return await this.actionExecutor.execute(intent, payload);
  }
}
