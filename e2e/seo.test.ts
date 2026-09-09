import { expect, test, type Page } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
const INDEXABLE = process.env.SEO_INDEXABLE === "true";
const PUBLIC_PATHS = [
  "/",
  "/shop",
  "/gallery",
  "/about",
  "/contact",
  "/shipping-returns",
];
const PRIVATE_PREFIXES = ["/cart", "/checkout", "/order"];

async function firstProductPath(page: Page): Promise<string | null> {
  await page.goto("/shop");
  return page
    .locator('a[href^="/shop/"]')
    .first()
    .getAttribute("href", { timeout: 5_000 })
    .catch(() => null);
}

test("every public page has one canonical under the site URL", async ({
  page,
}) => {
  for (const path of PUBLIC_PATHS) {
    await page.goto(path);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical, path).toHaveCount(1);
    await expect(canonical, path).toHaveAttribute(
      "href",
      `${SITE_URL}${path === "/" ? "" : path}`,
    );
  }
});

test("product page is discoverable and carries a priced Product offer", async ({
  page,
  request,
}) => {
  const path = await firstProductPath(page);
  test.skip(path === null, "shop has no products");

  await page.goto(path!);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${SITE_URL}${path}`,
  );

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(JSON.parse(jsonLd!)).toMatchObject({
    "@type": "Product",
    offers: { price: expect.any(Number), priceCurrency: expect.any(String) },
  });

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`<loc>${SITE_URL}${path}</loc>`);
});

test("unknown product is a 404, not an indexable error page", async ({
  page,
  request,
}) => {
  test.skip((await firstProductPath(page)) === null, "shop has no products");

  const res = await request.get("/shop/does-not-exist");
  expect(res.status()).toBe(404);
});

test("private pages are never indexed or listed", async ({ page, request }) => {
  await page.goto("/cart");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const prefix of PRIVATE_PREFIXES) {
    expect(sitemap).not.toContain(`<loc>${SITE_URL}${prefix}`);
  }
});

test("indexability follows SEO_INDEXABLE", async ({ page, request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  await page.goto("/shop");
  const robotsMeta = page.locator('meta[name="robots"]');

  if (INDEXABLE) {
    for (const prefix of PRIVATE_PREFIXES) {
      expect(robots).toContain(`Disallow: ${prefix}`);
    }
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    await expect(robotsMeta).toHaveCount(0);
  } else {
    expect(robots).toMatch(/^Disallow: \/$/m);
    await expect(robotsMeta).toHaveAttribute("content", /noindex/);
  }
});
