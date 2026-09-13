## 1. Storefront: stale cart recovery

- [ ] 1.1 Create `front/tests/cart.test.ts`, unit level, mocking `@/lib/medusa` and `@/lib/cookies` with `vi.mock`, one test per spec scenario: the add with a cookie whose cart answers 404 creates a cart, sets the cookie to the new id and returns the cart holding the item; the same with a 400 whose message says the cart is already completed; the read with a cookie whose cart answers 404 or that 400 returns the empty-cart result with no error and no `console.error`; the add with a network failure returns an error and never sets the cookie; verify `pnpm test:front` runs the file and the recovery tests fail because the action returns the error today.
- [ ] 1.2 In `front/lib/data/cart.ts` add one helper answering whether a `FetchError` marks the cart as stale, use it in `getCart` to return the empty-cart result silently, and in `addItemToCart` to create a cart, set the cookie and retry the line item once; verify `pnpm test:front` passes and `pnpm typecheck:front` and `pnpm lint:front` pass.
- [ ] 1.3 With both apps up, set a `cart_id` cookie to an unknown id in the Playwright MCP browser, open `http://localhost:3000/` and a product page, add the product; verify the header shows the item and a screenshot of the cart page is saved under `.tmp/`.

## 2. Docs

- [ ] 2.1 In `docs/architecture.md`, under Session, add that a cart id the backend answers 404 or already-completed for reads as an empty cart and is replaced by the next add; verify `grep -n "already completed" docs/architecture.md` finds the line.

## 3. Verification

- [ ] 3.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:front` and `pnpm test:api`; verify all pass.

## Review findings

None.
