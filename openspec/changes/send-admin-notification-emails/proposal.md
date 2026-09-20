Task: https://cloud.h2bcweb.com/index.php/apps/deck/board/3/card/252

## Why

The admin shows a "Send notification" checkbox on several order actions, but only the shipment one sends an email. The owner ticks the box and the customer hears nothing. The delivery path already exists: a subscriber runs a workflow that records a notification, and the provider sends it.

## What Changes

- A new `order.fulfillment_created` subscriber and `send-fulfillment-notice` workflow email the customer an `order-fulfillment-created` notice with the items being packed.
- A new `delivery.created` subscriber and `send-delivery-notice` workflow email the customer an `order-delivered` notice with the delivered items and the address.
- A new `order-edit.confirmed` subscriber and `send-order-edit-notice` workflow email the customer an `order-edited` notice with the current items and the new total.
- Each email is skipped when the owner left "Send notification" unticked, which arrives as `no_notification` on the event.
- Each email is skipped with a warning when the order has no email address, the same as the shipped email.
- The Resend provider gains the three templates and their subjects, built on the shared email layout.
- API integration tests cover the three notifications, and `test-email.ts` gains a case for each template.

Non-goals:

- Emails for return requested, return received, claim created and exchange created. Medusa 2.21.0 drops the checkbox value on those four confirm routes, so the untick rule cannot hold. They wait on a follow-up card.
- An email on `order-edit.requested`. The storefront has no page where a customer approves an edit.
- Owner copies of these emails.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `transactional-emails`: adds the customer emails for fulfillment created, delivered and order edit confirmed, their templates and data, and the rule that an unticked notification checkbox sends nothing.

## Impact

- New workflows in `api/src/workflows/`: `send-fulfillment-notice.ts`, `send-delivery-notice.ts` and `send-order-edit-notice.ts`.
- New subscribers in `api/src/subscribers/`: `fulfillment-created.ts`, `delivery-created.ts` and `order-edit-confirmed.ts`.
- New templates in `api/src/modules/resend/emails/`: `order-fulfillment-created.tsx`, `order-delivered.tsx` and `order-edited.tsx`.
- Edited: `api/src/modules/resend/service.ts`, `api/src/scripts/test-email.ts` and `docs/architecture.md`.
- Tests extend `api/tests/order-notifications.test.ts`.
- `add-owner-order-notifications` is archived first, so the shipped and cancelled requirements are in the main spec before this delta lands.
- No new env keys and no storefront change.
