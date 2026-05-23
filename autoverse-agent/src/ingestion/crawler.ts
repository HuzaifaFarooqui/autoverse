import axios from "axios";
import * as cheerio from "cheerio";

export class Crawler {
  /**
   * Fetches the main page AND follows internal links to collect more content.
   * Returns all HTML concatenated together.
   */
  async fetch(url: string): Promise<string> {
    const mainHTML = await this.fetchPage(url);
    const $ = cheerio.load(mainHTML);

    // Collect internal links (same domain)
    const base = new URL(url);
    const internalLinks = new Set<string>();

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const resolved = new URL(href, url);
        if (resolved.hostname === base.hostname && resolved.pathname !== base.pathname) {
          internalLinks.add(resolved.toString());
        }
      } catch { }
    });

    // Fetch up to 10 internal pages for more content
    const pagesToFetch = Array.from(internalLinks).slice(0, 10);
    const allHTML = [mainHTML];

    for (const link of pagesToFetch) {
      try {
        const pageHTML = await this.fetchPage(link);
        allHTML.push(pageHTML);
      } catch {
        // Skip failed pages silently
      }
    }

    return allHTML.join("\n<!-- PAGE_BREAK -->\n");
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AutoverseAgent/2.0)",
        },
        timeout: 15000,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch: ${url} — ${error.message}`);
    }
  }
}
