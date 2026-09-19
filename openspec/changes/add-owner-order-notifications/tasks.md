## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Owner receives an order-placed email | 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 |
| Order inbox is configured, not hardcoded | 1.2, 1.7 |
| Customer is emailed when their order ships | 2.1, 2.2, 2.3, 2.4, 2.5 |
| Customer is emailed when their order is cancelled | 3.1, 3.2, 3.3, 3.4, 3.5 |

## 1. API: owner email on order placed

- [x] 1.1 Create `api/tests/order-notifications.test.ts` (integration, Medusa runner with `env` carrying `ORDER_INBOX_EMAIL` and `MEDUSA_BACKEND_URL`) with a `support/notifications.ts` helper that creates an order through the order module and lists notifications from the notification module; add the owner email scenarios from `transactional-emails`: owner email recorded for the inbox with `admin_url`, second delivery records nothing, inbox unset records no owner email; verify they fail because the workflow sends only the customer email.
- [x] 1.2 In `api/src/workflows/send-order-confirmation.ts` add a `getNotificationRecipients` step reading `ORDER_INBOX_EMAIL`, and build the notification list from the order and the recipients: customer `order-placed` when the order has an email, `order-placed-owner` email with `admin_url` when the inbox is set, each with its own idempotency key; verify the 1.1 tests pass.
- [x] 1.3 Extend the query in the same workflow with `items.quantity`, `items.variant_title`, `shipping_address.*` and `shipping_methods.name` if not already loaded; verify the owner template has what it renders.
- [x] 1.4 Create `api/src/modules/resend/emails/order-placed-owner.tsx` on `EmailLayout` rendering the admin link, items with variant and quantity, the shipping address, the shipping method and the totals, and register `ORDER_PLACED_OWNER` in `api/src/modules/resend/service.ts` with the subject `New order #<display id>, <total>`; verify `pnpm typecheck:api` passes.
- [x] 1.5 Add an `order-placed-owner` case to `api/src/scripts/test-email.ts` reusing the mock order plus an `admin_url`; verify `npx medusa exec ./src/scripts/test-email.ts <address> order-placed-owner` sends it.
- [x] 1.6 Make `params` optional in `dashboardUrl` in `api/src/utils/dashboard-url.ts` so a link without a query string has no trailing `?`; verify the invite and reset links keep their token.
- [x] 1.7 Add `ORDER_INBOX_EMAIL=` to `api/.env.example`; verify the key is present with an empty value.

## 2. API: shipped email

- [x] 2.1 Add the shipped scenarios from `transactional-emails` to `api/tests/order-notifications.test.ts`, creating a fulfilment and a shipment through the core flows: email recorded with items and the tracking entry, empty tracking list when none entered, nothing when the no-notification flag is set, second delivery records nothing; verify they fail because no shipment subscriber exists.
- [x] 2.2 Create `api/src/workflows/send-shipment-notice.ts` that takes the fulfilment id and the flag, returns early on the flag, loads the fulfilment with `labels.*`, `items.*` and the linked order's `id`, `display_id`, `email` and `shipping_address.*`, warns and stops when the order has no email, else records one `order-shipped` email with idempotency key `order-shipped-<fulfilment id>`; verify `pnpm typecheck:api` passes.
- [x] 2.3 Create `api/src/subscribers/shipment-created.ts` on `shipment.created` running that workflow with the event's `id` and `no_notification`; verify the 2.1 tests pass.
- [x] 2.4 Create `api/src/modules/resend/emails/order-shipped.tsx` on `EmailLayout` rendering the display id, the shipped items with quantities, the shipping address and each tracking number linked to its URL when present, and register `ORDER_SHIPPED` in `service.ts` with the subject `Your order #<display id> is on its way`; verify `pnpm typecheck:api` passes.
- [x] 2.5 Add an `order-shipped` case to `api/src/scripts/test-email.ts` with a mock fulfilment carrying one label; verify the script sends it.

## 3. API: cancelled email

- [x] 3.1 Add the cancelled scenarios from `transactional-emails` to `api/tests/order-notifications.test.ts`, with a `support/cancellations.ts` helper that links a refunded payment collection to an order and runs the workflow: email recorded with `refunded_total` for a paid order, `refunded_total` of zero with no captured payment, nothing recorded without an email, second delivery records nothing; verify they fail because no cancellation workflow exists.
- [x] 3.2 Create `api/src/workflows/send-cancellation-notice.ts` that takes the order id, loads the order's `id`, `display_id`, `email`, `currency_code`, `items.*` and `payment_collections.refunded_amount`, warns and stops when the order has no email, else records one `order-canceled` email with `refunded_total` and idempotency key `order-canceled-<order id>`; verify the 3.1 tests pass.
- [x] 3.3 Create `api/src/subscribers/order-canceled.ts` on `order.canceled` running that workflow with the event's `id`; verify `pnpm typecheck:api` passes.
- [x] 3.4 Create `api/src/modules/resend/emails/order-canceled.tsx` on `EmailLayout` rendering the display id, the items with quantities and the refund line when `refunded_total` is above zero, and register `ORDER_CANCELED` in `service.ts` with the subject `Your order #<display id> was cancelled`; verify `pnpm typecheck:api` passes.
- [x] 3.5 Add an `order-canceled` case to `api/src/scripts/test-email.ts` reusing the mock order plus a `refunded_total`; verify the script sends it.

## 4. Docs and verification

- [x] 4.1 Update `docs/architecture.md`: list the two new workflows and the two subscribers, and the order inbox key under optional services; verify the file still reads as current facts only.
- [x] 4.2 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.

## Outside this repo

- [ ] 5.1 After the pull request merges, in `h2bc/web-store-deploy` set `ORDER_INBOX_EMAIL` on the API worker container and redeploy; verify a real test order produces an email in the inbox, and that marking it shipped with a tracking number emails the customer with that number, and that cancelling it emails the customer with the refunded amount.

## Review findings

None.
