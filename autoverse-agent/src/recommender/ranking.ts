import { ContentItem } from "../types/product";

export class Recommender {
  rank(items: ContentItem[], query: string): ContentItem[] {
    const terms = query.toLowerCase().split(/\s+/);

    const scored = items.map(item => {
      let score = 0;
      const title = item.title.toLowerCase();
      const body = item.body.toLowerCase();

      for (const term of terms) {
        if (title.includes(term)) score += 10;
        if (body.includes(term)) score += 5;
      }

      // Bonus for specific item types if looking for reviews or info
      if (item.type === "article") score += 2;

      return { item, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);
  }
}
