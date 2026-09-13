## Why

The footer links to `/privacy` and `/terms`, which do not exist, and the about page is lorem ipsum. The shop cannot go live without the legal pages, and the policies, the about text and the gallery are the owner's content: they change without a developer, so they belong in the Medusa admin next to the catalog instead of in React source.

## What Changes

- A `content_page` module and a `gallery` module on the API: a fixed set of markdown pages (`privacy`, `terms`, `shipping-returns`, `about`) and an ordered list of gallery videos.
- Lorem ipsum seed text for each screen in development and CI; the owner writes the real pages in the admin. No page text lives in application source.
- Five top-level admin sidebar items: one screen per page (a read card with the title, meta description and rendered body, and an edit drawer) and a **Gallery** screen laid out like the dashboard's Categories page (create and edit in a drawer, delete from the row menu, an Edit ranking modal with drag rows).
- Store endpoints that return one page by slug and the ordered video list, and admin endpoints that save a page and save the video list, all writes through workflows.
- Storefront pages for the four slugs and the gallery reading through the cached data layer, rendering markdown with the existing renderer, degrading with `noindex` when the API is unreachable. `/privacy` and `/terms` join the sitemap and the public path list.
- A line under the checkout's Place order button stating that placing the order accepts the Terms & Conditions and the Privacy Policy, linking both.
- Seeded gallery videos for development and CI, an API integration test, an end-to-end test, and the architecture doc updated.

Non-goals:

- Creating or deleting pages, or a rich text editor. Markdown in a textarea, like product descriptions.
- Localisation, page versioning, image uploads, or a revalidation webhook. Edits appear within the existing 60-second cache window.
- Moving the shipping thresholds shown in the cart alert out of code.

## Capabilities

### New Capabilities
- `content-management`: the fixed page set, the gallery video list, the admin screens that edit them, and the store and admin endpoints.
- `storefront-content-pages`: the four content pages and the gallery on the storefront, their metadata, their degraded state, and the footer links to them.

### Modified Capabilities
- `storefront-seo`: the sitemap and public path list gain `/privacy` and `/terms`.
- `storefront-checkout`: the payment step states that placing the order accepts the terms and the privacy policy.

## Impact

- `api/src/modules/content-page/` and `api/src/modules/gallery/` (new: models, services, migrations), `api/src/workflows/` (save page, save gallery), `api/src/api/store/<slug>/` and `api/src/api/admin/<slug>/` for the four slugs and the gallery, `api/src/api/middlewares.ts`, `api/src/admin/routes/`, `api/medusa-config.ts`, `api/src/scripts/seed.ts` and `api/src/scripts/seed/`, `api/package.json` (adds `@medusajs/ui`, `@medusajs/icons`, `@medusajs/js-sdk`, the `@dnd-kit` packages, `react-hook-form`, `@hookform/resolvers`, `zod` and `radix-ui` for the admin screens).
- `front/lib/data/content-page.ts` (new), `front/lib/routes.ts`, `front/components/content-page/` (new), `front/app/(main)/privacy/`, `front/app/(main)/terms/`, `front/app/(main)/shipping-returns/`, `front/app/(main)/about/`, `front/app/(main)/gallery/`, `front/components/layout/footer/footer-bar.tsx`, `front/components/checkout/payment-step.tsx`.
- `api/tests/content.test.ts`, `tests/content.test.ts`, `tests/admin.test.ts`, `tests/seo.test.ts`, `docs/architecture.md`.
- Deploy: the migration runs through the existing predeploy step. The owner fills in the seller identity block on the live admin after the first deploy.
