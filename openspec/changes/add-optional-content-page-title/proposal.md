## Why

Every content page shows its route label as the H1, so the owner cannot give a page a heading of their own or leave it without one. The tab title and the menu keep the label; the heading on the page is the owner's.

## What Changes

- The content page row gets an optional `title`, nullable, that the owner sets or clears in the admin.
- The store and admin endpoints return `title` as a string or null, and the admin endpoint accepts it as an optional string of at most 120 characters.
- The admin drawer gains a Title field above the meta description, empty allowed, and the card shows a Title row with a dash when empty.
- The storefront renders the page title as the H1 only when it is set; a page without a title starts at the body, with no fallback heading.
- The document title stays the route label in the storefront, so the tab and the menu always agree, and the meta description stays the row's description.
- The seed writes each page's route label as its title so development and CI pages keep a heading.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-management`: a content page has an optional title; the store, admin and admin screen requirements carry it. The spec lives in the unarchived change `add-admin-content-pages` and is modified again by `drop-content-page-title`, so those archive first and this delta applies to the synced spec.
- `storefront-content-pages`: a content page shows its own title as the heading only when set, and keeps the route label as the document title. Same archive order.

## Impact

- `api/src/modules/content-page/` (model, a migration adding the nullable column), `api/src/workflows/save-content-page.ts`, `api/src/api/utils/validators.ts`, `api/src/scripts/seed/content-pages.ts`, `api/src/admin/lib/content-page.ts`, `api/src/admin/components/content-page-card.tsx`, `api/src/admin/components/content-page-drawer.tsx`.
- `front/lib/types/content-page.ts`, `front/lib/data/content-page.ts`, `front/components/content-page/content-page-view.tsx`.
- `api/tests/content-page.test.ts`, `api/tests/support/data.ts`, `front/tests/content-page.test.ts`, `front/tests/support/data.ts`, `tests/admin.test.ts`, `tests/support/admin-page.ts`, `tests/support/data.ts`.
- `docs/architecture.md`.
