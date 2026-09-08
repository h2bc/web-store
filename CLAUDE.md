# CLAUDE.md

Single repo for the h2bc web store: Medusa v2 API and Next.js storefront, side by side.

## Layout

- `api/` — Medusa v2 backend (port 9000, admin at `/app`). See `api/CLAUDE.md`.
- `front/` — Next.js storefront (port 3000). See `front/CLAUDE.md`.
- `.devcontainer/` — one container for both, plus `db` (postgres) and `redis` sidecars.
- `.github/workflows/` — `api.yml` and `front.yml`: build and push each app's image, then trigger the deploy in `h2bc/web-store-deploy`.

The two apps are independent pnpm projects (own `package.json` and lockfile, no workspace). Their Dockerfiles build with the app directory as context.

## Running things

**Always `cd` into `api/` or `front/` first.** There is no root `package.json`. In particular, `api/medusa-config.ts` loads `.env` from `process.cwd()` — running `medusa` from the repo root silently loads no env and fails with confusing DB/CORS errors.

- API: `cd api && pnpm dev`
- Storefront: `cd front && pnpm dev`
- Both run inside the same devcontainer, so the storefront reaches the API at `http://localhost:9000`.

## Env files

- `api/.env` (from `api/.env.template`) — also read by the devcontainer's `db` service for `POSTGRES_*`.
- `front/.env.local` (from `front/.env.example`).
