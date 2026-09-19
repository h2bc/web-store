## Purpose

Defines the security headers every storefront page carries and which third-party origins the content policy allows, so the site cannot be framed, sniffed or downgraded and only known origins run code.

## ADDED Requirements

### Requirement: Every storefront page carries security headers
Every page response from the storefront SHALL carry `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` with a max age of at least one year, `Permissions-Policy` that turns off camera, microphone and geolocation, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Cross-Origin-Resource-Policy: same-site` and a `Content-Security-Policy`.

#### Scenario: Page response
- **WHEN** a browser requests any storefront page
- **THEN** the response carries all eight headers

#### Scenario: Site embedded elsewhere
- **WHEN** another site puts a storefront page in a frame
- **THEN** the browser refuses to render it

### Requirement: Scripts run only with the request's nonce
The content policy SHALL allow scripts only when they carry a nonce generated for that request, plus scripts they load themselves through `'strict-dynamic'`, and SHALL NOT contain `'unsafe-inline'` in `script-src`. The nonce SHALL differ on every response. Stripe's script origins SHALL be listed for browsers without `'strict-dynamic'` support. The policy SHALL allow WebAssembly to compile through `'wasm-unsafe-eval'`, and SHALL NOT contain `'unsafe-eval'` in production.

#### Scenario: Landing page loads its WebAssembly
- **WHEN** a visitor opens the landing page of a production build
- **THEN** the console shows no policy violation for WebAssembly

#### Scenario: Two responses
- **WHEN** a browser requests the same page twice
- **THEN** the two responses carry different nonces

#### Scenario: Injected inline script
- **WHEN** a page contains an inline script without the nonce
- **THEN** the browser refuses to run it

### Requirement: Content policy allows only the origins the storefront uses
The content policy SHALL allow frames from Stripe and YouTube, connections from the storefront and Stripe, images from the storefront and the S3 file host configured for the storefront, and nothing from any other origin. It SHALL forbid framing by any site, plugins, and restrict form targets and the document base to the storefront. It SHALL keep working with the inline style attributes the component library sets.

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

### Requirement: Responses hide the framework and protect the cart cookie
Storefront responses SHALL NOT carry `X-Powered-By`. The cart cookie SHALL be `HttpOnly` and `SameSite=Lax` in every environment, and `Secure` in production.

#### Scenario: Cart cookie stays private
- **WHEN** the storefront sets the cart cookie
- **THEN** it is `HttpOnly` and `SameSite=Lax`, and `Secure` in production

#### Scenario: No framework name in responses
- **WHEN** a browser requests any storefront page
- **THEN** the response carries no `X-Powered-By` header

### Requirement: Local development keeps its dev-only origins
Outside production the policy SHALL also allow the local API as an image origin and the script evaluation the dev server needs, so the same headers apply while developing.

#### Scenario: Product image in development
- **WHEN** a developer opens a product page against the local API
- **THEN** the product image renders
