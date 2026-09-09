## 1. front/ configuration and helpers

- [x] 1.1 Add `SITE_URL` and `SEO_INDEXABLE` to `front/.env.example`; create `front/lib/seo.ts` with `siteUrl()` (configured origin, else `http://localhost:3000`; never throws) and `isIndexable()`; verify with `next build && next start` that the server serves with `SITE_URL` set
- [x] 1.2 Add `schema-dts` as a dev dependency in `front/`; add `productMetadata(product)`, `productJsonLd(product, url)` and `organizationJsonLd()` helpers typed with it implementing the precedence rules in the spec (raw fields, no parsing or truncation; Open Graph title and description inherited from Next, not set by hand); verify title, description and `og:image` with curl on a seeded product

## 2. front/ data layer

- [x] 2.1 Extend `ProductDetail` with `seo` and `thumbnail`, populate them in `fetchProductDetails` from `metadata.seo_title`, `metadata.seo_description` and `thumbnail`; verify with `pnpm typecheck` and by logging a product from the local backend
- [x] 2.2 Replace `'use server'` in `lib/data/products.ts` with `import 'server-only'`; export `getProducts` and `getProductByHandle` directly as React `cache()`-wrapped functions with no pass-through wrappers; verify by adding a temporary log and observing a single backend call per request, then remove the log
- [x] 2.3 Add `getProductHandles()` in `lib/data/products.ts` that lists `handle,updated_at` without a region, pages through all results, is cached with the `products` tag and returns `ProductHandle[]` (empty on error); verify by calling it from a scratch route in dev and confirming it returns every seeded product
- [x] 2.4 Export one `isVariantAvailable(variant)` from `lib/utils.ts` and use it in `products.ts`, `product-details.tsx` and `productJsonLd`; use `productPath()` in `product-card.tsx` and `cart-line-item.tsx`; verify with `pnpm typecheck` and grep for no remaining `/shop/${` literals

## 3. front/ site-wide metadata

- [x] 3.1 In `app/layout.tsx` export `dynamic = 'force-dynamic'` once, set `metadataBase` from `siteUrl()`, a real site description, Open Graph defaults (`siteName`, `type`, `locale`), and `robots: noindex` when not indexable; remove the per-route `dynamic` export from the landing page (metadata routes keep theirs: `robots.ts` and `sitemap.ts` sit outside the layout tree); verify with `next build` that nothing is prerendered and with `curl -s localhost:3000/about | grep -E 'og:|robots|description'`
- [x] 3.2 Add the static `app/opengraph-image.png` (1200×630 brand card) with `opengraph-image.alt.txt`; switch `unifraktur` in `app/fonts.ts` to `next/font/local` on the committed TTF; verify `curl -sI localhost:3000/opengraph-image.png` returns `image/png` and `/about` references it in `og:image`
- [x] 3.3 Add `alternates.canonical` to about, contact, gallery, shipping-returns and the shop page (fixed to `/shop`); verify canonical tags with curl on each page and on `/shop?category=BEANIES`
- [x] 3.4 Add a `JsonLd` server component that inlines escaped JSON; on the landing page add a screen-reader-only `h1` and the Organization JSON-LD using the Instagram and YouTube handles from the footer constants; verify the home HTML contains one `h1` and one `application/ld+json` script

## 4. front/ product page

- [x] 4.1 Add `generateMetadata` to `app/(main)/shop/[slug]/page.tsx` using `productMetadata`, returning `robots: noindex` without canonical on data error and calling `notFound()` on missing product; verify title, description, canonical and `og:image` with curl on a seeded product and a 404 status on an unknown handle
- [x] 4.2 Render Product JSON-LD in the product page from `productJsonLd`, picking the cheapest variant that has a price; verify the script parses as JSON and `offers.price` matches the displayed price
- [x] 4.3 Add `generateMetadata` to the shop page that sets `robots: noindex` when `getProducts` reports an error; verify by stopping the backend, clearing the cache with `DISABLE_CACHE=true`, and confirming the noindex tag appears alongside the error alert

## 5. front/ sitemap, robots and private pages

- [x] 5.1 Add `app/sitemap.ts` returning the static routes derived from the shared route list plus product entries with `lastModified`, falling back to static entries on catalog error; verify `curl localhost:3000/sitemap.xml` lists every seeded product and still returns 200 with the backend stopped
- [x] 5.2 Add `app/robots.ts` switching on `isIndexable()` and disallowing `/cart`, `/checkout` and `/order`; verify both outputs with curl under `SEO_INDEXABLE=true` and unset
- [x] 5.3 Set `robots: { index: false, follow: false }` on cart, checkout and order confirmation pages; verify each page's HTML contains the noindex meta tag

## 6. Lighthouse tooling

- [x] 6.1 Remove `unlighthouse.config.ts`, the root `lighthouse` script, the `unlighthouse` dev dependency, the `.unlighthouse/` gitignore entry and the README section; verify with `grep -ri lighthouse` returning no hits outside `openspec/`

## 7. Cleanup

- [x] 7.1 Remove `front/design-system/`, `front/design-system/next-runtime-shim.ts` and the `.devcontainer/devcontainer-lock.json` change from the branch; verify `git diff main --stat` lists only SEO files
- [x] 7.2 Remove dead surface: the unused `error` field and `ProductHandlesResult` type, the exported `INSTAGRAM_HANDLE`, `YOUTUBE_HANDLE` and `DEFAULT_OG_IMAGE` constants (make them private), and `/api` from robots; verify with `pnpm lint` and grep
- [x] 7.3 Delete every comment this change introduced (`lib/seo.ts`, `lib/data/products.ts`, `app/sitemap.ts`, the landing page, `components/seo/json-ld.tsx`); verify with `git diff main` showing no added `//` lines
- [x] 7.4 Delete the SEO unit tests; the e2e suite covers the rendered output

## 8. Verification

- [x] 8.1 Add Playwright e2e cases in `e2e/seo.test.ts` asserting: every public page has one canonical under `SITE_URL`; the product page has a canonical, a Product JSON-LD with numeric price and currency, and appears in the sitemap; unknown product returns 404; `/cart` is noindex and no private URL is in the sitemap; robots and the shop page's robots meta follow `SEO_INDEXABLE`; every case that needs catalog data skips when the shop lists no products, including the 404 case; verify with `pnpm test:e2e` locally and with `MEDUSA_PUBLISHABLE_KEY` unset to mirror CI
- [ ] 8.2 After deploy, set `SITE_URL=https://dev.h2bcweb.com` and `SEO_INDEXABLE=true` for dev in `h2bc/web-store-deploy` (repeat for `h2bcweb.com` at launch), validate one product URL in Google's Rich Results Test, and submit the sitemap in Search Console; verify the sitemap shows as processed
- [x] 8.3 cd front && pnpm lint && pnpm typecheck
