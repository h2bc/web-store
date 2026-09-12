# CLAUDE.md

h2bc web store. Two independent pnpm projects, not a workspace.

## Layout

- `api/`: Medusa v2 backend, admin at `/app`.
- `front/`: Next.js storefront.
- `tests/`: Playwright journeys through both apps.
- `docs/architecture.md`: how the system works, current facts only. Read it before changing the data layer, caching, checkout or the backend config.

## Rules

- `.claude/rules/api.md` and `front.md`: each app's invariants, loaded when its files are touched.
- `.claude/rules/git.md`: commits, branches, hooks and the delivery skills.
- `.claude/rules/code.md`: reuse first and code style.
- `.claude/rules/tests.md`: which suite a test belongs to, how it is named and what it asserts, loaded when a test file is touched.
- `.claude/rules/writing.md`: how every prose file is written. A rule is invariants and where to look, under 50 lines.

## Scripts and dependencies

- Root `package.json` holds only cross-project tooling.
- Root scripts are `<cmd>:<scope>`, like `dev:api` and `lint:front`. Only `typecheck`, `migrate`, `lint` and `format` are unscoped.
- App dependencies go in `api/` or `front/`, never at root.

## Tests

- Every project has a `tests/` folder next to its `package.json`: `api/tests/` is Jest, `front/tests/` is Vitest, root `tests/` is Playwright.
- All test files are named `*.test.ts`.

## Medusa

For Medusa API questions, fetch https://docs.medusajs.com/llms.txt and follow its links.
