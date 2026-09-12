## Why

The admin form wrapper in `api/src/admin/components/form.tsx` is a copy of a dashboard internal, because Medusa 2.13.1 does not export it. Medusa 2.21.0 exports `Form` from `@medusajs/dashboard/components`, and the copy should go the moment the export is available. Eight minor releases have also accumulated security fixes and migrations the store is not getting.

## What Changes

- Every `@medusajs/*` package moves from 2.13.1 to 2.21.0 in one step, with `@medusajs/ui` at the version the dashboard pins, because Medusa requires one version across packages.
- The admin drawer imports `Form` from the dashboard and the copied wrapper is deleted. The form libraries stay as dev dependencies at the dashboard's versions, since pnpm does not expose transitive packages.
- The API validators move to Zod 4 syntax, which arrived in 2.14.
- The config drops its own `supersecret` fallback for the JWT and cookie secrets, as Medusa did in 2.16, so a missing secret fails at start instead of running insecurely. **BREAKING** for any environment without both secrets set.
- The storefront's SDK and types move to 2.21.0 so the renamed HTTP types are caught by the typecheck.
- The storefront's store API reads are verified against the strict allowed-field lists of 2.21 through the browser journeys, with a middleware escape hatch only if a field turns out stripped.
- The migrations of 2.14 to 2.21 run on the development database and, at deploy, on production through the existing predeploy step.

Non-goals:

- Adopting new 2.x features such as the layout composer, global product options in the admin UI, MFA or customer verification. The store stays guest-only.
- Changing the storefront's queries or pages beyond what the type and field changes force.
- Moving to the monorepo layout `create-medusa-app` now generates.

## Capabilities

### New Capabilities
- `api-platform`: the Medusa release the API runs, the rule that every Medusa package shares it, and what an upgrade must leave intact.

### Modified Capabilities

## Impact

- `api/package.json` and `api/pnpm-lock.yaml`, `api/medusa-config.ts`, `api/.env.test`, `api/src/api/admin/gallery/validators.ts`, `api/src/admin/components/video-drawer.tsx`, `api/src/admin/components/form.tsx` deleted.
- `front/package.json` and `front/pnpm-lock.yaml`, any storefront file the renamed HTTP types touch.
- `api/src/api/middlewares.ts` only if a store field the storefront reads is stripped by 2.21.
- `docs/architecture.md`, the Medusa version it states.
- Deploy: production migrations for global product options, auth verification tables and float product dimensions, none reversible. A database backup precedes the deploy.
