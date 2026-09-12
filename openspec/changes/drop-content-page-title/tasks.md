## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Fixed set of content pages | 1.1, 1.2 |
| Store endpoint returns one page | 1.1, 1.2 |
| Admin saves a page | 1.1, 1.2 |
| Content screens in the admin sidebar | 1.3 |
| Content pages render admin-managed markdown | 2.1, 2.2 |

## 1. API: drop the title

- [x] 1.1 In `api/tests/support/data.ts` drop `title` from `ABOUT`; in `api/tests/content-page.test.ts` assert the seeded privacy page by `slug` and a `description` string, and make the resave test post a new `body` and assert it; verify `pnpm test:api` fails because the validator rejects a post without a title.
- [x] 1.2 Remove `title` from the model in `api/src/modules/content-page/models/content-page.ts`, the service item, `save-content-page.ts` input and compensation, `AdminSaveContentPage` in `api/src/api/utils/validators.ts` and the seed; generate the migration with `pnpm --filter api exec medusa db:generate contentPage` or write it by hand so `up` drops the column and `down` adds it back as `text not null default ''`; verify `pnpm typecheck:api` and `pnpm test:api` pass.
- [x] 1.3 In `api/src/admin/lib/content-page.ts` drop `title` from `ContentPageInput`; in `content-page-card.tsx` remove the title row, show `label` in the header and drop `title` from `EMPTY` and the memoised input; in `content-page-drawer.tsx` remove the title field and update the drawer description; verify `pnpm typecheck:api` and `pnpm lint:api` pass and, with the API up, a Playwright MCP screenshot of `/app/about` under `.tmp/` shows the card without a title row, or the report says no page was loaded.

## 2. Storefront: route label as the heading

- [x] 2.1 In `front/tests/content-page.test.ts` add a test at the unit level: `contentPageMetadata` with a page returns the route label as the title, the page's description and the canonical; and `ContentPageView` with the read mocked to a page renders the route label as the level-1 heading; verify `pnpm test:front` fails because the helper returns the page title.
- [x] 2.2 Drop `title` from `front/lib/types/content-page.ts` and the mapping in `front/lib/data/content-page.ts`; make `contentPageMetadata` in `front/lib/seo.ts` return `route.label` as the title in both branches; make `content-page-view.tsx` render `route.label` unconditionally; verify `pnpm typecheck:front` and `pnpm test:front` pass and, with both apps up, a Playwright MCP screenshot of `/terms` under `.tmp/` shows the heading, or the report says no page was loaded.

## 3. Docs

- [x] 3.1 In `docs/architecture.md` say the content page row holds a description and a body and the route label is the heading and document title; verify the SEO section still matches.

## 4. Checks

- [x] 4.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:api` and `pnpm test:front`; verify all green.

## Review findings

None.
