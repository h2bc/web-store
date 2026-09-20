# Architecture

Two independent pnpm projects in one repository. The root `package.json` only wraps their scripts.

- `api/`: Medusa v2 backend, admin at `/app`, port 9000.
- `front/`: Next.js storefront, port 3000.
- `.devcontainer/docker-compose.yml`: node, pnpm, postgres and redis for local work.
- Everything runs on Node 26.9.0.
- The CI workflow, both Dockerfiles, the devcontainer compose file and the devcontainer `node` feature each pin it.

## Backend

### Extension points

- Stock Medusa v2, every `@medusajs/*` package pinned to the same exact release. Customisation lives only under `api/src/`.
- `api/package.json` overrides `fast-xml-parser` and `protobufjs` under `pnpm.overrides` for security advisories.
- `modules/`: `resend/`, `content-page/` (one row per fixed screen) and `gallery/` (the ordered video list).
- `scripts/seed/`: one part per data set, run together by `scripts/seed.ts` or alone with `medusa exec`.
- `workflows/`: `send-order-confirmation.ts`, `send-shipment-notice.ts`, `send-cancellation-notice.ts`, `send-contact-message.ts`, `save-content-page.ts`, `save-gallery.ts`, `track-order-event.ts`.
- `send-order-confirmation.ts` records the customer email and the owner email, each skipped when its recipient is missing.
- `send-shipment-notice.ts` records the customer email with the shipped items and tracking.
- `send-cancellation-notice.ts` records the customer email with the items and the refunded amount.
- `track-order-event.ts` sends one order event to the Analytics Module. It logs a failure and never fails the caller.
- An order whose `metadata.analytics_consent` is true is tracked under its lowercased email. Any other order is tracked under its id with no personal field and no person profile.
- `subscribers/`: `order-placed.ts`, `shipment-created.ts`, `order-canceled.ts`, `payment-captured.ts`, `payment-refunded.ts`, `invite.ts`, `password-reset.ts`.
- The order, shipment and payment subscribers run `track-order-event.ts`. The first three run it after their email workflow.
- `api/`: route files under `api/store/` and `api/admin/`. Body validation lives in `api/middlewares.ts`.
- The contact rate limit keys on the first forwarded address outside the private network, because the storefront calls the API through the proxy.
- `admin/routes/`: admin screens, one top-level sidebar item per content page plus the gallery editor. They are built from the components `@medusajs/dashboard` exports and load through TanStack Query; the drag ranking and the markdown preview are the only custom parts.
- `links/` and `jobs/`: empty today.

### Admin-owned data

- Catalog, prices, regions, shipping options and payment providers are configured in the admin, never in code.
- The text of the content pages and the gallery list too. A content page row holds an optional title, a meta description and a markdown body; the title is the storefront H1 when set, and the document title is the route label in `front/lib/routes.ts`. The seed only fills lorem ipsum; for a screen without a row the API answers 404 and the storefront shows an empty state.
- The storefront queries one country, `DEFAULT_COUNTRY_CODE` in `front/lib/store.ts`. The admin holds the region behind it.

### Optional services

`api/medusa-config.ts` switches each service on by env and runs with none of them.

- Stripe payments when `STRIPE_API_KEY` is set. Otherwise no payment module is registered.
- Resend email when `RESEND_API_KEY` is set. Otherwise Medusa's local provider, which logs.
- Owner order emails go to `ORDER_INBOX_EMAIL`. Unset, no owner email is recorded.
- PostHog order analytics when `POSTHOG_KEY` is set, on `POSTHOG_HOST`. Otherwise Medusa's local analytics provider, which logs.
- S3 file storage in production, local files otherwise.
- Redis caching, event bus, workflow engine and locking in production only, on `REDIS_URL`, `EVENTS_REDIS_URL`, `WE_REDIS_URL` and `LOCKING_REDIS_URL`.
- `api/.env.example` lists every key the config reads.

### Worker mode

- `MEDUSA_WORKER_MODE` selects `shared`, `server` or `worker`. `DISABLE_MEDUSA_ADMIN` drops the admin from a worker.
- `api/Dockerfile` defaults to `server`. `api/docker-entrypoint.sh` runs migrations only when the mode is not `worker`.
- One image serves both roles as separate containers. A subscriber or job runs in the worker and can only rely on env the worker carries.

## Storefront

Server-first Next.js App Router.

- Pages under `front/app/(landing)` and `front/app/(main)`.
- Components under `front/components/`, by area: `shop`, `cart`, `checkout`, `contact`, `layout`, `seo`, `ui`.
- `front/proxy.ts` sets the security headers and the Content-Security-Policy, with a nonce per request, on every page.

### Data layer

- Components never call the backend. Every call goes through `front/lib/data/`, which wraps the Medusa JS SDK from `front/lib/medusa.ts`.
- Reads are `import 'server-only'` (`products.ts`, `content-pages.ts`, `gallery.ts`). Only server components import them.
- Mutations are `'use server'` actions (`cart.ts`, `shipping.ts`, `payment.ts`, `orders.ts`, `categories.ts`, `contact.ts`). Client components call them as functions.
- Every data-layer function returns a result object with an `error` field and never throws. `getProducts` returns `{ products: [], error }` on failure, `getCart` returns `{ cart: null, error }`.
- Pages render the degraded state when the backend is unreachable.

### Caching

- Reads are wrapped in `cached` from `front/lib/cache.ts`: Next's `unstable_cache` with a key, tags and a 60-second revalidate, `CACHE_REVALIDATE_TIME` in `products.ts`.
- Catalog reads carry the `products` tag. Each product page adds `product-<handle>`. An admin change shows within a minute.
- Content page reads carry `content-page-<slug>`, the gallery read carries `gallery`.
- Cart mutations in `cart.ts` invalidate with `revalidatePath` on the checkout and the layout.
- `DISABLE_CACHE=true` makes `cached` a pass-through for development.

### Session

- The only session state is the cart id, in an httpOnly cookie managed by `front/lib/cookies.ts`.
- A client component asks a server action, which reads the cookie. Nothing about the cart lives in client state.
- PostHog keeps its own cookie only for a visitor who accepted analytics. It holds no cart or checkout state.
- A cart id the backend answers 404 for, or whose cart is completed, reads as the empty cart without an error.
- Add to cart reads the cart first and creates a new cart, replacing the cookie, when that read fails or the cart is completed.

### Checkout

- Guest-only. No accounts, no login, no order history.
- `front/app/(main)/checkout/page.tsx` walks the steps in `front/lib/checkout-steps.ts`: email and address, shipping, payment.
- The address form's default country comes from Cloudflare's `CF-IPCountry` request header through `getDefaultCountryCode` in `front/lib/store.ts`, and falls back to Lithuania.
- Payment is Stripe Elements from `front/lib/stripe.ts`. Redirect methods return to `checkout/return`.
- `order/[id]/confirmed` is the only page that shows an order.

### Analytics

- PostHog is on when `POSTHOG_KEY` is set. Without it there is no banner and no tracking.
- The root layout passes the key to `AnalyticsProvider` in `front/components/analytics/`, which starts PostHog, shows the consent banner and provides `useAnalyticsConsent` to the footer link.
- `front/lib/analytics.ts` holds the PostHog config, the consent helpers and one `track` function per shop event. Components never import `posthog-js`.
- PostHog runs in `cookieless_mode: 'on_reject'`. It holds every event until the visitor chooses, then tracks with cookies after Accept and anonymously without storage after Decline.
- The browser reaches PostHog only through `/ingest`, two rewrites in `front/next.config.ts` to the EU cloud. `front/proxy.ts` skips that path.
- The address step saves the choice as `metadata.analytics_consent` on the cart and identifies a shopper who accepted by email. The order inherits the metadata.
- Order placed is a backend event only. Payment failed is a storefront event, from the payment step and the return page.
- Playwright runs the storefront with a placeholder key, blocks `/ingest` and declines the banner in every journey but `tests/analytics.test.ts`.

### SEO

- `front/lib/seo.ts` holds the site constants. `SEO_INDEXABLE` decides whether the root layout emits `robots: { index: false }` for the whole site.
- Public pages set `alternates.canonical`: `shop`, `gallery`, `contact` and the content pages `about`, `privacy`, `terms`, `shipping-returns`.
- A content page or the gallery sets `robots: { index: false }` and drops the canonical when its read fails, like the shop.
- Cart, checkout, return and confirmation pages set `robots: { index: false }`.
- `front/app/robots.ts` and `front/app/sitemap.ts` come from the same helpers.

## Deployment

- `.github/workflows/deploy.yml` runs one `Check` job: format, lint, typecheck, API tests, e2e.
- The three suites and how a test is written are in `.claude/rules/tests.md`.
- It builds the two images from `api/Dockerfile` and `front/Dockerfile`, tagged `sha-<short sha>`, and triggers `deploy.yml` in `h2bc/web-store-deploy`.
- The deploy repository owns everything runtime: compose or manifest files, env for both apps and both API containers, secrets, domains, Stripe and Resend configuration.
- A change that needs a new env var is finished only when it is set there.
