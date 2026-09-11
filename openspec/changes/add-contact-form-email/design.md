## Context

See proposal.md for why. What shapes the approach:

- The API already delivers email through `sendNotificationsStep` from a workflow, the notification module, and either the Resend provider or the local provider. Order confirmation uses exactly this path.
- Medusa's notification DTOs carry `to`, `from`, `channel`, `template`, `data` and `attachments`. There is no reply-to field, so it has to travel in `data`.
- The Resend SDK accepts `replyTo` on the send call.
- Medusa validates route bodies with `validateAndTransformBody` and a zod schema declared in `src/api/middlewares.ts`; any Express middleware can sit in the same array. Medusa sets `trust proxy` to 1, so the client address is correct behind one reverse proxy.
- `api/` and `front/` are separate pnpm projects, not a workspace, so a schema cannot be imported across them.
- The storefront rules: components never call the backend, mutations are server actions in `front/lib/data/` that return `{ error }` and never throw.

## Goals / Non-Goals

**Goals:**

- One mail path. A contact message is one more notification template, not a second sender.
- Works on every machine without Resend, through the local provider, like every other email.
- No hand-rolled validation, sanitisation or error mapping anywhere the framework already does it.

**Non-Goals:**

- A shared validation package between the two apps.
- Distributed rate limiting.
- Admin UI for messages.

## Decisions

**Same pipeline as every other email.** A contact message is delivered exactly like the order confirmation: a workflow calls `sendNotificationsStep`, the notification module records it, and the configured provider sends or logs it. The only difference is the trigger. An order email starts from a Medusa event through a subscriber; a contact message starts from the form, so the storefront posts it to `POST /store/contact` and the route runs the workflow. The server action is a thin relay: `sdk.client.fetch('/store/contact', { method: 'POST', body })`, mapping a 400 `FetchError` to its message and anything else to a generic one, returning `{ error }`. Nothing cached changes, so no revalidation. Alternative rejected: the storefront sending mail itself through Resend, which the old TODO pointed at. That would be a second mail sender with its own key, skip the local provider in development, and put a side effect outside a workflow.

**The API owns validation.** `api/src/api/store/contact/validators.ts` exports the zod schema; `middlewares.ts` applies `validateAndTransformBody` to `POST /store/contact`, and the route reads `req.validatedBody`. The storefront keeps react-hook-form with a zod resolver purely for inline feedback; the server action does not parse. The two schemas hold the same limits by convention. Alternative considered: one shared schema. Rejected because the projects are independent and root dependencies are not allowed.

**Topic travels as its label.** The storefront's select is an enum of keys with labels; it sends the label string. The API validates `topic` as a trimmed string of 1 to 100 characters and uses it verbatim in the subject and body. Alternative: duplicate the enum and label map on the API. Rejected as a second source of truth that drifts.

**Reply-to rides in `data.reply_to`.** The workflow puts `reply_to: email` in the notification data; the provider passes `notification.data.reply_to` as `replyTo` to Resend when present. Alternative: `provider_data`, which the module does not forward to the provider. Alternative: a `from` of the sender, which fails SPF and DMARC because the domain is not verified for Resend.

**Subject built from data.** `getTemplateSubject(template, data)` returns `${data.topic} from ${data.name}` for `contact-message`; the existing templates keep their static subjects. Alternative: a static "New contact message" subject, which makes the inbox unscannable.

**Inbox from env, read in the route.** The route reads `CONTACT_INBOX_EMAIL`, throws `MedusaError` with type `UNEXPECTED_STATE` when it is missing, and passes it to the workflow as input. Mirrors how `MEDUSA_BACKEND_URL` gates the dashboard emails. The key is declared empty in `api/.env.example`; a developer sets any address locally.

**Honeypot plus `express-rate-limit`.** The form renders a text field named `website`, hidden with CSS, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`. The route returns 200 without running the workflow when it is non-empty, so bots see success. `express-rate-limit` guards `POST /store/contact` at 5 requests per 15 minutes per IP with the default memory store and standard headers. Alternatives: Cloudflare Turnstile, a new external service and a client script, deferred until spam proves the honeypot insufficient; a Redis store for the limiter, an extra dependency for a brand this size.

**The workflow is minimal.** `sendContactMessageWorkflow` takes `{ to, name, email, topic, message }` and calls `sendNotificationsStep` with one notification. No idempotency key: two identical messages are two messages. `sendNotificationsStep` already compensates.

**Storefront cleanup.** `xss` is removed: the message is never rendered as HTML in the storefront, and React escapes it in the email template. `ContactFormResponse` and the per-field `setError` loop go; the action returns `{ error }`. `isSubmitting` comes from `form.formState`. Success keeps the existing toast and reset. The topic zod enum is derived from the keys of `contactTopics`. The contact address is a public constant in `front/lib/social.ts` next to the Instagram handle.

## Risks / Trade-offs

- [Rate limit counts per API replica] → Acceptable at current scale; a Redis store is a drop-in later.
- [A bot that skips hidden fields and rotates IPs gets through] → Messages land in an inbox, not a database; add Turnstile behind an env key if it happens.
- [`CONTACT_INBOX_EMAIL` unset in production makes the form fail] → The route fails loudly with a configuration error, the integration test covers the unset case, and the deploy task sets it before the PR merges.
- [Storefront and API limits drift] → Both schemas carry the same numbers in one place each; the unit test and the integration test pin them.

## Migration Plan

1. Merge; the API starts without the key and only the contact route is affected.
2. Set `CONTACT_INBOX_EMAIL=contact@h2bcweb.com` on the API server container in the deploy repository.
3. Verify with `npx medusa exec ./src/scripts/test-email.ts <you> contact-message` on the server, then a real submission.

Rollback is a revert; no data migration.
