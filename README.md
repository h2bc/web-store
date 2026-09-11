# h2bc web store

Two independent pnpm projects, each with its own README:

- [`api/`](api/README.md) — Medusa v2 API (admin at `/app`)
- [`front/`](front/README.md) — Next.js storefront

## Develop

Open the repo in the devcontainer (VS Code: "Reopen in Container"). It provides node, pnpm, postgres and redis, and installs both apps.

Root scripts wrap the sub-projects (`<cmd>:<scope>`), e.g.:

```sh
pnpm dev:api
pnpm dev:front
pnpm migrate
```

`pnpm lint` and `pnpm format:check` run ESLint and Prettier over both apps; the pre-commit hook runs both. CI also runs the typechecks, the API tests and the e2e suite.

See each project's README for setup, env files and project-specific commands.
