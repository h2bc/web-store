## Why

The Resend notification provider and three email templates (order confirmation, password reset, dashboard invite) exist in `api/`, but nothing calls them: `api/src/subscribers/` holds only the README. Customers get no order confirmation, and admins cannot reset a password or accept an invite because the links in those emails are never sent.

## What Changes

- Add a subscriber for `order.placed` that runs a workflow fetching the order and sending the `order-placed` email to the order's email address. Works for guest checkout, which is the only checkout the store has.
- Add a subscriber for `auth.password_reset` that sends the `password-reset` email with a link to the admin dashboard's reset page. Only the `user` actor type is handled; customer accounts do not exist.
- Add one subscriber for `invite.created` and `invite.resent` that sends the `user-invited` email with a link to the admin dashboard's invite page.
- Add `admin.backendUrl` to `api/medusa-config.ts`, read from `MEDUSA_BACKEND_URL`, and add the var to `api/.env.template` and `api/.env` as `http://localhost:9000`. Reset and invite links are built from it.
- Add Jest integration tests in `api/integration/` that exercise each subscriber against the local notification provider and assert on the notifications the Notification module stores.

Non-goals:

- Shipment, cancellation, refund or any other email. No templates exist for them.
- Customer password reset. The storefront has no accounts.
- Changing the email templates or the Resend provider.

## Capabilities

### New Capabilities
- `transactional-emails`: which commerce events produce an email, to whom, with which template and data, and how links in those emails are built.

### Modified Capabilities
- none.

## Impact

- `api/src/subscribers/`: three new files.
- `api/src/workflows/`: one new workflow for the order confirmation.
- `api/medusa-config.ts`, `api/.env.template`, `api/.env`: `MEDUSA_BACKEND_URL` and `admin.backendUrl`.
- `api/integration/`: new tests.
- Deployed environments: `MEDUSA_BACKEND_URL` must be set to the public API address on every API container, including workers, and the Resend vars must be present on workers too, since subscribers run on the worker in Redis event-bus mode. Manual step in `h2bc/web-store-deploy`, outside this repo, listed in tasks.
