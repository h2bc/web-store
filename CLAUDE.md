# CLAUDE.md

h2bc web store: Medusa v2 API in `api/` (port 9000, admin at `/app`), Next.js storefront in `front/` (port 3000). Two independent pnpm projects, not a workspace. Root `package.json` only holds cross-project dev tooling; its scripts are named `<cmd>:<scope>` (`dev:api`, `lint:front`); root-level ones (`typecheck`, `migrate`) are unscoped. Tests: `e2e/` (Playwright), `api/integration/` (Jest), `front/unit/` (Vitest), all named `*.test.ts`. Add app dependencies inside `api/` or `front/`, never at root.

For Medusa API questions, fetch https://docs.medusajs.com/llms.txt and follow its links to the relevant doc pages.

## Code style

- Do not preserve legacy compatibility. When behavior, APIs, configs, or schemas change, update callers and tests to the new shape directly. Remove obsolete paths, shims, aliases, compatibility layers, deprecation scaffolding, and dead code instead of leaving them behind.
- Do not comment the code. Good code is clear enough by itself. The only exceptions are special markers such as TODO items or a note about something genuinely non-obvious.
