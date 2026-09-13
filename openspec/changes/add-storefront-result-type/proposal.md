## Why

The storefront rule says every data-layer function returns a result object with an error field, but nothing enforces it: eight files in `front/lib/data/` each declare their own result type with a different data field name, and three functions return a bare value, a string or nothing. Callers compare error strings and carry a separate `notFound` flag. One shared type makes the compiler enforce the rule and lets a review find any outlier with one search.

## What Changes

- One `Result<T>` type for the storefront data layer: data with a null error, or null data with an error message. Every function in `front/lib/data/` returns it and nothing else.
- A read that can legitimately find nothing returns `Result<T | null>`, so null data with a null error means not found. The `notFound` flag and the `'No cart found'` string comparison go.
- The cart read returns null data, not an error, when the shopper has no cart. Completing the cart returns the order id as data, releasing it returns null data.
- The contact action returns the success message as data and a message as error, without per-field errors. The form already validates every field with the same schema before submitting. The pending `add-contact-form-email` change already drops the per-field errors and planned `{ error }`; it adopts `Result<string>` instead.
- Reads are `server-only` and mutations are server actions. The categories and order reads currently carry the server action marker and switch.
- The storefront rule gains the data-layer invariants: one file per resource, one function per call, the shared return type, errors logged in the data layer and returned as a message, and the review list names a function whose return type is not `Result<T>`.
- `docs/architecture.md` describes the new shape in its data-layer section.

Non-goals:

- Changing what any page shows. Every page renders the same content, error and 404 states as today.
- Touching the API or the checkout flow.
- A generic error type with codes. One message string is all the pages use.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `agent-guidance`: the storefront rule's runtime failure list names a data-layer function whose return type is not the shared result type, instead of one that throws.

## Impact

- `front/lib/types/result.ts` (new), `front/lib/types/shipping.ts` (new, moved out of the data file).
- `front/lib/data/`: `cart.ts`, `categories.ts`, `contact.ts`, `content-page.ts`, `gallery.ts`, `orders.ts`, `payment.ts`, `products.ts`, `shipping.ts`.
- `front/lib/schemas/contact.ts` loses the form response type.
- Callers: the cart, checkout, checkout return, gallery, order confirmation, shop, product, about, privacy, terms and shipping-returns pages, the sitemap, the site header, the content page view, the contact form, and the address, delivery, payment and payment return checkout components.
- `front/tests/content-page.test.ts` and `front/tests/cart.test.ts` (new).
- `.claude/rules/front.md`, `docs/architecture.md`.
- `add-contact-form-email` adopts the shape when it lands.
