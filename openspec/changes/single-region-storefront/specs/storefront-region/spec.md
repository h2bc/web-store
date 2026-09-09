## Purpose

Defines how the storefront resolves the store's single market (region and currency) for product pricing and carts, and which countries a customer can ship to at checkout.

## ADDED Requirements

### Requirement: Storefront operates on the store's single region
The storefront SHALL resolve the region from the backend's region list, not from request state such as cookies, headers or query parameters, and SHALL use it for product prices and for creating carts. Every visitor, including crawlers, SHALL see the same prices. When the backend lists more than one region, the storefront SHALL use the first one and log a warning. When the region cannot be resolved, product and cart operations SHALL report an error in the same way they do when the catalog is unavailable, without crashing the page.

#### Scenario: Two visitors, different countries
- **WHEN** a visitor in Lithuania and a visitor in Germany open the same product page
- **THEN** both see the same price in EUR

#### Scenario: Backend unreachable
- **WHEN** the region list cannot be fetched
- **THEN** the shop page renders its catalog error state and no cart is created

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

### Requirement: Carts from a removed region keep working
When a cart is loaded whose region differs from the resolved region, the storefront SHALL move the cart to the resolved region before using it.

#### Scenario: Cart created before the region merge
- **WHEN** a visitor returns with a cart cookie pointing at a cart in a deleted region
- **THEN** the cart loads, its region is the current region, and its items and prices are intact
