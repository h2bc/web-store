## Why

Nothing tells the owner that an order came in; they only find it by opening the admin. The customer hears from the shop once, at checkout, and nothing when the parcel leaves or the order is cancelled. The API already has the delivery path for both, a workflow that records a notification which a provider sends, so this is wiring, not new plumbing.

## What Changes

- The order-placed workflow records one more notification next to the customer email: an `order-placed-owner` email to the shop's order inbox.
- A new `shipment.created` subscriber and `send-shipment-notice` workflow that email the customer an `order-shipped` notice with the shipped items and any tracking the owner entered, unless the owner ticked "no notification" when marking it shipped.
- A new `order.canceled` subscriber and `send-cancellation-notice` workflow that email the customer an `order-canceled` notice with the items and the amount refunded by the cancellation.
- The Resend provider gains the `order-placed-owner`, `order-shipped` and `order-canceled` templates and their subjects.
- One new API env key, `ORDER_INBOX_EMAIL`. The owner email is skipped when it is empty, so local development and CI keep working without it.
- API integration tests for the three notifications, and a `test-email.ts` case for each new template.

Non-goals:

- A second owner channel such as Telegram.
- An email for a manual refund without a cancellation.
- Owner emails for shipments, cancellations or anything other than a new order.
- Carrier integration. Tracking is what the owner types into the admin's "mark as shipped" dialog.
- Delivery confirmation emails on `delivery.created`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `transactional-emails`: adds the owner copy of the order-placed email, the customer shipped email and the customer cancelled email, their recipients, templates and data, and the order inbox configuration.

## Impact

- `api/src/workflows/send-order-confirmation.ts` gains the owner email.
- New workflows: `api/src/workflows/send-shipment-notice.ts` and `api/src/workflows/send-cancellation-notice.ts`.
- New subscribers: `api/src/subscribers/shipment-created.ts` and `api/src/subscribers/order-canceled.ts`.
- New templates under `api/src/modules/resend/emails/`: `order-placed-owner.tsx`, `order-shipped.tsx` and `order-canceled.tsx`.
- Edited: `api/src/modules/resend/service.ts`, `api/src/scripts/test-email.ts`, `api/.env.example` and `docs/architecture.md`.
- New test file: `api/tests/order-notifications.test.ts`.
- The deploy repository must set the key on the API worker container, since subscribers run there.
