## Purpose

Defines which suite a test belongs to, how it is organized and named, what it asserts, and that it is written from the spec scenario before the code that makes it pass.

## ADDED Requirements

### Requirement: Each kind of code has one test level
An API route or workflow SHALL be tested in `api/integration/` through the Medusa integration runner. Pure storefront logic such as schemas, formatting and data-layer helpers SHALL be tested in `front/unit/` with Vitest. A user journey SHALL be tested in `e2e/` with Playwright, and only journeys. The test rule SHALL state this and load whenever a file in one of those directories is touched.

#### Scenario: New store endpoint
- **WHEN** a change adds a route under `api/src/api/store/`
- **THEN** its test is an integration test that calls the route and asserts the status and body shape

#### Scenario: New form schema
- **WHEN** a change adds a zod schema under `front/lib/schemas/`
- **THEN** its test is a Vitest unit test of valid and invalid input, and no e2e test is written for the schema alone

### Requirement: Tests are organized by subject and named by behaviour
There SHALL be one test file per route, module or journey, named after it, ending in `.test.ts`. Each test name or step title SHALL state the behaviour from the shopper's or the store owner's point of view, in their words, and each spec scenario SHALL map to one test named after it. A Jest or Vitest test SHALL follow Arrange-Act-Assert as three blocks separated by blank lines. A Playwright test SHALL follow Given-When-Then, each part a step titled with it. A test file SHALL hold only tests; support code SHALL live in a `support/` folder next to the tests, page objects, fixtures and data for Playwright in `e2e/support/`, and Playwright tests SHALL import `test` from its fixtures file.

#### Scenario: Scenario becomes a test
- **WHEN** a delta spec scenario says a request with a missing field returns 400
- **THEN** one test in the route's file is named after that scenario and asserts the 400

#### Scenario: Journey report reads like the scenario
- **WHEN** a Playwright test fails
- **THEN** the report names the Given, When or Then step that failed

### Requirement: Tests assert outcomes, not internals
A test SHALL assert what a caller or a user observes: a status, a body shape, a visible text or element. It SHALL NOT assert exact copy, markup, internal calls or implementation order. External services SHALL be mocked only behind their env keys, and a test that needs a key that is not set SHALL skip with a reason.

#### Scenario: Copy changes
- **WHEN** a button label is reworded
- **THEN** the tests that click it by role still pass

#### Scenario: Stripe key missing
- **WHEN** the checkout journey runs on a machine with no Stripe key
- **THEN** it skips and names the missing key

### Requirement: The test is written before the code
A task group SHALL start with the task that writes the tests for the scenarios it delivers, naming the file and the level. Apply SHALL write the test, run its suite, see it fail for the reason the scenario describes, implement, and see it pass. A scenario with no testable level SHALL be stated as such in the task list.

#### Scenario: Group applied
- **WHEN** apply starts a task group with a testable scenario
- **THEN** the first run of the new test fails on the missing behaviour, and the group is ticked only after it passes

#### Scenario: Untestable scenario
- **WHEN** a scenario depends on a dashboard outside the repo
- **THEN** the task list says so and no placeholder test is written

### Requirement: End-to-end tests run where the apps are
Apply SHALL run an e2e file it wrote only when both apps are running, and SHALL otherwise state that the file was not run. Continuous integration SHALL run every suite.

#### Scenario: Session without the apps
- **WHEN** a session writes a journey test and cannot start the storefront
- **THEN** the task report says the file was not run and the pull request's check runs it
