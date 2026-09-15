## MODIFIED Requirements

### Requirement: Contact endpoint resists spam
A submission whose honeypot field is filled SHALL be accepted with status 200 and SHALL NOT record a notification. The endpoint SHALL limit each client address to 5 submissions per 15 minutes and reject further ones with status 429. The client address is the nearest forwarded address outside the private network, so a message sent through the storefront counts against the visitor, not the storefront, and a forged forwarded entry does not change it. The honeypot field SHALL be invisible to visitors and excluded from browser autofill.

#### Scenario: Honeypot filled
- **WHEN** a client posts a valid body with the honeypot field set
- **THEN** the response is 200 and no notification is recorded

#### Scenario: Sixth message in fifteen minutes
- **WHEN** the same client address posts a sixth valid message within 15 minutes
- **THEN** the response is 429 and no notification is recorded

#### Scenario: Two visitors through the storefront
- **WHEN** one visitor has used their five messages and a second visitor posts through the same storefront address
- **THEN** the second visitor's response is 200 and one notification is recorded

#### Scenario: Forged forwarded address
- **WHEN** a client has used their five messages and posts again with a different address added in front of the forwarded chain
- **THEN** the response is 429 and no notification is recorded
