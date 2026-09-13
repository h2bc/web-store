## Context

See proposal.md for why. What shapes the approach:

- The cart read runs during the render of the site header, a server component. Next.js allows cookie writes only in a server action or a route handler, so the read cannot clear or replace the cookie.
- Add to cart is a server action and may write the cookie. It already creates a cart when the cookie is absent.
- A cart read answers 404 when the cart id is unknown and returns the cart with its `completed_at` set when it is completed. Add to cart answers 404 or 400 for a stale cart, but also for a missing variant, so its error does not say which.
- `add-storefront-result-type` is planned, not started, and rewrites every function in the same file.

## Goals / Non-Goals

**Goals:**

- A shopper with a stale cookie never notices it: the next page shows an empty cart and the next add works.
- No extra backend call on page views that have a valid cart.

**Non-Goals:**

- Repairing the cookie at first page load.
- Recovering quantity updates or removals on a stale cart.

## Decisions

**1. The add-to-cart action recovers, the read only tolerates.** The action reads the cart first, as Medusa's starter storefront does, and creates a new cart and sets the cookie when the read fails or the cart is completed. The read maps a stale id to the empty-cart result and returns silently. Alternative, validating the cookie in `proxy.ts` on every request, was rejected because it costs a backend round trip per page view.

**2. Stale is decided on a read, never on the add's error.** A read carries only the cart id, so its failure is about the cart. The add's error is only ever shown, never interpreted. Alternative: classify the add's 404 or 400 as stale. Rejected because a missing variant fails the same way and the shopper would lose a live cart.

**3. Any read failure on add starts a new cart.** The cookie is replaced only after the create succeeds, so an outage fails both calls and keeps the cookie. The page read keeps the load error for anything but a 404, so an outage stays visible.

**4. Quantity update and removal stay as they are.** On a stale cart there is no item to touch. Their error toast stays, and the next render already shows the empty cart from the read change.

**5. One Vitest file, mocking the SDK and the cookie helper.** `front/tests/cart.test.ts` asserts the scenarios in the spec at unit level, per `.claude/rules/tests.md`. Alternative: a Playwright journey planting a fake cookie. Rejected because the browser cannot forge an httpOnly cookie a server accepts, and the two branches are pure result mapping.

## Risks / Trade-offs

- If the result-type change lands after this and rewrites the file, the unit tests fail when the recovery is lost.
- If the result-type change lands first and creates the same test file, this change adds its cases to that file.
- If Medusa stops returning completed carts on a read, the completed case answers 404 and takes the deleted-cart path.
