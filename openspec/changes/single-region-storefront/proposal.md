## Why

The store sells in EUR only, as a non-VAT-registered individual business, so every customer sees the same price regardless of country. The two Medusa regions (Lithuania, Rest of Europe) differ only in shipping cost, which Medusa already resolves per service zone from the shipping address, not from the region. The region machinery in the storefront (cookie, middleware, two selectors, cart migration, `DEFAULT_REGION_ID`) buys nothing and creates a dead end at checkout: the selector is hidden there, so a customer on the wrong region cannot pick their country.

## What Changes

- The backend has one region, EUR, tax inclusive, containing Lithuania and every other shipped-to country. Shipping options stay split by service zone (Lithuania, Rest of Europe) with their existing prices and free-shipping thresholds.
- The storefront never resolves a region. Product prices are requested for the store's home country and carts are created without a region, so Medusa uses the store's default region. No cookie, no middleware, no `DEFAULT_REGION_ID` env var, no region fetch.
- **BREAKING** The region selector is removed from the header and the footer, together with the region-change server action and the region error toasts.
- Checkout lists every country of the region in the shipping address, sorted by name, with Lithuania preselected for a new address.
- Carts created under the deleted region are abandoned. They are anonymous carts on a pre-launch environment, and the storefront has no place to repair them without writing to the cart on every page load.
- Seed script creates the single region. README and OpenSpec project context stop describing multi-region support. The SEO change's design note about crawlers getting default-region pricing is reworded: there is only one price.

Non-goals:

- Multi-currency (USD prices remain in the seed and admin but are not sold).
- Per-country VAT rates. Not needed below the EU distance-selling threshold; when it is, they are added to the same region in the admin.
- Language selection or localisation.

## Capabilities

### New Capabilities
- `storefront-region`: how the storefront prices products and creates carts without knowing the region, and which countries the checkout offers.

### Modified Capabilities
- `storefront-seo`: "Product pages publish Product structured data" prices the offer in the store's currency instead of "for the region the request resolves to".

## Impact

- `api/src/scripts/seed.ts`: one region instead of two.
- `front/`: delete `proxy.ts`, `components/layout/header/region-selector.tsx`, `components/layout/footer/mobile-region-selector.tsx`, `lib/types/region.ts`; remove region cookie helpers from `lib/cookies.ts`; delete `lib/data/regions.ts`; add `lib/store.ts` with the home country; simplify `lib/data/products.ts`, `lib/data/cart.ts`, `app/(main)/layout.tsx`, `components/layout/header/site-header.tsx`, `components/layout/footer/footer-bar.tsx`; pass the region's country codes from `app/(main)/checkout/page.tsx` to the Address Element in `components/checkout/address-step.tsx` and default its country to Lithuania.
- `DEFAULT_REGION_ID` removed from `front/.env.example` and `front/.env.local`. The e2e job in `.github/workflows/deploy.yml` stops querying `store.default_region_id` from Postgres; the publishable-key query stays. Deploy repo `h2bc/web-store-deploy` can drop the variable too (manual, outside this repo).
- The CI e2e job seeds the catalog, so the new checkout and layout Playwright cases in `e2e/` run against real data in CI.
- Data migration in the Medusa admin on every deployed environment: delete the "Rest of Europe" region, add its countries to the remaining region, rename it. Manual step, documented in the design.
- `front/README.md`, `openspec/config.yaml` context, archived `add-storefront-seo` design wording.
