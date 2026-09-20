## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Customer is emailed when a fulfilment is created | 1.1, 1.2, 1.3, 1.4, 1.5 |
| Customer is emailed when their order is delivered | 2.1, 2.2, 2.3, 2.4, 2.5 |
| Customer is emailed when an order edit is confirmed | 3.1, 3.2, 3.3, 3.4, 3.5 |

## 1. API: fulfilment created email

- [x] 1.1 Add the fulfilment created scenarios from `transactional-emails` to `api/tests/order-notifications.test.ts` (integration, Medusa runner), creating the fulfilment through the core flow and reusing `support/notifications.ts`: email recorded with the fulfilment's items, nothing when the no-notification flag is set, nothing when the order has no email, second delivery records nothing; verify they fail because no fulfilment subscriber exists.
- [x] 1.2 Create `api/src/workflows/send-fulfillment-notice.ts` copying the shape of `send-shipment-notice.ts`: take the fulfilment id and the flag, return early on the flag, load the fulfilment with `items.*` and the linked order's `id`, `display_id`, `email` and `shipping_address.*`, warn and stop when the order has no email, else record one `order-fulfillment-created` email with idempotency key `order-fulfillment-created-<fulfillment id>`; verify `pnpm typecheck:api` passes.
- [x] 1.3 Create `api/src/subscribers/fulfillment-created.ts` on `order.fulfillment_created` running that workflow with the event's `fulfillment_id` and `no_notification`; verify the 1.1 tests pass.
- [x] 1.4 Create `api/src/modules/resend/emails/order-fulfillment-created.tsx` on `EmailLayout` rendering the display id, the items with quantities and the shipping address through `getAddressLines`, and register `ORDER_FULFILLMENT_CREATED` in `api/src/modules/resend/service.ts` with the subject `We are preparing your order #<display id>`; verify `pnpm typecheck:api` passes.
- [x] 1.5 Add an `order-fulfillment-created` case to `api/src/scripts/test-email.ts` reusing the mock order and its items, and list it in the script's header comment; verify `npx medusa exec ./src/scripts/test-email.ts <address> order-fulfillment-created` sends it.

## 2. API: delivered email

- [x] 2.1 Add the delivered scenarios from `transactional-emails` to `api/tests/order-notifications.test.ts`, marking a fulfilment as delivered through the core flow: email recorded with the delivered items, nothing when the no-notification flag is set, nothing when the order has no email, second delivery of the event records nothing; verify they fail because no delivery subscriber exists.
- [x] 2.2 Create `api/src/workflows/send-delivery-notice.ts` in the same shape as 1.2, recording one `order-delivered` email with idempotency key `order-delivered-<fulfillment id>`; verify `pnpm typecheck:api` passes.
- [x] 2.3 Create `api/src/subscribers/delivery-created.ts` on `delivery.created` running that workflow with the event's `id` and `no_notification`; verify the 2.1 tests pass.
- [x] 2.4 Create `api/src/modules/resend/emails/order-delivered.tsx` on `EmailLayout` rendering the display id, the delivered items with quantities and the shipping address, and register `ORDER_DELIVERED` in `service.ts` with the subject `Your order #<display id> was delivered`; verify `pnpm typecheck:api` passes.
- [x] 2.5 Add an `order-delivered` case to `api/src/scripts/test-email.ts` reusing the mock order and its items; verify the script sends it.

## 3. API: order edited email

- [x] 3.1 Add the order edit scenarios from `transactional-emails` to `api/tests/order-notifications.test.ts`, with a `support/order-edits.ts` helper that begins an edit, adds an item, requests it with or without the flag and confirms it through the core flows: email recorded with the items and total after the edit, nothing when the edit was requested with the flag, nothing when the order has no email, second delivery of the event records nothing, a second edit records a second email; verify they fail because no order edit subscriber exists.
- [x] 3.2 Create `api/src/workflows/send-order-edit-notice.ts` that takes the order id, the first action id and the flag, returns early on the flag, warns and stops when there is no action id, loads the order's `id`, `display_id`, `email`, `currency_code`, `total` and `items.*`, warns and stops when the order has no email, else records one `order-edited` email with idempotency key `order-edited-<action id>`; verify `pnpm typecheck:api` passes.
- [x] 3.3 Create `api/src/subscribers/order-edit-confirmed.ts` on `order-edit.confirmed` running that workflow with the event's `order_id`, the id of its first action and `no_notification`; verify the 3.1 tests pass.
- [x] 3.4 Create `api/src/modules/resend/emails/order-edited.tsx` on `EmailLayout` rendering the display id, the items with quantities and the total through the price helper in `emails/price.ts`, and register `ORDER_EDITED` in `service.ts` with the subject `Your order #<display id> was changed`; verify `pnpm typecheck:api` passes.
- [x] 3.5 Add an `order-edited` case to `api/src/scripts/test-email.ts` reusing the mock order; verify the script sends it.

## 4. Docs and verification

- [x] 4.1 Update `docs/architecture.md`: list the three new workflows beside `send-shipment-notice.ts`, each with the event it answers and the no-notification rule; verify the file still reads as current facts only.
- [x] 4.2 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.

## Outside this repo

- On staging, tick "Send notification" while creating a fulfilment, marking it delivered and confirming an order edit on a test order. The customer address receives the three emails, and repeating each action unticked sends none.

## Review findings

None.
