## 1. Backend seed

- [x] 1.1 In `api/src/scripts/seed.ts` replace the two regions with one region "Europe" (`eur`, tax inclusive, countries `lt` plus `restOfEurope`, no `shortName` metadata) and point `default_region_id` at it; keep both service zones and shipping options unchanged; verify by reseeding a fresh local database and checking the admin shows one region with all countries and two shipping options

## 2. Storefront without regions

- [x] 2.1 Delete `front/lib/data/regions.ts` and add `front/lib/store.ts` exporting `DEFAULT_COUNTRY_CODE = 'lt'`; verify `grep -rn getRegion front --include=*.ts --include=*.tsx` outside `node_modules` returns nothing
- [x] 2.2 Remove `getRegionId` and `setRegionId` from `front/lib/cookies.ts`, delete `front/proxy.ts` and `front/lib/types/region.ts`; verify `grep -rn "region_id\|RegionSummary" front --include=*.ts --include=*.tsx` outside `node_modules` only hits Medusa SDK payloads
- [x] 2.3 In `front/lib/data/products.ts` replace `region_id` with `country_code: DEFAULT_COUNTRY_CODE`, add `*variants.calculated_price` to the fields of both product queries, and drop the region suffix from cache keys and tags; verify `/shop` and a product page render EUR prices with no `region_id` cookie present
- [x] 2.4 In `front/lib/data/cart.ts` create carts with `sdk.store.cart.create({})`, delete `changeRegion`, and keep `getCart` a plain retrieve; verify a fresh add-to-cart produces a cart whose `region_id` is the store's default region

## 3. Storefront layout cleanup

- [x] 3.1 Delete `front/components/layout/header/region-selector.tsx` and `front/components/layout/footer/mobile-region-selector.tsx`; remove all region props from `app/(main)/layout.tsx`, `site-header.tsx` and `footer-bar.tsx`, and drop the `ClientToastErrorHandler` wrapper from the header; verify the header shows logo, nav and cart, the footer shows links, rights notice and social icons, and no region control appears at any breakpoint
- [x] 3.2 Remove `DEFAULT_REGION_ID` from `front/.env.example` and `front/.env.local`, and drop the `default_region_id` psql line from the "Export storefront credentials" step in `.github/workflows/deploy.yml` while keeping the publishable-key line; verify `grep -rn DEFAULT_REGION_ID .` outside `node_modules` returns nothing

## 4. Checkout countries

- [x] 4.1 In `app/(main)/checkout/page.tsx` map `cart.region.countries` to upper-case ISO codes and pass them to `components/checkout/address-step.tsx` as the Address Element's `allowedCountries`; default the element's country to the existing address country or `DEFAULT_COUNTRY_CODE`; verify a fresh cart's address step preselects Lithuania with an alphabetical list, and a cart with a German address keeps Germany
- [x] 4.2 In `e2e/checkout.test.ts` add a case next to the card payment flow: add the first shop product to the cart, open checkout, confirm the Address Element's country select preselects Lithuania and lists countries alphabetically, submit a Lithuanian address and assert the delivery step offers "Standard Shipping LT" at 2.99, then edit the address to Germany and assert "Standard Shipping EU" at 5.99; the file already skips without `STRIPE_PUBLISHABLE_KEY`; verify with `pnpm test:e2e`

## 5. Docs and specs

- [x] 5.1 Remove "Multi-region/currency support" from `front/README.md`; in `openspec/config.yaml` context change "Session state (region, cart) lives in httpOnly cookies" to cart only; in `openspec/changes/archive/2026-09-09-add-storefront-seo/design.md` replace the two notes about crawlers receiving `DEFAULT_REGION_ID` pricing with a statement that the store has one region so every visitor sees the same price; verify by reading the three files

## 6. Verification

- [x] 6.1 With `pnpm dev` running, open `/`, `/shop` and a product page in the Playwright browser: header and footer show no region control, prices render in EUR, and the response sets no `region_id` cookie
- [x] 6.2 In the same browser session add a product to the cart, open checkout: country dropdown is alphabetical with Lithuania preselected; submit a Lithuanian address and see "Standard Shipping LT" at 2.99, switch to Germany and see "Standard Shipping EU" at 5.99
- [x] 6.3 View source of a product page and confirm the Product JSON-LD still carries price and currency
- [x] 6.4 cd front && pnpm lint && pnpm typecheck
