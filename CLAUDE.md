# CLAUDE.md

h2bc web store. Two independent pnpm projects, not a workspace.

## Layout

- `api/`: Medusa v2 backend, admin at `/app`.
- `front/`: Next.js storefront.
- `e2e/`: Playwright tests.
- `docs/architecture.md`: how the system works. Read it before changing the data layer, caching, checkout or the backend config.

## Rules

- `.claude/rules/api.md` and `front.md`: each app's invariants, loaded when its files are touched.
- `.claude/rules/git.md`: commits, branches, hooks and the delivery skills.

## Scripts and dependencies

- Root `package.json` holds only cross-project tooling.
- Root scripts are `<cmd>:<scope>`, like `dev:api` and `lint:front`. Only `typecheck`, `migrate`, `lint` and `format` are unscoped.
- App dependencies go in `api/` or `front/`, never at root.

## Tests

- `api/integration/`: Jest.
- `front/unit/`: Vitest.
- `e2e/`: Playwright.
- All test files are named `*.test.ts`.

## Code style

- No legacy compatibility. When behavior, APIs, configs or schemas change, update callers and tests to the new shape and delete the old path: no shims, aliases or dead code.
- Small methods: short, single-purpose functions with descriptive names.
- Functional patterns: immutable data, pure functions, `map`/`filter`/`reduce` over loops and mutation.
- No comments. The only exceptions are markers such as TODO and a note about something genuinely non-obvious.

## Medusa

For Medusa API questions, fetch https://docs.medusajs.com/llms.txt and follow its links.
