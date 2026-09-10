## Context

See proposal.md for motivation. The Notification module is registered in `api/medusa-config.ts` with the custom Resend provider (`api/src/modules/resend/`) when `RESEND_API_KEY` is set and Medusa's local provider otherwise. Templates `order-placed`, `password-reset` and `user-invited` expect, respectively, `{ order }`, `{ reset_url, email }` and `{ invite_url, email }`. `api/src/scripts/test-email.ts` already queries the order fields the template needs. In dev and in Jest the event bus is in-process; in production it is Redis and subscribers execute on whichever container has `MEDUSA_WORKER_MODE` of `worker` or `shared`. The storefront is guest-only, so `auth.password_reset` only ever matters for the `user` actor.

Event names and payloads, confirmed in `@medusajs/utils` 2.13.1: `order.placed` `{ id }`, `auth.password_reset` `{ entity_id, actor_type, token }`, `invite.created` and `invite.resent` `{ id }`.

## Goals / Non-Goals

**Goals:**
- Follow the shapes in Medusa's own docs so the code reads like any other Medusa project.
- Every subscriber is exercised by an integration test that needs no external service.

**Non-Goals:**
- Retry or dead-letter handling beyond what the event bus and Notification module already do.
- Making the email templates configurable per environment.

## Decisions

**Order confirmation runs a workflow; the token emails call the module directly.**
`src/subscribers/order-placed.ts` invokes `sendOrderConfirmationWorkflow` in `src/workflows/send-order-confirmation.ts`, built from `useQueryGraphStep` and `sendNotificationsStep` in `@medusajs/medusa/core-flows`, exactly as the Resend integration guide does. The reset and invite subscribers call `createNotifications` on the Notification module from the subscriber, as the auth docs do, because their payload already carries the data and there is nothing to orchestrate. Alternative: workflows for all three. Rejected as ceremony for a single step.

**Idempotency on order confirmation.** The workflow passes `idempotency_key: order-placed-<order id>` to `sendNotificationsStep`, so a redelivered event does not email the customer twice. The Notification module enforces the key.

**Dashboard links come from `admin.backendUrl` and `admin.path`.** `admin.backendUrl` is set from `MEDUSA_BACKEND_URL` in `medusa-config.ts`. Subscribers read both through `ContainerRegistrationKeys.CONFIG_MODULE` and build `${backendUrl}${adminPath}/reset-password?token=…&email=…` and `${backendUrl}${adminPath}/invite?token=…`, the routes the bundled dashboard serves. `admin.path` defaults to `/app`. A missing `backendUrl` is a configuration error and the subscriber throws; `MEDUSA_BACKEND_URL` is set in `.env`, `.env.template`, CI and every deployed container. Alternative: a dedicated `EMAIL_LINK_BASE_URL`. Rejected; Medusa already has the config field and the docs use it.

**Reset subscriber ignores non-`user` actors.** No customer accounts exist, and a customer link would need a storefront page that does not exist. When accounts arrive, the subscriber gains a `customer` branch using `admin.storefrontUrl`.

**Invite subscriber listens to both events in one file.** `config.event` accepts an array. The handler retrieves the invite through the User module's `retrieveInvite`, which returns `email` and the current `token`.

**Tests use the in-app runner with the local provider.** `medusaIntegrationTestRunner({ inApp: true })` loads `medusa-config.ts`; with no `RESEND_API_KEY` in `.env.test` the local provider is used, so nothing is sent. Tests trigger the real flows through the admin API (`POST /admin/invites`, `POST /admin/invites/:id/resend`, `POST /auth/user/emailpass/reset-password`) and, for the order, run the workflow against an order created with the Order module. They wait with `TestEventUtils.waitSubscribersExecution` and assert on `listNotifications` from the Notification module. Alternative: unit tests with a mocked container. Rejected; the point is proving the wiring.

## Risks / Trade-offs

- [Worker container lacks Resend or backend URL vars] → Emails silently go through the local provider or carry localhost links. Mitigation: post-deploy checklist in tasks, and the subscriber throws when `backendUrl` is unset, so the failure is visible in the worker logs.
- [Reset flow emits the event even for unknown emails] → Medusa does this by design to avoid leaking accounts; the subscriber simply sends nothing when the token workflow did not run. No change needed.
- [`order.placed` fires before the order query sees related data] → The event is emitted after the order transaction commits. If the query still returns no email, the workflow logs and stops rather than throwing.
- [Order query cost] → One graph query per order; negligible at this store's volume.

## Migration Plan

1. Merge and deploy the API image. No data migration.
2. In `h2bc/web-store-deploy`, set `MEDUSA_BACKEND_URL` to the public API origin on every API container and make sure `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `EMAIL_LOGO_URL` are set on the worker container as well as the server.
3. Verify by inviting a test user from the admin and placing a test order.

Rollback: remove the three subscriber files. The config change is inert without them.
