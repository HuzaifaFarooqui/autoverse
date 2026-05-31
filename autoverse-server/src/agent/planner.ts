import { Intent } from "./intentClassifier";

export interface Plan {
    action: string;
    steps: string[];
}

export class Planner {
    plan(intent: Intent, query: string): Plan {
        switch (intent) {
            case "product_search":
                return {
                    action: "search",
                    steps: ["retrieve_products", "rank_results", "generate_response"]
                };
            case "comparison":
                return {
                    action: "compare",
                    steps: ["retrieve_products", "extract_features", "generate_comparison"]
                };
            case "booking":
                return {
                    action: "execute_action",
                    steps: ["identify_product", "simulate_checkout", "generate_confirmation"]
                };
            case "recommendation":
                return {
                    action: "recommend",
                    steps: ["analyze_preferences", "retrieve_best_fits", "generate_suggestions"]
                };
            default:
                return {
                    action: "chat",
                    steps: ["generate_contextual_response"]
                };
        }
    }
}
