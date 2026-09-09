## Context

See proposal.md for motivation. Constraints that shape the approach:

- Next.js 16 App Router, server-first. Every page is rendered per request: the root layout declares `dynamic = 'force-dynamic'` once for pages, and `robots.ts` and `sitemap.ts` declare it themselves because metadata routes sit outside the layout tree. Only `/opengraph-image.png` is a static asset.
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
`SITE_URL` (absolute origin) feeds `metadataBase`, canonical URLs, the sitemap and JSON-LD. `SEO_INDEXABLE=true` enables indexing; anything else yields `Disallow: /` plus a `noindex` meta on every page. Default-off means previews cannot be indexed unless someone decides they should. Decision: `dev.h2bcweb.com` is indexable now, and `h2bcweb.com` becomes indexable when it goes live. Two indexable hosts with the same catalog compete for the same queries, so once production is live, dev either gets `SEO_INDEXABLE` removed or its `SITE_URL` set to `https://h2bcweb.com`, which makes every dev canonical point at production and lets Google consolidate the pair. No code depends on this choice. Deriving the origin from the `Host` header was rejected: behind Caddy and Cloudflare it is unreliable and lets a request forge canonicals. `siteUrl()` falls back to `http://localhost:3000` and never throws; a production host that omits `SITE_URL` is a deploy-repo configuration error, not something the storefront guards against.

**3. Per-product overrides via product `metadata.seo_title` and `metadata.seo_description`.**
The product detail query already fetches `metadata`. The admin lets the owner edit key/value pairs on a product, so no `api/` module, link or admin widget is needed. A dedicated SEO entity was rejected as over-engineering for a catalog of this size.

**4. Data layer additions.**
- `ProductDetail` gains `seo: { title?: string; description?: string }` and `thumbnail: string | null`.
- New `getProductHandles()` returns `{ handle, updatedAt }[]` for the sitemap (empty on error, which the catch already logs). It calls the store product list without `region_id` (pricing is the only thing that needs a region), selects only `handle,updated_at`, pages through results, and is cached under the existing `products` tag so catalog mutations invalidate it with everything else. It never reads cookies, so the sitemap stays free of request state.
- `lib/data/products.ts` uses `import 'server-only'` instead of `'use server'`: no client component imports it, and the directive would publish the fetchers as server actions. `getProducts` and `getProductByHandle` are exported directly as React `cache()`-wrapped functions so `generateMetadata` and the page body share one fetch per request, with no pass-through wrappers.
- One `isVariantAvailable()` predicate in `lib/utils.ts` replaces the copies in the data layer, the product details component and the JSON-LD helper. `productPath()` is the only place the product route is built; product-card and cart-line-item use it.

**5. Metadata helpers live in `lib/seo.ts`.**
Pure functions: `siteUrl()`, `isIndexable()`, `productMetadata(product)`, `productJsonLd(product, url)`, `organizationJsonLd()`. No custom parsing: the meta description is `seo_description`, else subtitle, else the raw product description, else the site description, which is what the Medusa starter and Next's own examples do. Search engines truncate snippets themselves; an ugly Markdown snippet is fixed by the owner setting `seo_description`. `productMetadata` sets only `alternates.canonical`, `openGraph.url` and `openGraph.images` (plus the site-wide Open Graph defaults, because Next replaces `openGraph` per segment); Next inherits `openGraph.title` and `description` from the templated title and description. There are no unit tests for these helpers; the e2e suite asserts the rendered output, which is the only thing that matters for SEO.

**6. JSON-LD is rendered as an inline script from a small server component.**
Objects are typed with `schema-dts` (Google's Schema.org TypeScript definitions, types only, dev dependency in `front/`) so a misspelled property fails `pnpm typecheck` instead of surfacing in the Rich Results Test. `JSON.stringify` output has `<` escaped as `<` so product descriptions cannot break out of the script tag. The `Offer` uses the lowest-priced variant that has a price for the region, preferring available ones, through the shared `selectDisplayVariant()` helper that the shop grid also uses for the card price, so both surfaces show the same number; availability comes from the shared `isVariantAvailable()` predicate. The crawler sees default-region pricing, which is acceptable: Google documents that price in structured data should match the price a user in the crawler's locale would see, and the default region is the store's home market.

**7. Canonical URLs are declared per page, resolved against `metadataBase`.**
The root layout does not know the request path, so each page sets `alternates.canonical` to its own relative path. The shop page always declares `/shop`, ignoring the `category` query. Product pages declare `/shop/<handle>`.

**8. Error states use `noindex`, not a 5xx.**
Once the App Router starts streaming, an `error.tsx` boundary cannot change the status code; a page cannot return 503. The existing degrade-instead-of-crash behaviour stays. `generateMetadata` on the shop and product pages sets `robots: { index: false }` and drops the canonical when the data layer reports an error. Trade-off: a crawl during a cold-cache outage temporarily deindexes that URL instead of asking the crawler to retry. Mitigation: the data cache serves stale values on failed revalidation, so the window is a cold cache only. A proxy-level health probe returning 503 was considered and rejected for now because it adds a backend round-trip to every request.

**9. Default Open Graph image is a static file.**
`app/opengraph-image.png` (1200×630, the wordmark in the blackletter font on the brand background) with `opengraph-image.alt.txt` beside it. Next's file convention wires it as the default `og:image` for every page; a generated `ImageResponse` route was rejected because the card never varies per page. Product pages override it with their first image, which is already an absolute URL.

**10. Sitemap and robots as route files.**
`app/sitemap.ts` returns static entries plus `getProductHandles()` results; on catalog error it returns the static entries so the file stays valid. The static list is derived from the shared route list the header and footer render. `app/robots.ts` switches on `isIndexable()` and disallows `/cart`, `/checkout` and `/order` (there is no `/api` route). Both use `siteUrl()` for absolute URLs. Metadata route handlers do not inherit the root layout's segment config (`next build` still prerenders them), so each exports `dynamic = 'force-dynamic'` itself; without it robots would be frozen at build time as `Disallow: /`.

**11. Home page gets a visually hidden `h1` and real copy in metadata.**
A screen-reader-only heading keeps the visual design untouched while giving crawlers a page topic. The root description becomes a one-sentence brand description; final wording is an open question but any real sentence beats the placeholder.

**12. The storefront stays English.**
Decision confirmed with the owner: `lang="en"`, `og:locale` `en_US`, English copy. The metadata layer hardcodes nothing locale-specific beyond those two values, so a later Lithuanian or bilingual change replaces them without touching the sitemap, canonicals or structured data.

**13. The unlighthouse tooling is removed.**
Its SEO category only checks that tags exist, so it cannot catch wrong canonicals, missing structured data or an indexable outage page; the Playwright e2e cases assert those directly against the rendered HTML. Keeping it would also require a documented production-build workflow that nobody runs. The config, root script and dev dependency are deleted.

## Risks / Trade-offs

- [Outage during a cold-cache crawl deindexes a URL until recrawl] → decision 8; revisit the proxy 503 if Search Console reports it.
- [Product descriptions are Markdown] → passed through raw; the owner sets `seo_description` when a snippet needs polishing.
- [`SITE_URL` missing or wrong in an environment] → canonicals silently point at localhost; the e2e test asserts canonicals use the configured origin, and the deploy repo owns the variable.
- [CI has no catalog and no publishable key] → e2e cases that need catalog data skip when the shop lists no products, including the unknown-product 404 case, which otherwise renders the error alert with 200.
- [Structured data errors are not asserted beyond shape] → validate a product page with Google's Rich Results Test after deploy (manual step in tasks).
- [Footer links to `/privacy` and `/terms` still 404] → out of scope; listed in proposal so it is not forgotten.

## Migration Plan

1. Deploy `dev.h2bcweb.com` with `SITE_URL=https://dev.h2bcweb.com` and `SEO_INDEXABLE=true`; submit `/sitemap.xml` in Search Console.
2. When `h2bcweb.com` goes live, deploy it with its own `SITE_URL` and `SEO_INDEXABLE=true`, verify it in Search Console, and submit its sitemap.
3. Then de-duplicate dev per decision 2 (drop `SEO_INDEXABLE` or point its `SITE_URL` at production).
4. Rollback on any host is removing `SEO_INDEXABLE`: robots returns `Disallow: /` and pages carry `noindex`.

## Open Questions

- Final wording of the site description and the hidden home heading. Any real sentence can ship; the owner can refine later without touching structure.
