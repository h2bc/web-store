## Why

The content page row carries a title the storefront only uses as the H1 and the document title, and both already fall back to the route label, which is the same text. An owner who edits it gets a heading that no longer matches the menu.

## What Changes

- **BREAKING** The `title` column leaves the content page row. The store and admin endpoints return and accept `slug`, `description`, `body` and `updated_at`.
- The admin card and drawer drop the title field and show the screen's label in the header.
- The seed writes only a description and a body.
- The storefront H1 and document title come from the route label in `front/lib/routes.ts` for every content page, with or without a row.
- A migration drops the column.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-management`: a content page has a description and a body, no title; the store, admin and admin screen requirements lose the title. The spec lives in the unarchived change `add-admin-content-pages`, so that change archives first and this delta applies to the synced spec.
- `storefront-content-pages`: a content page shows its route label as the heading and document title. Same archive order, after `show-content-page-empty-state`.

## Impact

- `api/src/modules/content-page/`, `api/src/workflows/save-content-page.ts`, `api/src/api/utils/validators.ts`, `api/src/scripts/seed/content-pages.ts`, `api/src/admin/components/content-page-*.tsx`, `api/src/admin/lib/content-page.ts`.
- `front/lib/types/content-page.ts`, `front/lib/data/content-page.ts`, `front/lib/seo.ts`, `front/components/content-page/content-page-view.tsx`.
- `api/tests/content-page.test.ts`, `api/tests/support/data.ts`, `front/tests/content-page.test.ts`.
- `docs/architecture.md`.
