## Why

The cart cookie lives a year, but the cart behind it can disappear or be completed while the cookie stays. Every add to cart then fails with a toast, the header and the cart page show a load error, and nothing ever replaces the cookie, so the shopper is stuck until they clear their cookies.

## What Changes

- Adding to the cart with a cart id Medusa no longer accepts creates a new cart, replaces the cookie and retries the add once.
- Reading the cart with such an id returns the empty cart, without an error and without a log line, so the header and the cart page render the empty state.
- A cart id is stale when Medusa answers 404 or refuses the cart as already completed. Any other failure keeps its current error.
- The other cart mutations keep failing on a stale cart; the next page load renders the empty cart and the next add replaces it.
- `docs/architecture.md` states the recovery in the session section.

## Capabilities

### New Capabilities
- `storefront-cart`: the cart cookie and how the storefront recovers when its cart is gone or completed.

### Modified Capabilities

None.

## Impact

- `front/lib/data/cart.ts`: the cart read and the add-to-cart action.
- `front/tests/cart.test.ts` (new).
- `docs/architecture.md`.
- `add-storefront-result-type` rewrites the same file; whichever lands second carries the stale-cart branches over.
