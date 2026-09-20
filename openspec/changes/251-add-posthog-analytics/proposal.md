Task: https://cloud.h2bcweb.com/index.php/apps/deck/board/3/card/251

## Why

The shop has no analytics, so nobody knows how many visitors come, from where, or where they drop out of checkout. We collect everything consent allows. Cookies and recordings need opt-in consent in the EU, so tracking ships with a consent banner.

## What Changes

- A first-time visitor sees a consent banner with Accept as the primary button and Decline beside it, so tracking has consent.
- Nothing is tracked before the visitor chooses, and the choice is remembered.
- A visitor who accepts gets full tracking: clicks, pageviews, scroll depth, heatmaps, unmasked session replay, web vitals, console logs, network timing and front-end errors.
- A visitor who declines is only counted anonymously without cookies, so visit numbers stay complete.
- A visitor who accepts is identified by email and name when they save the checkout address, so sessions link to a person.
- The storefront sends shop events from product view to failed payment, so the owner sees where shoppers drop out.
- The backend sends the order lifecycle events, so an ad blocker or a closed tab never loses an order.
- An order from a shopper who accepted carries their email. Any other order is sent without personal data.
- PostHog requests go through the shop's own domain, so ad blockers do not drop them.
- The footer has a link that reopens the consent choice.
- PostHog is optional in both apps. Without `POSTHOG_KEY` there is no banner and no tracking.

## Capabilities

### New Capabilities

- `storefront-analytics`: the consent banner, what is tracked for each choice, the shop events, the identity and the first-party proxy.
- `order-analytics`: the order lifecycle events the backend sends and how consent decides what they carry.

### Modified Capabilities

- `storefront-security-headers`: the requirement `Content policy allows only the origins the storefront uses` also allows the blob workers session replay runs on.

## Impact

- `front/` gains the `posthog-js` dependency, an analytics provider in the root layout, the consent banner, the footer link and the event calls.
- `front/next.config.ts` gains the rewrites that proxy `/ingest` to the PostHog EU cloud.
- `front/proxy.ts` allows blob workers and skips the `/ingest` path.
- `front/lib/data/cart.ts` saves the consent choice on the cart when the address is saved.
- `api/medusa-config.ts` registers the Analytics Module, with the PostHog provider when `POSTHOG_KEY` is set and the local one otherwise. Both ship with `@medusajs/medusa`, so no new dependency.
- `api/src/` gains one tracking workflow and subscribers for the payment events. The three order subscribers call the workflow too.
- `POSTHOG_KEY` is a new env key in both apps and `POSTHOG_HOST` in the API. The deploy repository has to set them.
- `playwright.config.ts` gives the storefront a placeholder key so the banner renders in end to end runs.
- `docs/architecture.md` gains the analytics section and updates the session section.
- The Privacy Policy text is admin content. The owner adds the PostHog paragraph in the admin.
- The storefront starts storing a PostHog cookie for visitors who accept. The cart cookie stays the only session state of the shop itself.
