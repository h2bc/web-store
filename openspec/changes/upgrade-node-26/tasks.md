## 1. Baseline and the pins

- [x] 1.1 The existing suites are this change's tests, unchanged: `api/tests/` integration, `front/tests/` unit and `tests/` end to end. Record the baseline on the current Node: run `node -v`, `pnpm test:api`, `pnpm test:front` and, with both apps up, `pnpm test:e2e`, and note which tests pass, since every one must pass again at 2.3, 3.3 and 4.2; verify the list is written in the report.
- [x] 1.2 In `.github/workflows/deploy.yml` set `node-version` to `'26.9.0'`; verify `grep -n "node-version" .github/workflows/deploy.yml` shows only `26.9.0`.
- [x] 1.3 In `api/Dockerfile` and `front/Dockerfile` change `node:25-slim` to `node:26.9.0-slim`, and in `.devcontainer/docker-compose.yml` change `node:25` to `node:26.9.0`; verify `grep -rn "node:2" api/Dockerfile front/Dockerfile .devcontainer` shows three lines, all `26.9.0`.
- [x] 1.4 Add `"engines": { "node": "^26.9.0" }` to the root `package.json` and `front/package.json`, and change it in `api/package.json` from `>=20`; verify `grep -n -A1 '"engines"' package.json api/package.json front/package.json` shows `^26.9.0` three times.
- [x] 1.5 In `.devcontainer/devcontainer.json` declare the feature `ghcr.io/devcontainers/features/node:1` with version `26.9.0`, because the Playwright feature pulls it in and its default LTS shadows the image's Node; verify `grep -n -A1 'features/node:1' .devcontainer/devcontainer.json` shows `26.9.0`.
- [x] 1.6 Stop and ask the owner to rebuild the devcontainer; verify `node -v` prints `v26.9.0` before any later task starts.

## 2. API

- [x] 2.1 The tests in `api/tests/` are this group's tests, integration, unchanged; verify they were green at 1.1.
- [x] 2.2 In `api/package.json` set `@types/node` to `^26`, delete `api/node_modules` and run `pnpm --dir api i`; verify the install ends without a native build error and `pnpm --dir api ls @types/node --depth 0` reports major 26.
- [x] 2.3 Run `pnpm typecheck:api`, `pnpm lint:api`, `pnpm test:api` and `pnpm --dir api build`, fixing any type error the new definitions report; verify every API test recorded at 1.1 passes unchanged and `pnpm --dir api start` serves `/health` and `/app` from the build.

## 3. Storefront

- [x] 3.1 The tests in `front/tests/` are this group's tests, unit, unchanged; verify they were green at 1.1.
- [x] 3.2 In `front/package.json` set `@types/node` to `^26`, delete `front/node_modules` and run `pnpm --dir front i`; verify `pnpm --dir front ls @types/node --depth 0` reports major 26.
- [x] 3.3 Run `pnpm typecheck:front`, `pnpm lint:front`, `pnpm test:front` and `pnpm --dir front build`, fixing any type error the new definitions report; verify every storefront test recorded at 1.1 passes unchanged and the build completes.

## 4. Root, journeys and docs

- [x] 4.1 The journeys in `tests/` are this group's tests, end to end, unchanged. Delete the root `node_modules` and run `pnpm i`; verify the install succeeds and `pnpm ls @types/node --depth 0` reports major 26.
- [x] 4.2 With both apps up on 26.9.0 run `pnpm test:e2e`; verify every journey recorded at 1.1 passes unchanged.
- [x] 4.3 In `docs/architecture.md` state that the store runs on Node 26.9.0 and that the workflow, both Dockerfiles and the devcontainer compose file pin it; verify `grep -n "26.9.0" docs/architecture.md` finds the line.
- [x] 4.4 Add an `.npmrc` with `engine-strict=true` to the root, `api/` and `front/`, because pnpm only warns on an engine mismatch without it; verify `pnpm install --frozen-lockfile` under a Node 25.9.0 binary stops with `ERR_PNPM_UNSUPPORTED_ENGINE` in all three projects, and a fresh install on 26.9.0 succeeds in all three.
- [x] 4.5 Run the version audit: `grep -rnE "node:[0-9]|node-version" .github api/Dockerfile front/Dockerfile .devcontainer/docker-compose.yml` and `grep -n -A1 'features/node:1' .devcontainer/devcontainer.json`; verify every hit names `26.9.0`.
- [x] 4.6 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.
- [x] 4.7 Delete the three `.npmrc` files of 4.4, because the owner dropped the install guard from the spec; verify `ls .npmrc api/.npmrc front/.npmrc` finds nothing and `pnpm install --frozen-lockfile` succeeds in all three projects.

## Outside this repo

- In GitHub Actions, on the pull request, the `Check` job runs on the new release. Proof: its `Set up Node.js` step logs `v26.9.0` and the job is green.
- In GitHub Actions, after the merge, both images build from `node:26.9.0-slim` and deploy to staging. Proof: the two publish jobs are green.
- On staging, the owner opens the shop, one product page and the admin. Proof: the shop lists products with prices, the product page shows its variants, and the admin login works.

## Review findings

- 3.3: `pnpm --dir front build` fails inside the devcontainer while prerendering `/_global-error`, because the compose file sets `NODE_ENV=development`. It completes with `NODE_ENV=production`, as in `front/Dockerfile` and CI. Not caused by Node 26. Worth its own change.
- 1.1: the dev database had no content pages, gallery videos or test admin, so 17 journeys could not pass. The `content-pages`, `gallery` and `admin-user` seed parts were run alone.
- 1.1 and 4.2: one checkout journey times out in a full parallel run against the dev servers, a different one each time. Each passes alone, and the second full run on 26.9.0 passed 36 of 36.
