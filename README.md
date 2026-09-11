<p align="center">
  <img src="front/public/bw-logo.svg" alt="h2bc logo" width="120" />
</p>

<h1 align="center">
  h2bc web store
</h1>

<p align="center">
  <a href="https://instagram.com/_h2bc">
    <img src="https://img.shields.io/badge/@_h2bc-555555?style=flat&logo=instagram&logoColor=white" alt="Instagram" />
  </a>
  <a href="https://youtube.com/@_h2bc">
    <img src="https://img.shields.io/badge/@_h2bc-555555?style=flat&logo=youtube&logoColor=white" alt="YouTube" />
  </a>
</p>

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

`pnpm lint` and `pnpm format` run ESLint and Prettier over both apps; the pre-commit hook runs both on the staged files only. CI also runs the typechecks, the API tests and the e2e suite.

See each project's README for setup, env files and project-specific commands.
