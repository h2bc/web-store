## Why

Nothing tells the owner that an order came in; they only find it by opening the admin. The customer hears from the shop once, at checkout, and nothing when the parcel leaves. The API already has the delivery path for both, a workflow that records a notification which a provider sends, so this is wiring, not new plumbing.

## What Changes

- The order-placed workflow records two more notifications next to the customer email: an `order-placed-owner` email to the shop's order inbox, and an `order-placed` Telegram message to the owner's chat.
- A new `telegram` notification provider under `api/src/modules/telegram`, on the `telegram` channel, that posts a plain-text message to the Telegram Bot API. Registered only when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set, like every other service.
- A new `shipment.created` subscriber and `send-shipment-notice` workflow that email the customer an `order-shipped` notice with the shipped items and any tracking the owner entered, unless the owner ticked "no notification" when marking it shipped.
- The Resend provider gains the `order-placed-owner` and `order-shipped` templates and their subjects.
- Three new API env keys: `ORDER_INBOX_EMAIL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Each recipient is skipped when its key is empty, so local development and CI keep working with none of them.
- API integration tests for the three notifications, and a `test-email.ts` case for each new template.

Non-goals:

- Telegram messages for shipments, cancellations or anything other than a new order.
- Carrier integration. Tracking is what the owner types into the admin's "mark as shipped" dialog.
- A Telegram provider module published for reuse. It stays a local module like `resend`.
- Delivery confirmation emails on `delivery.created`.

## Capabilities

### New Capabilities

- `owner-notifications`: the Telegram channel, its provider, its configuration and what the owner receives when an order is placed.

### Modified Capabilities

- `transactional-emails`: adds the owner copy of the order-placed email and the customer shipped email, their recipients, templates and data, and the order inbox configuration.

## Impact

- `api/src/workflows/send-order-confirmation.ts` (adds the owner email and the Telegram message), `api/src/workflows/send-shipment-notice.ts` (new), `api/src/subscribers/shipment-created.ts` (new).
- `api/src/modules/telegram/` (new provider), `api/medusa-config.ts` (registers it by env), `api/.env.example`.
- `api/src/modules/resend/service.ts`, `api/src/modules/resend/emails/order-placed-owner.tsx` (new), `api/src/modules/resend/emails/order-shipped.tsx` (new), `api/src/scripts/test-email.ts`.
- `api/tests/order-notifications.test.ts` (new), `docs/architecture.md`.
- The deploy repository must set the three keys on the API worker container, since subscribers run there.
