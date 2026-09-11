## Why

The footer links to `/privacy` and `/terms`, which do not exist, and the about page is lorem ipsum. The shop cannot go live without the legal pages, and the policies, the about text and the gallery are the owner's content: they change without a developer, so they belong in the Medusa admin next to the catalog instead of in React source.

## What Changes

- A `content` module on the API with two tables: a fixed set of markdown pages (`privacy`, `terms`, `shipping-returns`, `about`) and an ordered list of gallery videos.
- Default page content in the API, adapted from the Surf Sky policies for a Lithuanian non-VAT sole trader (individuali veikla) selling to Lithuania and the EU: 14-day withdrawal, customer-paid returns, Lithuanian law, VVTAT and the EU ODR platform, VDAI as supervisory authority, Stripe, Resend, the file host and LP Express as processors, and one httpOnly cart cookie. A page that has never been saved renders its default.
- A **Content** group in the admin sidebar with one screen per page (title, meta description, markdown body, save) and a **Gallery** screen (add by YouTube URL, remove, move up and down).
- Store endpoints that return one page by slug and the ordered video list, and admin endpoints that save a page and manage the videos, all writes through workflows.
- Storefront pages for the four slugs and the gallery reading through the cached data layer, rendering markdown with the existing renderer, degrading with `noindex` when the API is unreachable. `/privacy` and `/terms` join the sitemap and the public path list.
- A line under the checkout's Place order button stating that placing the order accepts the Terms & Conditions and the Privacy Policy, linking both.
- Seeded gallery videos for development and CI, an API integration test, an end-to-end test, and the architecture doc updated.

Non-goals:

- Creating or deleting pages, or a rich text editor. Markdown in a textarea, like product descriptions.
- Localisation, page versioning, image uploads, or a revalidation webhook. Edits appear within the existing 60-second cache window.
- Moving the shipping thresholds shown in the cart alert out of code.

## Capabilities

### New Capabilities
- `content-management`: the fixed page set with defaults, the gallery video list, the admin screens that edit them, and the store and admin endpoints.
- `storefront-content-pages`: the four content pages and the gallery on the storefront, their metadata, their degraded state, and the footer links to them.

### Modified Capabilities
- `storefront-seo`: the sitemap and public path list gain `/privacy` and `/terms`.
- `storefront-checkout`: the payment step states that placing the order accepts the terms and the privacy policy.

## Impact

- `api/src/modules/content/` (new: models, service, migration, defaults), `api/src/workflows/` (save page, add, remove, reorder gallery videos), `api/src/api/store/pages/`, `api/src/api/store/gallery/`, `api/src/api/admin/pages/`, `api/src/api/admin/gallery/`, `api/src/api/middlewares.ts`, `api/src/admin/routes/content/`, `api/medusa-config.ts`, `api/src/scripts/seed.ts`, `api/package.json` (adds `@medusajs/ui`, `@medusajs/icons`, `@medusajs/js-sdk` for the admin screens).
- `front/lib/data/content.ts` (new), `front/lib/routes.ts`, `front/components/content/` (new), `front/app/(main)/privacy/`, `front/app/(main)/terms/`, `front/app/(main)/shipping-returns/`, `front/app/(main)/about/`, `front/app/(main)/gallery/`, `front/components/layout/footer/footer-bar.tsx`, `front/components/checkout/payment-step.tsx`.
- `api/integration/http/content.test.ts`, `e2e/content.test.ts`, `e2e/seo.test.ts`, `docs/architecture.md`.
- Deploy: the migration runs through the existing predeploy step. The owner fills in the seller identity block on the live admin after the first deploy.
