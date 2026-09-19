## Context

See proposal.md for why. What shapes the approach:

- Every email today is one workflow calling `sendNotificationsStep`, the notification module recording the row, and the configured provider sending or logging it. The order confirmation is exactly this path and is idempotent through an `idempotency_key` per order.
- Medusa emits `shipment.created` with the fulfilment id and a `no_notification` flag when the owner marks a fulfilment as shipped. Tracking entered in that dialog is stored as labels on the fulfilment, each with a tracking number, a tracking URL and a label URL. The fulfilment reaches its order through the order-fulfilment link.
- Cancelling an order in the admin refunds its captured payments and then emits `order.canceled` with the order id.
- Subscribers run in the worker container. Anything they need has to be env the worker carries.
- The API tests boot the app in-process with the local notification provider, so a test can list recorded notifications from the notification module.

## Goals / Non-Goals

**Goals:**

- One notification path for all four messages. A new recipient is one more entry in the same step, not a second sender.
- The owner email is optional. With no inbox set, the app behaves exactly as today.

**Non-Goals:**

- A second owner channel such as Telegram. It was built and dropped: the owner email carries the same alert, and a custom provider is more code to maintain.
- Retrying a failed Resend send. The provider logs and returns, as today.
- A generic webhook provider.

## Decisions

**Owner alerts live in the existing order-placed workflow.** The workflow builds the list of notifications from the order and the configuration: the customer email when the order has an email, the owner email when `ORDER_INBOX_EMAIL` is set. One `sendNotificationsStep` call sends them all, each with its own idempotency key such as `order-placed-owner-<order id>`. Alternative considered: one subscriber and workflow per recipient. Rejected because both read the same order and would double the query, and because the module already accepts a list.

**Recipients come from env read inside the workflow.** A small `getNotificationRecipients` step resolves the inbox from `process.env` and returns it with the admin link, so the workflow's `transform` stays pure and the env is read where it runs, the worker. Alternative: reading env in the subscriber and passing it as input. Rejected because every subscriber would repeat it and the workflow is the unit tests exercise.

**Owner email is its own template, not a copy.** `order-placed-owner` renders what the owner needs to pack the parcel: items with variant and quantity, the shipping address, the shipping method, totals and a link to the order in the admin. The link is built by the same backend URL helper the invite and reset emails use. Alternative: a bcc on the customer email. Rejected because it cannot carry the admin link and disappears when the order has no email.

**Shipped email hangs off `shipment.created`.** A `shipment-created` subscriber runs `sendShipmentNoticeWorkflow` with the fulfilment id and the flag. The workflow returns early when `no_notification` is true, loads the fulfilment with its labels and items and the order with its email, display id and shipping address, warns and stops when the order has no email, and otherwise records one `order-shipped` email with idempotency key `order-shipped-<fulfilment id>`. Alternative: `order.fulfillment_created`, which fires when the owner creates the fulfilment, before it ships and before tracking exists. Rejected because the customer would be told "shipped" too early.

**Cancelled email hangs off `order.canceled` and carries the refund.** An `order-canceled` subscriber runs `sendCancellationNoticeWorkflow` with the order id. The workflow loads the order with its email, display id, currency, items and `payment_collections.refunded_amount`, warns and stops when the order has no email, and otherwise records one `order-canceled` email with `refunded_total` summed from the payment collections and idempotency key `order-canceled-<order id>`. The template shows the refund line only when the amount is above zero. Alternative: a second email on `payment.refunded`. Rejected because a cancellation would send two emails, and a manual refund is a conversation the owner already has with the customer.

**Tracking is optional and rendered as entered.** The template lists each label's tracking number, linked when a tracking URL is present. No carrier lookup and no URL templates. Alternative: building carrier URLs from the number. Rejected because the carrier is not known to the system.

**Tests read the notification table.** The runner's `env` carries `ORDER_INBOX_EMAIL` and `MEDUSA_BACKEND_URL`, which the workflow reads at run time. The order-placed tests in `api/tests/order-notifications.test.ts` run the workflow directly through the container with an order created by the order module. The cancelled tests run the workflow directly the same way, with a refunded payment collection linked to the order for the paid scenario. The shipped tests create the fulfilment and the shipment through the core order workflows, so the `shipment.created` event reaches the subscriber, and wait for the notification module to record the email. Alternative: an end-to-end Playwright journey through checkout. Rejected because the outcome is a row, not something a shopper sees.

## Risks / Trade-offs

- [Env set on the server container but not the worker] → The task list names the worker, and `docs/architecture.md` already states that subscribers only see the worker's env.
- [A shipment with several labels or partial quantities] → The template lists every label and the items on the fulfilment, not the order, so a second shipment produces a second, correct email.
- [The order query for the owner email grows the notification payload] → It is the same query the customer email already runs; the owner template only reads more of it.

## Migration Plan

- Merge and deploy the API. With no new env set, nothing changes.
- In the deploy repository set `ORDER_INBOX_EMAIL` on the API worker container and redeploy.
- Rollback is unsetting the key; the templates stay inert.
