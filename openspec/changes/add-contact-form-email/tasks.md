## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Contact page offers the form and alternative channels | 4.2, 4.5 |
| Form collects a validated message | 4.1, 4.4, 4.6 |
| Submission delivers the message and reports the outcome | 4.3, 4.4, 4.7 |
| API accepts a contact message | 1.2, 2.4, 3.1 |
| Contact endpoint resists spam | 1.1, 1.2, 2.4, 3.1, 4.4 |
| Contact message email is sent to the shop inbox | 2.1, 2.2, 2.3, 3.1 |
| Contact inbox is configured, not hardcoded | 1.3, 2.4, 3.2, 6.1 |

## 1. API: route validation and rate limit

- [ ] 1.1 Add `express-rate-limit` to `api/package.json` with `pnpm --dir api add express-rate-limit`; verify `pnpm install:api` succeeds and the lockfile changed.
- [ ] 1.2 Create `api/src/api/store/contact/validators.ts` exporting a zod schema from `@medusajs/framework/zod` (`name` 1–100, `email` valid and ≤254, `topic` 1–100, `message` 5–5000, optional `website`), and `api/src/api/middlewares.ts` applying `validateAndTransformBody` and a 5-per-15-minutes `express-rate-limit` to `POST /store/contact`; verify `pnpm typecheck:api` passes.
- [ ] 1.3 Add `CONTACT_INBOX_EMAIL=` to `api/.env.example` and set a value in the local `api/.env`; verify the key is in the example with an empty value.

## 2. API: workflow, template and route

- [ ] 2.1 Create `api/src/workflows/send-contact-message.ts` that takes `{ to, name, email, topic, message }` and calls `sendNotificationsStep` with one `contact-message` notification on the `email` channel carrying `name`, `email`, `topic`, `message` and `reply_to`; verify `pnpm typecheck:api` passes.
- [ ] 2.2 Create `api/src/modules/resend/emails/contact-message.tsx` on `EmailLayout` rendering name, email, topic and message with preserved line breaks; verify it renders with `npx medusa exec ./src/scripts/test-email.ts <address> contact-message` after 2.5.
- [ ] 2.3 In `api/src/modules/resend/service.ts` add `CONTACT_MESSAGE` to the templates enum and map, make `getTemplateSubject` take the notification data and return `${topic} from ${name}` for it, and pass `notification.data.reply_to` as `replyTo` when present; verify `pnpm typecheck:api` passes.
- [ ] 2.4 Create `api/src/api/store/contact/route.ts` with a `POST` that returns 200 without sending when `website` is filled, throws `MedusaError` `UNEXPECTED_STATE` when `CONTACT_INBOX_EMAIL` is unset, otherwise runs the workflow with the inbox as `to` and responds 200; verify a `curl` with the publishable key returns 200 and the local provider logs the notification.
- [ ] 2.5 Add a `contact-message` case with mock data to `api/src/scripts/test-email.ts`; verify the script sends it.

## 3. API tests

- [ ] 3.1 Create `api/integration/http/contact.test.ts` with `medusaIntegrationTestRunner` and `env: { CONTACT_INBOX_EMAIL: 'inbox@example.com' }`, creating a publishable key through the api-key module for the store header, covering: valid body → 200 and one notification listed by the notification module with `to` the inbox and `data.reply_to` the sender; missing `message` → 400 naming the field; honeypot filled → 200 and no new notification; sixth request → 429; verify `pnpm test:api` passes.
- [ ] 3.2 Create `api/integration/http/contact-unconfigured.test.ts` with an empty env asserting a valid post fails with a 500 and no notification is recorded; verify `pnpm test:api` passes.

## 4. Storefront

- [ ] 4.1 In `front/lib/schemas/contact.ts` add `name` (1–100) and optional `website`, derive the topic enum from `Object.keys(contactTopics)`, delete `ContactFormResponse`; verify `pnpm typecheck:front` passes.
- [ ] 4.2 Add `CONTACT_EMAIL = 'contact@h2bcweb.com'` to `front/lib/social.ts`; verify `pnpm typecheck:front` passes.
- [ ] 4.3 Rewrite `front/lib/data/contact.ts` to post `{ name, email, topic: contactTopics[topic], message, website }` with `sdk.client.fetch('/store/contact', { method: 'POST', body })`, returning `{ error: null }` on success, the `FetchError` message on 400 and a generic message otherwise, then remove `xss` with `pnpm --dir front remove xss`; verify `pnpm typecheck:front` and `pnpm lint:front` pass and `xss` is gone from the lockfile.
- [ ] 4.4 Update `front/components/contact/contact-form.tsx`: add the Name field, the hidden honeypot input, read `isSubmitting` from `form.formState`, drop the local state and the field-error loop, toast the returned `error` or the success message and reset; verify `pnpm lint:front` passes and the page renders at `/contact`.
- [ ] 4.5 Update `front/app/(main)/contact/page.tsx` with a line under the intro linking to `INSTAGRAM_URL` and `mailto:` `CONTACT_EMAIL`; verify the two links are present on `/contact` and the metadata still declares the canonical URL.
- [ ] 4.6 Create `front/unit/contact-schema.test.ts` covering the limits and the derived topic enum; verify `pnpm test:front` passes.
- [ ] 4.7 Create `e2e/contact.test.ts` that fills and submits the form and expects the success toast, and add `CONTACT_INBOX_EMAIL` to the `Check` job's API env in `.github/workflows/deploy.yml`; verify `pnpm exec playwright test e2e/contact.test.ts` passes locally.

## 5. Verification

- [ ] 5.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.

## 6. Outside this repo

- [ ] 6.1 After this branch's PR merges, in `h2bc/web-store-deploy` set `CONTACT_INBOX_EMAIL=contact@h2bcweb.com` on the API server container and redeploy; verify a real submission on the live contact page arrives in the inbox with the sender as reply-to.
