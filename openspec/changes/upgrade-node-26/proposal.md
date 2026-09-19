## Why

The repo names Node in five places and they disagree: CI, both Dockerfiles and the devcontainer say `25`, the API's `engines` says `>=20`, and the running devcontainer reports 24.21.0. Node 25 is an odd release that is already out of support, and a floating major tag lets CI, the images and local work drift apart. Node 26.9.0 is the current release of the line that becomes LTS in October 2026.

## What Changes

- CI sets up Node `26.9.0` instead of `25`, so the checks run on the release that ships.
- `api/Dockerfile` and `front/Dockerfile` build from `node:26.9.0-slim` instead of `node:25-slim`, so production runs the checked release.
- The devcontainer image becomes `node:26.9.0` instead of `node:25`, and its `node` feature is pinned to `26.9.0` instead of installing the LTS, so local work matches CI.
- The root, `api/` and `front/` `package.json` files declare `engines.node` as `^26.9.0`, so an install on another Node warns.
- `@types/node` moves from `^20` to `^26` in `api/` and `front/`, matching the root, so the typecheck knows the runtime's API.
- Both lockfiles are reinstalled on 26.9.0, so native modules are built for its ABI.
- `docs/architecture.md` names the Node release and the places that pin it.

Non-goals:

- Upgrading Medusa, Next.js, pnpm or TypeScript.
- Adopting new Node 26 APIs in the code.
- Changing the postgres or redis images.

## Capabilities

### New Capabilities
- `node-runtime`: the one Node release that CI, the production images, and the devcontainer run on, and what a Node upgrade must leave working.

### Modified Capabilities

None.

## Impact

- `.github/workflows/deploy.yml`, `api/Dockerfile`, `front/Dockerfile`, `.devcontainer/docker-compose.yml`, `.devcontainer/devcontainer.json`.
- `package.json`, `api/package.json`, `front/package.json` and the three `pnpm-lock.yaml` files.
- `docs/architecture.md`.
- Every developer rebuilds the devcontainer once.
- The images are built only after the merge to `main`, so the staging deploy is the first proof of both Dockerfiles.
