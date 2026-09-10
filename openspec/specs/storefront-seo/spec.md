# storefront-seo Specification

## Purpose

Makes the storefront's public pages discoverable and correctly represented by search engines and link-preview crawlers, and keeps non-public or broken pages out of the index.

## Requirements

### Requirement: Product pages carry product-specific metadata
Each product page SHALL expose a document title made of the product title followed by the site suffix, a meta description, a canonical URL of the form `<site URL>/shop/<handle>`, and Open Graph title, description, image and URL. The description SHALL be, in order of precedence: the product's `seo_description` metadata value, the product subtitle, the product description as stored, or the site description. No parsing or truncation is applied. The title SHALL use the product's `seo_title` metadata value when present, otherwise the product title. The Open Graph image SHALL be the product's first image, or the site default image when the product has none.

#### Scenario: Product without overrides
- **WHEN** a crawler requests `/shop/meduza-hood` and the product has no SEO metadata keys
- **THEN** the title is `MEDUZA HOOD | h2bc`, the description is derived from subtitle or description, the canonical is `<site URL>/shop/meduza-hood`, and `og:image` is the first product image URL

#### Scenario: Owner overrides title and description in the admin
- **WHEN** the product's metadata contains `seo_title` and `seo_description`
- **THEN** the title uses `seo_title` followed by the site suffix and the description equals `seo_description`

#### Scenario: Product without images
- **WHEN** the product has no images
- **THEN** `og:image` is the site default image

### Requirement: Product pages publish Product structured data
Each product page SHALL embed a JSON-LD `Product` object with name, description, image list, canonical URL, brand `h2bc`, and an `Offer` with price, currency and availability in the store's currency. Availability SHALL be `InStock` when any variant is purchasable and `OutOfStock` otherwise. The embedded JSON SHALL be safe to inline in HTML.

#### Scenario: In-stock product
- **WHEN** at least one variant is purchasable
- **THEN** the page contains one `application/ld+json` script whose `@type` is `Product`, whose `offers.availability` ends in `InStock`, and whose `offers.price` and `offers.priceCurrency` match the lowest purchasable variant price shown on the page

#### Scenario: Sold-out product
- **WHEN** every variant tracks inventory and none has stock
- **THEN** `offers.availability` ends in `OutOfStock`

### Requirement: Every public page carries site-wide metadata
Every public page SHALL declare an absolute canonical URL under the configured site URL, Open Graph `site_name`, `type`, `locale` and a default image, and the root metadata SHALL contain a real site description rather than placeholder text. The site URL SHALL come from configuration, not from the incoming request.

#### Scenario: Static page
- **WHEN** a crawler requests `/about`
- **THEN** the response contains `<link rel="canonical" href="<site URL>/about">`, `og:site_name` `h2bc`, `og:type` `website`, and an absolute `og:image`

#### Scenario: Shop category filter
- **WHEN** a crawler requests `/shop?category=BEANIES`
- **THEN** the canonical URL is `<site URL>/shop`

### Requirement: Home page is indexable content
The home page SHALL contain a level-one heading naming the brand and SHALL embed JSON-LD `Organization` data with the brand name, logo, site URL and `sameAs` links to the Instagram and YouTube accounts.

#### Scenario: Home page crawl
- **WHEN** a crawler requests `/`
- **THEN** the HTML contains exactly one `h1` and an `application/ld+json` script whose `@type` is `Organization` with two `sameAs` entries

### Requirement: Sitemap lists public pages and products
The storefront SHALL serve `/sitemap.xml` containing the home, shop, gallery, about, contact and shipping-returns pages and one entry per product at `/shop/<handle>` with the product's last-modified date. Cart, checkout and order pages SHALL never appear. Product entries SHALL reflect catalog changes within the same cache window as the shop page.

#### Scenario: Catalog available
- **WHEN** `/sitemap.xml` is requested and the catalog has five products
- **THEN** the response is XML with the six static entries and five product entries, all absolute URLs under the site URL

#### Scenario: Catalog unavailable
- **WHEN** the backend cannot be reached
- **THEN** `/sitemap.xml` still responds with the static entries

### Requirement: Robots rules follow the deployment's indexability
The storefront SHALL serve `/robots.txt`. When the deployment is configured as indexable, it SHALL allow all user agents, disallow `/cart`, `/checkout` and `/order`, and reference the absolute sitemap URL. When the deployment is not configured as indexable, it SHALL disallow everything and every page SHALL additionally carry a `noindex` robots meta tag. Deployments are not indexable unless explicitly configured.

#### Scenario: Indexable deployment
- **WHEN** `SEO_INDEXABLE` is `true`
- **THEN** `/robots.txt` allows `/`, disallows the three private prefixes, and contains `Sitemap: <site URL>/sitemap.xml`

#### Scenario: Non-indexable deployment
- **WHEN** `SEO_INDEXABLE` is unset
- **THEN** `/robots.txt` contains `Disallow: /` and `/shop` responds with `<meta name="robots" content="noindex">`

### Requirement: Private pages are never indexed
Cart, checkout and order confirmation pages SHALL carry `noindex, nofollow` regardless of deployment configuration.

#### Scenario: Cart page
- **WHEN** a crawler requests `/cart` on an indexable deployment
- **THEN** the response contains a robots meta tag with `noindex`

### Requirement: Error states are not indexable
When the shop or a product page cannot load catalog data, the response SHALL carry a `noindex` robots meta tag and SHALL omit the canonical URL, while still rendering the existing user-facing error message. A request for an unknown product handle SHALL respond with HTTP 404.

#### Scenario: Backend outage on the shop page
- **WHEN** the catalog request fails while rendering `/shop`
- **THEN** the page shows the error alert and its HTML contains `<meta name="robots" content="noindex">`

#### Scenario: Unknown product
- **WHEN** `/shop/does-not-exist` is requested
- **THEN** the HTTP status is 404
