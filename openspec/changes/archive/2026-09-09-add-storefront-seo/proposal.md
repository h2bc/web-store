## Why

The storefront has no SEO layer. Every product page carries the site title `h2bc` and the placeholder description "culture | culture | culture"; there is no sitemap, no robots rules of our own, no canonical URLs, no Open Graph tags and no structured data; backend outages render an indexable error page with a 200 status. The unlighthouse scan reports a perfect SEO score because it only checks that tags exist, so nothing in the pipeline catches any of this.

## What Changes

- Product pages get a per-product title, description, canonical URL, Open Graph image and Product/Offer JSON-LD. The shop owner can override title and description per product from the admin through product metadata keys `seo_title` and `seo_description`; no code change needed per product.
- Site-wide: absolute site URL from an environment variable, canonical URL on every public page, Open Graph defaults with a generated default image, a real site description, a heading on the home page, and Organization JSON-LD linking the Instagram and YouTube accounts.
- New `/sitemap.xml` listing public pages and every product; new `/robots.txt` that blocks cart, checkout and order pages, references the sitemap, and blocks everything when the deployment is not marked indexable.
- Cart, checkout and order confirmation pages are marked `noindex`.
- Shop and product pages are marked `noindex` when catalog data cannot be loaded, so an outage page is never indexed. Unknown products keep returning 404.
- `/shop?category=...` variants declare `/shop` as canonical, removing four indexable duplicates.
- The unlighthouse tooling is removed: its SEO audit only checks tag presence, its last scan hit `next dev` so the performance numbers were meaningless, and the Playwright e2e suite now asserts the rendered SEO output directly.

Non-goals:

- Lithuanian localisation or `hreflang`. The site stays `lang="en"`.
- Real About copy, legal pages, or performance work on the 3D home page and YouTube gallery.
- Creating `/privacy` and `/terms`. The footer links to them and both return 404 today; that is flagged, not fixed here.

## Capabilities

### New Capabilities
- `storefront-seo`: discoverability of the storefront's public pages by search engines and link-preview crawlers: page metadata, canonical URLs, Open Graph, structured data, sitemap, robots, index/noindex rules.

### Modified Capabilities
- none (the project has no main specs yet)

## Impact

- `front/` only. One dev dependency, `schema-dts` (types only). New `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.png`; metadata exports on every page; a JSON-LD component; data layer additions (`getProductHandles`, SEO and thumbnail fields on product detail); new env vars `SITE_URL` and `SEO_INDEXABLE` in `.env.example`.
- Root `unlighthouse.config.ts`, the `lighthouse` script and the `unlighthouse` dev dependency are deleted.
- New Playwright e2e cases for canonicals, product structured data, sitemap, robots and noindex rules. No unit tests: SEO output is only meaningful on a rendered page.
- Deploy repo `h2bc/web-store-deploy` must set `SITE_URL` and `SEO_INDEXABLE` per host: `dev.h2bcweb.com` now, `h2bcweb.com` when it launches (manual step, outside this repo).
- No `api/` changes. Per-product overrides use the existing product metadata field edited in the admin.
