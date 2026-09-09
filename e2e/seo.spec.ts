import { expect, test, type Page } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const INDEXABLE = process.env.SEO_INDEXABLE === "true";

async function firstProductPath(page: Page): Promise<string | null> {
  await page.goto("/shop");
  const href = await page
    .locator('a[href^="/shop/"]')
    .first()
    .getAttribute("href", { timeout: 5_000 })
    .catch(() => null);
  return href;
}

test("product page has a product title and canonical", async ({ page }) => {
  const path = await firstProductPath(page);
  test.skip(path === null, "shop has no products");

  const res = await page.goto(path!);
  expect(res?.status()).toBe(200);

  const title = await page.title();
  expect(title).toMatch(/\S \| h2bc$/);
  expect(title).not.toBe("Shop | h2bc");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${SITE_URL}${path}`,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^https?:\/\//,
  );

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(JSON.parse(jsonLd ?? "null")).toMatchObject({ "@type": "Product" });
});

test("sitemap.xml is served as XML", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("xml");
  const body = await res.text();
  expect(body).toContain("<urlset");
  expect(body).toContain(`<loc>${SITE_URL}/shop</loc>`);
});

test("robots.txt follows SEO_INDEXABLE", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  if (INDEXABLE) {
    expect(body).toContain("Disallow: /cart");
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  } else {
    expect(body).toMatch(/^Disallow: \/$/m);
  }
});

test("cart is noindex", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("unknown product returns 404", async ({ request }) => {
  const res = await request.get("/shop/does-not-exist");
  expect(res.status()).toBe(404);
});
