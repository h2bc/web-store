## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Fixed set of content pages with defaults | 1.2, 1.3, 1.4, 3.1, 3.2, 5.1 |
| Store endpoint returns one page | 3.1, 5.1 |
| Admin saves a page | 2.1, 3.2, 3.3, 5.1 |
| Gallery video list | 1.2, 3.1, 5.1 |
| Admin manages gallery videos | 2.2, 2.3, 2.4, 3.3, 3.4, 5.1 |
| Content group in the admin sidebar | 4.1, 4.2, 4.3, 4.4 |
| Content pages render admin-managed markdown | 6.1, 6.2, 6.3, 8.1 |
| Gallery renders the admin-managed video list | 6.1, 6.4, 8.1 |
| Content pages degrade when the API is unreachable | 6.1, 6.2, 6.3, 8.1 |
| Footer links to the policy pages | 7.1, 7.2, 8.1 |
| Sitemap lists public pages and products | 7.1, 8.2 |
| Payment step states acceptance of the terms | 7.3, 8.1 |

## 1. API: content module

- [ ] 1.1 Add `@medusajs/ui@4.1.1`, `@medusajs/icons@2.13.1` and `@medusajs/js-sdk@2.13.1` to `api/` devDependencies with `pnpm --dir api add -D`; verify `pnpm install:api` succeeds and the lockfile lists all three.
- [ ] 1.2 Create `api/src/modules/content/` with `models/page.ts` (`id`, unique `slug`, `title`, `description`, `body` text), `models/gallery-video.ts` (`id`, `youtube_id`, `title`, `rank` number), `service.ts` extending `MedusaService({ Page, GalleryVideo })`, and `index.ts` exporting `CONTENT_MODULE = "content"` with `Module(CONTENT_MODULE, { service })`; register it in `api/medusa-config.ts`; verify `pnpm typecheck:api` passes.
- [ ] 1.3 Create `api/src/modules/content/defaults/pages.ts` with `PAGE_SLUGS`, `PageSlug`, and a map of slug to `{ title, description }`, and add `getPage(slug)` to the service that returns the stored row or `{ slug, title, description, body, updated_at: null, is_default: true }` from the matching `defaults/<slug>.md` read once at module load; verify `pnpm typecheck:api` passes.
- [ ] 1.4 Generate the migration with `pnpm --dir api exec medusa db:generate content` and run `pnpm migrate`; verify the `page` and `gallery_video` tables exist in the development database.

## 2. API: workflows

- [ ] 2.1 Create `api/src/workflows/save-page.ts` with one step that upserts the page by slug and compensates by restoring the previous row or deleting the created one; verify `pnpm typecheck:api` passes.
- [ ] 2.2 Create `api/src/workflows/add-gallery-video.ts` that inserts with `rank = max(rank) + 1` and compensates by deleting; verify `pnpm typecheck:api` passes.
- [ ] 2.3 Create `api/src/workflows/remove-gallery-video.ts` that deletes by id and compensates by re-inserting the removed row; verify `pnpm typecheck:api` passes.
- [ ] 2.4 Create `api/src/workflows/reorder-gallery.ts` that throws `MedusaError` `INVALID_DATA` unless `ids` is a permutation of the existing ids, writes `rank = index`, and compensates by restoring the previous ranks; verify `pnpm typecheck:api` passes.

## 3. API: routes and validation

- [ ] 3.1 Create `api/src/api/store/pages/[slug]/route.ts` (`GET`, 404 through `MedusaError` `NOT_FOUND` for a slug outside `PAGE_SLUGS`, returns `{ page }` without `is_default`) and `api/src/api/store/gallery/route.ts` (`GET`, `{ videos }` ordered by rank); verify `curl` with the publishable key returns the default privacy page and an empty video list.
- [ ] 3.2 Create `api/src/api/admin/pages/[slug]/route.ts` with `GET` returning `{ page }` including `is_default` and `POST` running `savePageWorkflow` and returning the saved page; verify `pnpm typecheck:api` passes.
- [ ] 3.3 Create `api/src/api/admin/pages/[slug]/validators.ts` (title 1–120, description 0–300, body 1–100000) and `api/src/api/admin/gallery/validators.ts` (`title` 1–120; `url` transformed to an 11-character id from `watch?v=`, `youtu.be/`, `shorts/`, `embed/` or a bare id, else a validation error naming `url`; `ids` non-empty array of strings), and add `validateAndTransformBody` entries for the three POST routes to `api/src/api/middlewares.ts`, creating the file if the contact change has not; verify `pnpm typecheck:api` passes.
- [ ] 3.4 Create `api/src/api/admin/gallery/route.ts` (`GET`, `POST` running `addGalleryVideoWorkflow`), `api/src/api/admin/gallery/[id]/route.ts` (`DELETE`) and `api/src/api/admin/gallery/order/route.ts` (`POST` running `reorderGalleryWorkflow`); verify `pnpm typecheck:api` passes and a logged-in `curl` can add, reorder and delete a video.

## 4. API: admin screens

- [ ] 4.1 Create `api/src/admin/lib/sdk.ts` exporting a `Medusa` instance with `baseUrl` from `__BACKEND_URL__` and `auth: { type: "session" }`, and `api/src/admin/routes/content/page.tsx` with `defineRouteConfig({ label: "Content", icon: DocumentText })` rendering a container that links to the five child screens; verify the Content item appears in the sidebar of `pnpm dev:api`.
- [ ] 4.2 Create `api/src/admin/components/page-editor.tsx` taking `slug` and `label`: loads `GET /admin/pages/:slug` into state, renders `Heading`, `Input` for title, `Textarea` for description and body, a Save `Button` disabled while saving, toasts success or the error message, keeps entered values on failure; verify a save on `/app/content/privacy` persists after reload.
- [ ] 4.3 Create `api/src/admin/routes/content/privacy/page.tsx`, `terms/page.tsx`, `shipping-returns/page.tsx` and `about/page.tsx`, each exporting `defineRouteConfig` with its label and a `rank` in that order and rendering `PageEditor`; verify the four entries appear under Content in that order.
- [ ] 4.4 Create `api/src/admin/components/gallery-editor.tsx` and `api/src/admin/routes/content/gallery/page.tsx` (label Gallery, first rank): a `Table` of videos in order with title, id, move up, move down and remove buttons, and an add form with URL and title inputs, each action calling its endpoint, reloading the list and toasting; verify adding `https://youtu.be/srRVUe4_wW4`, moving it up and removing it works in the browser.

## 5. API: seed and tests

- [ ] 5.1 Create `api/integration/http/content.test.ts` with `medusaIntegrationTestRunner`, a publishable key for store calls, and an admin JWT from a user created through the user and auth modules, covering: default privacy page from the store route with null `updated_at`; unknown slug 404; admin GET shows `is_default` true; admin POST saves and the store route returns the new content; empty body 400 naming `body`; unauthenticated POST 401; empty gallery; add by `youtu.be` link stores the id and appends; vimeo URL 400 naming `url`; reorder reverses the store order; non-permutation `ids` 400; delete removes; verify `pnpm test:api` passes.
- [ ] 5.2 Add the three current gallery videos (`srRVUe4_wW4` verkei?, `C8Hkml0CRmo` meduza, `qI8fDbBXW2s` 2DRIP) to `api/src/scripts/seed.ts` through the content module service in that order; verify `pnpm --dir api seed` on a fresh database and `GET /store/gallery` returns them.

## 6. Storefront: data layer and pages

- [ ] 6.1 Create `front/lib/data/content.ts` (`server-only`) with `getPage(slug)` returning `{ page, error }` and `getGalleryVideos()` returning `{ videos, error }` through `sdk.client.fetch`, `cached` with keys `['page', slug]` and `['gallery']`, tags `page-<slug>` and `gallery`, the 60-second revalidate, React `cache()`, logging and returning the error without throwing; add `ContentPage` and `GalleryVideo` types under `front/lib/types/`; verify `pnpm typecheck:front` passes.
- [ ] 6.2 Add `CONTENT_PAGES` to `front/lib/routes.ts` (`{ slug, path, label }` for privacy, shipping-returns, terms, about), derive `PUBLIC_PATHS` from it, and add `contentPageMetadata(page, path)` to `front/lib/seo.ts` returning title, description and canonical, or `robots: { index: false }` without a canonical when `page` is null; verify `pnpm typecheck:front` passes.
- [ ] 6.3 Create `front/components/content/content-page.tsx` rendering the blackletter `Heading` and `<ReactMarkdown>` in `prose max-w-none`, or `ErrorAlert` when the read failed, then replace `front/app/(main)/about/page.tsx` and `shipping-returns/page.tsx` and create `privacy/page.tsx` and `terms/page.tsx`, each with `generateMetadata` from `contentPageMetadata` and the component; verify the four routes render their default titles and bodies and `/privacy` has one canonical.
- [ ] 6.4 Rewrite `front/app/(main)/gallery/page.tsx` to read `getGalleryVideos`, keep the player markup, show "No videos yet" for an empty list and `ErrorAlert` with `noindex` on error; verify the three seeded players render in order.

## 7. Storefront: footer, sitemap and checkout

- [ ] 7.1 Build the footer links in `front/components/layout/footer/footer-bar.tsx` from the three policy entries of `CONTENT_PAGES`; verify the footer still shows Privacy Policy, Shipping & Returns and Terms & Conditions and each opens its page.
- [ ] 7.2 Confirm `front/app/sitemap.ts` needs no change beyond the derived `PUBLIC_PATHS`; verify `/sitemap.xml` lists `/privacy` and `/terms`.
- [ ] 7.3 Change the note under the Place order button in `front/components/checkout/payment-step.tsx` to "By placing your order you accept the Terms & Conditions and the Privacy Policy. Your card is charged only when the order is placed." with both names as `Link`s to `/terms` and `/privacy` opening in a new tab; verify the line renders on the payment step.

## 8. End-to-end tests and docs

- [ ] 8.1 Create `e2e/content.test.ts`: each of the four pages shows its default heading and at least one `h2` in the body; `/gallery` shows three iframes whose first `src` contains `srRVUe4_wW4`; the Terms & Conditions footer link on `/cart` opens `/terms`; the payment step shows the consent line with both links, reached as in `checkout.test.ts`; verify `pnpm exec playwright test e2e/content.test.ts` passes locally.
- [ ] 8.2 Add `/privacy` and `/terms` to the path list in `e2e/seo.test.ts`; verify `pnpm exec playwright test e2e/seo.test.ts` passes locally.
- [ ] 8.3 Update `docs/architecture.md`: the content module under extension points, a line for admin screens under `api/src/admin/routes/`, `content.ts` in the data layer list, the `page-<slug>` and `gallery` tags under caching, and the content pages under SEO; verify the doc describes every new path.

## 9. Verification

- [ ] 9.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.

## 10. Outside this repo

- [ ] 10.1 After this branch's PR merges and deploys, in the live admin add the three gallery videos and replace the bracketed seller identity block in the privacy, terms and shipping pages with the real name, IV certificate number and address; verify the three live pages show no bracketed placeholder.
