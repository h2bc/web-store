# storefront-region Specification

## Purpose

Defines how the storefront prices products and creates carts without knowing the store's region, and which countries a customer can ship to at checkout.

## Requirements

### Requirement: Storefront does not resolve a region
The storefront SHALL NOT fetch, store or select a region. Product prices SHALL be requested for the store's home country, Lithuania, and carts SHALL be created without a region so that the backend places them in the store's default region. Every visitor, including crawlers, SHALL see the same prices, and no request state such as cookies, headers or query parameters SHALL influence them.

#### Scenario: Two visitors, different countries
- **WHEN** a visitor in Lithuania and a visitor in Germany open the same product page
- **THEN** both see the same price in EUR

#### Scenario: New cart
- **WHEN** a visitor without a cart adds a product
- **THEN** the cart is created in the store's default region and the checkout lists that region's countries

### Requirement: No region selection in the storefront
The storefront SHALL NOT present a region, country or currency selector outside the checkout shipping address, and SHALL NOT set a cookie or other session state for region.

#### Scenario: Header and footer
- **WHEN** any storefront page is rendered
- **THEN** the header and footer contain no region control and the response sets no `region_id` cookie

### Requirement: Checkout offers every shipped-to country
The shipping address form SHALL list every country of the region, sorted by display name, and SHALL preselect Lithuania when the cart has no shipping address yet. When the cart already has a shipping address, its country SHALL stay selected.

#### Scenario: New address
- **WHEN** a customer opens the address step on a cart without a shipping address
- **THEN** the country field shows Lithuania and the dropdown lists all region countries in alphabetical order

#### Scenario: Returning to the address step
- **WHEN** the cart already has a shipping address in Germany
- **THEN** the country field shows Germany

### Requirement: Shipping options follow the address country
Shipping options and prices SHALL be determined by the shipping address country through the backend's service zones. Regions SHALL play no part in choosing shipping options.

#### Scenario: Lithuanian address
- **WHEN** the shipping address country is Lithuania
- **THEN** the delivery step offers the Lithuanian shipping option and price

#### Scenario: Other EU address
- **WHEN** the shipping address country is any other region country
- **THEN** the delivery step offers the Rest of Europe shipping option and price
