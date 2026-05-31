import { generateWithCache } from "../core/cache";
import { GroqClient } from "../core/groq";

export type Intent = "product_search" | "comparison" | "recommendation" | "booking" | "general_query";

export class IntentClassifier {
    private client: GroqClient;

    constructor(client: GroqClient) {
        this.client = client;
    }

    async classify(query: string): Promise<Intent> {
        const prompt = `
Classify the following user query into one of these intents:
- product_search (looking for a specific product or category)
- comparison (comparing two or more products)
- recommendation (asking for suggestions)
- booking (asking to book, buy, or add to cart)
- general_query (anything else)

Query: "${query}"

Return ONLY the intent string.
`;

        const resultText = await generateWithCache(prompt, async () => {
            return await this.client.generate(prompt);
        });

        const intent = resultText.trim().toLowerCase() as Intent;
        const validIntents: Intent[] = ["product_search", "comparison", "recommendation", "booking", "general_query"];
        return validIntents.includes(intent) ? intent : "general_query";
    }
}
