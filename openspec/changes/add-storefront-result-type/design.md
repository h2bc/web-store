## Context

See proposal.md for why. What shapes the approach:

- Every function in `front/lib/data/` already catches, logs and returns; only the return shape differs per file. A spike on 2026-09-12 converted all of them and every caller in under an hour, then was reverted to plan it properly.
- The spike found that TypeScript does not narrow a destructured `data` after `if (error)`. It does after `if (error !== null)`. The convention has to say which.
- Pages branch three ways today: error, not found, content. The product and content page reads carry a `notFound` boolean for the middle case. The cart reads return the string `'No cart found'` and two pages compare against it.
- The contact form validates with the same Zod schema on the client through the form resolver, so the server's per-field errors are never shown in practice.
- `categories.ts` and `orders.ts` are reads marked `'use server'`, the others are `server-only`. Both work, but the rule says reads are server-only.
- There is no `front/tests/` folder yet. Vitest is configured to run `tests/**/*.test.ts` and passes with no tests.

## Goals / Non-Goals

**Goals:**

- One return type the compiler enforces, one narrowing convention, one way to say not found.
- Every page keeps its current content, error and 404 behaviour, proven by the existing Playwright journeys.

**Non-Goals:**

- Error codes, retry hints or typed error unions. The pages show one message.
- Reworking how the data layer fetches, caches or invalidates.

## Decisions

**1. `Result<T>` is a two-member union on `error`, with `ok` and `fail` helpers.** `{ data: T; error: null } | { data: null; error: string }` in `front/lib/types/result.ts`, with `ok(data)` and `fail(message)` so a data function reads as `return ok(x)` and `return fail('...')`. Alternative: a boolean discriminant `{ ok: true; data } | { ok: false; error }`. Rejected because callers could no longer destructure `data` and `error` in one line, and every component that only toasts the error would grow a wrapper object.

**2. Callers narrow with `error !== null`.** A truthiness check does not narrow the destructured `data`, an explicit null comparison does. The rule states the comparison so nobody rediscovers it. Alternative: never destructure and use `result.data` after `if (result.error)`. Rejected because truthiness does not narrow the object either, and the destructured form is what every page already writes.

**3. Not found is null data with null error.** A read that can miss returns `Result<T | null>`: the product by handle, the content page, the cart. A page checks `error !== null` first, then `data === null` for the 404. Alternative: keep the `notFound` boolean. Rejected because it is a third field carrying what the type already says, and the cart would still need its string comparison.

**4. The cart read returns `ok(null)` for a shopper without a cart.** No cart is the normal state for a new visitor, not a failure. The cart page and the header render the empty state from null data, the checkout redirects to the cart. Mutations still fail with a message when there is no cart to act on. Alternative: keep the error string and the comparison. Rejected because it is the exact drift the shared type exists to stop.

**5. The contact action returns `Result<string>` and drops per-field errors.** The client resolver already blocks a submit that fails the schema, so the server only re-validates for safety and returns one message. The success message is the data. Alternative: a `Result<T, E>` with a typed error for this one action. Rejected because it would give the whole data layer a second type parameter for one form that never shows the detail, and the pending contact change replaces the action anyway.

**6. Reads carry `import 'server-only'`, mutations carry `'use server'`.** The two reads marked as actions switch, so the data layer matches the rule. Nothing imports them from a client component today, so nothing else moves.

**7. Two Vitest unit tests prove the shape, the journeys prove the pages.** `front/tests/content-page.test.ts` mocks the SDK and asserts the read returns content, null data on a 404 and an error message on a network failure without throwing. `front/tests/cart.test.ts` mocks the SDK and the cookie helper and asserts the read returns null data without a cookie and the completion returns the order id. The four Playwright files are the tests for every caller, since no page changes what it shows. Alternative: a test per data file. Rejected because the other files are the same three branches with different SDK calls.

## Risks / Trade-offs

- [A caller still checks `if (error)` and reads `data`] → the typecheck fails, which is the point. The rule names the comparison so the fix is known.
- [The checkout ternary that skips the shipping read on other steps] → it returns `ok([])` for the other branch so the destructure narrows the same way.
- [The pending contact change planned the action as `{ error }`] → one line in its design changes to `Result<string>`, task 3.3.
- [A branch-wide rename touches twenty files at once] → no API or behaviour change, so a green typecheck plus the existing journeys is a full check.
