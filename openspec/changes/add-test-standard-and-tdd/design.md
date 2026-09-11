## Context

See proposal.md for motivation. OpenSpec 1.13 reads `openspec/config.yaml`: `rules` keyed by artifact id are injected into that artifact's instructions, and `operations.apply.guidance` and `operations.archive.guidance` reach the generated apply and archive skills as `operationGuidance`. Both survive `openspec update`. Rules under `.claude/rules/` load by path. The API tests run through `medusaIntegrationTestRunner` with a Postgres on localhost; the storefront's Vitest runs with `--passWithNoTests` and `front/unit/` does not exist yet; Playwright needs both apps running against a seeded database, and `e2e/checkout.test.ts` already skips with a reason when the Stripe key is missing. CI runs every suite. The post-edit hooks format and lint test files like any other file in an app.

## Goals / Non-Goals

**Goals:**
- One place that says how a test in this repo is written, short enough to be read every time.
- The test exists, and fails, before the code that makes it pass.
- Apply and archive do the same steps every time without a custom skill.

**Non-Goals:**
- Enforcement by script. The rule and the guidance are read by the agent; CI runs the suites.
- Coverage targets or a test for every function. One scenario, one test.

## Decisions

**A path-scoped rule, not a template file.** `.claude/rules/tests.md` loads with `api/integration/**`, `front/unit/**` and `e2e/**`. It names the level per kind of code (API route or workflow: integration through the runner; pure storefront logic such as schemas, formatting and data-layer helpers: Vitest; a user journey: Playwright, few), the file per route, module or journey named after it, behaviour-sentence names, outcomes asserted (status, body shape, visible text) never internals, exact copy or markup, external services mocked only behind their env keys with the skip-with-reason pattern from checkout, one spec scenario per test named after it, and the e2e rule: run the journey file you wrote when both apps are up, otherwise say it was not run and CI runs it. It points at `api/integration/http/health.test.ts` and `e2e/checkout.test.ts` as the examples. Alternative: a template file per suite. Rejected: two real files are the template, and a rule can say what a template cannot, which level and what not to assert.

**The examples are rewritten to follow the rule.** The health test was the Medusa scaffold with an action for a name. The checkout journey bundled several behaviours per test and asserted copy, seeded shipping prices and an href selector. Both are rewritten: the route as the describe block and a behaviour sentence per test; one scenario per test; role locators; assertions on the URL, a visible element and the data the test entered. Alternative: drop the examples line, or narrow it to the runner setup and the skip pattern. Rejected: a rule that names files contradicting it teaches the wrong thing, and two compliant files are the cheapest template.

**Given-When-Then through native steps, Arrange-Act-Assert elsewhere.** A Jest or Vitest test follows Arrange-Act-Assert as three blocks separated by blank lines, the shape the Vitest guide and the Medusa docs use. A Playwright test follows Given-When-Then with each part a `test.step`, so the HTML report and the trace read like the spec scenario, with no dependency. Alternative: Gherkin feature files through playwright-bdd or Cucumber. Rejected: the OpenSpec scenarios already carry the WHEN and THEN, a feature file is a second copy to keep in sync, and it adds a dependency and a generate step for one developer and an agent. Alternative: a given, when, then helper library. Rejected: `test.step` already does it.

**Page object behind a fixture for Playwright support code.** `e2e/support/fixtures.ts` extends `test` with a `checkout` fixture that hands each test a fresh `CheckoutPage`, the class holding the locators and the shopper actions. Test data is a module of constants. Every test file imports `test` from the fixtures file, so a new fixture is available everywhere. Alternative: plain functions taking `page`, as before. Rejected: the page object is the pattern the Playwright docs name and every Playwright user recognizes, and the fixture removes the `page` argument from every call. Alternative: helpers inside the test file. Rejected: the file grew past 180 lines with four tests.

**Blank lines enforced by ESLint, not by prose.** `@stylistic/padding-line-between-statements` runs in both apps and in a root ESLint config for `e2e/`: a blank line after declarations, before `return` and around multi-line blocks. Alternative: a bullet in the code rule. Rejected: Prettier cannot place blank lines and a prose rule is not checked. The core ESLint rule is gone in ESLint 10, so the stylistic plugin carries it.

**TDD through the config, not a plugin.** `rules.specs`: a scenario states an observable outcome. `rules.tasks`: each task group starts with the test task for the scenarios it delivers, naming the file and the level, and a scenario with no testable level is stated as such. `operations.apply.guidance`: write the test, run its suite for that file, see it fail for the right reason, implement, see it pass. Alternative: openspec-tdd. Rejected: six stars, last touched in June, and it adds a step the guidance already describes.

**Apply guidance carries the per-group discipline.** Run `pnpm lint`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` after each task group and tick only when green; a within-scope finding re-does the task, a beyond-scope finding goes under `## Review findings`; a task under `front/app` or `front/components` ends by loading the page through the Playwright MCP server and saving a screenshot under `.tmp/`, or the report says no page was loaded; end unstaged, never commit or push. Alternative: editing the generated apply skill. Rejected: overwritten by `openspec update`.

**Archive guidance makes verify matter.** Run `/opsx:verify` first; a CRITICAL finding stops the archive until fixed or logged under `## Review findings`; warnings are listed in the archive summary.

**Task list rules for what the guidance refers to.** `rules.tasks` also says: a change that alters how the system works has a task updating `docs/architecture.md`; the list ends with `## Review findings` reading `None.` at plan time and, when any, `## Outside this repo` with where each step happens and the observable result; a ticked task is history and never edited. Alternative: a forked schema whose templates carry the sections. Rejected: three rule lines say the same without a copy of the templates to maintain.

## Risks / Trade-offs

- [Guidance is advisory] → CI runs every suite; a PR without the test for its scenario is visible in review.
- [The rule grows into a manual] → Kept under 40 lines; examples are files, not prose.
- [e2e cannot run in a session without the apps] → The report says so and CI runs it.
- [`front/unit/` does not exist] → The first storefront unit test creates it; Vitest already looks there.

## Migration Plan

1. Land the rule, the config lines, the `CLAUDE.md` and architecture doc pointers in one PR.
2. The next change is planned and applied under the new rules.

Rollback: delete the rule file and the config lines.

## Open questions

None.

## Answered questions

- Are the two example tests good examples? No, as written. The owner chose to fix them rather than drop or narrow the examples line.
- Should tests follow a standard structure? Yes: arrange, act, assert in Jest and Vitest, Given, When, Then steps in Playwright. The owner chose native steps over a Gherkin toolchain.
- Where does Playwright support code live? In `e2e/support/` as a page object behind a fixture, the layout the Playwright docs show.
- How is spacing inside functions controlled? Nothing controlled it. ESLint's padding rule now does, in all three trees.
