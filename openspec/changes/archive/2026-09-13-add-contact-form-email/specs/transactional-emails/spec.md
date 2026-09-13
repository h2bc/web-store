## ADDED Requirements

### Requirement: Contact message email is sent to the shop inbox
When a contact message is accepted, the system SHALL record one email using the `contact-message` template addressed to the configured contact inbox. The data SHALL contain the sender's `name`, `email`, `topic` and `message`, and a `reply_to` equal to the sender's email. The subject SHALL be the topic followed by ` from ` and the sender's name. When Resend is configured, the email SHALL carry the sender's address as its reply-to header so a reply from the inbox reaches the sender.

#### Scenario: Message accepted
- **WHEN** a contact message from `Jonas <jonas@example.com>` with topic `Returns & Refunds` is accepted and the inbox is `contact@h2bcweb.com`
- **THEN** one `contact-message` notification on the `email` channel is recorded for `contact@h2bcweb.com` whose data carries the name, email, topic, message and `reply_to: jonas@example.com`

#### Scenario: Sent through Resend
- **WHEN** the Resend provider sends that notification
- **THEN** the email's subject is `Returns & Refunds from Jonas` and its reply-to is `jonas@example.com`

### Requirement: Contact inbox is configured, not hardcoded
The contact inbox address SHALL come from the API's `CONTACT_INBOX_EMAIL` configuration. When it is not set, accepting a contact message SHALL fail with a configuration error and no notification SHALL be recorded.

#### Scenario: Inbox configured
- **WHEN** `CONTACT_INBOX_EMAIL` is `contact@h2bcweb.com`
- **THEN** every contact message notification is addressed to `contact@h2bcweb.com`

#### Scenario: Inbox missing
- **WHEN** `CONTACT_INBOX_EMAIL` is not set and a contact message is posted
- **THEN** the request fails with a configuration error and no notification is recorded
