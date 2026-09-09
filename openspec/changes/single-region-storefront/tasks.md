## 1. Backend seed

- [ ] 1.1 In `api/src/scripts/seed.ts` replace the two regions with one region "Europe" (`eur`, tax inclusive, countries `lt` plus `restOfEurope`, no `shortName` metadata) and point `default_region_id` at it; keep both service zones and shipping options unchanged; verify by reseeding a fresh local database and checking the admin shows one region with all countries and two shipping options

## 2. Storefront region resolution

- [ ] 2.1 Rewrite `front/lib/data/regions.ts` as `getRegion()`: list regions, cache under the `regions` tag with the existing revalidate window, return `{ region, error }` with the first region, `console.warn` when more than one is listed; verify with a scratch call in dev that it returns the seeded region and warns against a database that still has two
- [ ] 2.2 Remove `getRegionId` and `setRegionId` from `front/lib/cookies.ts`, delete `front/proxy.ts` and `front/lib/types/region.ts`; verify `grep -rn "region_id\|RegionSummary" front --include=*.ts --include=*.tsx` outside `node_modules` only hits Medusa SDK payloads
- [ ] 2.3 In `front/lib/data/products.ts` take the region from `getRegion()` in `getProducts` and `getProductByHandle`, drop the region suffix from cache keys and tags, and return the catalog error shape when the region is missing; verify `/shop` and a product page render prices with no `region_id` cookie present
- [ ] 2.4 In `front/lib/data/cart.ts` use `getRegion()` in `initCart`, delete `changeRegion`, and in `getCart` move the cart to the resolved region when `cart.region_id` differs; verify by creating a cart, changing its region id directly through the admin API or database, reloading the site and confirming the cart keeps its items and shows the current region id

## 3. Storefront layout cleanup

- [ ] 3.1 Delete `front/components/layout/header/region-selector.tsx` and `front/components/layout/footer/mobile-region-selector.tsx`; remove all region props from `app/(main)/layout.tsx`, `site-header.tsx` and `footer-bar.tsx`, and drop the `ClientToastErrorHandler` wrapper from the header; verify the header shows logo, nav and cart, the footer shows links, rights notice and social icons, and no region control appears at any breakpoint
- [ ] 3.2 Remove `DEFAULT_REGION_ID` from `front/.env.example` and `front/.env.local`, and drop the `default_region_id` psql line from the "Export storefront credentials" step in `.github/workflows/deploy.yml` while keeping the publishable-key line; verify `grep -rn DEFAULT_REGION_ID .` outside `node_modules` returns nothing

## 4. Checkout countries

- [ ] 4.1 Add `DEFAULT_COUNTRY_CODE = 'lt'` beside the checkout schema in `front/lib/schemas/checkout.ts`; in `app/(main)/checkout/page.tsx` sort the country list by display name; in `components/checkout/address-step.tsx` default `country_code` to the existing address country or `DEFAULT_COUNTRY_CODE`; verify a fresh cart's address step preselects Lithuania with an alphabetical list, and a cart with a German address keeps Germany
- [ ] 4.2 Add `e2e/checkout.test.ts`: add the first shop product to the cart, open checkout, confirm the country field preselects Lithuania and the dropdown is alphabetical, submit a Lithuanian address and assert the delivery step offers "Standard Shipping LT" at 2.99, then edit the address to Germany and assert "Standard Shipping EU" at 5.99; skip when the shop lists no products; verify with `pnpm test:e2e`

## 5. Docs and specs

- [ ] 5.1 Remove "Multi-region/currency support" from `front/README.md`; in `openspec/config.yaml` context change "Session state (region, cart) lives in httpOnly cookies" to cart only; in `openspec/changes/add-storefront-seo/design.md` replace the two notes about crawlers receiving `DEFAULT_REGION_ID` pricing with a statement that the store has one region so every visitor sees the same price; verify by reading the three files

## 6. Verification

- [ ] 6.1 With `pnpm dev` running, open `/`, `/shop` and a product page in the Playwright browser: header and footer show no region control, prices render in EUR, and the response sets no `region_id` cookie
- [ ] 6.2 In the same browser session add a product to the cart, open checkout: country dropdown is alphabetical with Lithuania preselected; submit a Lithuanian address and see "Standard Shipping LT" at 2.99, switch to Germany and see "Standard Shipping EU" at 5.99
- [ ] 6.3 View source of a product page and confirm the Product JSON-LD still carries price and currency
- [ ] 6.4 cd front && pnpm lint && pnpm typecheck
