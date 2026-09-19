## Purpose

Defines the Node release the store runs on, the rule that CI, the production images and the devcontainer share that release, and what a Node upgrade must leave working.

## ADDED Requirements

### Requirement: One Node release everywhere
CI, the API image, the storefront image and the devcontainer SHALL run one exact Node release, currently 26.9.0. No place that selects Node SHALL name a bare major or a floating tag.

#### Scenario: Version audit
- **WHEN** the workflow, both Dockerfiles, the devcontainer compose file and the devcontainer feature list are searched for the Node version
- **THEN** each names 26.9.0 and none names another release

#### Scenario: Running release
- **WHEN** `node -v` runs in the devcontainer, in the CI check job and in each production image
- **THEN** each prints `v26.9.0`

### Requirement: Type definitions match the runtime
The Node type definitions of the root project, the API and the storefront SHALL be of the same major as the Node release.

#### Scenario: Types audit
- **WHEN** the installed `@types/node` of the three projects is listed
- **THEN** each reports major 26

### Requirement: A Node upgrade leaves the store behaving as before
A Node upgrade SHALL leave every check and every behaviour observable by a shopper or the owner unchanged.

#### Scenario: Suites pass on the new release
- **WHEN** lint, the format check, both typechecks, the API tests, the storefront tests and the browser journeys run on the new Node release
- **THEN** every test that passed before the upgrade passes after it, with no test changed to expect less

#### Scenario: Production builds start
- **WHEN** the API and the storefront are built and started on the new Node release
- **THEN** the API answers `/health`, serves the admin at `/app`, and the storefront serves the shop page
