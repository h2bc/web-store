## Requirements coverage

| Requirement | Delivered by |
|---|---|
| Named scripts run the checks | 1.1 |
| A commit runs lint and the format check | 1.2 |
| Continuous integration runs every check as a named step | 3.1, 3.2 |
| An edited file is formatted and linted immediately | 2.2 |
| Verification clauses in task lists name the scripts | 4.1 |

## 1. The scripts

- [x] 1.1 Add `lint` (`lint:api && lint:front`), `format` (`format:api && format:front`), `format:check` (each app's `format:check`), `format:api` and `format:front` to the root `package.json`, set `"type": "module"`; add `format` and `format:check` to `api/package.json` and `front/package.json` with a `.prettierignore` per app for the lock file and the storefront's Google verification page; run `pnpm format` once; verify `pnpm lint` and `pnpm format:check` pass in the devcontainer

- [x] 1.2 Create `.githooks/pre-commit` running `pnpm lint && pnpm format:check` and add a `prepare` script to the root `package.json` that runs `git config core.hooksPath .githooks`; verify `git commit` on a tree with a lint error is refused and creates nothing

## 2. Env example and edit hooks

- [x] 2.1 Rename `api/.env.template` to `api/.env.example`, drop the `.gitignore` exception, and declare `EVENTS_REDIS_URL`, `WE_REDIS_URL`, `LOCKING_REDIS_URL`, `MEDUSA_WORKER_MODE` and `DISABLE_MEDUSA_ADMIN` with empty values; verify `grep -c process.env api/medusa-config.ts` names no key missing from the file
- [x] 2.2 Create `.claude/settings.json` with two `PostToolUse` hooks on `Edit|Write` that read `tool_input.file_path`, strip `$CLAUDE_PROJECT_DIR/` and, for a path under `api/` or `front/`, run that app's `prettier --write` and `eslint` on the file, the lint hook writing to stderr and exiting 2 on failure; move the API to ESLint 10; add `eslint-config-next/typescript` with `no-unused-vars` as an error to `front/eslint.config.mjs`; verify a storefront edit leaving an unused import makes the lint hook exit 2 naming the rule, an edit to `README.md` or `e2e/checkout.test.ts` exits 0 without running a tool, and a Write of a badly formatted `.ts` file in a Claude Code session comes back formatted in that app's style

## 3. Continuous integration

- [x] 3.1 In `.github/workflows/deploy.yml` replace the `check` and `e2e` jobs with one `check` job: the postgres service and env block from the old `e2e` job plus `DB_HOST`, `DB_USERNAME` and `DB_PASSWORD`, the pnpm and Node setup, dependency install, Playwright Chromium install, migrations, seed and credential export, then four steps Format (`pnpm format:check`), Lint (`pnpm lint`), Typecheck (`pnpm typecheck && pnpm typecheck:api && pnpm typecheck:front`) and Tests (`pnpm test:api && pnpm test:e2e`), and the Playwright report upload on failure; point `build-api` and `build-front` at `needs: [check]`; verify `pnpm lint`, `pnpm format:check`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` are green in the devcontainer first
- [x] 3.2 Push the branch and open the pull request; verify the `check` job is green and its Tests step log shows the API integration tests running

## 4. Config and README

- [x] 4.1 Replace `rules.tasks` in `openspec/config.yaml` with: split tasks by app, api first when the storefront needs new endpoints; the last task of a change runs `pnpm lint`, `pnpm format:check`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`; verify `openspec instructions tasks --change add-verification-gates --json` shows the new rules and no `cd front` line
- [x] 4.2 Add to the Develop section of `README.md` what `pnpm lint` and `pnpm format:check` run, that the pre-commit hook runs them, and that CI adds typecheck, the API tests and e2e; verify `pnpm lint` and `pnpm format:check` on the final tree are green

## Review findings

None.
