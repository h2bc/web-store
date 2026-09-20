## ADDED Requirements

### Requirement: Customer is emailed when a fulfilment is created
When a fulfilment is created for an order, the system SHALL send one email to the order's email address using the `order-fulfillment-created` template. The data SHALL contain the order's display id, the fulfilment's items with their quantities and the shipping address. When the fulfilment was created with the no-notification flag, the system SHALL send nothing. When the order has no email address, the system SHALL log a warning and send nothing. Delivering the same fulfilment event more than once SHALL NOT produce a second email.

#### Scenario: Fulfilment created with the notification ticked
- **WHEN** the owner creates a fulfilment for order `1042` for `buyer@example.com` with "Send notification" ticked
- **THEN** one `order-fulfillment-created` notification on the `email` channel is recorded for `buyer@example.com` carrying the fulfilment's items

#### Scenario: Owner opts out of the notification
- **WHEN** the owner creates a fulfilment with the no-notification flag set
- **THEN** no notification is recorded

#### Scenario: Order without email
- **WHEN** a fulfilment is created for an order without an email address
- **THEN** no notification is recorded

#### Scenario: Event delivered twice
- **WHEN** the fulfilment created event for the same fulfilment is handled a second time
- **THEN** no additional notification is recorded

### Requirement: Customer is emailed when their order is delivered
When a fulfilment is marked as delivered, the system SHALL send one email to the order's email address using the `order-delivered` template. The data SHALL contain the order's display id, the delivered items with their quantities and the shipping address. When the delivery was recorded with the no-notification flag, the system SHALL send nothing. When the order has no email address, the system SHALL log a warning and send nothing. Delivering the same delivery event more than once SHALL NOT produce a second email.

#### Scenario: Fulfilment marked as delivered
- **WHEN** the owner marks a fulfilment of order `1042` for `buyer@example.com` as delivered
- **THEN** one `order-delivered` notification on the `email` channel is recorded for `buyer@example.com` carrying the delivered items

#### Scenario: Owner opts out of the notification
- **WHEN** the owner marks a fulfilment as delivered with the no-notification flag set
- **THEN** no notification is recorded

#### Scenario: Order without email
- **WHEN** a fulfilment of an order without an email address is marked as delivered
- **THEN** no notification is recorded

#### Scenario: Event delivered twice
- **WHEN** the delivery event for the same fulfilment is handled a second time
- **THEN** no additional notification is recorded

### Requirement: Customer is emailed when an order edit is confirmed
When an order edit is confirmed, the system SHALL send one email to the order's email address using the `order-edited` template. The data SHALL contain the order's display id, currency, its items after the edit with their quantities, and its total after the edit. When the edit was requested with the no-notification flag, the system SHALL send nothing. When the order has no email address, the system SHALL log a warning and send nothing. Delivering the same confirmed event more than once SHALL NOT produce a second email. A later edit of the same order SHALL produce its own email.

#### Scenario: Edit confirmed with the notification ticked
- **WHEN** the owner adds an item to order `1042` for `buyer@example.com` with "Send notification" ticked and the edit is confirmed
- **THEN** one `order-edited` notification on the `email` channel is recorded for `buyer@example.com` carrying the order's items and total after the edit

#### Scenario: Owner opts out of the notification
- **WHEN** an order edit requested with the no-notification flag set is confirmed
- **THEN** no notification is recorded

#### Scenario: Order without email
- **WHEN** an edit of an order without an email address is confirmed
- **THEN** no notification is recorded

#### Scenario: Event delivered twice
- **WHEN** the confirmed event for the same order edit is handled a second time
- **THEN** no additional notification is recorded

#### Scenario: Second edit of the same order
- **WHEN** a second edit of order `1042` is confirmed with the notification ticked
- **THEN** a second `order-edited` notification is recorded for `buyer@example.com`
