## 1. Storefront: default country

- [x] 1.1 Add the unit test `front/tests/store.test.ts` for `getDefaultCountryCode`: a region country returns itself, an unsupported country, `XX`, `T1` and a missing value return Lithuania, and a lowercase value matches. Test data goes in `front/tests/support/data.ts`. Verify `pnpm test:front` fails because the function does not exist.
- [x] 1.2 Add `getDefaultCountryCode(visitorCountry, countryCodes)` to `front/lib/store.ts` per `design.md`. Verify `pnpm test:front` passes.
- [x] 1.3 In `front/app/(main)/checkout/page.tsx` read `cf-ipcountry` with `headers()`, call `getDefaultCountryCode` with `countryCodes` and pass `defaultCountryCode` to `AddressStep`. Verify `pnpm typecheck:front` passes.
- [x] 1.4 In `front/components/checkout/address-step.tsx` take the `defaultCountryCode` prop, use `saved?.country_code ?? defaultCountryCode` and drop the `DEFAULT_COUNTRY_CODE` import. Verify `pnpm typecheck:front` and `pnpm lint:front` pass, and save a Playwright MCP screenshot of `http://localhost:3000/checkout` under `.tmp/`.

## 2. End to end

- [x] 2.1 Add `setVisitorCountry` in `tests/support/visitor.ts`, which adds the `cf-ipcountry` header to storefront requests only through `page.route`, and expose it as the `visitFrom` fixture in `tests/support/fixtures.ts` so the checkout and the shop journeys share it. Add the country codes it needs to `tests/support/data.ts`. Verify `pnpm lint` passes.
- [x] 2.2 Add three journeys to `tests/checkout.test.ts`, one per spec scenario: a visitor from Germany sees Germany preselected, a visitor from an unsupported country sees Lithuania, and a cart with a saved German address keeps Germany for a visitor from another country. Verify `pnpm test:e2e tests/checkout.test.ts` passes with both apps up.
- [x] 2.3 Add the journey for `Prices ignore the visitor's country` to `tests/shop.test.ts`: a visitor from Germany sees the same product price as a visitor with no country and gets no country cookie. Verify `pnpm test:e2e tests/shop.test.ts` passes with both apps up.

## 3. Docs

- [x] 3.1 In `docs/architecture.md` under `### Checkout`, add one bullet: the address form's default country comes from Cloudflare's `CF-IPCountry` header through `getDefaultCountryCode` in `front/lib/store.ts`, and falls back to Lithuania. Verify the bullet follows `.claude/rules/writing.md`.

## 4. Checks

- [x] 4.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:api` and `pnpm test:front`. Verify all are green.

## Outside this repo

- Cloudflare dashboard, zone `h2bcweb.com`: the visitor location header setting under Network is on. Proof: on `https://dev.h2bcweb.com/checkout` from a non-Lithuanian EU address, the country field shows that country.
- Cloudflare DNS: the production storefront record is proxied, like `dev.h2bcweb.com`. Proof: `curl -sI https://h2bcweb.com` answers with `server: cloudflare` and a `cf-ray` header.
- No change in `h2bc/web-store-deploy`: Caddy forwards the header as it is.

## Review findings

- 2.3: the owner dropped the prices journey and its spec scenario after the task was ticked, because more regions may come later. `tests/shop.test.ts` is back to its state on `main`.
