# Spec Delta

## Purpose

Tells the owner who visits the storefront and where shoppers drop out, tracking each visitor only as far as their consent choice allows.

## ADDED Requirements

### Requirement: Analytics is optional
The storefront SHALL run without an analytics key. Without the key it SHALL show no consent banner and send nothing to PostHog.

#### Scenario: No analytics key
- **WHEN** the storefront runs without an analytics key
- **THEN** no consent banner shows and no analytics request leaves the browser

### Requirement: A consent banner asks before anything is tracked
The storefront SHALL show a consent banner to a visitor who has not chosen yet. The banner SHALL offer Accept as the primary button and Decline beside it at the same size, SHALL link to the Privacy Policy and SHALL leave the page usable while it shows. Nothing SHALL be tracked or stored on the device before the visitor chooses. The choice SHALL be remembered on later visits.

#### Scenario: First visit
- **WHEN** a visitor opens any page for the first time
- **THEN** the consent banner shows with Accept and Decline

#### Scenario: Nothing before the choice
- **WHEN** a visitor browses without choosing
- **THEN** no analytics event is sent and no analytics cookie is set

#### Scenario: Choice is remembered
- **WHEN** a visitor accepts or declines and later opens the shop again
- **THEN** the banner does not show

### Requirement: A visitor who accepts is fully tracked
For a visitor who accepted, the storefront SHALL record page views, page leaves, clicks, scroll depth, heatmaps, session replay, web vitals, console logs, network timing and front-end errors. Session replay SHALL record the page unmasked. Card details SHALL never be recorded.

#### Scenario: Browsing after accepting
- **WHEN** a visitor accepts and opens a product page
- **THEN** PostHog receives the page view under a visitor id kept in a cookie

#### Scenario: Card details
- **WHEN** a shopper who accepted types card details on the payment step
- **THEN** the recording does not contain them

### Requirement: A visitor who declines is only counted
For a visitor who declined, the storefront SHALL send anonymous page views and shop events only. It SHALL store nothing on the device besides the choice itself, SHALL NOT record the session and SHALL NOT identify the visitor.

#### Scenario: Browsing after declining
- **WHEN** a visitor declines and opens a product page
- **THEN** PostHog receives an anonymous page view and no analytics cookie is set

#### Scenario: Checkout after declining
- **WHEN** a visitor who declined saves the checkout address
- **THEN** no email or name is sent to PostHog

### Requirement: The footer reopens the consent choice
Every page with the footer SHALL offer a link that shows the consent banner again. A new choice SHALL replace the old one from that moment.

#### Scenario: Changing the choice
- **WHEN** a visitor who accepted clicks the footer link and declines
- **THEN** the session stops being recorded and the analytics cookie is removed

### Requirement: Shop events follow the shopper to the payment
The storefront SHALL send an event when a shopper views a product, adds an item to the cart, removes an item, starts the checkout, completes the address step, completes the delivery step and fails a payment. Each event SHALL carry what applies of the product, variant, price, quantity, cart value, currency, country and shipping option.

#### Scenario: Adding to the cart
- **WHEN** a shopper adds a product to the cart
- **THEN** PostHog receives an added-to-cart event with the product, variant, price, quantity and currency

#### Scenario: Failed payment
- **WHEN** a shopper's payment is refused
- **THEN** PostHog receives a payment-failed event with the cart value and the reason the payment provider gave

### Requirement: A shopper who accepted is identified at the address step
When a shopper who accepted saves the checkout address, the storefront SHALL identify them to PostHog by their lowercased email, with their name and country. The storefront SHALL save the consent choice on the cart so the order carries it.

#### Scenario: Accepted shopper saves the address
- **WHEN** a shopper who accepted saves the email and address
- **THEN** the earlier anonymous session is linked to that email and the cart records the consent

#### Scenario: Shopper without consent saves the address
- **WHEN** a shopper who declined or never chose saves the email and address
- **THEN** the cart records no consent

### Requirement: Analytics requests go through the shop's own domain
The browser SHALL send every analytics request and load every analytics script from the storefront's own origin. The storefront SHALL forward them to the PostHog EU cloud.

#### Scenario: Ad blocker
- **WHEN** a visitor who accepted browses with a blocker that blocks PostHog's domains
- **THEN** the events still arrive
