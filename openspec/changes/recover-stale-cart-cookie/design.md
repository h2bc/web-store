## Context

See proposal.md for why. What shapes the approach:

- The cart read runs during the render of the site header, a server component. Next.js allows cookie writes only in a server action or a route handler, so the read cannot clear or replace the cookie.
- Add to cart is a server action and may write the cookie. It already creates a cart when the cookie is absent.
- Medusa's add-to-cart workflow answers 404 when the cart id is unknown and 400 with the message `Cart <id> is already completed.` when the cart has a completion date. Both surface as a `FetchError` with that status from the JS SDK.
- `add-storefront-result-type` is planned, not started, and rewrites every function in the same file.

## Goals / Non-Goals

**Goals:**

- A shopper with a stale cookie never notices it: the next page shows an empty cart and the next add works.
- No extra backend call on page views that have a valid cart.

**Non-Goals:**

- Repairing the cookie at first page load.
- Recovering quantity updates or removals on a stale cart.

## Decisions

**1. The add-to-cart action recovers, the read only tolerates.** The action creates a new cart, sets the cookie and retries the line item once when the first attempt fails as stale. The read maps a stale id to the empty-cart result and returns silently. Alternative: validate the cookie in `proxy.ts` middleware on every request and clear it there. Rejected because it costs a backend round trip per page view to fix a state the two changes above already make invisible.

**2. Stale means 404, or 400 whose message says the cart is already completed.** One helper in `cart.ts` reads the `FetchError` status and message and answers whether the cart is stale; the read and the action share it. Alternative: treat any 4xx as stale. Rejected because a 400 on the add is also how Medusa reports an out-of-stock variant, and that must stay an error the shopper sees.

**3. One retry, not a loop.** If the fresh cart also fails the add, the action returns that error. A second failure on a cart created milliseconds ago is a real outage, not a stale id.

**4. Quantity update and removal stay as they are.** On a stale cart there is no item to touch. Their error toast stays, and the next render already shows the empty cart from the read change.

**5. One Vitest file, mocking the SDK and the cookie helper.** `front/tests/cart.test.ts` asserts the scenarios in the spec at unit level, per `.claude/rules/tests.md`. Alternative: a Playwright journey planting a fake cookie. Rejected because the browser cannot forge an httpOnly cookie a server accepts, and the two branches are pure result mapping.

## Risks / Trade-offs

- [The result-type change lands after this and drops the stale-cart branches when it rewrites the file] → its task 1.3 rewrites every export; the two unit tests fail if the branches are lost.
- [The result-type change lands first and creates the same test file] → this change adds its cases to that file instead of creating it.
- [Medusa changes the completed-cart message] → the completed case degrades to today's behaviour, an error toast, and the unit test on that message catches it on upgrade.
