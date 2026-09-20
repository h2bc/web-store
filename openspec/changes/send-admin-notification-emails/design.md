## Context

See `proposal.md` for the motivation. The shipped email is the pattern: `api/src/subscribers/shipment-created.ts` passes the event's id and `no_notification` to `api/src/workflows/send-shipment-notice.ts`, which returns early on the flag, loads the fulfilment with its order, warns when the order has no email and records one notification with an idempotency key.

Medusa 2.21.0 is the latest release. It carries `no_notification` on `order.fulfillment_created`, `delivery.created` and `order-edit.confirmed`. The confirm routes for returns, return receipts, claims and exchanges drop the field, on `develop` too, so those four events never carry it.

## Goals / Non-Goals

**Goals:**

- Three emails that follow the shipped email's shape, so a reader who knows one knows all four.
- The checkbox decides, with no setting of our own on top.

**Non-Goals:**

- A workaround that saves the dropped flag for returns, claims and exchanges.
- A shared generic notice workflow.

## Decisions

**One workflow and one subscriber per email.** Each of the three events gets its own `send-*-notice.ts` workflow and its own subscriber, copying the shipped pair. The alternative was one generic workflow that takes a template name and a query. The three queries differ: two start from a fulfilment, one from an order with totals. A generic version would need a switch per template, which is harder to read than three short files.

**Fulfilment and delivery emails load the fulfilment, not the order.** Both events carry a fulfilment id. The workflows query `fulfillment` with `items.*` and the linked order's `id`, `display_id`, `email` and `shipping_address.*`, exactly as the shipped workflow does. The alternative was loading the whole order and filtering its items. An order can have several fulfilments, and the email must list only the items in this one.

**The order edit email is sent on confirmed, not on requested.** `order-edit.confirmed` fires when the change is final and carries the flag stored when the edit was requested. The alternative was emailing on `order-edit.requested` and asking the customer to approve. The storefront has no approval page, and the admin confirms edits itself, so that email would point nowhere.

**The order edit email shows the order after the edit, not a diff.** The workflow loads the order's `display_id`, `email`, `currency_code`, `total` and `items.*` after confirmation. The alternative was rendering added and removed lines from the event's `actions`. Action details need mapping per action type, and the customer's question is what they will now receive and pay.

**Idempotency keys name the thing that happened once.** The keys are `order-fulfillment-created-<fulfillment id>`, `order-delivered-<fulfillment id>` and `order-edited-<first action id>`. An order can be edited many times, so an order id key would block the second edit's email. The event carries the change's actions and not the change id, and an action belongs to exactly one change. The alternative was querying the order's latest confirmed change for its id, which costs a query and can race with a second edit.

**Templates reuse `EmailLayout`, `getAddressLines` and the price helper.** Each template is a small file beside `order-shipped.tsx` with the same heading and item list markup. The alternative was one template with a `kind` prop. Subjects, headings and sections differ enough that the branches would outweigh the shared lines.

**Tests extend `api/tests/order-notifications.test.ts`.** The file already holds the customer email scenarios and `support/notifications.ts` already creates orders and lists notifications. The alternative was a new test file per email, which the one-file-per-module rule in `.claude/rules/tests.md` argues against.

## Risks / Trade-offs

- A fulfilment email followed by a shipped email can feel like two emails for one parcel. The owner controls each with its own checkbox.
- The admin ticks "Send notification" by default on some dialogs. After this change those ticks send real emails, so the owner needs telling once.
- An order edit with no actions would have no idempotency key. The workflow warns and sends nothing in that case, since an empty edit changes nothing for the customer.
- When Medusa forwards the flag on the four remaining routes, the follow-up card adds those emails in the same shape.

## Migration Plan

`add-owner-order-notifications` is archived before this change's specs are synced, so the shipped and cancelled requirements are in the main spec first. No data migration and no new env key.
