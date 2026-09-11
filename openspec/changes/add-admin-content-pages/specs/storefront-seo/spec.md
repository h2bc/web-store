## MODIFIED Requirements

### Requirement: Sitemap lists public pages and products
The storefront SHALL serve `/sitemap.xml` containing the home, shop, gallery, about, contact, shipping-returns, privacy and terms pages and one entry per product at `/shop/<handle>` with the product's last-modified date. Cart, checkout and order pages SHALL never appear. Product entries SHALL reflect catalog changes within the same cache window as the shop page.

#### Scenario: Catalog available
- **WHEN** `/sitemap.xml` is requested and the catalog has five products
- **THEN** the response is XML with the eight static entries and five product entries, all absolute URLs under the site URL

#### Scenario: Catalog unavailable
- **WHEN** the backend cannot be reached
- **THEN** `/sitemap.xml` still responds with the static entries
