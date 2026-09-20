# Spec Delta

## Purpose

Sends the order lifecycle to PostHog from the backend, so revenue and the checkout funnel stay complete when a browser blocks tracking or closes early.

## ADDED Requirements

### Requirement: Order analytics is optional
The API SHALL start and place orders without an analytics key. Without the key it SHALL only log the events.

#### Scenario: No analytics key
- **WHEN** the API runs without an analytics key and an order is placed
- **THEN** the order succeeds and nothing is sent to PostHog

### Requirement: The backend sends the order lifecycle
The API SHALL send an event when an order is placed, a payment is captured, a payment is refunded, a shipment is created and an order is canceled. Each event SHALL carry the order id, the display id, the total, the currency, the shipping country and the items with product, variant, quantity and price. A refund SHALL carry the refunded amount.

#### Scenario: Order placed
- **WHEN** a shopper completes the checkout
- **THEN** PostHog receives an order-placed event with the total, the currency and the items

#### Scenario: Refund
- **WHEN** the owner refunds a payment
- **THEN** PostHog receives a payment-refunded event with the refunded amount

### Requirement: Consent decides what an order event carries
For an order whose cart recorded consent, the event SHALL be sent under the shopper's lowercased email, so it joins their storefront session. For any other order the event SHALL carry no email, name, address or phone and SHALL NOT create a person in PostHog.

#### Scenario: Shopper accepted
- **WHEN** an order from a cart with recorded consent is placed
- **THEN** the event belongs to the same person as the shopper's storefront session

#### Scenario: Shopper declined
- **WHEN** an order from a cart without recorded consent is placed
- **THEN** the event counts the order and its value and names nobody

### Requirement: A tracking failure never affects the order
A failure to reach PostHog SHALL NOT fail, delay or roll back the order, the payment, the shipment, the cancellation or their emails.

#### Scenario: PostHog is down
- **WHEN** an order is placed while PostHog does not answer
- **THEN** the order is placed and the confirmation email is recorded
