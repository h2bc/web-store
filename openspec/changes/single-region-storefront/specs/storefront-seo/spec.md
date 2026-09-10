## MODIFIED Requirements

### Requirement: Product pages publish Product structured data
Each product page SHALL embed a JSON-LD `Product` object with name, description, image list, canonical URL, brand `h2bc`, and an `Offer` with price, currency and availability in the store's currency. Availability SHALL be `InStock` when any variant is purchasable and `OutOfStock` otherwise. The embedded JSON SHALL be safe to inline in HTML.

#### Scenario: In-stock product
- **WHEN** at least one variant is purchasable
- **THEN** the page contains one `application/ld+json` script whose `@type` is `Product`, whose `offers.availability` ends in `InStock`, and whose `offers.price` and `offers.priceCurrency` match the lowest purchasable variant price shown on the page

#### Scenario: Sold-out product
- **WHEN** every variant tracks inventory and none has stock
- **THEN** `offers.availability` ends in `OutOfStock`
