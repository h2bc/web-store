## MODIFIED Requirements

### Requirement: Content pages render admin-managed markdown
The storefront SHALL serve `/privacy`, `/terms`, `/shipping-returns` and `/about`, each showing the markdown body of the content page with the matching slug, fetched from the store API through the data layer. When the content page has a title, the page SHALL show it as the level-1 heading above the body; when it has none, the page SHALL show no level-1 heading and SHALL NOT fall back to any other text. The body SHALL be rendered as formatted text in the storefront's typography with the same renderer as product descriptions, and raw HTML in the body SHALL NOT be rendered as HTML. Each page SHALL use its route label as the document title and the content page's description as the meta description, and SHALL declare its own canonical URL. Content SHALL reflect an admin save within the storefront's standard cache window. When the page has no content, the storefront SHALL respond with HTTP 200 showing a line saying there is no content yet and no heading, SHALL carry a `noindex` robots meta tag and SHALL omit the canonical URL.

#### Scenario: Seeded page
- **WHEN** a visitor opens `/privacy` on a seeded store
- **THEN** the page shows the seeded title as a heading and the body as formatted text, and the document title is "Privacy Policy" followed by the site suffix

#### Scenario: Page without a title
- **WHEN** the owner saved `/about` with a body and no title
- **THEN** `/about` shows the body with no level-1 heading, and the document title is still "About" followed by the site suffix

#### Scenario: Page without content
- **WHEN** a visitor opens `/terms` before the page was seeded or saved
- **THEN** the response is HTTP 200, shows the empty message and no heading, has the document title "Terms & Conditions" followed by the site suffix, contains `<meta name="robots" content="noindex">` and no canonical link

#### Scenario: Edited page
- **WHEN** the owner saved `/about` with a new body more than a minute ago
- **THEN** `/about` shows the new body

#### Scenario: Markdown structure
- **WHEN** a body contains a `##` heading, a bulleted list and a link to `/contact`
- **THEN** the page renders a second-level heading, a list and a link to the contact page
