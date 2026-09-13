## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Fixed set of content pages | 1.1, 1.2 |
| Store endpoint returns one page | 1.1, 1.2 |
| Admin saves a page | 1.1, 1.2 |
| Content screens in the admin sidebar | 1.3, 3.1 |
| Content pages render admin-managed markdown | 2.1, 2.2 |

## 1. API: the optional title

- [x] 1.1 In `api/tests/support/data.ts` give `ABOUT` a `title` and add `ABOUT_UNTITLED` with an empty title; in `api/tests/content-page.test.ts`, integration level, assert the seeded privacy page returns a string `title`, the first save returns the posted title, and a save with an empty title returns `title` null from `GET /store/about`; verify `pnpm test:api` fails because the validator rejects the unknown field.
- [x] 1.2 Add `title: model.text().nullable()` to `api/src/modules/content-page/models/content-page.ts`, a migration under `api/src/modules/content-page/migrations/` whose `up` adds `title text null` and `down` drops it, `title` in the service item, the `save-content-page.ts` input and compensation storing an empty or missing title as null, `title: z.string().max(120).optional()` in `AdminSaveContentPage`, and a slug-to-label map in the seed writing the label as the title; verify `pnpm typecheck:api` and `pnpm test:api` pass.
- [x] 1.3 In `api/src/admin/lib/content-page.ts` add `title: string` to `ContentPageInput` and `title: string | null` to `ContentPage`; in `content-page-card.tsx` add a Title row showing a dash when null and map the null to an empty input; in `content-page-drawer.tsx` add an `Input` labelled Title above the meta description and update the drawer description; verify `pnpm typecheck:api` and `pnpm lint:api` pass and, with the API up, a Playwright MCP screenshot of `/app/about` under `.tmp/` shows the Title row, or the report says no page was loaded.

## 2. Storefront: the H1 only when set

- [x] 2.1 In `front/tests/support/data.ts` give `TERMS` a `title` and add `TERMS_UNTITLED` with `title: null`; in `front/tests/content-page.test.ts`, unit level, assert a page with a title renders it as the level-1 heading, a page without one renders no level-1 heading, a page without content renders no level-1 heading, and `contentPageMetadata` still returns the route label as the title; verify `pnpm test:front` fails because the view renders the route label.
- [x] 2.2 Add `title: string | null` to `front/lib/types/content-page.ts` and map it in `front/lib/data/content-page.ts`; make `content-page-view.tsx` render the `Heading` only when `contentPage?.title` is set; verify `pnpm typecheck:front` and `pnpm test:front` pass and, with both apps up, a Playwright MCP screenshot of `/about` under `.tmp/` shows the seeded heading, or the report says no page was loaded.

## 3. End to end: the owner clears and restores the title

- [x] 3.1 In `tests/support/admin-page.ts` add `getTitleDraft`, `editPageTitle` and `getTitleRow` using the Title label and row; in `tests/admin.test.ts` add a journey where the owner clears the About title, sees a dash in the Title row, then saves the original title again; verify with both apps up that `pnpm exec playwright test --project admin --no-deps` passes.

## 4. Docs

- [x] 4.1 In `docs/architecture.md` say the row holds an optional title shown as the storefront H1 when set, and that the document title stays the route label; verify `grep -n "title" docs/architecture.md` reads consistently.

## 5. Checks

- [x] 5.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:api` and `pnpm test:front`; verify all green.

## Review findings

None.
