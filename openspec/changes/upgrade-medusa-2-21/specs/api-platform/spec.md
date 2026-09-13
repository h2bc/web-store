## Purpose

Defines the Medusa release the API runs on, the rule that every Medusa package shares that release, the rule that admin screens are built from the dashboard's own components, and what a Medusa upgrade must leave working for shoppers, the owner and the deploy.

## ADDED Requirements

### Requirement: One Medusa release across the API
The API SHALL pin every `@medusajs/*` package to one exact Medusa release, currently 2.21.0, and SHALL pin the libraries the dashboard bundles, such as its UI kit, form libraries and query library, to the versions that release of the dashboard declares. No package SHALL carry a caret or tilde range on a Medusa version.

#### Scenario: Version audit
- **WHEN** the installed `@medusajs/*` packages of the API are listed
- **THEN** every one reports the same version and none appears twice in the lockfile

### Requirement: Admin screens are built from the dashboard's components
An admin screen SHALL render its forms, field errors, record rows, action menus, tables and empty states with the components the dashboard package exports, and SHALL load and save its data the way the dashboard's screens do. Custom code SHALL exist only for behaviour no Medusa package provides, such as a drag list or a markdown renderer. No copy of a dashboard component SHALL exist under `api/src/admin/`.

#### Scenario: Form wrapper
- **WHEN** an admin screen renders a form with field validation
- **THEN** its form wrapper is the one exported by the dashboard package, and no copy of it exists under `api/src/admin/`

#### Scenario: Rows, menus and tables
- **WHEN** an admin screen shows a record card, a row menu, a list of records or an empty state
- **THEN** each is the dashboard's exported component, and the screen reads the same as the dashboard's own screens of that kind

### Requirement: An upgrade leaves the store behaving as before
A Medusa upgrade SHALL run all pending migrations at deploy through the existing predeploy step and SHALL leave every existing behaviour observable by a shopper or the owner unchanged: the shop lists products with prices and stock, a product page shows its variants and images, the cart shows shipping method names, checkout completes, the admin logs in and the content screens save and validate as specified in `content-management`.

#### Scenario: Suites pass on the new release
- **WHEN** the API tests and the browser journeys run against the upgraded API and storefront
- **THEN** every test that passed before the upgrade passes after it, with no test changed to expect less

#### Scenario: Admin screens before and after
- **WHEN** every admin screen, drawer, modal and prompt is captured before and after the upgrade
- **THEN** each pair shows the same content and the same actions

#### Scenario: Store reads stay complete
- **WHEN** the storefront requests a product with its variants, calculated prices, inventory quantities, images and categories, or a cart with its shipping method names
- **THEN** the response carries every one of those fields, and a field the release would strip is re-exposed on the API rather than dropped from the storefront

### Requirement: Secrets are never defaulted
The API SHALL refuse to start without a JWT secret and a cookie secret in its environment, and SHALL never fall back to a built-in value.

#### Scenario: Missing secret
- **WHEN** the API starts with `JWT_SECRET` or `COOKIE_SECRET` unset
- **THEN** it exits with an error naming the missing setting instead of serving requests
