## Why

Three test suites exist, but the API has one health test, the storefront has none, and no rule says how or when a test is written. Two smaller gaps: nothing tells a change to update `docs/architecture.md`, and the task list sections apply relies on exist only by habit.

## What Changes

- A test rule at `.claude/rules/tests.md`: which suite for what, one file per subject, behaviour names, outcomes not internals, one spec scenario per test.
- Tests are written before the code: each task group starts with its test task, apply sees the test fail, then pass.
- Apply guidance: scripts after each group, tick only when green, log beyond-scope findings, load storefront pages, never commit.
- Archive guidance: `/opsx:verify` first, a CRITICAL finding stops it.
- Task list rules: an architecture doc task when the system changes, `## Review findings` and `## Outside this repo` sections, ticked tasks never edited.
- The two tests the rule names as examples, the health test and the checkout journey, are rewritten to follow it.
- Test structure: Arrange-Act-Assert in Jest and Vitest, Given-When-Then steps in Playwright.
- Playwright support code in `e2e/support/`: a fixtures file, a checkout page object and test data. Test files hold only tests.
- Blank lines inside functions enforced by ESLint in both apps and, with a new root ESLint config, in `e2e/`.

Non-goals:

- Third-party OpenSpec skill packs.
- A Gherkin toolchain such as Cucumber or playwright-bdd.
- A schema fork, a spec check script, a coverage table or a hook step.
- Decision records.
- Tests for existing code beyond the two examples.

## Capabilities

### New Capabilities
- `testing`: which suite a test belongs to, how it is organized and named, what it asserts, and that it is written before the code.

### Modified Capabilities
- `agent-guidance`: the OpenSpec config carries the apply and archive guidance, and the task list rules.

## Impact

- `.claude/rules/tests.md` new.
- `openspec/config.yaml`: `rules.specs`, `rules.tasks`, `operations.apply.guidance`, `operations.archive.guidance`.
- `CLAUDE.md`: the test rule under Rules.
- `docs/architecture.md`: the tests line points at the rule.
- `api/integration/http/health.test.ts` and `e2e/checkout.test.ts`: renamed and split to match the rule.
- `e2e/support/` new; `e2e/seo.test.ts` and `e2e/smoke.test.ts` rewritten on the fixtures with steps.
- `api/integration/http/README.md` deleted.
- `api/eslint.config.mjs`, `front/eslint.config.mjs`, root `eslint.config.mjs`, `package.json`, `.githooks/pre-commit`: the padding rule and the e2e lint.
- Blank lines added across `api/src` and `front/` by `eslint --fix`.
