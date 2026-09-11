## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Each kind of code has one test level | 1.1 |
| Tests are organized by subject and named by behaviour | 1.1, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 7.1, 7.2, 8.1 |
| Tests assert outcomes, not internals | 1.1, 3.2 |
| The test is written before the code | 2.1, 2.2 |
| End-to-end tests run where the apps are | 1.1, 2.2 |
| Apply and archive guidance lives in the OpenSpec config | 2.2, 2.3 |
| Task list rules carry the sections and the doctrine | 2.1 |

## 1. The test rule

- [x] 1.1 Create `.claude/rules/tests.md` with `paths: ["api/integration/**", "front/unit/**", "e2e/**"]`: the level per kind of code (API route or workflow in `api/integration/` through the runner, pure storefront logic in `front/unit/` with Vitest, a user journey in `e2e/` with Playwright and only journeys); one file per route, module or journey named after it; behaviour-sentence names, one spec scenario per test named after it; assert status, body shape, visible text or element, never exact copy, markup, internal calls or order; mock external services only behind their env keys and skip with a reason when a key is missing; run an e2e file only when both apps are up, otherwise say it was not run; `api/integration/http/health.test.ts` and `e2e/checkout.test.ts` named as the examples; add the rule to the Rules list in `CLAUDE.md` and point the tests paragraph of `docs/architecture.md` at it; verify the file is under 40 lines, its frontmatter parses, and opening `e2e/smoke.test.ts` loads it

## 2. The OpenSpec config

- [x] 2.1 In `openspec/config.yaml` add `rules.specs` with one line, a scenario states an observable outcome, and extend `rules.tasks` with: each task group starts with the test task for the scenarios it delivers, naming the file and the level, and a scenario with no testable level is stated as such; a change that alters how the system works has a task updating `docs/architecture.md`; the list ends with `## Review findings` reading `None.` at plan time and, when any step happens outside the repository, `## Outside this repo` with where and the observable result; a ticked task is history and never edited; verify `openspec instructions tasks --change add-test-standard-and-tdd --json` and `openspec instructions specs --change add-test-standard-and-tdd --json` show the lines
- [x] 2.2 Add `operations.apply.guidance` to `openspec/config.yaml`: for each task group write the tests first, run their suite for those files, see them fail for the reason the scenario describes, implement, see them pass; run `pnpm lint`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` after each group and tick only when green; a within-scope finding re-does the task, a beyond-scope finding is logged under `## Review findings`; an e2e file runs only when both apps are up, otherwise the report says it was not run; a task under `front/app` or `front/components` ends by loading the page through the Playwright MCP server and saving a screenshot under `.tmp/`, or the report says no page was loaded; end unstaged, never commit or push; verify `openspec instructions apply --change add-test-standard-and-tdd --json` shows an `operationGuidance` array with those items
- [x] 2.3 Add `operations.archive.guidance` to `openspec/config.yaml`: run `/opsx:verify` first; a CRITICAL finding stops the archive until fixed or logged under `## Review findings` in the change's `tasks.md`; list warnings in the archive summary; verify `openspec instructions archive --change add-test-standard-and-tdd --json` shows the guidance
- [x] 2.4 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify every script is green and `openspec validate add-test-standard-and-tdd` passes

## 3. The example tests

- [x] 3.1 Rewrite `api/integration/http/health.test.ts`: the describe block is the route `/health`, the test name is a behaviour sentence, the assertion stays the 200 status; verify `pnpm test:api` is green
- [x] 3.2 Rewrite `e2e/checkout.test.ts` into one test per scenario: the address step offers every country of the region, the delivery step offers a shipping option for another country of the region, a declined card keeps the customer on the payment step with an alert, a guest checkout with a test card lands on the confirmation page; locate the product by its link role and shipping options by their radio role; assert URLs, roles and the email the test entered, never copy, seeded option names or prices; keep the Stripe skip; verify `pnpm test:e2e e2e/checkout.test.ts` is green with both apps up, otherwise the report says it was not run
- [x] 3.3 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify every script is green and `openspec validate add-test-standard-and-tdd` passes

## 4. Test structure

- [x] 4.1 Add a `## Structure` section to `.claude/rules/tests.md`: a Jest or Vitest test is three blocks separated by blank lines, arrange, act, assert, with no comment markers; a Playwright test wraps each part in `test.step` titled Given, When or Then; verify the file stays under 40 lines
- [x] 4.2 Restructure `api/integration/http/health.test.ts` into an act block and an assert block separated by a blank line; verify `pnpm test:api` is green
- [x] 4.3 Wrap each part of the four tests in `e2e/checkout.test.ts` in `test.step` titled Given, When or Then, keeping the helpers; verify `pnpm test:e2e e2e/checkout.test.ts` is green with both apps up and the list reporter shows the step titles on a failure, otherwise the report says it was not run
- [x] 4.4 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify every script is green and `openspec validate add-test-standard-and-tdd` passes

## 5. Titles from the shopper's side

- [x] 5.1 In `.claude/rules/tests.md` make the naming bullet say a test name or step title states the behaviour from the shopper's or the store owner's point of view, in their words; verify the file stays under 40 lines
- [x] 5.2 Rename every test and step title in `e2e/checkout.test.ts`, `e2e/seo.test.ts` and `e2e/smoke.test.ts` that speaks from the system's side, keeping the health test's route perspective; verify `pnpm test:e2e` is green with both apps up, otherwise the report says it was not run

## 6. Blank lines by ESLint

- [x] 6.1 Add `@stylistic/eslint-plugin` to `api/` and `front/`, enable `@stylistic/padding-line-between-statements` in both `eslint.config.mjs` with a blank line after declarations, before `return` and around multi-line blocks, add a root `eslint.config.mjs` for `e2e/**/*.ts` and `playwright.config.ts` with the same rule, a `lint:e2e` script inside `pnpm lint`, an e2e line in `.githooks/pre-commit`, run `eslint --fix` in all three trees and note the rule in `.claude/rules/code.md` and the hook in `.claude/rules/git.md`; verify `pnpm lint` and `pnpm format` are green

## 7. Playwright support code

- [x] 7.1 Create `e2e/support/fixtures.ts` extending `test` with a `checkout` fixture, `e2e/support/checkout-page.ts` with the `CheckoutPage` class holding the locators and shopper actions, `e2e/support/data.ts` with the email, cards and addresses, and `e2e/support/env.ts` with the Stripe key lookup; rewrite `e2e/checkout.test.ts` on the fixture and make `e2e/seo.test.ts` and `e2e/smoke.test.ts` import `test` from the fixtures file; verify `pnpm typecheck`, `pnpm lint:e2e` and `pnpm test:e2e` are green with both apps up
- [x] 7.2 Add the support-folder bullet to `.claude/rules/tests.md` and the page-object exception to `.claude/rules/code.md`; verify the test rule stays under 40 lines
- [x] 7.3 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify every script is green and `openspec validate add-test-standard-and-tdd` passes

## 8. The other e2e files

- [x] 8.1 Add `e2e/support/seo-page.ts` with a `SeoPage` holding the canonical, robots meta, JSON-LD, sitemap and robots.txt lookups and the first product path, a `seo` fixture in `e2e/support/fixtures.ts`, `SITE_URL` and `INDEXABLE` in `e2e/support/env.ts`, `PUBLIC_PATHS` and `PRIVATE_PREFIXES` in `e2e/support/data.ts`; rewrite `e2e/seo.test.ts` and `e2e/smoke.test.ts` with Given-When-Then steps on the fixtures; verify `pnpm typecheck`, `pnpm lint:e2e` and `pnpm test:e2e` are green with both apps up

## 9. The API integration folder

- [x] 9.1 Delete `api/integration/http/README.md`, the Medusa scaffold's copy of the docs, and generalize the support-folder bullet in `.claude/rules/tests.md` and the testing spec to every suite; verify `pnpm test:api` is green and the rule stays under 40 lines

## 10. The pattern in the rule

- [x] 10.1 Add a `## Fixtures and page objects` section to `.claude/rules/tests.md`: a page object per page or flow with `get` locators and verb actions, `e2e/support/fixtures.ts` extending `test` with one fixture per page object, every Playwright test importing `test` and `expect` from it, data as constants in `e2e/support/data.ts`; fold the examples into the Level bullets; verify the rule stays under 40 lines

## Review findings

None.
