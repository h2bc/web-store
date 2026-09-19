## Context

- Four files select Node and all say `25`: `.github/workflows/deploy.yml`, `api/Dockerfile`, `front/Dockerfile` and `.devcontainer/docker-compose.yml`.
- A fifth place selects it and no file configures it: the devcontainer `node` feature.
- The Playwright devcontainer feature depends on that feature, which installs the current LTS through nvm and puts it first on the path.
- The running devcontainer therefore reports 24.21.0 although its image holds 25.9.0.
- Only `api/package.json` has `engines`, at `>=20`.
- Docker is not available inside the devcontainer.
- CI builds the images only on a push to `main`.

## Goals / Non-Goals

**Goals:**
- One exact Node release in every place that selects one.
- The suites prove the upgrade on 26.9.0 before the merge.

**Non-Goals:**
- A tool that keeps the pins in sync.
- Building the images before the merge.

## Decisions

**Exact `26.9.0`, not the major `26`.** Every pin names the full release, so CI and the images cannot differ by a patch. The alternative was `26`, which takes security patches for free but brings back the drift this change removes. A patch bump is a five-line change.

**A literal in each file, not a shared `.nvmrc`.** `actions/setup-node` can read `.nvmrc`, but a Dockerfile and a compose file cannot. A shared file would cover one of five places and add a sixth. The version audit scenario is a single `grep`.

**The devcontainer `node` feature is declared and pinned.** `.devcontainer/devcontainer.json` lists the feature with version `26.9.0`, so nvm installs the same release the image holds. The alternative was dropping the Playwright feature that pulls it in, which means installing the browsers by hand.

**`engines.node` is `^26.9.0`, not the exact release.** The range documents the supported line in each `package.json`. An exact engine would flag a developer on 26.9.1 outside the devcontainer.

**`@types/node` follows the runtime major.** `api/` and `front/` move from `^20` to `^26`, as the root already is. The alternative was leaving them, which hides APIs removed since Node 20 from the typecheck.

**Pins first, then a devcontainer rebuild, then the suites.** The agent runs inside the devcontainer and cannot rebuild it. The apply stops after the pins and asks the owner to rebuild. The alternative was unpacking a Node tarball beside the system one, which proves the suites on a setup nobody else runs.

**The existing suites are the tests.** A runtime upgrade adds no behaviour, so no test is written. The baseline run before the pins is the list every later run is compared to, as in `upgrade-medusa-2-21`.

## Risks / Trade-offs

- Medusa 2.21.0 and Next.js 16.1.6 were not released against Node 26. Mitigation: the API suite, the storefront suite, both production builds and all browser journeys run on 26.9.0 before the merge.
- A native module of the API has no prebuilt binary for the Node 26 ABI. Mitigation: the devcontainer and `api/Dockerfile` already carry a compiler, and the reinstall task checks `pnpm --dir api i` ends without a build error.
- Node 26 is not LTS until October 2026. Mitigation: it is the line that becomes LTS, and Node 25 is already unsupported.
- The Dockerfiles are first built after the merge. Mitigation: both `26.9.0` and `26.9.0-slim` tags exist on Docker Hub, the deploy goes to staging, and a revert of the one commit is the rollback.

## Migration Plan

1. Merge. CI builds both images from `node:26.9.0-slim` and deploys to staging.
2. The owner checks staging as listed in `tasks.md` under `## Outside this repo`.
3. Rollback is reverting the squash commit. No data changes.
