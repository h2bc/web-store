## Why

The storefront has no SEO layer. Every product page carries the site title `h2bc` and the placeholder description "culture | culture | culture"; there is no sitemap, no robots rules of our own, no canonical URLs, no Open Graph tags and no structured data; backend outages render an indexable error page with a 200 status. Lighthouse reports a perfect SEO score because it only checks that tags exist, so nothing in the pipeline catches any of this.

## What Changes

- Product pages get a per-product title, description, canonical URL, Open Graph image and Product/Offer JSON-LD. The shop owner can override title and description per product from the admin through product metadata keys `seo_title` and `seo_description`; no code change needed per product.
- Site-wide: absolute site URL from an environment variable, canonical URL on every public page, Open Graph defaults with a generated default image, a real site description, a heading on the home page, and Organization JSON-LD linking the Instagram and YouTube accounts.
- New `/sitemap.xml` listing public pages and every product; new `/robots.txt` that blocks cart, checkout and order pages, references the sitemap, and blocks everything when the deployment is not marked indexable.
- Cart, checkout and order confirmation pages are marked `noindex`.
- Shop and product pages are marked `noindex` when catalog data cannot be loaded, so an outage page is never indexed. Unknown products keep returning 404.
- `/shop?category=...` variants declare `/shop` as canonical, removing four indexable duplicates.
- Lighthouse tooling: the unlighthouse config reads its target from an environment variable, excludes non-public pages, and fails on score budgets. The run is documented to require a production build: the last scan hit `next dev` and its performance numbers are meaningless.

Non-goals:

- Lithuanian localisation or `hreflang`. The site stays `lang="en"`.
- Real About copy, legal pages, or performance work on the 3D home page and YouTube gallery.
- Creating `/privacy` and `/terms`. The footer links to them and both return 404 today; that is flagged, not fixed here.

## Capabilities

### New Capabilities
- `storefront-seo`: discoverability of the storefront's public pages by search engines and link-preview crawlers: page metadata, canonical URLs, Open Graph, structured data, sitemap, robots, index/noindex rules, and the Lighthouse check that guards them.

### Modified Capabilities
- none (the project has no main specs yet)

## Impact

- `front/` only. New `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`; metadata exports on every page; a JSON-LD component; data layer additions (`getProductHandles`, SEO and thumbnail fields on product detail); new env vars `SITE_URL` and `SEO_INDEXABLE` in `.env.example`.
- Root `unlighthouse.config.ts` and the `lighthouse` script.
- New Playwright e2e cases for metadata, sitemap and robots; unit tests for the metadata helpers.
- Deploy repo `h2bc/web-store-deploy` must set `SITE_URL` and `SEO_INDEXABLE` for each environment (manual step, outside this repo).
- No `api/` changes. Per-product overrides use the existing product metadata field edited in the admin.
