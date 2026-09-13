## Context

See proposal.md for the motivation. The API pins Medusa 2.13.1 throughout, with `@medusajs/ui` 4.1.1 and the form libraries added at the 2.13.1 dashboard's versions. The storefront pins `@medusajs/js-sdk` and `@medusajs/types` at 2.10. Node is 24 in the devcontainer and 25 in CI and the image, so the Node floor of 2.19 is already met. There are no admin widgets, no custom Vite config, no search provider, no customer accounts and no MFA, so most of the breaking changes between 2.14 and 2.21 have nothing to hit. The ones that do: Zod 4 in 2.14, HTTP type renames in 2.14, removed default secrets in 2.16, the three-level relation cap in 2.20 and strict allowed store fields in 2.21.

The admin code under `api/src/admin/` is about a thousand lines: five route files, two drawers, a page card, a gallery editor, a ranking modal, a markdown renderer, three fetch helpers and a copy of the dashboard's form wrapper. The dashboard's `@medusajs/dashboard/components` entry exists from 2.16 but exports only the layout composer and a configurable table until 2.20. Release 2.21.0 is the first to export `Form`, `KeyboundForm`, `ActionMenu`, `SectionRow`, `NoRecords` and `DataTable`, which is why the rebuild needs the upgrade.

## Goals / Non-Goals

**Goals:**
- One version bump, one migration run, the copied form wrapper gone.
- Every admin screen built from the dashboard's exported components where one exists, custom code only where none does.
- Every suite green with no assertion weakened, and the admin screens covered by journeys before they are rebuilt.

**Non-Goals:**
- Any feature work. If a new capability of 2.21 looks useful it gets its own change.
- New admin screens, routes or URLs. The five screens keep their paths and actions.

## Decisions

**1. One jump to 2.21.0, every package at once.** Medusa's update guide says all `@medusajs/*` packages share a version and that `db:migrate` applies every pending migration, so nothing is gained by stepping through 2.14, 2.16 and so on. `@medusajs/ui` moves to 4.2.4 because that is what the 2.21.0 dashboard declares, and `@medusajs/draft-order` stays a separate package at 2.21.0. Alternative: stepwise upgrades with a migrate run at each, rejected because the migrations are cumulative and each step would re-run the same suites for no new information.

**2. Admin screens are built from the dashboard's exports.** The page cards render their rows with `SectionRow`, their header menu with `ActionMenu` and their empty state with `NoRecords`. The gallery renders with `DataTable`, passing its heading, sub-heading, the Edit ranking and Create actions, the columns built with the UI kit's column helper, an `ActionMenu` column with Edit and Delete, and an empty state. Both drawers wrap their fields in the dashboard `Form` with `Form.Field`, `Form.Item`, `Form.Label`, `Form.Control` and `Form.ErrorMessage`, inside a `KeyboundForm` so Cmd+Enter submits like every dashboard form. The route files, the `Container` and `Heading` header, the `Drawer`, `FocusModal`, `usePrompt` and `toast` from `@medusajs/ui` stay, because the dashboard itself builds its screens from those. Alternative: keep the screens on `@medusajs/ui` primitives and only swap the form import, rejected because the goal is one source of truth for how a screen looks and behaves, and the primitives leave the layout hand-written.

**3. Drawers stay state-driven.** A drawer opens from component state with the `Drawer` from `@medusajs/ui`, as today. The dashboard also has a drawer that opens at its own URL, but a custom admin route renders a nested path as a separate page, so that drawer cannot sit on top of the gallery or a page card. Alternative: adopt it anyway with nested route files, rejected because it changes URLs, saves no code and needs a rendering path the admin does not give custom routes.

**4. Both drawers validate in the form with Zod.** The video drawer already does. The content page drawer gets a schema matching the API's rules, description 0 to 300 characters and body 1 to 100000, resolved through `@hookform/resolvers`, so a cleared body shows a field error under the body and nothing is posted. The video drawer checks the link shape with its own rule, so a non-YouTube link is a field error too. Each drawer owns its schema and its save mutation, so the field errors and the toasts sit in one component, and an API error shows as a toast from the mutation, as every dashboard form does. This changes the content-management scenario for a rejected save from a toast to a field error. Alternative: keep the page drawer's plain state and toast, rejected because two drawers with two validation patterns is what the rebuild removes.

**5. TanStack Query for admin reads and writes.** Each screen reads with `useQuery` keyed by screen and saves with `useMutation`, which invalidates the query on success and toasts on error. The `loaded` and `saving` flags, the effects and the `useState` copies of server data go. `@tanstack/react-query` is added to `api/package.json` as a dev dependency at exactly 5.64.2, the 2.21.0 dashboard's pin, so pnpm resolves one copy and the hooks find the dashboard's query client. The fetch helpers under `api/src/admin/lib/` stay as the query and mutation functions. Alternative: keep the effects and flags, rejected because every dashboard screen loads through TanStack Query and Medusa's admin customisation docs use it too.

**6. Ranking modal and markdown renderer stay custom.** No Medusa package exports a sortable list or a markdown renderer, and the dashboard's own category ranking tree is not exported. Alternative: drop drag ranking for up and down buttons, rejected because it would change what the owner does for no reuse gain.

**7. `Form` from `@medusajs/dashboard/components`, libraries kept as direct dev dependencies.** `api/src/admin/components/form.tsx` is deleted. `react-hook-form`, `zod` and `@hookform/resolvers` stay in `api/package.json` at the versions the 2.21.0 dashboard pins, 7.83.0, 4.2.0 and 5.5.7, because pnpm does not expose a dependency's dependencies and the drawers import all three themselves. `radix-ui` goes, only the copy used it. Alternative: a `public-hoist-pattern` in `.npmrc` so the transitive packages resolve, rejected because it hides which packages the admin code actually depends on.

**8. Zod 4 syntax in the API validators, still through `@medusajs/framework/zod`.** The gallery validator's custom issue uses the string code `"custom"` and keeps `z.NEVER`, which Zod 4 still exports. The admin drawer's schema already runs on the dashboard's Zod. Alternative: pinning the API's own `zod` 3 next to the framework's, rejected because two Zod majors in one bundle is exactly the mess the framework re-export exists to avoid.

**9. Drop the `supersecret` fallback.** `api/medusa-config.ts` reads `JWT_SECRET` and `COOKIE_SECRET` with no default, matching what Medusa did in 2.16. `api/.env.test` gains both so the integration runner and the admin JWT helper keep working, `api/.env.example` already lists them, and CI sets them. Alternative: keep our own fallback since it is ours and not the framework's, rejected because a store that silently signs sessions with a public string is the failure the removal was meant to prevent.

**10. Storefront types move with the API.** `@medusajs/js-sdk` and `@medusajs/types` go to 2.21.0 so the renamed HTTP types of 2.14 fail the typecheck instead of drifting. Alternative: leave the storefront at 2.10 since the SDK is backward compatible at runtime, rejected because the type renames are the cheapest signal of what the responses now look like.

**11. Strict fields are proven by the journeys, patched on the API.** The storefront asks for variants with calculated prices, options and inventory quantities, images with URLs, categories with names, and cart shipping method names, all two levels deep and all standard. The shop, product, cart and checkout journeys are the check, since a stripped field fails silently. If one is missing because 2.21 wants another query syntax, such as `+variants.inventory_quantity` for the computed stock or `*categories` for the relation, the fix is that syntax in the storefront's `fields` string. If one is disallowed outright, the fix is `allowFields` middleware for that route in `api/src/api/middlewares.ts`, the escape hatch Medusa documents. Never a storefront page showing less. Alternative: reading the allowed lists in the Medusa source for each route, rejected because the journeys already exercise every field the storefront renders.

**12. Journeys first, then the rebuild, then everything again.** The admin journeys today cover the sidebar, a rejected video link, adding and deleting a video and rewriting a page body. Editing a video, editing a meta description, a rejected page save, the empty gallery and drag ranking are added and pass on 2.13.1 before any screen is rebuilt, so a regression in the rebuild shows as a red journey. Every group ends with the API suite and the full Playwright run, not only the admin project, and every admin screen is screenshotted before and after the rebuild for a side by side check. Alternative: rely on the four existing journeys and a manual click-through, rejected because the rebuild touches every screen and the click-through would be repeated at every fix.

## Risks / Trade-offs

- Production migrations are irreversible, global product options rewrite catalog data. Mitigation: a database backup right before the deploy, and the shop and a product page opened after it.
- A store field silently stripped in a path no journey renders. Mitigation: the field audit lists every `fields` string in `front/lib/data/` against what the journeys assert.
- Two copies of TanStack Query would make the hooks throw for a missing query client. Mitigation: the exact dashboard pin, and `pnpm --dir api why @tanstack/react-query` showing one resolved version.
- The dashboard's `DataTable` and `ActionMenu` render different roles and labels than the hand-written table. Mitigation: the page object's locators change, the journeys' assertions do not.
- The dashboard changed its chrome between 2.13 and 2.21, layout composer included. Mitigation: custom routes are unaffected by the composer; the admin journeys confirm the sidebar, drawer and toasts still read the same.
- The page card's empty state has no journey because no endpoint removes a content row. Mitigation: it is checked by eye on a fresh database in the screenshot step.
- The 2.21 dashboard build under Vite 7 fails in the image. Mitigation: `pnpm --dir api build` runs locally before the pull request, the same command the Dockerfile runs.

## Migration Plan

1. Branch from `main`.
2. Write the missing admin journeys and see them pass on 2.13.1.
3. Bump, install, fix types and validators, run `pnpm migrate` on the development database, run every suite.
4. Rebuild the admin screens on the dashboard's components, run every suite, compare the screenshots.
5. Two commits on the branch: the upgrade, then the rebuild, so each can be read and reverted alone.
6. Merge. The deploy job builds the images; the predeploy step runs `medusa db:migrate` against production.
7. Rollback: restore the database backup and redeploy the previous image tag. The two are done together, since the old code cannot read the migrated schema.
