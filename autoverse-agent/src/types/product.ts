export interface ContentItem {
    id: string;
    title: string;
    body: string;
    url: string;
    type: "product" | "article" | "text_block";
    price?: number;
    currency?: string;
    imageUrl?: string;
    inStock?: boolean;
    metadata?: Record<string, any>;
}

export interface ScrapedData {
    items: ContentItem[];
    scrapedAt: string;
}
