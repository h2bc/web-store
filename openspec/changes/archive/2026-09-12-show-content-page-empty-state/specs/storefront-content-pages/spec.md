## MODIFIED Requirements

### Requirement: Content pages render admin-managed markdown
The storefront SHALL serve `/privacy`, `/terms`, `/shipping-returns` and `/about`, each showing the title and markdown body of the content page with the matching slug, fetched from the store API through the data layer. The body SHALL be rendered as formatted text in the storefront's typography with the same renderer as product descriptions, and raw HTML in the body SHALL NOT be rendered as HTML. Each page SHALL use the content page's title as the document title and its description as the meta description, and SHALL declare its own canonical URL. Content SHALL reflect an admin save within the storefront's standard cache window. When the page has no content, the storefront SHALL respond with HTTP 200 showing the route's label as the heading and a line saying there is no content yet, SHALL use the route's label as the document title, SHALL carry a `noindex` robots meta tag and SHALL omit the canonical URL.

#### Scenario: Seeded page
- **WHEN** a visitor opens `/privacy` on a seeded store
- **THEN** the page shows the seeded privacy policy title as a heading and the body as formatted text, and the document title is the page title followed by the site suffix

#### Scenario: Page without content
- **WHEN** a visitor opens `/terms` before the page was seeded or saved
- **THEN** the response is HTTP 200, shows "Terms & Conditions" as the heading and the empty message, has the document title "Terms & Conditions" followed by the site suffix, contains `<meta name="robots" content="noindex">` and no canonical link

#### Scenario: Edited page
- **WHEN** the owner saved `/about` with a new body more than a minute ago
- **THEN** `/about` shows the new body

#### Scenario: Markdown structure
- **WHEN** a body contains a `##` heading, a bulleted list and a link to `/contact`
- **THEN** the page renders a second-level heading, a list and a link to the contact page
