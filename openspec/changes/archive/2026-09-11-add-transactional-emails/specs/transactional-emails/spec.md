## Purpose

Defines which commerce events produce an email, who receives it, which template and data it carries, and how links inside those emails are built.

## ADDED Requirements

### Requirement: Order confirmation is sent when an order is placed
When an order is placed, the system SHALL send one email to the order's email address using the `order-placed` template. The data SHALL contain the order with its display id, currency, totals, items, shipping methods, shipping address and customer, which is what the template renders. Guest orders SHALL be handled the same as orders with a customer account. When the order has no email address, the system SHALL log a warning and send nothing. Delivering the same placed event more than once SHALL NOT produce a second email.

#### Scenario: Guest order placed
- **WHEN** a guest completes checkout with email `buyer@example.com`
- **THEN** one `order-placed` notification on the `email` channel is recorded for `buyer@example.com` carrying that order's items and totals

#### Scenario: Event delivered twice
- **WHEN** the placed event for the same order is handled a second time
- **THEN** no additional notification is recorded

### Requirement: Admin password reset email
When a password reset token is generated for an admin user, the system SHALL send the `password-reset` email to that user's email address. The data SHALL contain a `reset_url` pointing at the admin dashboard's reset page and carrying the token and the email as query parameters, and the `email`. Tokens generated for any other actor type SHALL be ignored.

#### Scenario: Admin requests a reset
- **WHEN** a reset is requested for admin user `admin@h2bcweb.com` and the backend URL is `https://api.example.com`
- **THEN** one `password-reset` notification is recorded for `admin@h2bcweb.com` whose `reset_url` starts with `https://api.example.com/app/reset-password?token=` and includes the email

#### Scenario: Non-admin actor
- **WHEN** a reset token is generated with an actor type other than `user`
- **THEN** no notification is recorded

### Requirement: Dashboard invite email
When an admin invite is created or its token is refreshed, the system SHALL send the `user-invited` email to the invited email address. The data SHALL contain an `invite_url` pointing at the admin dashboard's invite page with the current token as a query parameter, and the `email`.

#### Scenario: Invite created
- **WHEN** an admin invites `new@h2bcweb.com`
- **THEN** one `user-invited` notification is recorded for `new@h2bcweb.com` whose `invite_url` is the backend URL followed by `/app/invite?token=` and the invite's token

#### Scenario: Invite resent
- **WHEN** the invite for `new@h2bcweb.com` is resent
- **THEN** a new `user-invited` notification is recorded carrying the refreshed token

### Requirement: Email links are built from the configured backend URL
Links to the admin dashboard in emails SHALL be built from the API's configured public backend URL and admin path. In local development the backend URL SHALL be `http://localhost:9000`. When the backend URL is not configured, building the link SHALL fail with a configuration error.

#### Scenario: Backend URL configured
- **WHEN** `MEDUSA_BACKEND_URL` is `https://api.example.com`
- **THEN** every dashboard link in reset and invite emails starts with `https://api.example.com/app/`

#### Scenario: Backend URL missing
- **WHEN** `MEDUSA_BACKEND_URL` is not set and a reset or invite email is triggered
- **THEN** the subscriber fails with a configuration error and no notification is recorded

### Requirement: Emails work without a mail provider configured
When no Resend API key is configured, the system SHALL still record each notification through the local provider, which logs it instead of sending. Sending failures at the provider SHALL be logged and SHALL NOT fail the commerce operation that triggered the email.

#### Scenario: Local development without Resend
- **WHEN** an order is placed on a machine with no `RESEND_API_KEY`
- **THEN** the order succeeds and the notification appears in the server log and in the stored notifications
