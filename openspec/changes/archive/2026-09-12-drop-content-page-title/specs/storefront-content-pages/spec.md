## MODIFIED Requirements

### Requirement: Content pages render admin-managed markdown
The storefront SHALL serve `/privacy`, `/terms`, `/shipping-returns` and `/about`, each showing its route label as the heading and the markdown body of the content page with the matching slug, fetched from the store API through the data layer. The body SHALL be rendered as formatted text in the storefront's typography with the same renderer as product descriptions, and raw HTML in the body SHALL NOT be rendered as HTML. Each page SHALL use its route label as the document title and the content page's description as the meta description, and SHALL declare its own canonical URL. Content SHALL reflect an admin save within the storefront's standard cache window. When the page has no content, the storefront SHALL respond with HTTP 200 showing the route label as the heading and a line saying there is no content yet, SHALL carry a `noindex` robots meta tag and SHALL omit the canonical URL.

#### Scenario: Seeded page
- **WHEN** a visitor opens `/privacy` on a seeded store
- **THEN** the page shows "Privacy Policy" as a heading and the body as formatted text, and the document title is "Privacy Policy" followed by the site suffix

#### Scenario: Page without content
- **WHEN** a visitor opens `/terms` before the page was seeded or saved
- **THEN** the response is HTTP 200, shows "Terms & Conditions" as the heading and the empty message, has the document title "Terms & Conditions" followed by the site suffix, contains `<meta name="robots" content="noindex">` and no canonical link

#### Scenario: Edited page
- **WHEN** the owner saved `/about` with a new body more than a minute ago
- **THEN** `/about` shows the new body

#### Scenario: Markdown structure
- **WHEN** a body contains a `##` heading, a bulleted list and a link to `/contact`
- **THEN** the page renders a second-level heading, a list and a link to the contact page
