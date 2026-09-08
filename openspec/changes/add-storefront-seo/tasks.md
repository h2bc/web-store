## 1. front/ configuration and helpers

- [ ] 1.1 Add `SITE_URL` and `SEO_INDEXABLE` to `front/.env.example`; create `front/lib/seo.ts` with `siteUrl()` (defaults to `http://localhost:3000` outside production, throws in production when unset) and `isIndexable()`; verify with a Vitest unit test covering both env states
- [ ] 1.2 Add `truncateDescription(markdown, max)` to `lib/seo.ts` that strips Markdown and truncates at a word boundary; verify with unit tests for headings, links, long text and empty input
- [ ] 1.3 Add `schema-dts` as a dev dependency in `front/`; add `productMetadata(product)`, `productJsonLd(product, url)` and `organizationJsonLd()` helpers typed with it implementing the precedence rules in the spec; verify with unit tests for override, subtitle fallback, description fallback, no-image fallback, in-stock and sold-out availability

## 2. front/ data layer

- [ ] 2.1 Extend `ProductDetail` with `seo` and `thumbnail`, populate them in `fetchProductDetails` from `metadata.seo_title`, `metadata.seo_description` and `thumbnail`; verify with `pnpm typecheck` and by logging a product from the local backend
- [ ] 2.2 Wrap `getProductByHandle` in React `cache()` so `generateMetadata` and the page share one fetch; verify by adding a temporary log and observing a single backend call per request, then remove the log
- [ ] 2.3 Add `getProductHandles()` in `lib/data/products.ts` that lists `handle,updated_at` without a region, pages through all results, is cached with the `products` tag and returns `{ handles, error }`; verify by calling it from a scratch route in dev and confirming it returns every seeded product

## 3. front/ site-wide metadata

- [ ] 3.1 In `app/layout.tsx` set `metadataBase` from `siteUrl()`, a real site description, Open Graph defaults (`siteName`, `type`, `locale`), and `robots: noindex` when not indexable; verify with `curl -s localhost:3000/about | grep -E 'og:|robots|description'`
- [ ] 3.2 Add `app/opengraph-image.tsx` using `ImageResponse` with the blackletter font from `public/fonts` and a system-font fallback; verify `curl -sI localhost:3000/opengraph-image` returns `image/png` and the image renders in a browser
- [ ] 3.3 Add `alternates.canonical` to about, contact, gallery, shipping-returns and the shop page (fixed to `/shop`); verify canonical tags with curl on each page and on `/shop?category=BEANIES`
- [ ] 3.4 Add a `JsonLd` server component that inlines escaped JSON; on the landing page add a screen-reader-only `h1` and the Organization JSON-LD using the Instagram and YouTube handles from the footer constants; verify the home HTML contains one `h1` and one `application/ld+json` script

## 4. front/ product page

- [ ] 4.1 Add `generateMetadata` to `app/(main)/shop/[slug]/page.tsx` using `productMetadata`, returning `robots: noindex` without canonical on data error and calling `notFound()` on missing product; verify title, description, canonical and `og:image` with curl on a seeded product and a 404 status on an unknown handle
- [ ] 4.2 Render Product JSON-LD in the product page from `productJsonLd`; verify the script parses as JSON and `offers.price` matches the displayed price
- [ ] 4.3 Add `generateMetadata` to the shop page that sets `robots: noindex` when `getProducts` reports an error; verify by stopping the backend, clearing the cache with `DISABLE_CACHE=true`, and confirming the noindex tag appears alongside the error alert

## 5. front/ sitemap, robots and private pages

- [ ] 5.1 Add `app/sitemap.ts` returning the six static routes plus product entries with `lastModified`, falling back to static entries on catalog error; verify `curl localhost:3000/sitemap.xml` lists every seeded product and still returns 200 with the backend stopped
- [ ] 5.2 Add `app/robots.ts` switching on `isIndexable()`; verify both outputs with curl under `SEO_INDEXABLE=true` and unset
- [ ] 5.3 Set `robots: { index: false, follow: false }` on cart, checkout and order confirmation pages; verify each page's HTML contains the noindex meta tag

## 6. Lighthouse tooling

- [ ] 6.1 Update root `unlighthouse.config.ts` to read `LIGHTHOUSE_SITE`, exclude `/cart`, `/checkout/*`, `/order/*`, and set `ci.budget` (seo 100, accessibility 90, best-practices 90, performance 70); verify with `pnpm lighthouse` against `cd front && pnpm build && pnpm start` that product pages are scanned and private pages are absent
- [ ] 6.2 Document in `README.md` that Lighthouse must target a production build or the deployed host, with the exact commands; verify the section reads correctly and the command in it works

## 7. Verification

- [ ] 7.1 Add Playwright e2e cases in `e2e/seo.spec.ts` asserting: product page title and canonical, `/sitemap.xml` returns 200 XML, `/robots.txt` returns `Disallow: /` when `SEO_INDEXABLE` is unset, `/cart` has noindex, unknown product returns 404; verify with `pnpm test` (CI has no catalog, so product assertions skip when the shop has no products)
- [ ] 7.2 Run `pnpm lighthouse` against a local production build with the seeded catalog and confirm all pages pass the budgets; keep the report out of git
- [ ] 7.3 After deploy, set `SITE_URL=https://dev.h2bcweb.com` and `SEO_INDEXABLE=true` for dev in `h2bc/web-store-deploy` (repeat for `h2bcweb.com` at launch), validate one product URL in Google's Rich Results Test, and submit the sitemap in Search Console; verify the sitemap shows as processed
- [ ] 7.4 cd front && pnpm lint && pnpm typecheck
