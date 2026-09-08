# CLAUDE.md

h2bc web store: Medusa v2 API in `api/` (port 9000, admin at `/app`), Next.js storefront in `front/` (port 3000). Two independent pnpm projects, not a workspace. Root `package.json` only holds cross-project dev tooling; its scripts are named `<cmd>:<scope>` (`dev:api`, `lint:front`); root-level ones (`typecheck`, `test`, `migrate`) are unscoped. Add app dependencies inside `api/` or `front/`, never at root.

## Code style

- Do not preserve legacy compatibility. When behavior, APIs, configs, or schemas change, update callers and tests to the new shape directly. Remove obsolete paths, shims, aliases, compatibility layers, deprecation scaffolding, and dead code instead of leaving them behind.
- Keep comments minimal and useful. Add them only when the code is not obvious.
