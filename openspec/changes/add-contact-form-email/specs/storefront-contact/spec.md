## Purpose

Defines the contact page: what it collects, how a message is validated and delivered to the shop, which alternative channels it offers, and how the public endpoint behind it resists spam.

## ADDED Requirements

### Requirement: Contact page offers the form and alternative channels
The contact page SHALL show the contact form and, beside it, a link to send a direct message to the shop's Instagram account and a mail link to the shop's public contact address. The page SHALL remain a public page with a canonical URL.

#### Scenario: Visitor prefers Instagram
- **WHEN** a visitor opens `/contact`
- **THEN** the page shows a link to the shop's Instagram profile and a `mailto:` link to the contact address alongside the form

### Requirement: Form collects a validated message
The form SHALL collect a name, an email address, a topic chosen from a fixed list and a message. Validation SHALL run on submit and block submission while any field is invalid: the name SHALL be 1 to 100 characters, the email SHALL be a valid address of at most 254 characters, the message SHALL be 5 to 5000 characters. The submit control SHALL be disabled while a submission is in flight.

#### Scenario: Invalid email
- **WHEN** the visitor submits with `not-an-email` in the email field
- **THEN** the email field shows a validation message and nothing is sent

#### Scenario: Message too short
- **WHEN** the visitor submits a message shorter than 5 characters
- **THEN** the message field shows a validation message and nothing is sent

#### Scenario: Double click on send
- **WHEN** the visitor clicks send while the previous submission is still in flight
- **THEN** the second click does nothing

### Requirement: Submission delivers the message and reports the outcome
Submitting a valid form SHALL send the message to the API. On success the form SHALL show a confirmation and clear its fields. On failure the form SHALL show the error and keep the visitor's entries.

#### Scenario: Message sent
- **WHEN** the API accepts the message
- **THEN** a confirmation is shown and the fields are empty

#### Scenario: API unavailable
- **WHEN** the API cannot be reached
- **THEN** an error is shown and the name, email, topic and message stay filled in

### Requirement: API accepts a contact message
The store API SHALL expose `POST /store/contact` taking `name`, `email`, `topic` and `message` with the same limits as the form, plus an optional honeypot field. A body that fails validation SHALL be rejected with status 400 and a message naming the field. A valid body SHALL be accepted with status 200 and result in exactly one contact message email being recorded for the shop inbox, as defined by the transactional emails capability.

#### Scenario: Valid message
- **WHEN** a client posts a valid name, email, topic and message
- **THEN** the response is 200 and one notification addressed to the shop inbox is recorded

#### Scenario: Missing field
- **WHEN** a client posts a body without `message`
- **THEN** the response is 400 and names `message`

### Requirement: Contact endpoint resists spam
A submission whose honeypot field is filled SHALL be accepted with status 200 and SHALL NOT record a notification. The endpoint SHALL limit each client address to 5 accepted submissions per 15 minutes and reject further ones with status 429. The honeypot field SHALL be invisible to visitors and excluded from browser autofill.

#### Scenario: Honeypot filled
- **WHEN** a client posts a valid body with the honeypot field set
- **THEN** the response is 200 and no notification is recorded

#### Scenario: Sixth message in fifteen minutes
- **WHEN** the same client address posts a sixth valid message within 15 minutes
- **THEN** the response is 429 and no notification is recorded
