# storefront-checkout Specification

## Purpose

Defines the guest checkout flow from cart to confirmed order: the steps and their gating, what each step collects and how it is validated, how payment is confirmed and the cart completed, and what the order confirmation page shows.

## Requirements

### Requirement: Checkout is a gated three-step flow
The checkout SHALL consist of three steps in order: address, delivery, payment. A step SHALL be reachable only when every earlier step is complete. The address step is complete when the cart has an email and a shipping address with a street line. The delivery step is complete when the cart has a shipping method. A request for a step further than the furthest reachable one SHALL show the furthest reachable step instead. Completed steps SHALL show a read-only summary and a way to return to that step. An empty cart SHALL redirect to the cart page.

#### Scenario: Skipping ahead
- **WHEN** a customer with no address on the cart opens the checkout at the payment step
- **THEN** the address step is shown

#### Scenario: Returning to a completed step
- **WHEN** a customer at the payment step chooses to edit the address
- **THEN** the address step is shown with the saved values filled in

### Requirement: Address step collects a validated shipping address
The address step SHALL collect an email address and a shipping address consisting of first name, last name, street line, optional second line, city, postal code, country and an optional phone number. Country choices SHALL be limited to the countries of the cart's region. Address fields SHALL be validated per country, including postal code format, and the customer SHALL NOT be able to continue while the address or the email is incomplete or invalid. Saving SHALL write the address to both the shipping and the billing address of the cart and the email to the cart, then show the delivery step.

#### Scenario: Country outside the region
- **WHEN** the cart region contains only EU countries
- **THEN** the country choice offers only those countries

#### Scenario: Invalid postal code
- **WHEN** the customer enters a postal code that is not valid for the selected country
- **THEN** the field shows a validation message and the step cannot be submitted

#### Scenario: Valid address saved
- **WHEN** the customer submits a complete, valid address and email
- **THEN** the cart carries that email and the same address as shipping and billing address, and the delivery step is shown

### Requirement: Checkout requires payments to be configured
When the storefront has no payment publishable key configured, the checkout SHALL show a message that payments are unavailable in place of the address step. The rest of the storefront, including the cart, SHALL keep working.

#### Scenario: Key missing
- **WHEN** the storefront runs without a payment publishable key and a customer opens the checkout with a non-empty cart
- **THEN** the checkout shows that payments are unavailable and no address form

### Requirement: Delivery step selects a shipping method
The delivery step SHALL list the shipping options available for the cart with their flat prices, preselecting the cart's current method or the first option. Choosing an option and continuing SHALL set it on the cart and show the payment step. When no option is available for the address, the step SHALL say so and offer nothing to continue with.

#### Scenario: Option chosen
- **WHEN** the customer picks an option and continues
- **THEN** the cart's shipping method is that option and the payment step is shown

### Requirement: Payment step confirms payment and places the order
The payment step SHALL show a payment form offering every payment method enabled in the Stripe Dashboard that the device and store support, including card, Apple Pay and Google Pay. Placing the order SHALL confirm the payment for the cart's total and then complete the cart. A method that confirms in place SHALL complete the cart on the same page. A method that leaves the site SHALL return the customer to a return page that verifies the payment and completes the cart. A payment still being processed by the bank SHALL tell the customer the confirmation will arrive by email and release the cart, leaving completion to the Stripe webhook. A failed or declined payment SHALL show the reason and leave the cart in place so the customer can retry. A payment that succeeded but whose cart could not be completed SHALL tell the customer not to pay again, release the cart and leave completion to the Stripe webhook; it SHALL NOT offer a way back to the payment step. The return page SHALL act only on a client secret that belongs to a payment session of the visitor's own cart and SHALL redirect to the checkout otherwise. A completed cart SHALL redirect to the order confirmation page. Completing a cart that was already completed SHALL return the existing order and SHALL NOT charge again.

#### Scenario: Card payment succeeds
- **WHEN** the customer places the order with a valid test card
- **THEN** the cart is completed and the customer lands on the confirmation page for the new order

#### Scenario: Card declined
- **WHEN** the customer places the order with a declined test card
- **THEN** the decline reason is shown, the cart is unchanged and the customer can try again

#### Scenario: Redirect method succeeds
- **WHEN** the customer places the order with a method that leaves the site and approves the payment
- **THEN** the customer returns to the return page, the cart is completed and the customer lands on the confirmation page for the new order

#### Scenario: Redirect method fails
- **WHEN** the customer places the order with a method that leaves the site and the payment is refused
- **THEN** the return page shows the reason and offers a way back to the payment step with the cart intact

#### Scenario: Paid but the cart could not be completed
- **WHEN** the payment succeeded and completing the cart fails
- **THEN** the return page says the payment was received and the order is not confirmed yet, tells the customer not to pay again and releases the cart

#### Scenario: Client secret of another cart
- **WHEN** the return page is opened with a client secret that belongs to no payment session of the visitor's cart
- **THEN** the customer is redirected to the checkout and the cart is left untouched

### Requirement: Order confirmation page
The confirmation page for an order SHALL use the checkout's layout and order summary. It SHALL show the customer's first name, order number, order date and the email the confirmation was sent to; the contact details, shipping address, delivery method with its cost and the payment method with the amount charged; the ordered items with thumbnails, quantities and prices; subtotal, delivery and total; and a primary action back to the shop. It SHALL NOT be indexed by search engines. An unknown order id SHALL show an error instead of the page.

#### Scenario: Confirmation shown
- **WHEN** the customer lands on the confirmation page for their order
- **THEN** the page shows the order number, email, address, delivery method, payment amount, items and totals from that order

#### Scenario: Unknown order
- **WHEN** the confirmation page is opened with an id that does not resolve to an order
- **THEN** an error message is shown and no order details
