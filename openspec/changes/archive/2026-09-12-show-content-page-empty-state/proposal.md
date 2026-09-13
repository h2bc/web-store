## Why

A content page whose row is missing answers 404 while the empty gallery renders a message. The footer links to the policy pages from every screen, so a linked page should never 404, and the two kinds of content page should behave the same.

## What Changes

- A content page without a row renders its route label as the heading and a "No content yet" line with HTTP 200, `noindex` and no canonical, like the empty gallery.
- The store API keeps answering 404 for a missing row; only the storefront mapping changes.
- The gallery page is unchanged.
- The architecture doc no longer says a screen without a row answers 404 on the storefront.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `storefront-content-pages`: the "Page without content" scenario renders an empty state instead of 404. The spec lives in the unarchived change `add-admin-content-pages`, so that change archives first and this delta applies to the synced spec.

## Impact

- `front/components/content-page/content-page-view.tsx`, `front/lib/seo.ts`, `front/lib/routes.ts`, the four route files under `front/app/(main)/`.
- `front/tests/content-page.test.ts` (new, the first Vitest file), `front/vitest.config.mts`.
- `docs/architecture.md`.
