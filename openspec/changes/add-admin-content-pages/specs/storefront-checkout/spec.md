## ADDED Requirements

### Requirement: Payment step states acceptance of the terms
The payment step SHALL show, next to the Place order control, a statement that placing the order means accepting the Terms & Conditions and the Privacy Policy, with each name linking to its page. The links SHALL open in a new tab so the checkout is not abandoned.

#### Scenario: Reading the terms before paying
- **WHEN** a customer on the payment step follows the Terms & Conditions link
- **THEN** `/terms` opens in a new tab and the checkout page stays on the payment step
