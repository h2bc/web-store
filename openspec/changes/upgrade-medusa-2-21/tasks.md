## 1. API packages, config and validators

- [ ] 1.1 Record the baseline: run `pnpm test:api` and `pnpm exec playwright test` on the current pins with both apps up and note which tests pass, since every one of them must pass again at 1.6 and 3.3; verify the api suite and the journeys are green.
- [ ] 1.2 In `api/package.json` set `@medusajs/admin-sdk`, `@medusajs/admin-shared`, `@medusajs/cli`, `@medusajs/dashboard`, `@medusajs/draft-order`, `@medusajs/framework`, `@medusajs/medusa`, `@medusajs/icons`, `@medusajs/js-sdk` and `@medusajs/test-utils` to exact `2.21.0`, `@medusajs/ui` to `4.2.4`, `react-hook-form` to `7.83.0`, `zod` to `4.2.0`, `@hookform/resolvers` to `5.5.7`, remove `radix-ui`, run `pnpm --dir api i`; verify `pnpm --dir api ls "@medusajs/*" --depth 0` shows one version everywhere and the lockfile holds no second Medusa version.
- [ ] 1.3 Update `api/src/api/admin/gallery/validators.ts` to Zod 4: the custom issue uses `code: "custom"`; check `api/src/api/utils/validators.ts` and the page validators for anything Zod 4 renamed; verify `pnpm typecheck:api` passes.
- [ ] 1.4 Remove the `|| "supersecret"` fallbacks from `api/medusa-config.ts` and add `JWT_SECRET` and `COOKIE_SECRET` to `api/.env.test`; verify `pnpm --dir api exec medusa start` with `JWT_SECRET` unset exits with an error naming it, and starts with both set.
- [ ] 1.5 Run `pnpm migrate` on the development database; verify `medusa db:migrate` reports no pending migrations afterwards and `GET /store/products` with the publishable key still returns the seeded products with variants and prices.
- [ ] 1.6 Run `pnpm test:api`; verify every test recorded at 1.1 passes unchanged.
- [ ] 1.7 Run `pnpm --dir api build`; verify it completes, including the admin build under Vite 7, and `pnpm --dir api start` serves `/health` and `/app` from the build.

## 2. Admin form from the dashboard

- [ ] 2.1 The journeys in `tests/admin.test.ts` are this group's tests: the Vimeo link and the empty title must still show their field errors and the valid save must still close the drawer. No new test is written; verify the file still asserts those three.
- [ ] 2.2 Replace the import of `./form` in `api/src/admin/components/video-drawer.tsx` with `import { Form } from "@medusajs/dashboard/components"`, delete `api/src/admin/components/form.tsx` and any other file importing it; verify `pnpm typecheck:api` passes and `grep -rn "components/form" api/src/admin` finds nothing.
- [ ] 2.3 With both apps up run `pnpm exec playwright test --project admin --no-deps`; verify all admin journeys pass.

## 3. Storefront types and store reads

- [ ] 3.1 The journeys in `tests/smoke.test.ts`, `tests/checkout.test.ts`, `tests/seo.test.ts` and `tests/content.test.ts` are this group's tests; verify they cover the shop listing with prices, a product page with variants and images, the cart with a shipping method name and a completed checkout, and add an assertion in the matching file for any of those a journey does not already check.
- [ ] 3.2 In `front/package.json` set `@medusajs/js-sdk` and `@medusajs/types` to exact `2.21.0`, run `pnpm --dir front i`, fix every type rename the typecheck reports; verify `pnpm typecheck:front` and `pnpm lint:front` pass.
- [ ] 3.3 With both apps up run `pnpm exec playwright test`; verify every journey recorded at 1.1 passes unchanged.
- [ ] 3.4 List every `fields` string in `front/lib/data/` and compare each field against what the journeys of 3.1 assert; for any field a journey cannot see, call the route with `curl` and the publishable key; verify each requested field is present in the response, and for a stripped one add an `allowFields` entry for that route in `api/src/api/middlewares.ts` and re-verify.

## 4. Docs and checks

- [ ] 4.1 Update `docs/architecture.md` where it names the Medusa version or the admin form pattern; verify `grep -n "2.13\|form.tsx" docs/architecture.md` finds nothing.
- [ ] 4.2 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.

## Outside this repo

- Before the deploy that carries this change, the owner takes a backup of the production database. Proof: the backup exists and its timestamp precedes the deploy.
- After the deploy, the owner opens the live admin, the shop and one product page. Proof: login works, the shop lists products with prices, the product page shows its variants and images.

## Review findings

None.
