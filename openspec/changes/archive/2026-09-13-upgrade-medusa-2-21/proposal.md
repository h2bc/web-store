## Why

The admin screens carry about a thousand lines of hand-written React, including a copy of the dashboard's form wrapper, because Medusa 2.13.1 exports none of its dashboard components. Medusa 2.21.0 is the first release that exports them from `@medusajs/dashboard/components`, so the copies can go and the screens can be built from the same parts the dashboard uses. Eight minor releases have also accumulated security fixes and migrations the store is not getting.

## What Changes

- Every `@medusajs/*` package moves from 2.13.1 to 2.21.0 in one step, with `@medusajs/ui` at the version the dashboard pins, because Medusa requires one version across packages.
- The admin screens are rebuilt from the dashboard's exported components: `Form` and `KeyboundForm` for both drawers, `SectionRow`, `ActionMenu` and `NoRecords` for the page cards, `DataTable` with a row `ActionMenu` for the gallery.
- Both admin drawers validate in the form with field errors, the way every dashboard form does; the content page drawer today has no client validation and reports a rejected save with a toast.
- Admin data loads and saves through TanStack Query, the library every dashboard screen uses, instead of hand-rolled effects and loading flags.
- The copied form wrapper, the `radix-ui` dependency and the starter README under `api/src/admin/` are deleted. The ranking modal and the markdown renderer stay custom because no Medusa package covers them.
- The missing admin journeys are written first and pass on the current release, so the rebuilt screens are proven by tests: editing a video, editing a meta description, a rejected page save, the empty gallery and drag ranking.
- Every group ends with a full run of the API suite and all browser journeys, and every admin screen is screenshotted before and after the rebuild.
- The API validators move to Zod 4 syntax, which arrived in 2.14.
- The config drops its own `supersecret` fallback for the JWT and cookie secrets, as Medusa did in 2.16, so a missing secret fails at start instead of running insecurely. **BREAKING** for any environment without both secrets set.
- The storefront's SDK and types move to 2.21.0 so the renamed HTTP types are caught by the typecheck.
- The storefront's store API reads are verified against the strict allowed-field lists of 2.21 through the browser journeys, with a middleware escape hatch only if a field turns out stripped.
- The migrations of 2.14 to 2.21 run on the development database and, at deploy, on production through the existing predeploy step.

Non-goals:

- Adopting new 2.x features such as the layout composer, global product options in the admin UI, MFA or customer verification. The store stays guest-only.
- Changing what the admin screens do. Same five screens, same URLs, same actions, same data.
- Changing the storefront's queries or pages beyond what the type and field changes force.
- Moving to the monorepo layout `create-medusa-app` now generates.

## Capabilities

### New Capabilities
- `api-platform`: the Medusa release the API runs, the rule that every Medusa package shares it, the rule that admin screens are built from the dashboard's own components, and what an upgrade must leave intact.

### Modified Capabilities
- `content-management`: the admin screens validate both drawers in the form with field errors, and the empty gallery shows the dashboard's empty state.

## Impact

- `api/package.json` and `api/pnpm-lock.yaml`, `api/medusa-config.ts`, `api/.env.test`, `api/src/api/admin/gallery/validators.ts`.
- Every file under `api/src/admin/components/` and `api/src/admin/lib/`; `api/src/admin/components/form.tsx` and `api/src/admin/README.md` deleted.
- `tests/admin.test.ts`, `tests/support/admin-page.ts`, `tests/support/data.ts` and `tests/support/fixtures.ts` for the new journeys and the selectors the dashboard components render.
- `tests/shop.test.ts` and `tests/support/shop-page.ts` for the catalog journeys the field audit needs, and `.claude/rules/tests.md` for what a smoke test is.
- `front/package.json` and `front/pnpm-lock.yaml`, any storefront file the renamed HTTP types touch.
- `api/src/api/middlewares.ts` only if a store field the storefront reads is stripped by 2.21.
- `docs/architecture.md`, the admin screen pattern and the Medusa version.
- Deploy: production migrations for global product options, auth verification tables and float product dimensions, none reversible. A database backup precedes the deploy.
