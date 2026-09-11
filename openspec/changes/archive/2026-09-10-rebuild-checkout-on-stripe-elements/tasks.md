## 1. Remove dead checkout code

- [x] 1.1 In `front/lib/schemas/checkout.ts` drop `review` from `CHECKOUT_STEPS` and delete `checkoutAddressSchema` and `CheckoutAddressData`; delete `calculateShippingPrice` from `front/lib/data/shipping.ts` and the `isCalculated` field plus the "Calculated at checkout" branch in `front/components/checkout/delivery-step.tsx`; verify `cd front && pnpm typecheck` reports only the address step and cart action as remaining users of the removed schema

## 2. Shared Stripe wrapper

- [x] 2.1 Create `front/components/checkout/checkout-elements.tsx`, a client component taking `publishableKey` and optional `clientSecret`, that renders Stripe `Elements` with the Appearance options from design.md and the existing `getStripe` loader; verify the Address Element renders inside it on the checkout page

## 3. Address step on the Address Element

- [x] 3.1 Rewrite `front/lib/data/cart.ts` `setCheckoutContact` to accept `{ email, address }` in the Address Element's value shape, map it to Medusa's shipping and billing address, keep the `xss` cleanup, and reject only a missing email, street line or country; verify `cd front && pnpm typecheck` passes with no remaining import of the deleted schema
- [x] 3.2 Rewrite `front/components/checkout/address-step.tsx`: a `<form>` with the native email input and an `AddressElement` in shipping mode configured per design.md with `allowedCountries` from the `countries` prop and `defaultValues` from the cart; Continue disabled until the element reports complete; on submit call the new action and push to the delivery step; verify in the browser that an invalid postal code for the chosen country blocks submission and that a valid address lands on the delivery step with the cart showing the address in the step summary

## 4. Payment step on the Payment Element

- [x] 4.1 Rewrite `front/components/checkout/payment-step.tsx` to render `PaymentElement` with `fields.billingDetails: 'never'` and on Place order call `confirmPayment` with `redirect: 'if_required'` and billing details from the cart address, then `completeCart` and redirect to the confirmation page; keep the existing error alert for Stripe and cart errors; verify a Stripe test card places an order and a declined test card shows the decline reason with the cart intact
- [x] 4.2 In `front/app/(main)/checkout/page.tsx` read `STRIPE_PUBLISHABLE_KEY` once, render the unavailable message in place of the step column when it is missing, wrap the step column in `CheckoutElements` with the client secret at the payment step, and initiate the session through `PaymentSessionStarter` when the cart has none; verify by opening the checkout without the key and seeing the message, and by reaching the payment step and seeing only card offered

## 5. Order confirmation page

- [x] 5.1 In `front/app/(main)/order/[id]/confirmed/page.tsx` remove the `preview` branch and `previewOrder`; verify `cd front && pnpm typecheck` passes and `/order/preview/confirmed` now shows the order error alert

## 6. Tests and checks

- [x] 6.1 Add `e2e/checkout.test.ts` that skips unless `STRIPE_PUBLISHABLE_KEY` is set, adds a product to the cart, fills the Address Element iframes and email, picks the first delivery option, enters Stripe's `4242 4242 4242 4242` test card in the Payment Element iframe, places the order and asserts the confirmation page shows the order number and the entered email; verify `pnpm test:e2e` passes locally with test keys
- [x] 6.2 Run `cd front && pnpm lint && pnpm typecheck` and verify both pass
