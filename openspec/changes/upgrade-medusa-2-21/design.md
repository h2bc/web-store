## Context

See proposal.md for the motivation. The API pins Medusa 2.13.1 throughout, with `@medusajs/ui` 4.1.1 and the form libraries added at the 2.13.1 dashboard's versions. The storefront pins `@medusajs/js-sdk` and `@medusajs/types` at 2.10. Node is 24 in the devcontainer and 25 in CI and the image, so the Node floor of 2.19 is already met. There are no admin widgets, no custom Vite config, no search provider, no customer accounts and no MFA, so most of the breaking changes between 2.14 and 2.21 have nothing to hit. The ones that do: Zod 4 in 2.14, HTTP type renames in 2.14, removed default secrets in 2.16, the three-level relation cap in 2.20 and strict allowed store fields in 2.21. The change branches from `main` after `add-admin-content-pages` merges, since both edit the admin drawer and the gallery validator.

## Goals / Non-Goals

**Goals:**
- One version bump, one migration run, the copied form wrapper gone.
- Every suite green with no assertion weakened.

**Non-Goals:**
- Any feature work. If a new capability of 2.21 looks useful it gets its own change.

## Decisions

**1. One jump to 2.21.0, every package at once.** Medusa's update guide says all `@medusajs/*` packages share a version and that `db:migrate` applies every pending migration, so nothing is gained by stepping through 2.14, 2.16 and so on. `@medusajs/ui` moves to 4.2.4 because that is what the 2.21.0 dashboard declares, and `@medusajs/draft-order` stays a separate package at 2.21.0. Alternative: stepwise upgrades with a migrate run at each, rejected because the migrations are cumulative and each step would re-run the same suites for no new information.

**2. `Form` from `@medusajs/dashboard/components`, libraries kept as direct dev dependencies.** The drawer imports `Form` from the dashboard and `api/src/admin/components/form.tsx` is deleted. `react-hook-form`, `zod` and `@hookform/resolvers` stay in `api/package.json` at the versions the 2.21.0 dashboard pins, 7.83.0, 4.2.0 and 5.5.7, because pnpm does not expose a dependency's dependencies and the drawer imports all three itself. `radix-ui` goes, only the copy used it. Alternative: a `public-hoist-pattern` in `.npmrc` so the transitive packages resolve, rejected because it hides which packages the admin code actually depends on.

**3. Zod 4 syntax in the API validators, still through `@medusajs/framework/zod`.** The gallery validator's custom issue uses the string code `"custom"` and keeps `z.NEVER`, which Zod 4 still exports. The admin drawer's schema already runs on the dashboard's Zod. Alternative: pinning the API's own `zod` 3 next to the framework's, rejected because two Zod majors in one bundle is exactly the mess the framework re-export exists to avoid.

**4. Drop the `supersecret` fallback.** `api/medusa-config.ts` reads `JWT_SECRET` and `COOKIE_SECRET` with no default, matching what Medusa did in 2.16. `api/.env.test` gains both so the integration runner and the admin JWT helper keep working, `api/.env.example` already lists them, and CI sets them. Alternative: keep our own fallback since it is ours and not the framework's, rejected because a store that silently signs sessions with a public string is the failure the removal was meant to prevent.

**5. Storefront types move with the API.** `@medusajs/js-sdk` and `@medusajs/types` go to 2.21.0 so the renamed HTTP types of 2.14 fail the typecheck instead of drifting. Alternative: leave the storefront at 2.10 since the SDK is backward compatible at runtime, rejected because the type renames are the cheapest signal of what the responses now look like.

**6. Strict fields are proven by the journeys, patched on the API.** The storefront asks for variants with calculated prices, options and inventory quantities, images with URLs, categories with names, and cart shipping method names, all two levels deep and all standard. The shop, product, cart and checkout journeys are the check, since a stripped field fails silently. If one is stripped, the fix is `allowFields` middleware for that route in `api/src/api/middlewares.ts`, the escape hatch Medusa documents, never a storefront page showing less. Alternative: reading the allowed lists in the Medusa source for each route, rejected because the journeys already exercise every field the storefront renders.

## Risks / Trade-offs

- [Production migrations are irreversible, global product options rewrite catalog data] → a database backup right before the deploy, and the shop and a product page opened after it.
- [A store field silently stripped in a path no journey renders] → the field audit in task 3.4 lists every `fields` string in `front/lib/data/` against what the journeys assert.
- [The dashboard changed its chrome between 2.13 and 2.21, layout composer included] → custom routes are unaffected by the composer; the admin journeys confirm the sidebar, drawer and toasts still read the same.
- [The 2.21 dashboard build under Vite 7 fails in the image] → `pnpm --dir api build` runs locally before the pull request, the same command the Dockerfile runs.

## Migration Plan

1. Branch from `main` once `add-admin-content-pages` is merged.
2. Bump, install, fix types and validators, run `pnpm migrate` on the development database, run every suite.
3. Merge. The deploy job builds the images; the predeploy step runs `medusa db:migrate` against production.
4. Rollback: restore the database backup and redeploy the previous image tag. The two are done together, since the old code cannot read the migrated schema.
