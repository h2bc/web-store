# Design

## Context

- The storefront reads every env key at run time on the server. No key is inlined at build, and the image is built without secrets.
- `front/proxy.ts` sets a nonce Content-Security-Policy with `strict-dynamic` on every page.
- Checkout is guest-only, so the address step is the one place a shopper gives an email.
- `completeCartWorkflow` copies `cart.metadata` to `order.metadata`.
- Medusa 2.21.0 ships the Analytics Module and its PostHog and local providers inside `@medusajs/medusa`.
- Every backend service is switched on by env in `api/medusa-config.ts`, and subscribers run in the worker.

## Goals / Non-Goals

**Goals:**

- One PostHog project on the EU cloud receives browser behaviour and the order lifecycle under one person.
- Both apps run unchanged without `POSTHOG_KEY`.

**Non-Goals:**

- Feature flags, experiments and surveys.
- Dashboards and funnels as code. The owner builds them in the PostHog UI.
- The real Privacy Policy text, which is card 244.
- A consent record on the server. The choice lives in the browser and on the cart.

## Decisions

**The key reaches the browser as a prop.** The root layout is already dynamic. It reads `POSTHOG_KEY` and renders `AnalyticsProvider` from `front/components/analytics/` with the key, or nothing when the key is missing. The provider calls `posthog.init` once during its first client render, because child effects run before a parent's and would lose the first event. The alternative was `NEXT_PUBLIC_POSTHOG_KEY` with `instrumentation-client.ts`. It bakes the key into the image at build, which no other key in this repo does.

**Plain `posthog-js`, no React wrapper.** `front/lib/analytics.ts` imports the `posthog-js` singleton and exports one small function per event, like `trackProductViewed`. Client components call them. The alternative was `@posthog/react` with its context and hooks. We use no flags, so the context adds nothing.

**One init config turns everything on.** `defaults: '2026-08-30'` gives page views on history change and page leaves. The config adds `cookieless_mode: 'on_reject'`, `person_profiles: 'always'`, `autocapture`, `enable_heatmaps`, `capture_dead_clicks`, `capture_performance`, `capture_exceptions`, and `session_recording` with `maskAllInputs: false`, console logs and network timing with headers and bodies. The alternative was PostHog's masked defaults. The owner chose full collection.

**PostHog's own consent state, no second store.** The banner shows while `get_explicit_consent_status()` is `pending`. Accept calls `opt_in_capturing()` and Decline calls `opt_out_capturing()`. In `on_reject` mode PostHog holds every event until one of them runs, then tracks with cookies or without. The alternative was our own consent cookie. It would be a second source of truth for one choice.

**The banner is a fixed card at the bottom, not a dialog.** It reuses `Card` and two `Button`s of the same size, a primary Accept and an outlined Decline, and links to `/privacy`. The owner chose the highlighted Accept over equal buttons and accepts the regulatory risk. It does not block the page. The alternative was a modal. A modal blocks the shop and every existing journey behind it.

**The footer link reopens the banner through context.** `AnalyticsProvider` wraps the page and provides `isEnabled` and `openConsentBanner` through `useAnalyticsConsent`. The footer renders the link only when analytics is on. The alternative was a settings page. One choice does not need a page.

**The proxy is two constant rewrites in `next.config.ts`.** `/ingest/static/:path*` goes to `https://eu-assets.i.posthog.com/static/:path*` and `/ingest/:path*` to `https://eu.i.posthog.com/:path*`, with `skipTrailingSlashRedirect: true`. The browser config uses `api_host: '/ingest'` and `ui_host: 'https://eu.posthog.com'`. The alternative was a run-time rewrite in `front/proxy.ts` from `POSTHOG_HOST`. Rewrites are fixed at build and the EU host never changes, so the storefront needs no `POSTHOG_HOST`. The key is removed from `front/.env.example` and `front/.env.local`.

**The policy gains `worker-src 'self' blob:` and the matcher skips `/ingest`.** Replay compresses in a blob worker. Without `worker-src` the browser falls back to `script-src` and blocks it. Scripts and connections need nothing new, because the proxy makes them same-origin and `strict-dynamic` trusts what the nonce script loads. The alternative was listing the PostHog origins. The proxy makes them unnecessary.

**Consent travels on the cart.** `setCheckoutContact` takes `analyticsConsent` and writes `metadata.analytics_consent` in the same cart update. The address step passes `hasAnalyticsConsent()` and, when it is true, calls `identifyShopper` with the lowercased email after the save succeeds. The alternative was sending the PostHog distinct id to the backend. The email is already the shared id, and a boolean is all the backend needs.

**The backend registers the Analytics Module the way it registers email.** With `POSTHOG_KEY` the provider is `@medusajs/medusa/analytics-posthog` with `posthogEventsKey` and `posthogHost`. Without it the provider is `@medusajs/medusa/analytics-local`, which logs. The alternative was raw `posthog-node`. The module is the Medusa feature for this.

**One workflow tracks every order event.** `api/src/workflows/track-order-event.ts` takes the order id, the event name and optional extra properties. It reads the order with `useQueryGraphStep`, builds the event with the pure function `getOrderEvent` and calls `track` in one step. The step catches and logs a failure, so nothing upstream rolls back. The existing `order-placed`, `shipment-created` and `order-canceled` subscribers run it after their email workflow. New `payment-captured` and `payment-refunded` subscribers resolve the order from the payment and run it. The alternative was one workflow per event. They would differ only in the event name.

**`getOrderEvent` applies consent.** With `metadata.analytics_consent` true, `actor_id` is the order email and the properties include the name. Otherwise `actor_id` is the order id, the properties hold no personal field and `$process_person_profile` is false. The alternative was dropping orders without consent. Anonymous order counts are legal and keep revenue complete.

**Payment failed is a storefront event.** Medusa emits no payment-failed event. Stripe reports the failure to the browser in `payment-step.tsx`, so `trackPaymentFailed` runs there with the Stripe error code. A redirect method fails on the return page, so `payment-return.tsx` calls it too. The alternative was our own Stripe webhook for `payment_intent.payment_failed`. It would be a second webhook handler beside Medusa's for one event.

**Order placed is a backend event only.** The confirmation page sends no order event. The alternative was sending it from both sides. It counts every order twice.

**End to end runs with a placeholder key and blocked ingestion.** `playwright.config.ts` sets `POSTHOG_KEY=phc_e2e` on the storefront web server only, because the workflow runs all suites in one step and the API must not see the placeholder. A fixture aborts `/ingest/**`, so CI sends nothing to PostHog. A second fixture registers a Playwright locator handler that declines the banner for every journey except `tests/analytics.test.ts`, so the banner never covers another journey and the fixture does not depend on the key. The alternative was the real key in CI. It fills the project with robot traffic.

## Risks / Trade-offs

- Unmasked replay and network bodies put emails and addresses in PostHog. The owner accepted this. The Stripe iframes keep card details and the typed address out.
- `opt_out_capturing()` alone removes the PostHog cookie. `posthog.reset()` after it also wipes the stored choice, so it is not called.
- PostHog drops events from headless browsers as bot traffic. Events are proven from a normal browser, never from Playwright.
- A shopper who accepts after the address step is not identified until the next order. Their order events are anonymous.
- Medusa emits `payment.captured` only from its capture workflow. A Stripe payment captured at checkout emits it when the webhook arrives, never locally without one.
- The PostHog project must have Cookieless server hash mode on. Without it, events from visitors who declined are dropped.
- A later Medusa release may move the providers out of `@medusajs/medusa`. The pinned release rule in `api-platform` catches it at upgrade.

## Migration Plan

- Set `POSTHOG_KEY` for the storefront and `POSTHOG_KEY` and `POSTHOG_HOST` for both API containers in `h2bc/web-store-deploy`.
- Rollback is unsetting `POSTHOG_KEY`. Both apps run without it.
