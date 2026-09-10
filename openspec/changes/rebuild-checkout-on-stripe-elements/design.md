## Context

See proposal.md for motivation. The checkout page is a server component that reads the cart, decides the furthest reachable step and renders three step cards; each step is a client component calling a server action in `front/lib/data/`. Stripe is initiated at the payment step only: `initiateStripeSession` creates a Medusa payment session for the `pp_stripe_stripe` provider and the client secret comes back on the cart. The Medusa Stripe provider is configured with `automaticPaymentMethods: true` and `capture: true`, so the PaymentIntent already offers whatever methods are enabled in the Stripe dashboard; the storefront's Card Element simply ignores them. `@stripe/react-stripe-js` 6.9 and `@stripe/stripe-js` 9.15 are installed and export `AddressElement`, `PaymentElement` and `Elements`. Medusa's cart address validator accepts every field as null, so required-field enforcement has to happen in the storefront.

## Goals / Non-Goals

**Goals:**
- No storefront-owned form fields or validation rules for address or card data.
- One Stripe load per checkout, shared by both steps.
- Stripe elements visually indistinguishable from the site's inputs.

**Non-Goals:**
- Initiating the Medusa payment session before the payment step.
- Address autocomplete. It needs a Google Maps key when the Address Element is not mounted alongside the Payment Element, which is the case here.

## Decisions

**Address Element in `shipping` mode with `display.name: 'split'`, `fields.phone: 'always'`, `validation.phone.required: 'never'`, `allowedCountries` from the region.** This yields first and last name as separate values, an optional phone, and per-country validation and layout, matching the fields Medusa stores. The element reports `{ complete, value }` on change; the step keeps the latest value in state and enables Continue only when `complete` is true and the email input is valid per the browser's own `type="email" required` check. Alternative: keep react-hook-form with a smaller schema. Rejected; it keeps the custom rule set the change exists to remove.

**Email stays a native input.** Stripe's Link Authentication Element would enrol customers into Link, which the store does not want. One `<Input type="email" required>` inside a `<form>` gives validation for free.

**A single `CheckoutElements` client wrapper mounts `Elements` for the whole step column.** At the address and delivery steps it is created with no client secret, which is enough for the Address Element. At the payment step it receives the client secret from the page and the Payment Element mounts inside it. `loadStripe` stays memoised through the existing `getStripe` helper. Appearance is set once here: `theme: 'stripe'` with variables for `colorPrimary`, `colorText`, `colorDanger`, `borderRadius`, `fontFamily` and rules for `.Input` and `.Label` mirroring `components/ui/input.tsx`.

**Server action takes the Address Element value verbatim.** `setCheckoutContact({ email, address })` where `address` is `{ name: { firstName, lastName }, phone, address: { line1, line2, city, state, postal_code, country } }` as the element emits it. The action maps it to Medusa's address shape, lowercases the country and writes shipping and billing. Only presence of email, line1 and country is checked server-side; the element already validated the rest and Medusa accepts anything. No sanitising: React and the email templates escape on output, and the values come from Stripe's own form.

**Payment Element limited to card and card wallets.** The Medusa Stripe provider no longer enables Stripe's automatic payment methods, and the storefront initiates the session with `payment_method_types: ['card']` in the session data, which the provider forwards to the PaymentIntent. The Payment Element then offers card and, when available, Apple Pay and Google Pay, which Stripe treats as card wallets. Nothing else appears regardless of dashboard settings. `confirmPayment` runs with `redirect: 'if_required'` and no `return_url`; card and wallets never redirect, so the existing `completeCart` action always runs next in the same page. Billing details are supplied to `confirmPayment` from the cart's address so the Payment Element does not ask for name, email or address again. Alternative: keep automatic methods and disallow redirects. Rejected after testing; Stripe still offered MB WAY and Satispay, which use in-app approval rather than a redirect.

**The payment session is initiated by one client-triggered action, not during render.** Rendering `/checkout?step=payment` used to call Medusa's initiate-session endpoint. Next renders that page twice around the delivery step's revalidate-then-navigate, and two concurrent initiations race: the second deletes the first's session and cancels its PaymentIntent, so the page either errors or mounts a Payment Element on a cancelled intent. The page now only reads a pending session's client secret from the cart. When there is none, a small client component calls `initiateStripeSession` exactly once and refreshes the route, after which the Payment Element mounts. Alternative: retry inside the server action. Rejected; a retry can still lose to a third render and the side effect does not belong in render.

**Stripe key required from step one.** `STRIPE_PUBLISHABLE_KEY` is read on the checkout page and passed down. Without it the page renders the existing unavailable message where the address card would be. Alternative: a fallback native address form. Rejected; two implementations of the same form is the problem being removed, and checkout without Stripe cannot complete anyway.

**Dead code removal.** `CHECKOUT_STEPS` loses `review`; `calculateShippingPrice` and the "Calculated at checkout" branch go. `lib/schemas/checkout.ts` keeps only the step list.

**Order confirmation page.** Already rebuilt in the working tree on the checkout layout; this change lands it and drops the `preview` id and sample order. The store order endpoint returns items, shipping address and shipping methods by default, so no extra fields are requested.

## Risks / Trade-offs

- [Stripe iframes cannot be styled with Tailwind] → Appearance API variables and rules in one place; verify against the site's input in the browser.
- [Stripe script loads at step one] → Roughly 100 kB extra before the address form. Acceptable for a checkout; nothing else on the site loads it.
- [Apple Pay and Google Pay need HTTPS and, for Apple Pay, a domain registered in the Stripe dashboard] → Neither shows on localhost. Register the storefront domain after deploy; the Payment Element hides them until then and card still works.
- [Region countries the Address Element does not support] → Stripe supports every EU country plus Lithuania; if a region ever includes an unsupported country the element throws at mount. Countries come from the admin, so this is a configuration error; log it and show the unavailable message.
- [No e2e coverage today] → Add a Playwright flow that runs only when `STRIPE_PUBLISHABLE_KEY` is set, using Stripe's test card inside the element iframes.

## Migration Plan

1. Deploy the storefront. No backend change.
2. Confirm `STRIPE_PUBLISHABLE_KEY` is set on every storefront environment; it was already required for payments.
3. Register the storefront domain for Apple Pay in the Stripe dashboard, then place a test order with card and with a wallet.

Rollback: revert the storefront deploy. The cart data written by the new action has the same shape as before.
