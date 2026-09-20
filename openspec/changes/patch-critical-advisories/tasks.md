## 1. Baseline

- [x] 1.1 The existing suites are this change's tests, unchanged: `api/tests/` integration, `front/tests/` unit and `tests/` end to end. Run `pnpm test:api`, `pnpm test:front` and, with both apps up, `pnpm test:e2e`, and save `pnpm --dir api audit` and `pnpm --dir front audit` summaries under `.tmp/`; verify the passing tests and the four critical advisories are written in the report.

## 2. API

- [x] 2.1 The tests in `api/tests/` are this group's tests, integration, unchanged; verify they were green at 1.1.
- [x] 2.2 In `api/package.json` add `"overrides": { "fast-xml-parser": "5.11.1", "protobufjs": "7.6.6" }` under `pnpm`, run `pnpm --dir api i`; verify `pnpm --dir api why fast-xml-parser` and `pnpm --dir api why protobufjs` each show one version, the overridden one, and `pnpm --dir api ls "@medusajs/*" --depth 0` still shows 2.21.0 everywhere.
- [x] 2.3 Run `pnpm typecheck:api`, `pnpm lint:api`, `pnpm test:api` and `pnpm --dir api build`; verify every API test recorded at 1.1 passes unchanged, `pnpm --dir api start` serves `/health` and `/app`, and `pnpm --dir api audit` reports 0 critical.

## 3. Storefront

- [x] 3.1 The tests in `front/tests/` and the journeys in `tests/` are this group's tests, unit and end to end, unchanged; verify they were green at 1.1.
- [x] 3.2 In `front/package.json` set `next` and `eslint-config-next` to exact `16.3.5`, run `pnpm --dir front i`; verify `pnpm --dir front ls next eslint-config-next sharp --depth 1` shows 16.3.5 twice and `sharp` at 0.35.4 or later.
- [x] 3.3 Run `pnpm typecheck:front`, `pnpm lint:front`, `pnpm test:front` and `NODE_ENV=production pnpm --dir front build`, fixing any type or lint error the new release reports; verify every storefront test recorded at 1.1 passes unchanged and the build completes.
- [x] 3.4 With both apps up run `pnpm test:e2e`; verify every journey recorded at 1.1 passes unchanged, including the security header journeys, and take a Playwright MCP screenshot of the shop page and one product page under `.tmp/`.
- [x] 3.5 Run `pnpm --dir front audit`; verify it reports 0 critical and no advisory names `next` or `sharp`.

## 4. Docs and checks

- [x] 4.1 In `docs/architecture.md` state that `api/package.json` overrides `fast-xml-parser` and `protobufjs` for security and that each override goes when Medusa resolves a fixed version by itself; verify `grep -n "overrides" docs/architecture.md` finds the line.
- [x] 4.2 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify all pass.
- [x] 4.3 Keep the `front/AGENTS.md` and `front/CLAUDE.md` that `next dev` 16.3 writes by default, because the owner chose the default over `agentRules: false`; verify both files exist and `front/next.config.ts` is unchanged.

## Outside this repo

- In GitHub Actions, on the pull request, the `Check` job is green on the bumped packages. Proof: the job's result.
- On staging, product images load through `/_next/image`. Proof: a product page shows its images and the image requests return 200.
- On staging, the owner uploads a product image in the admin. Proof: the upload succeeds and the image shows, which exercises the S3 provider on the overridden `fast-xml-parser`.

## Review findings

- 3.4: the Playwright MCP browser was missing after the devcontainer rebuild, so the two screenshots were taken with the test runner's Chromium. They are `.tmp/next-16-3-shop.png` and `.tmp/next-16-3-product.png`.
- 3.4: right after a dev server restart three checkout journeys timed out on cold compiles. Warm, the checkout file passed 4 of 4 five times, and a full run shows the same single checkout flake as the baseline at 1.1.
- 3.3: the production build served `/_next/image` on a spare port and returned a 25 KB PNG as a 5 KB WebP, which exercises the patched optimizer and `sharp` 0.35.4.
- 3.4: the product page notice reads "It make take 7-14 days to ship your oder". The text is store content, outside this change.
