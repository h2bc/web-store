---
paths:
  - "api/integration/**"
  - "front/unit/**"
  - "e2e/**"
---

# Tests

## Level

- An API route or workflow: `api/integration/`, through the Medusa integration runner, like `api/integration/http/health.test.ts`.
- Pure storefront logic such as schemas, formatting and data-layer helpers: `front/unit/`, with Vitest.
- A user journey: `e2e/`, with Playwright, like `e2e/checkout.test.ts`. Only journeys go there.

## Files and names

- One file per route, module or journey, named after it, ending in `.test.ts`.
- A test name or step title states the behaviour from the shopper's or the store owner's point of view, in their words.
- One spec scenario maps to one test named after it.
- A test file holds only tests. Support code lives in a `support/` folder next to the tests, plain helpers and data modules for Jest and Vitest.

## Fixtures and page objects

- A Playwright page object is a class per page or flow, like `CheckoutPage`, holding its locators as `get` methods and the shopper's actions as verbs.
- `e2e/support/fixtures.ts` extends `test` with one fixture per page object, so a test asks for a fresh instance as a parameter; every Playwright test imports `test` and `expect` from it.
- Test data such as addresses and cards is a module of constants in `e2e/support/data.ts`.

## Structure

- A Jest or Vitest test follows Arrange-Act-Assert: three blocks separated by blank lines, no comment markers.
- A Playwright test follows Given-When-Then: each part is a `test.step` titled with it, so the report reads like the scenario.

## Assertions

- Assert what a caller or user observes: a status, a body shape, a visible text or element.
- Never assert exact copy, markup, internal calls or implementation order.
- Mock an external service only behind its env key; a test that needs an unset key skips with a reason naming the key.
