## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Owner is told on Telegram when an order is placed | 1.1, 1.2, 1.3, 2.2 |
| Telegram delivery is optional and switched on by configuration | 1.3, 1.4, 2.2 |
| Owner receives an order-placed email | 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 |
| Order inbox is configured, not hardcoded | 1.4, 2.2 |
| Customer is emailed when their order ships | 3.1, 3.2, 3.3, 3.4, 3.5 |

## 1. API: Telegram provider

- [ ] 1.1 Create `api/tests/order-notifications.test.ts` (integration, Medusa runner with `env` carrying `ORDER_INBOX_EMAIL`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`) with a `support/notifications.ts` helper that creates an order through the order module, stubs the global `fetch` and lists notifications from the notification module; add the Telegram scenarios from `owner-notifications`: message recorded for the chat id with the order data, second delivery records nothing, chat id without a token records nothing, Bot API error is logged and the order still succeeds; verify the tests fail because no `telegram` provider exists.
- [ ] 1.2 Create `api/src/modules/telegram/index.ts` and `service.ts`: a notification `ModuleProvider` with identifier `notification-telegram`, options `bot_token` and `chat_id` validated in `validateOptions`, an `order-placed` text template in `api/src/modules/telegram/messages/order-placed.ts` rendering display id, total with currency, item count, shipping country and email, and a `send` that posts to the Bot API with `fetch` and a short timeout, logs and returns `{}` on a non-OK answer, else returns the message id; verify `pnpm typecheck:api` passes.
- [ ] 1.3 In `api/medusa-config.ts` add the Telegram provider to the notification module's providers with channel `telegram` only when both keys are set; verify the app boots with and without the keys.
- [ ] 1.4 Add `ORDER_INBOX_EMAIL=`, `TELEGRAM_BOT_TOKEN=` and `TELEGRAM_CHAT_ID=` to `api/.env.example`; verify the three keys are present with empty values.

## 2. API: owner alerts on order placed

- [ ] 2.1 Add the owner email scenarios from `transactional-emails` to `api/tests/order-notifications.test.ts`: owner email recorded for the inbox with `admin_url`, second delivery records nothing, inbox unset records no owner email; verify they fail because the workflow sends only the customer email.
- [ ] 2.2 In `api/src/workflows/send-order-confirmation.ts` add a `getNotificationRecipients` step reading `ORDER_INBOX_EMAIL`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, returning the chat id only when the token is set too, and build the notification list from the order and the recipients: customer `order-placed` when the order has an email, `order-placed-owner` email with `admin_url` when the inbox is set, `order-placed` on the `telegram` channel when the chat id is returned, each with its own idempotency key; verify the 1.1 and 2.1 tests pass.
- [ ] 2.3 Extend the query in the same workflow with `items.quantity`, `items.variant_title`, `shipping_address.*` and `shipping_methods.name` if not already loaded; verify the owner template has what it renders.
- [ ] 2.4 Change `dashboardUrl` in `api/src/utils/dashboard-url.ts` to take only the path and return the backend URL, the admin path and that path with nothing appended, and make `api/src/subscribers/invite.ts` and `password-reset.ts` append their own query string with `URLSearchParams`; verify `pnpm typecheck:api` passes and the invite and reset links keep their token.
- [ ] 2.5 Create `api/src/modules/resend/emails/order-placed-owner.tsx` on `EmailLayout` rendering the admin link, items with variant and quantity, the shipping address, the shipping method and the totals, and register `ORDER_PLACED_OWNER` in `api/src/modules/resend/service.ts` with the subject `New order #<display id>, <total>`; verify `pnpm typecheck:api` passes.
- [ ] 2.6 Add an `order-placed-owner` case to `api/src/scripts/test-email.ts` reusing the mock order plus an `admin_url`; verify `npx medusa exec ./src/scripts/test-email.ts <address> order-placed-owner` sends it.

## 3. API: shipped email

- [ ] 3.1 Add the shipped scenarios from `transactional-emails` to `api/tests/order-notifications.test.ts`, creating a fulfilment and a shipment through the core flows: email recorded with items and the tracking entry, empty tracking list when none entered, nothing when the no-notification flag is set, second delivery records nothing; verify they fail because no shipment subscriber exists.
- [ ] 3.2 Create `api/src/workflows/send-shipment-notice.ts` that takes the fulfilment id and the flag, returns early on the flag, loads the fulfilment with `labels.*`, `items.*` and the linked order's `id`, `display_id`, `email` and `shipping_address.*`, warns and stops when the order has no email, else records one `order-shipped` email with idempotency key `order-shipped-<fulfilment id>`; verify `pnpm typecheck:api` passes.
- [ ] 3.3 Create `api/src/subscribers/shipment-created.ts` on `shipment.created` running that workflow with the event's `id` and `no_notification`; verify the 3.1 tests pass.
- [ ] 3.4 Create `api/src/modules/resend/emails/order-shipped.tsx` on `EmailLayout` rendering the display id, the shipped items with quantities, the shipping address and each tracking number linked to its URL when present, and register `ORDER_SHIPPED` in `service.ts` with the subject `Your order #<display id> is on its way`; verify `pnpm typecheck:api` passes.
- [ ] 3.5 Add an `order-shipped` case to `api/src/scripts/test-email.ts` with a mock fulfilment carrying one label; verify the script sends it.

## 4. Docs and verification

- [ ] 4.1 Update `docs/architecture.md`: list `telegram/` under modules, the two new workflows and the subscriber, the Telegram service under optional services with its two keys, and the order inbox key; verify the file still reads as current facts only.
- [ ] 4.2 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.

## Outside this repo

- [ ] 5.1 After the pull request merges, in `h2bc/web-store-deploy` set `ORDER_INBOX_EMAIL`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` on the API worker container and redeploy; verify a real test order produces an email in the inbox, a message in the Telegram chat, and that marking it shipped with a tracking number emails the customer with that number.

## Review findings

None.
