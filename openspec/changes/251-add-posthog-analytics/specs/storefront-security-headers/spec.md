# Spec Delta

## MODIFIED Requirements

### Requirement: Content policy allows only the origins the storefront uses
The content policy SHALL allow frames from Stripe and YouTube, connections from the storefront and Stripe, images from the storefront and the S3 file host configured for the storefront, workers from the storefront and from blobs the storefront's own scripts create, and nothing from any other origin. It SHALL forbid framing by any site, plugins, and restrict form targets and the document base to the storefront. It SHALL keep working with the inline style attributes the component library sets.

#### Scenario: Checkout loads Stripe
- **WHEN** a shopper reaches the address or payment step
- **THEN** the Stripe elements render and the payment completes

#### Scenario: Gallery embeds a video
- **WHEN** a visitor opens the gallery
- **THEN** the YouTube players render

#### Scenario: Unknown origin
- **WHEN** a page tries to load a script from an origin not in the policy
- **THEN** the browser blocks it

#### Scenario: Popover opens
- **WHEN** a visitor opens a select or a toast appears
- **THEN** it renders and the console shows no policy violation

#### Scenario: Session is recorded
- **WHEN** a visitor who accepted analytics browses the shop
- **THEN** the session recording starts and the console shows no policy violation
