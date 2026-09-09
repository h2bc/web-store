## Context

See proposal.md for motivation.

Today `front/proxy.ts` runs on every request solely to plant a `region_id` cookie from `DEFAULT_REGION_ID`. `lib/cookies.ts` reads it, `lib/data/products.ts` keys its cache per region, `lib/data/cart.ts` creates carts with it and exposes `changeRegion`, and `app/(main)/layout.tsx` threads the region list, current region and two error strings into the header and footer, which render `RegionSelector` and `MobileRegionSelector`. The checkout already derives its country list from `cart.region.countries` and defaults to the first entry.

On the backend nothing custom touches regions. The seed creates two regions and two service zones; shipping options hang off the service zones. Medusa's store API still requires a `region_id` for calculated prices and for cart creation, so the storefront must know the region's id even when there is only one.

Deployed environments (`dev.h2bcweb.com`) already hold the two seeded regions and possibly carts attached to each.

The CI e2e job seeds a fresh database and then runs a `psql` query against `store.default_region_id` to populate `DEFAULT_REGION_ID` for the storefront, because the id is only known after seeding. Playwright cases therefore run against the seeded catalog and shipping setup.

## Goals / Non-Goals

**Goals:**
- One place resolves the region; nothing else in the storefront knows regions exist.
- Zero request-dependent state for pricing, so cached pages and crawler responses are identical for everyone.
- Fewer files and props, no middleware.

**Non-Goals:**
- Geolocation or any automatic country detection.
- Changing shipping configuration, prices or thresholds.
- Removing USD prices from the seed or supported currencies.

## Decisions

**Resolve the region by listing regions, not from an env var.** `lib/data/regions.ts` becomes `getRegion()`: fetch `sdk.store.region.list()`, take the first region, cache it under the existing `regions` tag with the same revalidate window as before, return `{ region, error }` like every other data-layer call. Alternative: keep `DEFAULT_REGION_ID` and read it directly. Rejected because the id differs per environment, puts shop configuration in code, which the project context forbids, and already forced CI to query Postgres for it after seeding. Listing is one cached request per hour and removes that query.

**Warn, do not fail, on more than one region.** During the window between deploying the storefront and merging regions in the admin, the list has two entries. Using the first with a `console.warn` keeps the site up; failing would take the shop down until the admin step is done. After the merge the warning disappears.

**Cache keys lose the region suffix.** `products-${regionId}` and `product-${handle}-${regionId}` become `products` and `product-${handle}`. Invalidation tags stay `products` and `product-${handle}`.

**Move stale carts on load.** `getCart()` compares `cart.region_id` with the resolved region and calls `cart.update({ region_id })` when they differ. This is one extra call only for carts created before the merge and costs nothing afterwards. Alternative: drop the cart cookie when the region mismatches. Rejected because it silently empties a returning customer's cart.

**Default country is a storefront constant.** `DEFAULT_COUNTRY_CODE = 'lt'` lives next to the checkout schema, in the same spirit as the Instagram handle in `lib/social.ts`: it is brand identity, not shop configuration. Alternative: derive it from the stock location. Rejected because the store API does not expose stock locations and the value will not change. The address step uses it only when the cart has no shipping address.

**Country list sorted in the checkout page.** `app/(main)/checkout/page.tsx` already maps `cart.region.countries`; it sorts by display name before passing the list down. The address step keeps the dropdown as-is.

**Remove, do not disable.** `proxy.ts`, both selector components, `lib/types/region.ts`, `changeRegion`, `getRegionId`, `setRegionId`, the `regions`/`currentRegion`/`regionSelectorDisabled`/`regionsError`/`currentRegionError` props and the `ClientToastErrorHandler` wrapper in the header (its only inputs were the two region errors) are deleted. The footer keeps its links, rights notice and social icons.

**Seed creates one region.** Name "Europe", `eur`, tax inclusive, countries `['lt', ...restOfEurope]`, `metadata.shortName` dropped since nothing displays it. Service zones and shipping options are unchanged. The store's `default_region_id` still points at it.

## Risks / Trade-offs

- [Deploy order: storefront ships before the admin merge] → the warning path keeps the site working on the first region; the merge is done right after deploy. If the merge is done first, the old storefront's `DEFAULT_REGION_ID` still resolves as long as the kept region is the Lithuanian one, which the migration plan requires.
- [Medusa refuses to delete a region with active carts, or orphans them] → deletion is a soft delete in Medusa v2 and carts keep their `region_id`; the stale-cart move in `getCart()` handles them. If deletion is blocked, remove the countries from "Rest of Europe" instead and leave the empty region in place; the storefront ignores it after the merge only if it is not first in the list, so rename it to sort last or delete it once carts expire.
- [Regions list fails on a cold start] → same degradation as a catalog failure today: error state, no crash. `getRegion()` is cached, so a single success covers an hour.
- [A future second currency] → reintroducing region selection is a new change; nothing here blocks it, but nothing is kept for it either.

## Migration Plan

1. Deploy `api/` and `front/` from this change. `DEFAULT_REGION_ID` can be removed from the deploy repo at the same time; the new storefront ignores it.
2. In the Medusa admin on each environment: open Settings, Regions. Delete "Rest of Europe". Open "Lithuania", add every EU country from the seed list, rename it "Europe". Countries can only belong to one region, so the delete must happen first.
3. Confirm the storefront log no longer warns about multiple regions and that `/shop` shows prices.
4. Local dev: `pnpm migrate` is unaffected; a fresh seed produces the single region. Existing local databases follow step 2 or are reseeded.

Rollback: redeploy the previous storefront with `DEFAULT_REGION_ID` set to the kept region's id. The backend needs no rollback; one region is valid for the old storefront too, its selector simply shows one entry.
