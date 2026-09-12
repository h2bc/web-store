---
paths:
  - "api/tests/**"
  - "front/tests/**"
  - "tests/**"
---

# Tests

## Suites

| Suite          | Level             | Tool                | Talks to                                          |
| -------------- | ----------------- | ------------------- | ------------------------------------------------- |
| `api/tests/`   | unit, integration | Jest, Medusa runner | the API on a throwaway database                   |
| `front/tests/` | unit              | Vitest, SDK mocked  | nothing                                           |
| `tests/`       | end to end        | Playwright          | the storefront and the admin, in the browser only |

## Files and names

- One flat `tests/` folder next to each `package.json`. No subfolders by level or tool.
- One file per route, module or journey, named after it, ending in `.test.ts`.
- A test name or step title states the behaviour from the shopper's or the store owner's point of view, in their words.
- One spec scenario maps to one test named after it.
- A test file holds only tests. No helper functions, setup code or literals: they live in `support/` inside the suite's folder.

## Fixtures and page objects

- A Playwright page object is a class per page or flow, like `CheckoutPage`, holding its locators as `get` methods and the shopper's actions as verbs.
- `tests/support/fixtures.ts` extends `test` with one fixture per page object, so a test asks for a fresh instance as a parameter; every Playwright test imports `test` and `expect` from it.
- Test data such as addresses and cards is a module of constants in `support/data.ts`.
- Setup that a suite repeats, like an admin login or a seeded row, is a fixture or a `support/` helper, never a `beforeEach` in the test file.

## Structure

- Every test is Given-When-Then, three parts in that order, no comment markers.
- In Jest and Vitest the parts are blocks separated by blank lines.
- In Playwright each part is a `test.step` titled with it, so the report reads like the scenario.

## Assertions

- End to end asserts what the shopper or the owner sees: a visible text or element.
- Integration asserts what the caller gets: a status and a body shape.
- Unit asserts what the function returns.
- Never assert exact copy, markup, internal calls or implementation order.
- Never skip a test. A missing key, product or fixture fails the test with a message naming it.
