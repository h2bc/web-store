## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Fixed set of content pages | 1.2, 1.3, 1.4, 3.1, 3.2, 5.1 |
| Store endpoint returns one page | 3.1, 5.1 |
| Admin saves a page | 2.1, 3.2, 3.3, 5.1 |
| Gallery video list | 1.2, 3.1, 5.1 |
| Admin manages gallery videos | 2.2, 3.3, 3.4, 5.1 |
| Content screens in the admin sidebar | 4.1, 4.2, 4.3, 4.4 |
| Content pages render admin-managed markdown | 6.1, 6.2, 6.3, 8.1 |
| Gallery renders the admin-managed video list | 6.1, 6.4, 8.1 |
| Content pages degrade when the API is unreachable | 6.1, 6.2, 6.3, 8.1 |
| Footer links to the policy pages | 7.1, 7.2, 8.1 |
| Sitemap lists public pages and products | 7.1, 8.2 |
| Payment step states acceptance of the terms | 7.3, 8.1 |

## 1. API: content and gallery modules

- [x] 1.1 Add `@medusajs/ui@4.1.1`, `@medusajs/icons@2.13.1`, `@medusajs/js-sdk@2.13.1`, `@dnd-kit/core@6.3.1`, `@dnd-kit/sortable@8.0.0` and `@dnd-kit/utilities@3.2.2` to `api/` devDependencies with `pnpm --dir api add -D`; verify `pnpm install:api` succeeds and the lockfile lists all three.
- [x] 1.2 Create `api/src/modules/content-page/` with `models/content-page.ts` (`id`, unique `slug`, `title`, `description`, `body` text), `service.ts` extending `MedusaService({ ContentPage })` and `index.ts` exporting `CONTENT_PAGE_MODULE = "content_page"`; create `api/src/modules/gallery/` with `models/gallery-item.ts` (`id`, `url`, `title`, `rank` number), `youtube.ts`, `service.ts` extending `MedusaService({ GalleryItem })` and `index.ts` exporting `GALLERY_MODULE = "gallery"`; register both in `api/medusa-config.ts`; verify `pnpm typecheck:api` passes.
- [x] 1.3 Create `api/src/modules/content-page/types.ts` with `CONTENT_PAGE_SLUGS` and `ContentPageSlug`, and add `getContentPage(slug)` to the service that returns the stored row or null; add `@faker-js/faker` to `api/` devDependencies, and create `api/src/scripts/seed/content-pages.ts` that inserts the missing rows with the screen's title and lorem ipsum description and body whose headings start at `##`; verify `pnpm typecheck:api` passes.
- [x] 1.4 Generate the migrations with `pnpm --dir api exec medusa db:generate content_page gallery` and run `pnpm migrate`; verify the `content_page` and `gallery_item` tables exist in the development database.

## 2. API: workflows

- [x] 2.1 Create `api/src/workflows/save-content-page.ts` with one step that upserts the row by slug and compensates by restoring the previous row or deleting the created one; verify `pnpm typecheck:api` passes.
- [x] 2.2 Create `api/src/workflows/save-gallery.ts` with one step that deletes the stored videos, inserts the posted ones with `rank = index`, and compensates by deleting the inserted rows and restoring the previous ones; verify `pnpm typecheck:api` passes.

## 3. API: routes and validation

- [x] 3.1 Create `api/src/api/store/<slug>/route.ts` for each of the four slugs (`GET` resolving the content page service and returning `{ content_page }` from `retrieveBySlug`, which throws `MedusaError` `NOT_FOUND` for a screen without a row) and `api/src/api/store/gallery/route.ts` (`GET`, `{ videos }` ordered by rank); verify `curl` with the publishable key returns the seeded privacy text and an empty video list.
- [x] 3.2 Create `api/src/api/admin/<slug>/route.ts` for each of the four slugs with `GET` returning `{ content_page }` or 404 and `POST` running `saveContentPageWorkflow`, which creates or replaces the row, and returning the saved row; verify `pnpm typecheck:api` passes.
- [x] 3.3 Create `api/src/api/utils/validators.ts` with `AdminSaveContentPage` (title 1–120, description 0–300, body 1–100000) and `api/src/api/admin/gallery/validators.ts` (`videos`: at most 100 entries of `title` 1–120 and `url` transformed by `modules/content/youtube.ts` into the embed URL from a `watch?v=`, `youtu.be/`, `shorts/` or `embed/` link, else a validation error naming `url`), and add `validateAndTransformBody` entries for the two POST routes to `api/src/api/middlewares.ts`, creating the file if the contact change has not; verify `pnpm typecheck:api` passes.
- [x] 3.4 Create `api/src/api/admin/gallery/route.ts` (`GET`, `POST` running `saveGalleryWorkflow` and returning the saved list); verify `pnpm typecheck:api` passes and a logged-in `curl` can replace the list.

## 4. API: admin screens

- [x] 4.1 Create `api/src/admin/lib/sdk.ts` exporting a `Medusa` instance with `baseUrl` from `__BACKEND_URL__` and `auth: { type: "session" }`, and declare `__BACKEND_URL__` in `api/src/admin/vite-env.d.ts`; verify `pnpm typecheck:api` passes.
- [x] 4.2 Create `api/src/admin/components/content-page-card.tsx` taking `slug` and `label`: loads `GET /admin/<slug>`, treats 404 as no content, and renders the record layout with the header, a `DropdownMenu` with Edit, and rows for title, meta description and the body through `components/markdown.tsx`, or an empty state; `components/content-drawer.tsx` is the edit `Drawer` with `Input` for title and `Textarea` for description and body, Cancel and Save, toasting success or the error message and keeping entered values on failure; add `react-markdown` to `api/` devDependencies and typecheck the admin with `src/admin/tsconfig.json`; verify a save on `/app/privacy` persists after reload.
- [x] 4.3 Create `api/src/admin/routes/privacy/page.tsx`, `terms/page.tsx`, `shipping-returns/page.tsx` and `about/page.tsx`, each exporting `defineRouteConfig` with its label, an icon and a `rank` in that order and rendering `PageEditor`; verify the four entries appear in the sidebar of `pnpm dev:api` in that order.
- [x] 4.4 Create `api/src/admin/components/gallery-editor.tsx` and `api/src/admin/routes/gallery/page.tsx` (label Gallery, an icon, first rank): the Categories page layout: a header with `Heading`, subtitle and small secondary Edit ranking and Create buttons, a `Table` of videos in order with title, id and a row `DropdownMenu` with Edit and Delete; Create and Edit open `components/video-drawer.tsx`, a `Drawer` whose form is `react-hook-form` with `zodResolver` inside `components/form.tsx`, the dashboard's `Form` wrapper copied over, with a link field checked by `isYoutubeLink` and a title field, each showing its error under the input; Delete confirms with `usePrompt`; Edit ranking opens `components/ranking-modal.tsx`, a `FocusModal` with one drag row per video on `@dnd-kit/sortable` that saves on every drop; every action posts the whole list through `lib/gallery.ts` and toasts; verify creating `https://youtu.be/srRVUe4_wW4`, editing its title, dragging it to the top in Edit ranking and deleting it works in the browser and shows in `GET /store/gallery`.

## 5. API: seed and tests

- [x] 5.1 Create `api/tests/content.test.ts` with `medusaIntegrationTestRunner`, a publishable key for store calls, and an admin JWT from a user created through the user and auth modules, covering: seeded privacy page from the store route after `seedPages` runs; page without content 404; unknown slug 404; admin POST creates and the store route returns the new content; a second POST replaces it; empty body 400 naming `body`; unauthenticated POST 401; empty gallery; a save with a `youtu.be` link stores the id in the posted order; vimeo URL 400 naming `url` and nothing changes; a reversed save reverses the store order; a save without one video removes it; unauthenticated gallery save 401; verify `pnpm test:api` passes.
- [x] 5.2 Make `api/src/scripts/seed.ts` an orchestrator over `src/scripts/seed/store.ts`, `products.ts`, `content-pages.ts` and `gallery.ts`, each runnable alone with `medusa exec`, and have `gallery.ts` add the three current gallery videos (`srRVUe4_wW4` verkei?, `C8Hkml0CRmo` meduza, `qI8fDbBXW2s` 2DRIP) through the gallery service in that order; verify `pnpm --dir api seed` on a fresh database and `GET /store/privacy` and `GET /store/gallery` return them.

## 6. Storefront: data layer and pages

- [x] 6.1 Create `front/lib/data/content-page.ts` (`server-only`) with `getContentPage(slug)` returning `{ contentPage, error, notFound }` and `getGalleryVideos()` returning `{ videos, error }` through `sdk.client.fetch`, `cached` with keys `['content', slug]` and `['gallery']`, tags `content-<slug>` and `gallery`, the 60-second revalidate, React `cache()`, logging and returning the error without throwing; add `Content` and `GalleryVideo` types under `front/lib/types/`; verify `pnpm typecheck:front` passes.
- [x] 6.2 Add `CONTENT_PAGES` to `front/lib/routes.ts` (`{ slug, path, label }` for privacy, shipping-returns, terms, about), derive `PUBLIC_PATHS` from it, and add `contentPageMetadata(contentPage, path)` to `front/lib/seo.ts` returning title, description and canonical, or `robots: { index: false }` without a canonical when `page` is null; verify `pnpm typecheck:front` passes.
- [x] 6.3 Create `front/components/content-page/content-page-view.tsx` rendering the blackletter `Heading` and `<ReactMarkdown>` in `prose max-w-none`, or `ErrorAlert` when the read failed, then replace `front/app/(main)/about/page.tsx` and `shipping-returns/page.tsx` and create `privacy/page.tsx` and `terms/page.tsx`, each with `generateMetadata` from `contentPageMetadata` and the component; verify the four routes render their seeded titles and bodies and `/privacy` has one canonical.
- [x] 6.4 Rewrite `front/app/(main)/gallery/page.tsx` to read `getGalleryVideos`, frame each video's `url` as is, show "No videos yet" for an empty list and `ErrorAlert` with `noindex` on error; verify the three seeded players render in order.

## 7. Storefront: footer, sitemap and checkout

- [x] 7.1 Build the footer links in `front/components/layout/footer/footer-bar.tsx` from the three policy entries of `CONTENT_PAGES`; verify the footer still shows Privacy Policy, Shipping & Returns and Terms & Conditions and each opens its page.
- [x] 7.2 Confirm `front/app/sitemap.ts` needs no change beyond the derived `PUBLIC_PATHS`; verify `/sitemap.xml` lists `/privacy` and `/terms`.
- [x] 7.3 Change the note under the Place order button in `front/components/checkout/payment-step.tsx` to "By placing your order you accept the Terms & Conditions and the Privacy Policy. Your card is charged only when the order is placed." with both names as `Link`s to `/terms` and `/privacy` opening in a new tab; verify the line renders on the payment step.

## 8. End-to-end tests and docs

- [x] 8.1 Create `tests/content.test.ts`: each of the four pages shows its seeded heading and at least one `h2` in the body; `/gallery` shows three iframes whose first `src` contains `srRVUe4_wW4`; the Terms & Conditions footer link on `/cart` opens `/terms`; the payment step shows the consent line with both links, reached as in `checkout.test.ts`; verify `pnpm exec playwright test tests/content.test.ts` passes locally.
- [x] 8.2 Add `/privacy` and `/terms` to the path list in `tests/seo.test.ts`; verify `pnpm exec playwright test tests/seo.test.ts` passes locally.
- [x] 8.4 Create `tests/admin.test.ts` with `tests/support/admin-page.ts` and an `admin` fixture: the owner logs in as `admin@h2bc.local`, sees the five content screens in the sidebar, is shown the field error for a Vimeo link, adds a video that lands last in the table and deletes it, and rewrites the About body shown on the screen and resets it; the root tests hold no publishable key, what reaches shoppers is covered by `api/tests/content.test.ts`; the `admin` Playwright project runs after the `storefront` project so the edits never race the storefront journeys; the seed creates that user; verify `pnpm exec playwright test --project admin --no-deps` passes locally.
- [x] 8.3 Update `docs/architecture.md`: the content page module under extension points, a line for admin screens under `api/src/admin/routes/`, `content.ts` in the data layer list, the `content-<slug>` and `gallery` tags under caching, and the content pages under SEO; verify the doc describes every new path.

## 9. Verification

- [x] 9.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.

## 10. Outside this repo

- [ ] 10.1 After this branch's PR merges and deploys, in the live admin add the three gallery videos and write the privacy, terms, shipping and about pages, each policy with the seller identity block; verify the four live pages answer 200.
