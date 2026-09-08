## Context

See proposal.md for motivation. Constraints that shape the approach:

- Next.js 16 App Router, server-first. Every page reads the region cookie, so all pages are dynamically rendered per request; there is no static generation to lean on.
- The server-only data layer returns `{ data, error }` and never throws. Reads go through `unstable_cache` with tags, which keeps serving the last good value when a revalidation fails. An outage therefore reaches a page only when the cache is cold.
- Prices depend on the `region_id` cookie. A crawler carries no cookie and gets `DEFAULT_REGION_ID`.
- Product images are absolute URLs on the storage host in production.
- The home page is a 3D logo plus nav links and has no text content.
- The official Medusa Next.js starter only adds `generateMetadata` on the product page; Medusa docs offer no SEO guidance. Next.js ships every primitive needed: `generateMetadata`, `metadataBase`, `app/sitemap.ts`, `app/robots.ts`, `opengraph-image.tsx`.

## Goals / Non-Goals

**Goals:**
- Every public page describes itself correctly with no per-page manual upkeep; product pages derive everything from catalog data.
- Owner can tune product titles and descriptions from the admin.
- A non-production host can never be indexed by accident.

**Non-Goals:**
- Localisation, performance, legal pages (see proposal non-goals).
- Returning a real 5xx during outages (see decision 8).

## Decisions

**1. Next.js built-in metadata API, no SEO library.**
`next-seo` predates the App Router and duplicates what `generateMetadata` does; `next-sitemap` generates at build time and cannot see the catalog. Built-ins keep zero new dependencies and match the "stay close to stock" rule.

**2. Site URL and indexability come from environment variables.**
`SITE_URL` (absolute origin) feeds `metadataBase`, canonical URLs, the sitemap and JSON-LD. `SEO_INDEXABLE=true` enables indexing; anything else yields `Disallow: /` plus a `noindex` meta on every page. Default-off means previews cannot be indexed unless someone decides they should. Decision: `dev.h2bcweb.com` is indexable now, and `h2bcweb.com` becomes indexable when it goes live. Two indexable hosts with the same catalog compete for the same queries, so once production is live, dev either gets `SEO_INDEXABLE` removed or its `SITE_URL` set to `https://h2bcweb.com`, which makes every dev canonical point at production and lets Google consolidate the pair. No code depends on this choice. Deriving the origin from the `Host` header was rejected: behind Caddy and Cloudflare it is unreliable and lets a request forge canonicals. In development `SITE_URL` defaults to `http://localhost:3000`; in production the app throws at startup when it is missing, since a wrong origin poisons every canonical.

**3. Per-product overrides via product `metadata.seo_title` and `metadata.seo_description`.**
The product detail query already fetches `metadata`. The admin lets the owner edit key/value pairs on a product, so no `api/` module, link or admin widget is needed. A dedicated SEO entity was rejected as over-engineering for a catalog of this size.

**4. Data layer additions.**
- `ProductDetail` gains `seo: { title?: string; description?: string }` and `thumbnail: string | null`.
- New `getProductHandles()` returns `{ handle, updatedAt }[]` for the sitemap. It calls the store product list without `region_id` (pricing is the only thing that needs a region), selects only `handle,updated_at`, pages through results, and is cached under the existing `products` tag so catalog mutations invalidate it with everything else. It never reads cookies, so the sitemap stays free of request state.
- `getProductByHandle` is wrapped in React `cache()` so `generateMetadata` and the page body share one fetch per request.

**5. Metadata helpers live in `lib/seo.ts`.**
Pure functions: `siteUrl()`, `isIndexable()`, `productMetadata(product)`, `productJsonLd(product)`, `organizationJsonLd()`, `truncateDescription(markdown)`. Pure functions are unit-testable with Vitest without a running backend, and pages stay thin.

**6. JSON-LD is rendered as an inline script from a small server component.**
Objects are typed with `schema-dts` (Google's Schema.org TypeScript definitions, types only, dev dependency in `front/`) so a misspelled property fails `pnpm typecheck` instead of surfacing in the Rich Results Test. `JSON.stringify` output has `<` escaped as `<` so product descriptions cannot break out of the script tag. The `Offer` uses the lowest purchasable variant price and the currency the data layer already returns; availability maps from the existing `manage_inventory` / `inventory_quantity` logic. The crawler sees default-region pricing, which is acceptable: Google documents that price in structured data should match the price a user in the crawler's locale would see, and the default region is the store's home market.

**7. Canonical URLs are declared per page, resolved against `metadataBase`.**
The root layout does not know the request path, so each page sets `alternates.canonical` to its own relative path. The shop page always declares `/shop`, ignoring the `category` query. Product pages declare `/shop/<handle>`.

**8. Error states use `noindex`, not a 5xx.**
Once the App Router starts streaming, an `error.tsx` boundary cannot change the status code; a page cannot return 503. The existing degrade-instead-of-crash behaviour stays. `generateMetadata` on the shop and product pages sets `robots: { index: false }` and drops the canonical when the data layer reports an error. Trade-off: a crawl during a cold-cache outage temporarily deindexes that URL instead of asking the crawler to retry. Mitigation: the data cache serves stale values on failed revalidation, so the window is a cold cache only. A proxy-level health probe returning 503 was considered and rejected for now because it adds a backend round-trip to every request.

**9. Default Open Graph image is generated with `ImageResponse`.**
`app/opengraph-image.tsx` renders the wordmark in the blackletter font on the brand background. This avoids adding a binary asset and keeps the image in step with the identity. Product pages override it with their first image, which is already an absolute URL.

**10. Sitemap and robots as route files.**
`app/sitemap.ts` returns static entries plus `getProductHandles()` results; on catalog error it returns the static entries so the file stays valid. `app/robots.ts` switches on `isIndexable()`. Both use `siteUrl()` for absolute URLs. Route files run under the same cache as pages, so no extra invalidation wiring is needed.

**11. Home page gets a visually hidden `h1` and real copy in metadata.**
A screen-reader-only heading keeps the visual design untouched while giving crawlers a page topic. The root description becomes a one-sentence brand description; final wording is an open question but any real sentence beats the placeholder.

**12. The storefront stays English.**
Decision confirmed with the owner: `lang="en"`, `og:locale` `en_US`, English copy. The metadata layer hardcodes nothing locale-specific beyond those two values, so a later Lithuanian or bilingual change replaces them without touching the sitemap, canonicals or structured data.

**13. Lighthouse config becomes environment-driven with budgets.**
`site` reads `LIGHTHOUSE_SITE`, `scanner.exclude` lists `/cart`, `/checkout/*`, `/order/*`, and `ci.budget` sets `seo: 100`, `accessibility: 90`, `best-practices: 90`, `performance: 70`. The performance budget is deliberately loose until the 3D and video pages are tuned. The root script keeps `--build-static`. The README documents that the target must be a production build (`next build && next start`, or the deployed host) because a dev server fails minification and source-map audits and inflates every timing.

## Risks / Trade-offs

- [Outage during a cold-cache crawl deindexes a URL until recrawl] → decision 8; revisit the proxy 503 if Search Console reports it.
- [`ImageResponse` needs the font as binary data at runtime] → load it from `public/fonts` at build; if loading fails, fall back to a system serif so the image still renders.
- [Product descriptions are Markdown] → `truncateDescription` strips Markdown before truncating; covered by unit tests.
- [`SITE_URL` missing or wrong in an environment] → startup guard in production; e2e test asserts canonicals use the configured origin.
- [Structured data errors are invisible in Lighthouse] → validate a product page with Google's Rich Results Test after deploy (manual step in tasks).
- [Footer links to `/privacy` and `/terms` still 404] → out of scope; listed in proposal so it is not forgotten.

## Migration Plan

1. Deploy `dev.h2bcweb.com` with `SITE_URL=https://dev.h2bcweb.com` and `SEO_INDEXABLE=true`; submit `/sitemap.xml` in Search Console.
2. When `h2bcweb.com` goes live, deploy it with its own `SITE_URL` and `SEO_INDEXABLE=true`, verify it in Search Console, and submit its sitemap.
3. Then de-duplicate dev per decision 2 (drop `SEO_INDEXABLE` or point its `SITE_URL` at production).
4. Rollback on any host is removing `SEO_INDEXABLE`: robots returns `Disallow: /` and pages carry `noindex`.

## Open Questions

- Final wording of the site description and the hidden home heading. Any real sentence can ship; the owner can refine later without touching structure.
