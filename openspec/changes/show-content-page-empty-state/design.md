## Context

- `getContentPage(slug)` returns `{ contentPage, error, notFound }`; a 404 from the store API becomes `notFound: true` and nothing else reads the flag.
- `ContentPageView` and each route's `generateMetadata` call `notFound()` on that flag. `contentPageMetadata(contentPage, path)` returns `noindex` without a title when the page is null.
- Each route file hard-codes its slug and path; the label lives in `CONTENT_PAGES` in `front/lib/routes.ts`.
- The seeded store always has the four rows and the admin cannot delete them, so an end-to-end test cannot reach the empty state. `front/tests/` holds no Vitest file yet.

## Goals / Non-Goals

**Goals:**

- A missing row renders the same way the empty gallery does, with the route label as the heading.
- One place decides the heading, title and robots for a page without content.

**Non-Goals:**

- Reshaping the other data-layer results. `add-storefront-result-type` owns that.
- Changing the store API, the admin or the gallery page.

## Decisions

**1. Null page with no error is the empty state.** `ContentPageView` shows the error alert when `error` is set, otherwise renders the page, or the route label and a muted "No content yet" line when `contentPage` is null. The `notFound` flag on the content page read goes, since null data with a null error already says it, which is the shape `add-storefront-result-type` adopts for every read. The view no longer imports `notFound()`. Alternative: keep the flag and branch on it, rejected as a third field carrying what the type already says.

**2. Routes carry the label into the page.** `getContentPageRoute(slug)` in `front/lib/routes.ts` returns the `CONTENT_PAGES` entry, and each route file holds one `ROUTE` constant instead of a separate slug and path. `contentPageMetadata(contentPage, route)` returns the label as the title plus `noindex` when the page is null, and the page's own title, description and canonical otherwise. The failed-read case gains a title too, which the degraded-state requirement allows. Alternative: a label prop on the view, rejected because the label would then be typed twice per page.

**3. Unit test with the read mocked.** `front/tests/content-page.test.ts` mocks `@/lib/data/content-page` with `vi.mock`, calls the async view as a function and renders the element with `renderToStaticMarkup`, then asserts the level-1 heading holds the label and no alert is rendered. A second test covers `contentPageMetadata` with a null page. The Vitest config sets `esbuild.jsx` to `automatic` so the `.tsx` components compile outside Next. Alternative: an end-to-end test, rejected because the seeded store cannot show the state.

## Risks / Trade-offs

- [The pending result-type change edits the same read and view] → Both land on the same shape, null data with a null error, so the merge is a few lines.
- [Vitest cannot import a component through `server-only` or `next/navigation`] → The read is mocked and the view no longer imports `next/navigation`; `Heading` and `ErrorAlert` are plain components.
