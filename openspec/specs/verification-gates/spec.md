# verification-gates Specification

## Purpose

Defines which checks a change must pass before it is called done, how they are run, how a commit runs them, and how an edit is formatted and linted as it happens.

## Requirements

### Requirement: Named scripts run the checks
The root `package.json` SHALL expose one script per check, each chaining both apps: `lint` and `format`, alongside the existing `typecheck:*` and `test:*` scripts. Each app SHALL expose `lint`, `format` (the Prettier check), `typecheck` and `test`. ESLint and Prettier SHALL be dependencies of the apps only, never of the root.

#### Scenario: Root script runs both apps
- **WHEN** `pnpm lint` or `pnpm format` runs at the root
- **THEN** the api script runs first, then the storefront's, and the command exits non-zero if either fails

#### Scenario: Format check
- **WHEN** `pnpm format` runs on a tree with an unformatted file inside an app
- **THEN** the command exits non-zero naming the file and changes nothing on disk

### Requirement: A commit runs lint and the format check
A git pre-commit hook SHALL run `pnpm lint && pnpm format` on every commit, from the agent or from a terminal, and refuse the commit when either fails. `pnpm i` at the root SHALL point git at the hook, so no one sets it up by hand. A bypass flag on the git command SHALL NOT be used.

#### Scenario: Commit with a lint error
- **WHEN** `git commit` runs while a file in either app fails lint or is unformatted
- **THEN** the hook refuses and no commit is created

### Requirement: Continuous integration runs every check as a named step
CI SHALL check a push or pull request with four steps, in order: Format (`pnpm format`), Lint (`pnpm lint`), Typecheck (the root, api and storefront typecheck scripts) and Tests (`pnpm test:api && pnpm test:front && pnpm test:e2e`). The API integration tests SHALL run against a database service. The image build jobs SHALL depend on this job.

#### Scenario: Pull request opened
- **WHEN** a pull request is opened against `main`
- **THEN** CI runs the four steps, including the API integration tests against a database service, and fails naming the first step that failed

### Requirement: An edited file is formatted and linted immediately
After the agent writes or edits a file inside `api/` or `front/`, the file SHALL be formatted with that app's Prettier and linted with that app's ESLint. Lint errors SHALL be returned to the agent as feedback on the edit. Files outside both apps SHALL be left alone.

#### Scenario: Edit introduces a lint error
- **WHEN** an edit to `front/lib/data/cart.ts` leaves an unused import
- **THEN** the lint hook reports the eslint finding to the agent before it moves on

#### Scenario: Edit outside the apps
- **WHEN** an edit touches `e2e/checkout.test.ts` or `README.md`
- **THEN** the hook runs no tool and the edit completes

### Requirement: Verification clauses in task lists name the scripts
A task's verify clause SHALL name a root script (`pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:api`, `pnpm test:e2e`) or an observable behaviour, never a tool invoked directly. The last task of a change SHALL run lint, the format check, both app typechecks and the API tests.

#### Scenario: Task list written for an API change
- **WHEN** a tasks.md is created for a change that touches `api/`
- **THEN** its last task runs `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`
