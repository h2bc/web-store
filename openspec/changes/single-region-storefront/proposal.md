## Why

The store sells in EUR only, as a non-VAT-registered individual business, so every customer sees the same price regardless of country. The two Medusa regions (Lithuania, Rest of Europe) differ only in shipping cost, which Medusa already resolves per service zone from the shipping address, not from the region. The region machinery in the storefront (cookie, middleware, two selectors, cart migration, `DEFAULT_REGION_ID`) buys nothing and creates a dead end at checkout: the selector is hidden there, so a customer on the wrong region cannot pick their country.

## What Changes

- The backend has one region, EUR, tax inclusive, containing Lithuania and every other shipped-to country. Shipping options stay split by service zone (Lithuania, Rest of Europe) with their existing prices and free-shipping thresholds.
- The storefront resolves the store's single region server-side from the backend, cached, and uses it for product pricing and cart creation. No cookie, no middleware, no `DEFAULT_REGION_ID` env var.
- **BREAKING** The region selector is removed from the header and the footer, together with the region-change server action and the region error toasts.
- Checkout lists every country of the region in the shipping address, sorted by name, with Lithuania preselected for a new address.
- A cart created under a region that no longer exists is moved to the current region when loaded, so carts from before the data migration keep working.
- Seed script creates the single region. README and OpenSpec project context stop describing multi-region support. The SEO change's design note about crawlers getting default-region pricing is reworded: there is only one price.

Non-goals:

- Multi-currency (USD prices remain in the seed and admin but are not sold).
- Per-country VAT rates. Not needed below the EU distance-selling threshold; when it is, they are added to the same region in the admin.
- Language selection or localisation.

## Capabilities

### New Capabilities
- `storefront-region`: how the storefront resolves the store's single market (region and currency) for pricing and carts, and which countries the checkout offers.

### Modified Capabilities
- none yet. `add-storefront-seo` is merged in code but not archived, so `storefront-seo` is not a main spec. Once it is archived, this change adds a MODIFIED delta for "Product pages publish Product structured data" replacing "for the region the request resolves to" with "in the store's currency".

## Impact

- `api/src/scripts/seed.ts`: one region instead of two.
- `front/`: delete `proxy.ts`, `components/layout/header/region-selector.tsx`, `components/layout/footer/mobile-region-selector.tsx`, `lib/types/region.ts`; remove region cookie helpers from `lib/cookies.ts`; rewrite `lib/data/regions.ts` around a single region; simplify `lib/data/products.ts`, `lib/data/cart.ts`, `app/(main)/layout.tsx`, `components/layout/header/site-header.tsx`, `components/layout/footer/footer-bar.tsx`; sort and default the country list in `app/(main)/checkout/page.tsx` and `components/checkout/address-step.tsx`.
- `DEFAULT_REGION_ID` removed from `front/.env.example` and `front/.env.local`. The e2e job in `.github/workflows/deploy.yml` stops querying `store.default_region_id` from Postgres; the publishable-key query stays. Deploy repo `h2bc/web-store-deploy` can drop the variable too (manual, outside this repo).
- The CI e2e job seeds the catalog, so the new checkout and layout Playwright cases in `e2e/` run against real data in CI.
- Data migration in the Medusa admin on every deployed environment: delete the "Rest of Europe" region, add its countries to the remaining region, rename it. Manual step, documented in the design.
- `front/README.md`, `openspec/config.yaml` context, `openspec/changes/add-storefront-seo/design.md` wording.
