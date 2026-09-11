import type { APIRequestContext, Page } from "@playwright/test";

export class SeoPage {
  constructor(
    private readonly page: Page,
    private readonly request: APIRequestContext,
  ) {}

  getCanonical() {
    return this.page.locator('link[rel="canonical"]');
  }

  getRobotsMeta() {
    return this.page.locator('meta[name="robots"]');
  }

  async getProductJsonLd(): Promise<unknown> {
    const jsonLd = await this.page.locator('script[type="application/ld+json"]').textContent();

    return JSON.parse(jsonLd ?? "null");
  }

  async getSitemap(): Promise<string> {
    return (await this.request.get("/sitemap.xml")).text();
  }

  async getRobotsTxt(): Promise<string> {
    return (await this.request.get("/robots.txt")).text();
  }

  async getFirstProductPath(): Promise<string | null> {
    await this.page.goto("/shop");

    return this.page
      .getByRole("link", { name: /^View / })
      .first()
      .getAttribute("href", { timeout: 5_000 })
      .catch(() => null);
  }

  async open(path: string) {
    await this.page.goto(path);
  }
}
