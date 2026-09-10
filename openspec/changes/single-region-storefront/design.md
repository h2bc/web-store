## Context

See proposal.md for motivation.

Today `front/proxy.ts` runs on every request solely to plant a `region_id` cookie from `DEFAULT_REGION_ID`. `lib/cookies.ts` reads it, `lib/data/products.ts` keys its cache per region, `lib/data/cart.ts` creates carts with it and exposes `changeRegion`, and `app/(main)/layout.tsx` threads the region list, current region and two error strings into the header and footer, which render `RegionSelector` and `MobileRegionSelector`. The checkout already derives its country list from `cart.region.countries` and defaults to the first entry.

On the backend nothing custom touches regions. The seed creates two regions and two service zones; shipping options hang off the service zones. Medusa's store API prices products for a `region_id` or a `country_code`, and creates carts in the store's default region when no `region_id` is given, so the storefront does not need to know the region's id at all.

Deployed environments (`dev.h2bcweb.com`) already hold the two seeded regions and possibly carts attached to each.

The CI e2e job seeds a fresh database and then runs a `psql` query against `store.default_region_id` to populate `DEFAULT_REGION_ID` for the storefront, because the id is only known after seeding. Playwright cases therefore run against the seeded catalog and shipping setup.

## Goals / Non-Goals

**Goals:**
- Nothing in the storefront resolves or knows the region; the backend does.
- Zero request-dependent state for pricing, so cached pages and crawler responses are identical for everyone.
- Fewer files and props, no middleware.

**Non-Goals:**
- Geolocation or any automatic country detection.
- Changing shipping configuration, prices or thresholds.
- Removing USD prices from the seed or supported currencies.

## Decisions

**Price by country, not by region.** `lib/data/products.ts` passes `country_code: DEFAULT_COUNTRY_CODE` and requests `*variants.calculated_price` explicitly, because Medusa only adds that field on its own when `region_id` is given. The backend resolves the region that contains the country. `lib/data/regions.ts` is deleted. Alternative: list regions and take the first, cached. Rejected because it is a second request on every cold render, needs a warning path for the two-region window, and its result depends on list order. Alternative: keep `DEFAULT_REGION_ID`. Rejected because the id differs per environment and forced CI to query Postgres for it after seeding.

**Create carts without a region.** `sdk.store.cart.create({})` lets Medusa's `findOneOrAnyRegionStep` pick `store.default_region_id`. The migration plan therefore keeps the region that is the store's default.

**Cache keys lose the region suffix.** `products-${regionId}` and `product-${handle}-${regionId}` become `products` and `product-${handle}`. Invalidation tags stay `products` and `product-${handle}`.

**Abandon carts of the deleted region.** A cart whose region is soft-deleted still loads but has no countries at checkout. Repairing it means a write inside `getCart()`, which runs on every page render, and the cart cookie cannot be cleared there because Next.js forbids cookie writes during render. The affected carts are anonymous carts on `dev.h2bcweb.com`; testers clear the `cart_id` cookie.

**Default country is a storefront constant.** `DEFAULT_COUNTRY_CODE = 'lt'` in `lib/store.ts`, in the same spirit as the Instagram handle in `lib/social.ts`: it is brand identity, not shop configuration. It is the pricing context for product queries and the preselected country when the cart has no shipping address. Alternative: derive it from the stock location. Rejected because the store API does not expose stock locations and the value will not change.

**Country list sorted in the checkout page.** `app/(main)/checkout/page.tsx` already maps `cart.region.countries`; it sorts by display name before passing the list down. The address step keeps the dropdown as-is.

**Remove, do not disable.** `proxy.ts`, both selector components, `lib/types/region.ts`, `changeRegion`, `getRegionId`, `setRegionId`, the `regions`/`currentRegion`/`regionSelectorDisabled`/`regionsError`/`currentRegionError` props and the `ClientToastErrorHandler` wrapper in the header (its only inputs were the two region errors) are deleted. The footer keeps its links, rights notice and social icons.

**Seed creates one region.** Name "Europe", `eur`, tax inclusive, countries `['lt', ...restOfEurope]`, `metadata.shortName` dropped since nothing displays it. Service zones and shipping options are unchanged. The store's `default_region_id` still points at it.

## Risks / Trade-offs

- [Deploy order: storefront ships before the admin merge] → `lt` belongs to the Lithuanian region before the merge and to "Europe" after it, and the store's default region is the Lithuanian one in both states, so prices and carts work throughout. If the merge is done first, the old storefront's `DEFAULT_REGION_ID` still resolves as long as the kept region is the Lithuanian one, which the migration plan requires.
- [Store default region points at the deleted region] → cart creation fails with no region. The migration plan checks the default region before deleting; the seed already sets it to the kept region.
- [Medusa refuses to delete a region with active carts, or orphans them] → deletion is a soft delete in Medusa v2 and carts keep their `region_id`; those carts are abandoned. If deletion is blocked, remove the countries from "Rest of Europe" instead and leave the empty region in place; the storefront never lists regions, so an empty extra region is harmless.
- [A future second currency] → reintroducing region selection is a new change; nothing here blocks it, but nothing is kept for it either.

## Migration Plan

1. Deploy `api/` and `front/` from this change. `DEFAULT_REGION_ID` can be removed from the deploy repo at the same time; the new storefront ignores it.
2. In the Medusa admin on each environment: open Settings, Store, and confirm the default region is "Lithuania". Then open Settings, Regions. Delete "Rest of Europe". Open "Lithuania", add every EU country from the seed list, rename it "Europe". Countries can only belong to one region, so the delete must happen first.
3. Confirm `/shop` shows prices and a fresh add-to-cart reaches the checkout with the full country list.
4. Local dev: `pnpm migrate` is unaffected; a fresh seed produces the single region. Existing local databases follow step 2 or are reseeded.

Rollback: redeploy the previous storefront with `DEFAULT_REGION_ID` set to the kept region's id. The backend needs no rollback; one region is valid for the old storefront too, its selector simply shows one entry.
