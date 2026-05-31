import { describe, it, expect } from "vitest";
import { Extractor } from "../ingestion/extractor";

describe("Extractor", () => {
  const extractor = new Extractor();
  const html = `
    <html>
      <body>
        <div class="product">
          <h3 class="name">Wireless Headphones</h3>
          <span class="price">$99.99</span>
          <p class="description">High quality sound with noise cancellation.</p>
          <img src="/images/headphones.jpg" />
          <a href="/p/headphones">View Details</a>
        </div>
      </body>
    </html>
  `;
  const baseUrl = "https://example.com";

  it("should extract product data correctly", () => {
    const items = extractor.extract(html, baseUrl);
    expect(items.length).toBe(2);
    expect(items[1].title).toBe("Wireless Headphones");
    expect(items[1].price).toBe(99.99);
    expect(items[1].currency).toBe("USD");
    expect(items[1].url).toBe("https://example.com/p/headphones");
    expect(items[1].type).toBe("product");
  });

  it("should handle multiple currencies", () => {
    const euroHtml = '<div class="product"><h3 class="name">Item</h3><span class="price">€50</span></div>';
    const items = extractor.extract(euroHtml, baseUrl);
    expect(items[1].currency).toBe("EUR");
    expect(items[1].price).toBe(50);
  });

  it("should extract general article content", () => {
    const articleHtml = `
      <article>
        <h2 class="title">Latest Cyber News</h2>
        <div class="entry-content">This is a summary of the latest news.</div>
      </article>
    `;
    const items = extractor.extract(articleHtml, baseUrl);
    expect(items.length).toBe(2);
    expect(items[1].title).toBe("Latest Cyber News");
    expect(items[1].body).toContain("summary");
    expect(items[1].type).toBe("article");
  });
});
