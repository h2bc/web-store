import { PRIVATE_PREFIXES, PUBLIC_PATHS } from "./support/data";
import { INDEXABLE, SITE_URL } from "./support/env";
import { expect, test } from "./support/fixtures";

test("search engines get one canonical address for every public page", async ({ seo }) => {
  for (const path of PUBLIC_PATHS) {
    await test.step(`When a search engine opens ${path}`, async () => {
      await seo.open(path);
    });

    await test.step("Then the page names one canonical address on the site", async () => {
      await expect(seo.getCanonical(), path).toHaveCount(1);
      await expect(seo.getCanonical(), path).toHaveAttribute(
        "href",
        `${SITE_URL}${path === "/" ? "" : path}`,
      );
    });
  }
});

test("search engines find a product page in the sitemap and read its price", async ({ seo }) => {
  const path = await seo.getFirstProductPath();

  test.skip(path === null, "shop has no products");

  await test.step("When a search engine opens a product page", async () => {
    await seo.open(path!);
  });

  await test.step("Then the page names its canonical address and a priced product", async () => {
    await expect(seo.getCanonical()).toHaveAttribute("href", `${SITE_URL}${path}`);
    expect(await seo.getProductJsonLd()).toMatchObject({
      "@type": "Product",
      offers: { price: expect.any(Number), priceCurrency: expect.any(String) },
    });
  });

  await test.step("Then the sitemap lists the page", async () => {
    expect(await seo.getSitemap()).toContain(`<loc>${SITE_URL}${path}</loc>`);
  });
});

test("a missing product returns 404 instead of an error page search engines could index", async ({
  seo,
  request,
}) => {
  test.skip((await seo.getFirstProductPath()) === null, "shop has no products");

  await test.step("When a search engine requests a product that does not exist", async () => {
    const res = await request.get("/shop/does-not-exist");

    expect(res.status()).toBe(404);
  });
});

test("cart, checkout and order pages stay out of search engines", async ({ seo }) => {
  await test.step("When a search engine opens the cart", async () => {
    await seo.open("/cart");
  });

  await test.step("Then the page asks not to be indexed", async () => {
    await expect(seo.getRobotsMeta()).toHaveAttribute("content", /noindex/);
  });

  await test.step("Then the sitemap lists no cart, checkout or order page", async () => {
    const sitemap = await seo.getSitemap();

    for (const prefix of PRIVATE_PREFIXES) {
      expect(sitemap).not.toContain(`<loc>${SITE_URL}${prefix}`);
    }
  });
});

test("the store is visible to search engines only when SEO_INDEXABLE is on", async ({ seo }) => {
  const robots = await seo.getRobotsTxt();

  await test.step("When a search engine opens the shop", async () => {
    await seo.open("/shop");
  });

  if (INDEXABLE) {
    await test.step("Then robots.txt hides only the private pages and points at the sitemap", async () => {
      for (const prefix of PRIVATE_PREFIXES) {
        expect(robots).toContain(`Disallow: ${prefix}`);
      }

      expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
      await expect(seo.getRobotsMeta()).toHaveCount(0);
    });
  } else {
    await test.step("Then robots.txt hides the whole store and the shop asks not to be indexed", async () => {
      expect(robots).toMatch(/^Disallow: \/$/m);
      await expect(seo.getRobotsMeta()).toHaveAttribute("content", /noindex/);
    });
  }
});
