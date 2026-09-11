## Context

See proposal.md for why. What shapes the approach:

- Medusa v2.13 supports custom modules with their own tables and migrations, custom admin and store routes with zod body validation in `src/api/middlewares.ts`, and admin UI routes under `src/admin/routes/` whose exported config puts them in the sidebar. Nested route directories with their own config appear as children of the parent sidebar item. The Resend provider under `api/src/modules/resend/` is already a custom module, so the extension points are in use.
- Store routes require the publishable key by default; admin routes require an authenticated admin by default. Nothing extra is needed for either.
- The admin bundle is built by Vite from `api/src/admin/`. `@medusajs/ui`, `@medusajs/icons` and `@medusajs/js-sdk` are not direct dependencies of `api/` today, so admin screens cannot import them until they are added.
- The storefront already renders markdown with `react-markdown` inside the `prose` typography for product descriptions. `react-markdown` does not render raw HTML by default.
- The storefront data layer: reads are `server-only`, wrapped in `cached` with a key, tags and a 60-second revalidate, and return `{ data, error }` without throwing. The shop page's metadata sets `noindex` and drops the canonical when the data layer reports an error.
- The footer already lists `/privacy`, `/shipping-returns` and `/terms`. `PUBLIC_PATHS` in `front/lib/routes.ts` feeds the sitemap and the e2e SEO test mirrors it.
- The seed script runs in CI on a fresh database and once by hand on a new environment. Migrations run on every deploy through `pnpm predeploy` in the API entrypoint.
- The owner is a Lithuanian sole trader (individuali veikla), not a VAT payer, shipping to Lithuania and the EU with one Lithuanian option and one Rest of Europe option. Sizes and rates come from the admin, and the current shipping page's numbers match the seed.

## Goals / Non-Goals

**Goals:**

- A fresh environment renders complete, correct policy pages with no manual step. The admin edits override, never bootstrap.
- Admin screens that look native, with no state library and no editor dependency.
- Every write on the API goes through a workflow, every read on the storefront through the cached data layer, exactly like the catalog.

**Non-Goals:**

- Generic CMS features: arbitrary pages, blocks, media library, drafts, history.
- Instant propagation of edits. The catalog already tolerates a minute; so do the policies.
- Lithuanian translations.

## Decisions

**1. One `content` module, two models.** `api/src/modules/content/` holds `page` (`id`, `slug` unique, `title`, `description`, `body`, timestamps) and `gallery_video` (`id`, `youtube_id`, `title`, `rank`, timestamps). One service extends `MedusaService({ Page, GalleryVideo })`; the module is registered unconditionally in `medusa-config.ts` because it is application data, not an optional external service, and its migration is generated with `medusa db:generate content` and runs with the existing predeploy step. Alternative: product or collection metadata as a store for page text. Rejected because there is no natural product to hang a privacy policy on and the admin's key/value editor is a poor place for a page of markdown.

**2. Defaults live in code, the database holds overrides.** `api/src/modules/content/defaults/` holds one markdown file per slug plus a `pages.ts` map of slug to title and description, and the module service exposes `getPage(slug)` which returns the stored row when present and the default otherwise, with `updated_at: null` and `is_default: true` for the default. The store and admin GET routes call it; unknown slugs throw `MedusaError` `NOT_FOUND`. `POST /admin/pages/:slug` upserts by slug. Alternatives: a seed step that inserts the defaults, rejected because prod is not seeded and CI would need the extra step; a module loader that inserts missing rows at boot, rejected because loaders run in the server and the worker and add a startup side effect for no gain. With defaults in code the legal text is reviewed in a pull request, the live copy is whatever the owner last saved, and neither depends on the other.

**3. The slug set is a constant.** `PAGE_SLUGS = ['privacy', 'terms', 'shipping-returns', 'about'] as const` in the module's `defaults/pages.ts` is the only list. Routes validate the slug parameter against it, the admin screens are one static route per slug, and the storefront keeps its own route-to-slug map in `front/lib/routes.ts` because the projects cannot share code. The two lists are pinned by the integration test on the API side and the e2e test on the storefront side.

**4. Writes are workflows.** `savePageWorkflow({ slug, title, description, body })`, `addGalleryVideoWorkflow({ youtube_id, title })`, `removeGalleryVideoWorkflow({ id })` and `reorderGalleryWorkflow({ ids })`, each one step with a compensation that restores the previous row or ranks. The routes only validate and invoke. This follows the API rule that side effects never run inline in a route, and matches how the contact route delegates to a workflow. Rank assignment: a new video gets `max(rank) + 1`; reorder writes `rank = index` for the posted ids after checking they are a permutation of the existing ids, otherwise the step throws `MedusaError` `INVALID_DATA`.

**5. YouTube URL parsing on the API.** The `url` field is validated by a zod schema in `api/src/api/admin/gallery/validators.ts` that transforms a `watch?v=`, `youtu.be/`, `shorts/` or `embed/` link, or a bare 11-character id, into the id, and rejects anything else naming `url`. Parsing on the API keeps the admin form a plain input and lets the integration test pin the accepted forms. The stored value is always the id, so the storefront never parses.

**6. Validation in `middlewares.ts`.** `validateAndTransformBody` with zod schemas from `@medusajs/framework/zod` for `POST /admin/pages/:slug`, `POST /admin/gallery` and `POST /admin/gallery/order`, in the same `middlewares.ts` the contact change introduces, so the two changes add entries to one file rather than each creating it. Limits: title 1 to 120, description 0 to 300, body 1 to 100000, video title 1 to 120.

**7. Admin screens: one component per shape, plain SDK calls.** `api/src/admin/routes/content/page.tsx` is the parent with `defineRouteConfig({ label: 'Content', icon: DocumentText })` and a short overview linking to its children. `content/<slug>/page.tsx` for each slug renders `<PageEditor slug="…" />` from `api/src/admin/components/page-editor.tsx` with the label and a `rank` that orders the children; `content/gallery/page.tsx` renders `<GalleryEditor />`. Both use `@medusajs/ui` (`Container`, `Heading`, `Input`, `Textarea`, `Button`, `Table`, `toast`) and an `sdk` instance from `@medusajs/js-sdk` configured with `auth: { type: 'session' }` in `api/src/admin/lib/sdk.ts`, the pattern the Medusa docs use. Data loads in `useEffect` into component state; there are five screens with one request each, so `@tanstack/react-query` is not added. `@medusajs/ui@4.1.1`, `@medusajs/icons@2.13.1` and `@medusajs/js-sdk@2.13.1` are added to `api/` devDependencies at the versions the bundled dashboard already uses, so the bundle keeps one copy of each. Alternative: a dynamic `content/pages/[slug]` route and a table, rejected because dynamic routes cannot appear in the sidebar and the owner asked for the pages listed under one group.

**8. Storefront data layer.** `front/lib/data/content.ts` is `server-only` and exports `getPage(slug)` returning `{ page, error }` and `getGalleryVideos()` returning `{ videos, error }`, both through `sdk.client.fetch` against the store routes, wrapped in `cached` with keys `['page', slug]` and `['gallery']`, tags `page-<slug>` and `gallery`, and the 60-second revalidate. On failure they log and return the error with `page: null` or `videos: []`. React `cache()` wraps them so `generateMetadata` and the page body share one fetch per request, as the product page does.

**9. One page component, four routes.** `front/components/content/content-page.tsx` takes a slug and a path, calls `getPage`, and renders the `Heading` in blackletter plus `<ReactMarkdown>` inside `prose max-w-none`, or the error alert. A `contentPageMetadata(slug, path)` helper in `front/lib/seo.ts` builds title, description and canonical from the page, or `robots: { index: false }` without a canonical when the read failed, mirroring the shop page. The four route files under `front/app/(main)/` each export `generateMetadata` and render the component with their slug and path; the old hard-coded shipping and about pages are deleted. `/gallery` reads `getGalleryVideos` and keeps its current player markup, plus the empty and error states. Heading levels inside the body start at `##` in the defaults so the page keeps one `h1`.

**10. Routes and footer.** `front/lib/routes.ts` gains `CONTENT_PAGES`, a list of `{ slug, path }` for the four pages, and `PUBLIC_PATHS` derives from it instead of listing `/shipping-returns` by hand. The footer builds its links from the three policy entries plus their labels. The e2e SEO test's path list gains `/privacy` and `/terms`.

**11. Checkout consent line.** The paragraph under the Place order button in `payment-step.tsx` becomes "By placing your order you accept the Terms & Conditions and the Privacy Policy. Your card is charged only when the order is placed." with the two names as links opening in a new tab. Placement under the button, not a checkbox: EU consumer law requires the customer to be informed before ordering, not to tick a box, and a checkbox is one more way to abandon the checkout.

**12. Default content.** The markdown files are drafted from the Surf Sky policies with everything Shopify-specific removed and the Lithuanian consumer rules written in. Sections and facts each file must contain:

- `privacy.md`: who the controller is (seller identity block), what is collected (contact and shipping details, order and payment data handled by Stripe with no card numbers stored by the shop, contact messages, server logs), why and on which legal basis (contract, legal obligation, legitimate interest), processors (Stripe for payment, Resend for email, the file host for images, LP Express and other carriers for delivery, the hosting provider), no marketing emails without consent, retention (orders for the accounting period required by Lithuanian law, contact messages until handled), cookies (one httpOnly cart cookie, no analytics or advertising cookies), rights under the GDPR (access, rectification, erasure, restriction, portability, objection), the right to complain to the Valstybinė duomenų apsaugos inspekcija with its website, international transfers only through processors with EU-approved safeguards, children not targeted, last updated date.
- `terms.md`: seller identity block including "not a VAT payer", scope and that ordering accepts the terms, products and that colours may differ on screen, orders as an offer accepted when the confirmation email is sent and the right to cancel an order that cannot be fulfilled with a full refund, prices in EUR final with no VAT added and shipping shown at checkout, payment through Stripe, delivery as an estimate with risk passing on delivery to the consumer, the 14-day right of withdrawal with the customer paying return shipping and the refund within 14 days of receiving the goods back, the withdrawal exceptions for sealed hygiene goods once unsealed and for personalised items, the two-year legal guarantee for defective goods under the Lithuanian Civil Code, intellectual property in the brand and designs, limitation of liability to the extent the law allows, Lithuanian law, disputes first by contact, then the Valstybinė vartotojų teisių apsaugos tarnyba and the EU ODR platform with their URLs, changes to the terms, contact, last updated date.
- `shipping-returns.md`: processing time 1 to 3 business days, Lithuania by LP Express parcel lockers at 2.99 EUR, free from 30 EUR, 1 to 3 working days, EU at 5.99 EUR, free from 60 EUR, 5 to 10 working days, no delivery outside the EU, tracking by email, one parcel per order, then the return steps: contact within 14 days of delivery, unworn with tags and original packaging, customer pays return shipping to the return address, refund to the original payment method within 14 days of receipt, damaged or wrong items replaced or refunded with the shop paying shipping.
- `about.md`: a short brand text from the site description: h2bc, streetwear from Lithuania, blackletter and pink, drops announced on Instagram and YouTube. Replaces the lorem ipsum until the owner writes the real story.

The seller identity block is the same in the three policies: name, "individualios veiklos pažymos Nr." followed by the number, address, email `contact@h2bcweb.com`. Name, number and address are written as bracketed placeholders in the defaults; the owner fills them in through the admin on the live site so they never enter the repository. Every default starts its headings at `##`.

**13. Seed and tests.** `seed.ts` adds the three current gallery videos through the module service so development and CI show the same gallery as today; pages are not seeded. `api/integration/http/content.test.ts` uses `medusaIntegrationTestRunner`, creates a publishable key for store calls as the contact test does, and for admin calls creates a user through the user module with an emailpass auth identity and signs a JWT with the configured secret in the `Authorization` header. `e2e/content.test.ts` opens the four pages and the gallery against the seeded API and checks the heading, a body element, the gallery players, the footer link from the cart, and the consent line on the payment step reached the way `checkout.test.ts` reaches it.

**14. Documentation.** `docs/architecture.md` gains the content module under extension points, the admin screens under a new admin line, `content.ts` under the data layer, and the `page-<slug>` and `gallery` tags under caching.

## Risks / Trade-offs

- [Owner never fills in the identity placeholders] → The migration plan makes it the first post-deploy step, and the production storefront is not indexable until `SEO_INDEXABLE` is set, so a placeholder cannot reach a search index before the owner has read the pages.
- [Legal text drafted by a developer] → The defaults follow the Lithuanian consumer rules named in decision 12 and a working local shop's wording; the owner reads them before go-live and can change every word in the admin.
- [Markdown pasted from Word brings odd characters] → `react-markdown` renders text safely and never HTML; nothing can break the page layout beyond ugly formatting the owner sees on the site within a minute.
- [Admin bundle grows with `@medusajs/ui`] → The dashboard already ships it; pinning the same version keeps one copy.
- [Reorder with stale state overwrites a concurrent change] → One owner edits the gallery; the permutation check rejects a list that no longer matches and the screen reloads.
- [Two slug lists, API and storefront] → Each side's test pins its list; a mismatch fails CI on the 404 page.

## Migration Plan

1. Merge. The predeploy step creates the two tables. Every page renders its default immediately; the gallery is empty on production until videos are added.
2. In the live admin, open Content, add the three videos, then open each policy and replace the bracketed identity block with the real name, IV certificate number and address, and save.
3. Read the three policies once on the live site before `SEO_INDEXABLE` is switched on.

Rollback is a revert plus dropping the two tables; no other data is touched.

## Open Questions

- The exact seller name, IV certificate number and address are entered by the owner in the admin after deploy; they change no code.
- Whether the about default stays or the owner writes the real text in the admin before launch. Content only.
