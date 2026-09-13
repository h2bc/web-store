## Context

See proposal.md for why. What shapes the approach:

- Every email today is one workflow calling `sendNotificationsStep`, the notification module recording the row, and the configured provider sending or logging it. The order confirmation is exactly this path and is idempotent through an `idempotency_key` per order.
- The notification module accepts several providers, each owning its channels. It picks the provider by the notification's `channel`. A notification on a channel no provider owns fails the step.
- Medusa emits `shipment.created` with the fulfilment id and a `no_notification` flag when the owner marks a fulfilment as shipped. Tracking entered in that dialog is stored as labels on the fulfilment, each with a tracking number, a tracking URL and a label URL. The fulfilment reaches its order through the order-fulfilment link.
- Subscribers run in the worker container. Anything they need has to be env the worker carries.
- The API tests boot the app in-process with the local notification provider, so a test can list recorded notifications from the notification module and stub the global `fetch`.

## Goals / Non-Goals

**Goals:**

- One notification path for all four messages. A new recipient is one more entry in the same step, not a second sender.
- Every recipient is optional. With no keys, the app behaves exactly as today.
- Telegram is a provider like Resend, so its messages are recorded, idempotent and visible in the notification table.

**Non-Goals:**

- Rich Telegram messages with buttons or images.
- Retrying a failed Telegram or Resend send. The provider logs and returns, as today.
- A generic webhook provider.

## Decisions

**Owner alerts live in the existing order-placed workflow.** The workflow builds the list of notifications from the order and the configuration: the customer email when the order has an email, the owner email when `ORDER_INBOX_EMAIL` is set, the Telegram message when both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set, the same condition that registers the provider. One `sendNotificationsStep` call sends them all, each with its own idempotency key such as `order-placed-owner-<order id>` and `order-placed-telegram-<order id>`. Alternative considered: one subscriber and workflow per recipient. Rejected because the three read the same order and would triple the query, and because the module already accepts a list.

**Recipients come from env read inside the workflow.** A small `getNotificationRecipients` step reads `process.env` and returns the inbox, and the chat id only when the bot token is set too, so the workflow's `transform` stays pure and the env is read where it runs, the worker. Alternative: reading env in the subscriber and passing it as input. Rejected because every subscriber would repeat it and the workflow is the unit tests exercise.

**Telegram is a notification provider module on its own channel.** `api/src/modules/telegram` mirrors `resend`: a `ModuleProvider` for the notification module, options `bot_token` and `chat_id`, channel `telegram`, one template map from template name to a function that renders plain text from the notification data. `send` posts JSON to `https://api.telegram.org/bot<token>/sendMessage` with the global `fetch`, logs an error on a non-OK answer and returns an empty result, and returns the Telegram message id otherwise. `medusa-config.ts` adds it to the notification module's providers only when both keys are set. Alternative: calling the Bot API directly from a workflow step. Rejected because it would bypass the notification table and the idempotency key, and would be the only side effect outside a provider.

**The Telegram `to` is the chat id.** The workflow addresses the notification to the configured chat id, so the row shows where it went and the provider stays stateless. The provider still holds `chat_id` in its options for validation. Alternative: an empty `to` with the provider filling it in. Rejected because the row would say nothing about the recipient.

**Owner email is its own template, not a copy.** `order-placed-owner` renders what the owner needs to pack the parcel: items with variant and quantity, the shipping address, the shipping method, totals and a link to the order in the admin. The link is built by `dashboardUrl`, the helper the invite and reset emails use, which changes to return the backend URL, the admin path and the given path with nothing appended; the invite and reset subscribers add their own query string. Alternative: a bcc on the customer email. Rejected because it cannot carry the admin link and disappears when the order has no email.

**Shipped email hangs off `shipment.created`.** A `shipment-created` subscriber runs `sendShipmentNoticeWorkflow` with the fulfilment id and the flag. The workflow returns early when `no_notification` is true, loads the fulfilment with its labels and items and the order with its email, display id and shipping address, warns and stops when the order has no email, and otherwise records one `order-shipped` email with idempotency key `order-shipped-<fulfilment id>`. Alternative: `order.fulfillment_created`, which fires when the owner creates the fulfilment, before it ships and before tracking exists. Rejected because the customer would be told "shipped" too early.

**Tracking is optional and rendered as entered.** The template lists each label's tracking number, linked when a tracking URL is present. No carrier lookup and no URL templates. Alternative: building carrier URLs from the number. Rejected because the carrier is not known to the system.

**Tests stub the network, not the provider.** `api/tests/order-notifications.test.ts` boots the app with `env` carrying `ORDER_INBOX_EMAIL`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, so both providers register alongside the local email provider, and replaces the global `fetch` with a stub that records the call and answers like the Bot API. The test runs the workflows directly through the container with an order created by the order module, then lists notifications from the notification module. Alternative: an end-to-end Playwright journey through checkout. Rejected because the outcome is a row and a log line, not something a shopper sees.

## Risks / Trade-offs

- [Telegram outage or a bad token slows order placement by the request timeout] → The provider uses a short `AbortSignal.timeout`, logs and returns; the order was already placed before the subscriber ran.
- [Env set on the server container but not the worker] → The task list names the worker, and `docs/architecture.md` already states that subscribers only see the worker's env.
- [A shipment with several labels or partial quantities] → The template lists every label and the items on the fulfilment, not the order, so a second shipment produces a second, correct email.
- [The order query for the owner email grows the notification payload] → It is the same query the customer email already runs; the owner template only reads more of it.

## Migration Plan

- Merge and deploy the API. With no new env set, nothing changes.
- In the deploy repository set `ORDER_INBOX_EMAIL`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` on the API worker container and redeploy.
- Rollback is unsetting the keys; the templates and the provider stay inert.
