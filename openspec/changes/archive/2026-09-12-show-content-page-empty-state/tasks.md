## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Content pages render admin-managed markdown | 1.1, 1.2, 1.3 |

## 1. Storefront: empty state for a page without content

- [x] 1.1 Create `front/tests/content-page.test.ts` at the unit level: `contentPageMetadata` with a null page returns the route label as the title, `noindex` and no canonical; `ContentPageView` with the read mocked to a null page and no error renders the route label as the level-1 heading and no alert. Set `esbuild: { jsx: 'automatic' }` in `front/vitest.config.mts`. Run `pnpm test:front`; verify both tests fail because the view calls `notFound()` and the helper returns no title.
- [x] 1.2 Add `getContentPageRoute(slug)` to `front/lib/routes.ts`; change `contentPageMetadata` in `front/lib/seo.ts` to take the route and return `{ title: route.label, robots: { index: false } }` for a null page; make the four route files under `front/app/(main)/` hold one `ROUTE` constant, drop `notFound()` from `generateMetadata` and pass the route to the view; remove the `notFound` field from `front/lib/data/content-page.ts`; verify `pnpm typecheck:front` passes.
- [x] 1.3 In `front/components/content-page/content-page-view.tsx` render the route label as the heading and a muted "No content yet" line when the page is null without an error, remove the `next/navigation` import; verify `pnpm test:front` passes and, with both apps up, a Playwright MCP screenshot of `/terms` under `.tmp/` shows the seeded page unchanged, or the report says no page was loaded.

## 2. Docs

- [x] 2.1 In `docs/architecture.md` change the admin-owned data line to say the API answers 404 for a screen without a row and the storefront shows an empty state; verify the SEO section still matches the degraded-state line.

## 3. Checks

- [x] 3.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:api` and `pnpm test:front`; verify all green.

## Review findings

None.
