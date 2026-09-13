## 1. Baseline and the missing admin journeys

- [x] 1.1 Record the baseline: run `pnpm test:api` and `pnpm exec playwright test` on the current pins with both apps up and note which tests pass, since every one of them must pass again at 2.6, 3.6, 4.3 and 5.2; verify the api suite and the journeys are green.
- [x] 1.2 In `tests/admin.test.ts`, end to end, add one journey per new scenario of the content-management delta: editing a video's title, editing a page's meta description, a rejected page save with a cleared body showing a field error and keeping the values, the empty gallery showing its empty state, and dragging the second video above the first; add the locators and actions to `tests/support/admin-page.ts`, an `emptyGallery` fixture in `tests/support/fixtures.ts` that saves an empty list through `POST /admin/gallery` and restores the list after, and the constants to `tests/support/data.ts`; verify the four journeys that describe existing behaviour pass on 2.13.1 with both apps up, and the rejected page save fails for its scenario's reason, no field error, until 3.3.
- [x] 1.3 With both apps up, take a Playwright MCP screenshot of every admin screen and of both drawers, the ranking modal and the delete prompt, saved under `.tmp/admin-before/`; verify nine screenshots exist.

## 2. API packages, config and validators

- [x] 2.1 The tests in `api/tests/` are this group's tests, integration, unchanged; verify `pnpm test:api` is green at 1.1.
- [x] 2.2 In `api/package.json` set `@medusajs/admin-sdk`, `@medusajs/admin-shared`, `@medusajs/cli`, `@medusajs/dashboard`, `@medusajs/draft-order`, `@medusajs/framework`, `@medusajs/medusa`, `@medusajs/icons`, `@medusajs/js-sdk` and `@medusajs/test-utils` to exact `2.21.0`, `@medusajs/ui` to `4.2.4`, `react-hook-form` to `7.83.0`, `zod` to `4.2.0`, `@hookform/resolvers` to `5.5.7`, add `@tanstack/react-query` at `5.64.2` as a dev dependency, remove `radix-ui`, run `pnpm --dir api i`; verify `pnpm --dir api ls "@medusajs/*" --depth 0` shows one version everywhere, the lockfile holds no second Medusa version and `pnpm --dir api why @tanstack/react-query` resolves one version.
- [x] 2.3 Update `api/src/api/admin/gallery/validators.ts` to Zod 4: the link check is a `refine` with a message; check `api/src/api/utils/validators.ts` and the page validators for anything Zod 4 renamed; verify `pnpm typecheck:api` passes.
- [x] 2.4 Remove the `|| "supersecret"` fallbacks from `api/medusa-config.ts` and add `JWT_SECRET` and `COOKIE_SECRET` to `api/.env.test`; verify `pnpm --dir api exec medusa start` with `JWT_SECRET` unset exits with an error naming it, and starts with both set.
- [x] 2.5 Set the `predeploy` script in `api/package.json` to `medusa db:migrate --execute-safe-links`, because the 2.21 link sync prompts for the `product_variant_inventory_item` update and a plain `db:migrate` hangs without a terminal; run `pnpm migrate` on the development database; verify `medusa db:migrate` reports no pending migrations afterwards and `GET /store/products` with the publishable key still returns the seeded products with variants and prices.
- [x] 2.6 Run `pnpm test:api`, `pnpm --dir api build` and, with both apps up, `pnpm exec playwright test`; verify every test recorded at 1.1 and every journey of 1.2 except the rejected page save passes unchanged, the admin build completes under Vite 7 and `pnpm --dir api start` serves `/health` and `/app` from the build.

## 3. Admin screens on the dashboard's components

- [x] 3.1 The journeys in `tests/admin.test.ts`, end to end, are this group's tests; no new test is written, only the locators in `tests/support/admin-page.ts` change where the dashboard components render different roles or labels; verify every assertion of 1.1 and 1.2 is still in the file.
- [x] 3.2 In `api/src/admin/components/video-drawer.tsx` import `Form` and `KeyboundForm` from `@medusajs/dashboard/components`, wrap the fields in `KeyboundForm`, delete `api/src/admin/components/form.tsx` and `api/src/admin/README.md`; verify `pnpm typecheck:api` passes and `grep -rn "components/form\|from \"./form\"" api/src/admin` finds nothing.
- [x] 3.3 Rebuild `api/src/admin/components/content-page-drawer.tsx` on `Form`, `KeyboundForm`, `react-hook-form` and a Zod schema with description 0 to 300 and body 1 to 100000 characters, and toast an API error from the save mutation; verify the rejected save journey and the page body journeys pass with `pnpm exec playwright test --project admin --no-deps`.
- [x] 3.4 Rebuild `api/src/admin/components/content-page-card.tsx` with `SectionRow` for the two rows, `ActionMenu` for the header menu and `NoRecords` for the empty state, removing the local `Row`; verify the about page journeys pass and the card still shows the description and the rendered body.
- [x] 3.5 Rebuild `api/src/admin/components/gallery-editor.tsx` on `DataTable` with the heading, sub-heading, the Edit ranking and Create actions, the title and link columns from the UI kit's column helper, an `ActionMenu` column with Edit and Delete, and the empty state, removing `VideoRow` and the local `Table`; verify the gallery journeys pass, including the empty gallery and the row menu.
- [x] 3.6 Move every read in `api/src/admin/components/` to `useQuery` and every save to `useMutation` from `@tanstack/react-query`, invalidating the screen's query on success and toasting on error, keeping `api/src/admin/lib/` as the query and mutation hooks, with each drawer owning its save mutation and toasts and deleting the `loaded` and `saving` state and the load effects; verify `pnpm typecheck:api` and `pnpm lint:api` pass, `grep -rn "useEffect" api/src/admin/components` finds only the drawers' reset effects, and with both apps up `pnpm test:api` and `pnpm exec playwright test` pass with every test of 1.1 and 1.2 unchanged.
- [x] 3.7 Take the same nine Playwright MCP screenshots as 1.3 under `.tmp/admin-after/`; verify each pair shows the same content and actions, and note any layout difference in the report.

## 4. Storefront types and store reads

- [x] 4.1 The journeys in `tests/shop.test.ts`, `tests/checkout.test.ts`, `tests/seo.test.ts` and `tests/content.test.ts`, end to end, are this group's tests; verify they cover the shop listing with prices, a product page with variants and images, the cart with a shipping method name and a completed checkout, and add an assertion in the matching file for any of those a journey does not already check.
- [x] 4.2 In `front/package.json` set `@medusajs/js-sdk` and `@medusajs/types` to exact `2.21.0`, run `pnpm --dir front i`, fix every type rename the typecheck reports; verify `pnpm typecheck:front` and `pnpm lint:front` pass.
- [x] 4.3 With both apps up run `pnpm exec playwright test`; verify every journey recorded at 1.1 and 1.2 passes unchanged.
- [x] 4.4 List every `fields` string in `front/lib/data/` and compare each field against what the journeys of 4.1 assert; for any field a journey cannot see, call the route with `curl` and the publishable key; verify each requested field is present in the response. Found: 2.21 returns `inventory_quantity` only for `+variants.inventory_quantity` and categories only for `*categories`, so the two product field strings in `front/lib/data/products.ts` use that syntax, a stocked product no longer shows as sold out, and `tests/shop.test.ts` asserts it; no field needed `allowFields`.

## 5. Docs and checks

- [x] 5.1 Update `docs/architecture.md` where it describes the admin screens, stating that they are built from the components `@medusajs/dashboard` exports and load through TanStack Query, and the Medusa version if it names one; verify `grep -n "2.13\|form.tsx" docs/architecture.md` finds nothing and `grep -n "dashboard" docs/architecture.md` finds the new line.
- [x] 5.2 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`, then with both apps up `pnpm exec playwright test`; verify all pass with every test of 1.1 and 1.2 unchanged.

## Outside this repo

- Before the deploy that carries this change, the owner takes a backup of the production database. Proof: the backup exists and its timestamp precedes the deploy.
- After the deploy, the owner opens the live admin, the gallery, one content page, the shop and one product page. Proof: login works, the gallery lists its videos, the page shows its body, the shop lists products with prices, the product page shows its variants and images.

## Review findings

- 1.1: `pnpm test:api` cannot run inside the devcontainer as is. The Medusa test runner forces SSL for any database host but `localhost`, and the local postgres password holds an `@` the runner does not escape into its URL. The baseline ran through a local TCP proxy on `127.0.0.1:5432` with a `tester` role. Worth a compose or `.env.test` fix in its own change.
- 1.1: the four checkout journeys time out on the Stripe address frame when the API suite runs at the same time. They pass alone.
