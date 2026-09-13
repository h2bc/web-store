## Purpose

Defines how the store owner is pinged about a new order on Telegram: the channel, what the message carries, and how it is switched on.

## ADDED Requirements

### Requirement: Owner is told on Telegram when an order is placed
When an order is placed and Telegram is configured, the system SHALL record one notification on the `telegram` channel addressed to the configured chat, using the `order-placed` template. The message SHALL be plain text naming the order's display id, the total with its currency, the number of items, the shipping country and the customer's email. Delivering the same placed event more than once SHALL NOT produce a second message.

#### Scenario: Order placed with Telegram configured
- **WHEN** an order with display id `1042`, total `59.90 EUR`, two items and a shipping address in Lithuania is placed and the Telegram chat id is `123456`
- **THEN** one `order-placed` notification on the `telegram` channel is recorded for `123456` whose data carries that order

#### Scenario: Event delivered twice
- **WHEN** the placed event for the same order is handled a second time
- **THEN** no additional Telegram notification is recorded

### Requirement: Telegram delivery is optional and switched on by configuration
The Telegram channel SHALL exist only when both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set. When either is missing, placing an order SHALL record no Telegram notification and SHALL NOT fail. A failure to deliver to Telegram SHALL be logged and SHALL NOT fail the order.

#### Scenario: Telegram not configured
- **WHEN** `TELEGRAM_CHAT_ID` is set, `TELEGRAM_BOT_TOKEN` is not, and an order is placed
- **THEN** the order succeeds, the customer email is recorded and no `telegram` notification is recorded

#### Scenario: Telegram rejects the message
- **WHEN** Telegram is configured and its API answers with an error while an order is placed
- **THEN** the order succeeds, the error is logged and the notification is recorded without a provider id
