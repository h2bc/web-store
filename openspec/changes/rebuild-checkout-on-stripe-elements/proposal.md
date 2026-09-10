## Why

The checkout address and payment steps are hand-built: a custom zod schema with hand-written error copy, validated once in the browser and again in the server action, a form with no per-country postal code or phone rules, and Stripe's legacy Card Element for payment. Stripe already ships validated, localized, autocomplete-enabled address and payment forms, and the React package the storefront depends on includes them. Reusing those removes the custom form and validation code and gives customers Apple Pay and Google Pay for free.

## What Changes

- Replace the address form with Stripe's Address Element in shipping mode, restricted to the cart region's countries, plus one native email input. The server action accepts the element's address object and writes it to the cart's shipping and billing address; the custom zod schema and its double validation are removed.
- Replace the Card Element with Stripe's Payment Element, limited to card and the card wallets (Apple Pay, Google Pay). The PaymentIntent is pinned to the card type, so no local method appears, confirmation always completes in place and no return handler is needed.
- Style all Stripe elements through the Appearance API so they match the storefront's inputs.
- **BREAKING** for local dev: the checkout now needs `STRIPE_PUBLISHABLE_KEY` from the first step, not only at payment. Without it the checkout shows the existing "payments unavailable" message instead of the address form. Cart, catalog and everything else keep working without Stripe.
- Remove dead checkout code: the never-rendered `review` step and the uncalled shipping price calculation action.
- Keep the Delivery step as it is: a radio list of Medusa shipping options.
- Land the rebuilt order confirmation page already in the working tree: same width, grid and summary component as checkout, thank-you and order details cards on the left, primary "Continue shopping" button under the summary. Remove its temporary `preview` id and sample order.

Non-goals:

- Stripe Link, the Link Authentication Element, or any customer account. Checkout stays guest-only.
- A separate billing address. Billing keeps mirroring shipping.
- Calculated-price shipping options. They stay unsupported; the placeholder label is removed with the dead action.
- Other changes to the Medusa backend. The only backend edit is turning off automatic payment methods in the Stripe provider options.

## Capabilities

### New Capabilities
- `storefront-checkout`: the guest checkout flow from cart to confirmed order: steps and their gating, what each step collects and how it is validated, how payment is confirmed and the cart completed, and what the order confirmation page shows.

### Modified Capabilities
- none.

## Impact

- `front/components/checkout/`: `address-step.tsx` and `payment-step.tsx` rewritten on Stripe Elements; new client wrapper that loads Stripe once for the whole checkout.
- `front/lib/schemas/checkout.ts`: address schema and `review` step removed; step list stays.
- `front/lib/data/cart.ts`: `setCheckoutContact` takes the Address Element result; `completeCart` unchanged.
- `front/lib/data/shipping.ts`: `calculateShippingPrice` removed.
- `front/lib/data/payment.ts`: the payment session is initiated once from a client-triggered action with the card payment method type.
- `api/medusa-config.ts`: `automaticPaymentMethods` removed from the Stripe provider options.
- `front/app/(main)/checkout/page.tsx`: Stripe key and region countries passed down.
- `front/app/(main)/order/[id]/confirmed/page.tsx`: preview scaffolding removed.
- Dependencies: no new packages. `react-hook-form`, `@hookform/resolvers` and `zod` stay because the contact form uses them.
- Tests: new Playwright e2e for the checkout flow against Stripe test mode, gated on the key being present.
