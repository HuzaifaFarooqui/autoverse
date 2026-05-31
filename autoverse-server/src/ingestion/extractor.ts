import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { ContentItem } from "../types/product";

export class Extractor {
    extract(html: string, baseUrl: string): ContentItem[] {
        const $ = cheerio.load(html);
        const items: ContentItem[] = [];

        // Extract site metadata (name, description) for RAG context
        const siteName = $("meta[property='og:site_name']").attr("content")
            || $("meta[name='application-name']").attr("content")
            || $("title").text().trim()
            || new URL(baseUrl).hostname;

        const siteDescription = $("meta[name='description']").attr("content")
            || $("meta[property='og:description']").attr("content")
            || "";

        // Always add site info as first item
        if (siteName) {
            items.push({
                id: uuidv4(),
                title: `Website: ${siteName}`,
                body: siteDescription || `This is the website ${siteName} at ${baseUrl}`,
                type: "text_block",
                url: baseUrl
            });
        }

        // 1. Product extraction with broad selectors
        const productSelectors = [
            ".product",
            ".item",
            "[itemtype*='Product']",
            ".card-wrapper",                              // Shopify Dawn
            "[class*='ai-featured-collection__item']",    // feelfitters
            "[class*='product-card']",                    // common pattern
            "[class*='ProductCard']",                     // React/Next.js
            ".group.relative",                            // Tailwind product cards (Random Hands style)
            "[class*='card'][class*='shadow']",           // Generic card with shadow
        ];

        for (const selector of productSelectors) {
            $(selector).each((_, element) => {
                const title = $(element).find("h1, h2, h3, h4, .name, .title, [class*='title']").first().text().trim();
                const priceText = $(element).find(".price, [itemprop='price'], .price-item, [class*='price'], p:contains('$'), span:contains('$'), span:contains('Rs'), p:contains('Rs')").first().text().trim();
                const description = $(element).find(".description, [itemprop='description'], .card__information, p").first().text().trim();
                let imageUrl = $(element).find("img").first().attr("src");
                if (!imageUrl) imageUrl = $(element).find("img").first().attr("srcset")?.split(" ")[0];

                const linkEl = $(element).is("a") ? $(element) : $(element).find("a").first();
                const url = linkEl.attr("href") || baseUrl;
                
                const elementText = $(element).text().toLowerCase();
                const inStock = !elementText.includes("sold out") && 
                                !elementText.includes("out of stock") &&
                                !elementText.includes("unavailable");

                if (title && title.length > 2) {
                    items.push({
                        id: uuidv4(),
                        title,
                        body: description || title,
                        type: "product",
                        price: priceText ? this.parsePrice(priceText) : undefined,
                        currency: priceText ? this.detectCurrency(priceText) : undefined,
                        inStock,
                        url: this.resolveUrl(baseUrl, url),
                        imageUrl: imageUrl ? this.resolveUrl(baseUrl, imageUrl) : undefined
                    });
                }
            });
            if (items.length > 1) return items; // >1 because site info is always item 0
        }

        // 2. Article extraction
        const articleSelectors = ["article", ".post", ".entry", ".story"];
        for (const selector of articleSelectors) {
            $(selector).each((_, element) => {
                const title = $(element).find("h1, h2, h3, .title, .entry-title, .post-title").first().text().trim();
                const body = $(element).find("p, .content, .entry-content, .post-content, .excerpt, .summary").text().trim();
                const imageUrl = $(element).find("img").first().attr("src");
                const url = $(element).find("a").first().attr("href") || baseUrl;

                if (title && body) {
                    items.push({
                        id: uuidv4(),
                        title,
                        body: body.substring(0, 1000),
                        type: "article",
                        url: this.resolveUrl(baseUrl, url),
                        imageUrl: imageUrl ? this.resolveUrl(baseUrl, imageUrl) : undefined
                    });
                }
            });
            if (items.length > 1) return items;
        }

        // 3. Fallback: Generic Text Blocks
        $("h1, h2, h3").each((_, element) => {
            const title = $(element).text().trim();
            const body = $(element).nextUntil("h1, h2, h3").text().trim();

            if (title.length > 5 && body.length > 20) {
                items.push({
                    id: uuidv4(),
                    title,
                    body: body.substring(0, 500),
                    type: "text_block",
                    url: baseUrl
                });
            }
        });

        // 4. Last Resort: Paragraphs
        if (items.length <= 1) {
            $("p").each((i, element) => {
                const text = $(element).text().trim();
                if (text.length > 50) {
                    items.push({
                        id: uuidv4(),
                        title: `Content ${i + 1}`,
                        body: text,
                        type: "text_block",
                        url: baseUrl
                    });
                }
            });
        }

        return items;
    }

    private parsePrice(text: string): number {
        const match = text.match(/\d[0-9,.]*/);
        return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
    }

    private detectCurrency(text: string): string {
        if (text.includes("$")) return "USD";
        if (text.includes("€")) return "EUR";
        if (text.includes("£")) return "GBP";
        if (text.includes("Rs") || text.includes("₨")) return "PKR";
        return "USD";
    }

    private resolveUrl(base: string, path: string): string {
        if (path.startsWith("http")) return path;
        try {
            const url = new URL(path, base);
            return url.toString();
        } catch {
            return base;
        }
    }
}
