## ADDED Requirements

### Requirement: Owner receives an order-placed email
When an order is placed and the order inbox is configured, the system SHALL send one email to the order inbox using the `order-placed-owner` template, next to the customer's confirmation. The data SHALL contain the same order as the customer email plus an `admin_url` pointing at the order in the admin dashboard, built from the configured backend URL. The subject SHALL name the order's display id and total. Delivering the same placed event more than once SHALL NOT produce a second email.

#### Scenario: Order placed with the inbox configured
- **WHEN** an order with display id `1042` is placed, the order inbox is `orders@h2bcweb.com` and the backend URL is `https://api.example.com`
- **THEN** one `order-placed-owner` notification on the `email` channel is recorded for `orders@h2bcweb.com` whose `admin_url` is `https://api.example.com/app/orders/` followed by the order id

#### Scenario: Event delivered twice
- **WHEN** the placed event for the same order is handled a second time
- **THEN** no additional owner notification is recorded

### Requirement: Order inbox is configured, not hardcoded
The order inbox address SHALL come from the API's `ORDER_INBOX_EMAIL` configuration. When it is not set, placing an order SHALL record no owner email and SHALL NOT fail.

#### Scenario: Inbox missing
- **WHEN** `ORDER_INBOX_EMAIL` is not set and an order is placed
- **THEN** the customer email is recorded and no `order-placed-owner` notification is recorded

### Requirement: Customer is emailed when their order ships
When a shipment is created for an order's fulfilment, the system SHALL send one email to the order's email address using the `order-shipped` template. The data SHALL contain the order's display id, the shipped items with their quantities, the shipping address and the fulfilment's tracking entries, each with a tracking number and an optional tracking URL. When the shipment was created with the no-notification flag, the system SHALL send nothing. When the order has no email address, the system SHALL log a warning and send nothing. Delivering the same shipment event more than once SHALL NOT produce a second email.

#### Scenario: Shipment with tracking
- **WHEN** the owner marks a fulfilment of order `1042` for `buyer@example.com` as shipped with tracking number `LT123456789` and URL `https://tracking.example.com/LT123456789`
- **THEN** one `order-shipped` notification on the `email` channel is recorded for `buyer@example.com` carrying the shipped items and that tracking entry

#### Scenario: Shipment without tracking
- **WHEN** the owner marks a fulfilment as shipped with no tracking entered
- **THEN** one `order-shipped` notification is recorded whose tracking list is empty

#### Scenario: Owner opts out of the notification
- **WHEN** the owner marks a fulfilment as shipped with the no-notification flag set
- **THEN** no notification is recorded

#### Scenario: Event delivered twice
- **WHEN** the shipment event for the same fulfilment is handled a second time
- **THEN** no additional notification is recorded

### Requirement: Customer is emailed when their order is cancelled
When an order is cancelled, the system SHALL send one email to the order's email address using the `order-canceled` template. The data SHALL contain the order's display id, currency and items, and a `refunded_total` holding the amount refunded on the order's payments, zero when nothing was refunded. When the order has no email address, the system SHALL log a warning and send nothing. Delivering the same cancelled event more than once SHALL NOT produce a second email.

#### Scenario: Paid order cancelled
- **WHEN** the owner cancels order `1042` for `buyer@example.com` whose captured payment of `59.90 EUR` is refunded by the cancellation
- **THEN** one `order-canceled` notification on the `email` channel is recorded for `buyer@example.com` whose `refunded_total` is `59.90`

#### Scenario: Order cancelled before any payment was captured
- **WHEN** the owner cancels an order with no captured payment
- **THEN** one `order-canceled` notification is recorded whose `refunded_total` is `0`

#### Scenario: Order without email
- **WHEN** an order without an email address is cancelled
- **THEN** a warning is logged and no notification is recorded

#### Scenario: Event delivered twice
- **WHEN** the cancelled event for the same order is handled a second time
- **THEN** no additional notification is recorded
