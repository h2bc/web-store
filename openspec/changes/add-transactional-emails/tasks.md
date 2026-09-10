## 1. Backend URL config

- [x] 1.1 In `api/medusa-config.ts` add `backendUrl: process.env.MEDUSA_BACKEND_URL` to the `admin` block; add `MEDUSA_BACKEND_URL=http://localhost:9000` to `api/.env.template` and `api/.env`; verify `pnpm typecheck:api` passes and `medusa develop` starts

## 2. Order confirmation

- [x] 2.1 Create `api/src/workflows/send-order-confirmation.ts` per design: `useQueryGraphStep` for the order with the fields listed in `api/src/scripts/test-email.ts`, a `when` branch that logs a warning and stops if the order has no email, then `sendNotificationsStep` with `to: order.email`, `channel: "email"`, `template: "order-placed"`, `data: { order }`, `idempotency_key: order-placed-<id>`; verify `pnpm typecheck:api` passes
- [x] 2.2 Create `api/src/subscribers/order-placed.ts` listening to `order.placed` and running the workflow with the event's `id`; verify by placing an order in the local storefront with no `RESEND_API_KEY` and seeing the local provider log an `order-placed` notification for the order's email

## 3. Admin password reset

- [x] 3.1 Create `api/src/subscribers/password-reset.ts` listening to `auth.password_reset`: return early unless `actor_type === "user"`, build `reset_url` from `admin.backendUrl` (throw a configuration error when unset) plus `admin.path` plus `/reset-password?token=…&email=…`, and call `createNotifications` with template `password-reset` and `{ reset_url, email }`; verify by requesting a reset from the local admin login page and seeing the logged notification with a `http://localhost:9000/app/reset-password?token=` link

## 4. Dashboard invite

- [x] 4.1 Create `api/src/subscribers/invite.ts` listening to `["invite.created", "invite.resent"]`: retrieve the invite through the User module, build `invite_url` the same way as 3.1 with `/invite?token=<invite.token>`, and call `createNotifications` with template `user-invited` and `{ invite_url, email }`; verify by inviting and then resending an invite in the local admin and seeing two logged notifications with different tokens

## 5. Integration tests

- [ ] 5.1 Add `api/integration/emails/invite.test.ts` using `medusaIntegrationTestRunner({ inApp: true })`: create an admin user and auth headers, `POST /admin/invites`, wait with `TestEventUtils.waitSubscribersExecution("invite.created", eventBus)`, assert one stored notification with template `user-invited`, the invited email and an `invite_url` containing `/app/invite?token=`; then `POST /admin/invites/:id/resend` and assert a second notification with the refreshed token; verify `pnpm test:api` passes
- [ ] 5.2 Add `api/integration/emails/password-reset.test.ts`: create an admin user with emailpass, `POST /auth/user/emailpass/reset-password`, wait on `auth.password_reset`, assert one `password-reset` notification whose `reset_url` contains `/app/reset-password?token=` and the email; add a case with a `customer` actor asserting no notification; verify `pnpm test:api` passes
- [ ] 5.3 Add `api/integration/emails/order-placed.test.ts`: create an order through the Order module with an email, one item and a shipping method, run `sendOrderConfirmationWorkflow` twice with the same id, assert exactly one `order-placed` notification for that email whose data carries the order; add a case with an order without email asserting no notification; verify `pnpm test:api` passes
- [x] 5.4 Run `pnpm lint:api && pnpm typecheck:api && pnpm test:api` and verify all pass

## 6. Manual steps after deploy (outside this repo)

- [ ] 6.1 In `h2bc/web-store-deploy`, set `MEDUSA_BACKEND_URL` to the public API origin (for dev `https://api.dev.h2bcweb.com` or whatever the API is served from, no trailing slash) on every API container, server and worker alike; verify by inviting a test user from the deployed admin and checking the received email's link opens the deployed dashboard
- [ ] 6.2 In `h2bc/web-store-deploy`, confirm `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `EMAIL_LOGO_URL` are set on the worker container, not only the server; verify by placing a test order on the deployed storefront and receiving the confirmation email
- [ ] 6.3 In the Resend dashboard, confirm the sending domain for `RESEND_FROM_EMAIL` is verified; verify the test emails from 6.1 and 6.2 arrive in the inbox rather than being rejected
