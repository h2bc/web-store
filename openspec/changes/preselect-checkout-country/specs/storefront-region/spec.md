## MODIFIED Requirements

### Requirement: Checkout offers every shipped-to country
The shipping address form SHALL list every country of the region, sorted by display name. When the cart has no shipping address yet, the form SHALL preselect the country the visitor's request comes from when that country is in the region, and Lithuania otherwise. When the cart already has a shipping address, its country SHALL stay selected. The country guess SHALL be made on the server from the request alone: the storefront SHALL NOT store it on the device and SHALL NOT ask the browser for location.

#### Scenario: New address
- **WHEN** a customer whose country is not known opens the address step on a cart without a shipping address
- **THEN** the country field shows Lithuania and the dropdown lists all region countries in alphabetical order

#### Scenario: Visitor from a shipped-to country
- **WHEN** a customer whose request comes from Germany opens the address step on a cart without a shipping address
- **THEN** the country field shows Germany

#### Scenario: Visitor from an unsupported country
- **WHEN** a customer whose request comes from a country outside the region opens the address step on a cart without a shipping address
- **THEN** the country field shows Lithuania

#### Scenario: Returning to the address step
- **WHEN** the cart already has a shipping address in Germany and the request comes from another country
- **THEN** the country field shows Germany
