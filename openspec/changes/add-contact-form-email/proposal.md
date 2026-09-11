## Why

The contact page validates a message and then logs it to the server console; nothing reaches the shop. The API already has the delivery path the order emails use, a workflow that records a notification which Resend sends or the local provider logs, so the missing piece is wiring the form to it with as little custom code as possible.

## What Changes

- A `POST /store/contact` route on the API, validated by the framework's body validator, rate limited per IP, with a honeypot field that silently drops bot submissions.
- A `send-contact-message` workflow that records one `contact-message` notification addressed to the shop inbox, with the sender's address as reply-to.
- The Resend provider gains the `contact-message` template, a subject built from the message's topic and sender name, and passes reply-to to Resend.
- A new API env key, `CONTACT_INBOX_EMAIL`, set to `contact@h2bcweb.com` in the deploy repository.
- The storefront form gains a single Name field and a hidden honeypot; the page gains a line pointing at Instagram DMs and the contact address. The server action relays to the API through the SDK and returns `{ error }` like the rest of the data layer. The `xss` dependency, the per-field error plumbing and the custom response type are removed; the topic enum is derived from the topic list.
- An API integration test for the route, a storefront unit test for the form schema, and an end-to-end test that submits the form.

Non-goals:

- An automatic "we received your message" copy to the sender.
- An order number field.
- A captcha service. The honeypot and the rate limit cover the current risk; a captcha can be added later behind an env key like every other service.
- Storing messages anywhere other than the notification table Medusa already keeps.

## Capabilities

### New Capabilities
- `storefront-contact`: the contact page, its form and alternative channels, the API route that accepts a message, and the spam protection on that route.

### Modified Capabilities
- `transactional-emails`: adds the contact message email, its recipient, reply-to, subject and template, and the inbox configuration.

## Impact

- `api/src/api/store/contact/` (new route and validator), `api/src/api/middlewares.ts` (new), `api/src/workflows/send-contact-message.ts` (new), `api/src/modules/resend/service.ts`, `api/src/modules/resend/emails/contact-message.tsx` (new), `api/src/scripts/test-email.ts`, `api/.env.example`, `api/package.json` (adds `express-rate-limit`).
- `front/lib/schemas/contact.ts`, `front/lib/data/contact.ts`, `front/lib/social.ts`, `front/components/contact/contact-form.tsx`, `front/app/(main)/contact/page.tsx`, `front/package.json` (removes `xss`).
- `api/integration/http/contact.test.ts`, `front/unit/contact-schema.test.ts`, `e2e/contact.test.ts`, and the API env in the CI `Check` job.
- The deploy repository must set `CONTACT_INBOX_EMAIL` on the API server container.
