# Tasks

## 1. API: order events

- [x] 1.1 Add the unit test `api/tests/order-analytics.test.ts` for `getOrderEvent`, one test per scenario of `Consent decides what an order event carries` and `The backend sends the order lifecycle`: a consented order returns the email as `actor_id` with the name, an order without consent returns the order id as `actor_id`, no personal field and `$process_person_profile` false, and a refund carries the refunded amount. Orders go in `api/tests/support/data.ts`. Verify `pnpm test:api` fails because the function does not exist.
- [x] 1.2 Add an integration test to `api/tests/order-analytics.test.ts` for `No analytics key` and `PostHog is down`: an order placed with the local provider succeeds and its confirmation email is recorded. Reuse the order helpers in `api/tests/support/`. Verify it fails or passes for the scenario's reason before 1.4.
- [x] 1.3 In `api/medusa-config.ts` register `@medusajs/medusa/analytics` with `@medusajs/medusa/analytics-posthog` when `POSTHOG_KEY` is set and `@medusajs/medusa/analytics-local` otherwise, per `design.md`. Keep `POSTHOG_KEY` empty and `POSTHOG_HOST` in `api/.env.example`. Verify `pnpm typecheck:api` passes and `pnpm dev:api` starts without the key.
- [x] 1.4 Add `api/src/workflows/track-order-event.ts` with the pure `getOrderEvent` and the tracking step that catches and logs a failure. Verify the 1.1 and 1.2 tests pass.
- [x] 1.5 Run the workflow from `order-placed.ts`, `shipment-created.ts` and `order-canceled.ts` after their email workflow, with the events `order_placed`, `shipment_created` and `order_canceled`. Verify `pnpm test:api` passes and the local provider logs `order_placed` when a test order is placed.
- [x] 1.6 Add `api/src/subscribers/payment-captured.ts` and `payment-refunded.ts`, which resolve the order from the payment's collection and run the workflow with `payment_captured` and `payment_refunded`. Verify the integration test finds the order behind a refunded payment and a refund through the admin API answers 200 with the subscriber loaded. The proof that both events reach PostHog is under `## Outside this repo`, because `payment.captured` only fires when the Stripe webhook runs the capture workflow.

## 2. Storefront: consent and tracking

- [x] 2.1 Add the unit test `front/tests/analytics.test.ts` for the pure helpers in `front/lib/analytics.ts`: `getPostHogConfig` turns on every option in `design.md` and points at `/ingest`, and `getCartEventProperties` maps a cart to the value, currency, country and shipping option. Extend `front/tests/next-config.test.ts` for the two rewrites, `front/tests/security-headers.test.ts` for `worker-src` and the `/ingest` matcher, and `front/tests/cart.test.ts` for `analytics_consent` on the cart. Verify `pnpm test:front` fails for those reasons.
- [x] 2.2 Add `posthog-js` to `front/package.json`, pinned. Remove `POSTHOG_HOST` from `front/.env.example` and `front/.env.local`. Verify `pnpm install` in `front/` succeeds.
- [x] 2.3 Add the rewrites and `skipTrailingSlashRedirect` to `front/next.config.ts`, and `worker-src` plus the `/ingest` matcher exclusion to `front/proxy.ts`. Verify the next-config and security-headers tests pass.
- [x] 2.4 Add `front/lib/analytics.ts`: `getPostHogConfig`, `hasAnalyticsConsent`, `acceptAnalytics`, `declineAnalytics`, `openConsentBanner` with its subscription, `identifyShopper`, `getCartEventProperties` and one `track` function per shop event. Verify the analytics unit test passes.
- [x] 2.5 Add `front/components/analytics/analytics-provider.tsx` and render it from `front/app/layout.tsx` only when `POSTHOG_KEY` is set. Verify with the key set that `http://localhost:3000` sends nothing to `/ingest` before a choice, and without the key that no banner shows.
- [x] 2.6 Add `front/components/analytics/consent-banner.tsx` from `Card` and two equal `Button`s with a link to `/privacy`, per `.claude/rules/design.md`. Verify Accept and Decline each hide it, the choice survives a reload, and save a Playwright MCP screenshot of `http://localhost:3000/shop` with the banner under `.tmp/`.
- [x] 2.7 Add the consent link to `front/components/layout/footer/footer-bar.tsx`, styled like the policy links and rendered only when analytics is on. Verify it reopens the banner and save a Playwright MCP screenshot of the footer under `.tmp/`.
- [x] 2.8 Send `analyticsConsent` from `address-step.tsx` through `setCheckoutContact` into `metadata.analytics_consent`, and call `identifyShopper` after a successful save when consent is given. Verify the cart test passes.
- [x] 2.9 Call the shop events: product viewed from a small client component on `shop/[slug]/page.tsx`, added and removed in the cart components, checkout started on the checkout page, the address and delivery steps on their success paths, and payment failed in `payment-step.tsx` and `payment-return.tsx` with the Stripe error code. Verify each appears in the PostHog activity feed for an accepted local session.

## 3. End to end

- [x] 3.1 Add `ConsentBanner` as a page object in `tests/support/consent-banner.ts`, a fixture that aborts `/ingest/**`, and a fixture that declines consent before every journey except the analytics one, all in `tests/support/fixtures.ts`. Verify `pnpm lint` passes.
- [x] 3.2 Add `tests/analytics.test.ts` with one journey per scenario: first visit shows the banner, the choice is remembered after a reload, no analytics cookie before a choice or after declining, and the footer link changes the choice. Verify `pnpm test:e2e tests/analytics.test.ts` passes with both apps up and `POSTHOG_KEY=phc_e2e` on the storefront.
- [x] 3.3 Set `POSTHOG_KEY` to `phc_e2e` in the storefront `webServer` env of `playwright.config.ts`, so the API never sees the placeholder. Verify the whole `pnpm test:e2e` run passes locally.

## 4. Docs

- [x] 4.1 In `docs/architecture.md` add PostHog under `### Optional services`, the new workflow and subscribers under `### Extension points`, a `### Analytics` section under `## Storefront`, and one bullet under `### Session` saying PostHog keeps its own cookie only after consent. Verify it follows `.claude/rules/writing.md`.

## 5. Checks

- [x] 5.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:api` and `pnpm test:front`. Verify all are green.

## Outside this repo

- PostHog, project settings at `https://eu.posthog.com`: Cookieless server hash mode, autocapture, heatmaps, web vitals, dead clicks, exception autocapture and session replay with console logs and network are on, and Discard client IP data is off. Proof: an accepted session on `https://dev.h2bcweb.com` shows a recording, and a declined one shows an anonymous page view.
- PostHog, organization settings: the DPA is signed. Proof: the signed copy is in the owner's inbox.
- `h2bc/web-store-deploy`: `POSTHOG_KEY` is set for the storefront, and `POSTHOG_KEY` and `POSTHOG_HOST` for the API server and worker containers. Proof: an order on `https://dev.h2bcweb.com` shows `order_placed` in PostHog.
- Staging, where the Stripe webhook reaches the API: a paid order shows `payment_captured` in PostHog, and a refund in the admin shows `payment_refunded`. Proof: both events are in the Activity feed for an order on `https://dev.h2bcweb.com`.
- Medusa admin, Privacy page: a paragraph names PostHog, the data it collects, the stored IP addresses, the session recording and the footer link that changes the choice. Proof: `https://dev.h2bcweb.com/privacy` shows it.
- PostHog UI: a funnel from `product_viewed` to `order_placed` and a dashboard with visits, referrers and countries. Proof: the dashboard shows data from dev.

## Review findings

- 2.6: the owner chose a primary Accept and an outlined Decline after the task was ticked, and renamed the footer link to `Cookies` without uppercase.
- 1.6: a 5.00 refund of local order 5 through the admin API answered 200 on 2026-09-20. Nobody checked that `payment_refunded` reached PostHog, so that proof moved to staging.
