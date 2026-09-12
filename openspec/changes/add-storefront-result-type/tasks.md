## 1. Storefront: the type and the data layer

- [ ] 1.1 Create `front/tests/content-page.test.ts` and `front/tests/cart.test.ts`, unit level, mocking `@/lib/medusa` and `@/lib/cookies` with `vi.mock`, covering: a content page read returns the mapped page as data with null error; a 404 from the SDK returns null data and null error; a network error returns null data and a message without throwing; a cart read without a cookie returns null data and null error; a cart completion returns the order id as data; a completion the SDK rejects returns a message; verify `pnpm test:front` runs both files and they fail because the functions do not return the shape yet.
- [ ] 1.2 Create `front/lib/types/result.ts` exporting `Result<T>`, `ok` and `fail`, and `front/lib/types/shipping.ts` holding `ShippingOptionSummary`; verify `pnpm typecheck:front` passes.
- [ ] 1.3 Convert `front/lib/data/cart.ts`: every export returns `Result`, `getCart` returns `ok(null)` without a cookie, `completeCart` returns the order id, `releaseCart` returns `ok(null)`, mutations fail with their current messages, one helper maps a 400 to its message; verify the cart unit tests pass.
- [ ] 1.4 Convert `content-page.ts`, `products.ts`, `gallery.ts`, `categories.ts`, `orders.ts`, `shipping.ts` and `payment.ts`: reads that can miss return `Result<T | null>`, `getProductHandles` returns `Result<ProductHandle[]>`, `categories.ts` and `orders.ts` switch to `server-only`, `shipping.ts` imports its type from `lib/types`; verify the content page unit tests pass and `grep -rn "error: string | null" front/lib/data` finds nothing.
- [ ] 1.5 Convert `front/lib/data/contact.ts` to return `Result<string>` and delete `ContactFormResponse` from `front/lib/schemas/contact.ts`; verify `pnpm typecheck:front` reports errors only in callers.

## 2. Storefront: callers

- [ ] 2.1 The Playwright journeys in `tests/smoke.test.ts`, `tests/checkout.test.ts`, `tests/seo.test.ts` and `tests/content.test.ts` are this group's tests, end-to-end level; verify they cover the cart empty state, the checkout redirect without a cart, a product 404, a content page 404 and the gallery, and add a scenario in the matching file for any that is missing.
- [ ] 2.2 Update the pages: cart, checkout, checkout return, gallery, order confirmation, shop, product, about, privacy, terms, shipping-returns, the sitemap, the site header and the content page view destructure `{ data, error }`, check `error !== null` first and `data === null` for a 404, the checkout's other-step branch returns `ok([])`; verify `pnpm typecheck:front` passes.
- [ ] 2.3 Update the components: the address, delivery, payment and payment return steps and the contact form read `data` and `error`, the delivery step imports its type from `lib/types`, the contact form toasts the error or the success message; verify `pnpm typecheck:front` and `pnpm lint:front` pass and `grep -rn "notFound: isNotFound\|No cart found" front/app front/components` finds nothing.
- [ ] 2.4 With both apps up run `pnpm exec playwright test --project storefront`; verify every journey passes, and take a Playwright MCP screenshot of `/cart` without a cart and `/shop/does-not-exist` saved under `.tmp/`.

## 3. Rules and docs

- [ ] 3.1 Update `.claude/rules/front.md`: under Data layer add one file per resource in `front/lib/data/`, one function per call named `get` for a read and the action for a mutation, every function returns `Result<T>` from `front/lib/types/result.ts`, callers check `error !== null` then `data === null`, errors are logged in the data layer and returned as a message; replace the review line about throwing with a function whose return type is not `Result<T>`; verify the file stays under 50 lines.
- [ ] 3.2 Update `docs/architecture.md` data layer section to state the shared return type, the not-found convention and the `ok` and `fail` helpers, replacing the two example shapes; verify `grep -n "cart: null\|products: \[\]" docs/architecture.md` finds nothing.
- [ ] 3.3 In `openspec/changes/add-contact-form-email/design.md` change the storefront cleanup line so the action returns `Result<string>` instead of `{ error }`; verify `grep -n "{ error }" openspec/changes/add-contact-form-email/design.md` finds nothing.

## 4. Verification

- [ ] 4.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:front` and `pnpm test:api`; verify all pass.

## Review findings

None.
