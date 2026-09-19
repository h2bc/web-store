# storefront-cart Specification

## Purpose

Defines the cart the storefront keeps for a visitor between page loads and how it recovers when the cart behind the stored id is gone or already completed.

## Requirements

### Requirement: A stale cart id is replaced on the next add and reads as an empty cart
The storefront SHALL remember the visitor's cart by its id in an httpOnly cookie. A cart id is stale when the backend answers that no cart has that id or returns a cart that is already completed. Adding a product with a stale cart id SHALL create a new cart, store its id and add the product to it, so the shopper sees the item in the new cart. Reading the cart with a stale cart id SHALL show the empty cart and SHALL NOT show an error or log a failure. Any other backend failure SHALL keep showing an error.

#### Scenario: Cart deleted behind the cookie
- **WHEN** a visitor whose cookie names a cart that no longer exists adds a product
- **THEN** a new cart is created holding that product and the cookie names the new cart

#### Scenario: Cart completed behind the cookie
- **WHEN** a visitor whose cookie names an already completed cart adds a product
- **THEN** a new cart is created holding that product and the cookie names the new cart

#### Scenario: Header and cart page with a stale cookie
- **WHEN** a visitor whose cookie names a deleted or completed cart opens a page
- **THEN** the header and the cart page show the empty cart and no error

#### Scenario: Backend unreachable
- **WHEN** the backend does not answer while a visitor adds a product
- **THEN** the shopper sees an error and the cookie is unchanged
