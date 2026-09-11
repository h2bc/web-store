## Purpose

Defines the storefront's policy, about and gallery pages: where their content comes from, how it is rendered and described to crawlers, and how the pages behave when the content cannot be loaded.

## ADDED Requirements

### Requirement: Content pages render admin-managed markdown
The storefront SHALL serve `/privacy`, `/terms`, `/shipping-returns` and `/about`, each showing the title and markdown body of the content page with the matching slug, fetched from the store API through the data layer. The body SHALL be rendered as formatted text in the storefront's typography with the same renderer as product descriptions, and raw HTML in the body SHALL NOT be rendered as HTML. Each page SHALL use the content page's title as the document title and its description as the meta description, and SHALL declare its own canonical URL. Content SHALL reflect an admin save within the storefront's standard cache window.

#### Scenario: Default page
- **WHEN** a visitor opens `/privacy` on a store where the page was never saved
- **THEN** the page shows the default privacy policy title as a heading and the default body as formatted text, and the document title is the page title followed by the site suffix

#### Scenario: Edited page
- **WHEN** the owner saved `/about` with a new body more than a minute ago
- **THEN** `/about` shows the new body

#### Scenario: Markdown structure
- **WHEN** a body contains a `##` heading, a bulleted list and a link to `/contact`
- **THEN** the page renders a second-level heading, a list and a link to the contact page

### Requirement: Gallery renders the admin-managed video list
The storefront SHALL serve `/gallery` showing one embedded YouTube player per gallery video in display order, each titled with the video's title. When the list is empty the page SHALL say that there are no videos yet.

#### Scenario: Three videos
- **WHEN** the gallery has three videos
- **THEN** `/gallery` contains three players in the admin's order, the first embedding the first video's id

#### Scenario: Empty gallery
- **WHEN** the gallery has no videos
- **THEN** `/gallery` shows the empty message and no player

### Requirement: Content pages degrade when the API is unreachable
When a content page or the gallery list cannot be loaded, the page SHALL render the storefront's error message, SHALL carry a `noindex` robots meta tag and SHALL omit the canonical URL, without failing the request.

#### Scenario: Backend outage
- **WHEN** the store API cannot be reached while rendering `/terms`
- **THEN** the response renders the error alert, contains `<meta name="robots" content="noindex">` and no canonical link

### Requirement: Footer links to the policy pages
Every storefront page, checkout included, SHALL show footer links to `/privacy`, `/shipping-returns` and `/terms`, and each SHALL resolve to the corresponding content page.

#### Scenario: Footer on the cart
- **WHEN** a visitor on `/cart` follows the Terms & Conditions footer link
- **THEN** `/terms` opens with the terms page title
