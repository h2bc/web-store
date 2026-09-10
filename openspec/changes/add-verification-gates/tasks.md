## Requirements coverage

| Requirement | Delivered by |
|---|---|
| One command selects the gates from the diff | 1.1, 1.2 |
| Gates run cheapest first and stop at the first failure | 1.2 |
| Explicit modes override the diff | 1.2 |
| A gate that ran nothing is reported as not run | 1.2 |
| A green run is remembered for the exact tree it verified | 1.4 |
| A commit is blocked until the tree has a green run | 3.1 |
| A turn cannot end over unverified edits | 3.2, 3.4 |
| An edited TypeScript file is formatted and linted immediately | 3.3, 3.4 |
| A session starts with the known defects in view | 3.4, 3.5 |
| Continuous integration runs the same command | 4.1, 4.2 |
| Every env var the code reads is declared in a template | 2.1, 2.2 |
| Verification clauses in task lists go through the runner | 5.2 |
| The rules carry the gate invariants | 5.1 |
| Known deviations from the rules are recorded in one place | 5.3 |
| The runner and hooks are tested | 1.3, 2.1, 3.2, 3.3 |

## 1. Gate runner

- [ ] 1.1 Create `scripts/verify-lib.mjs` exporting `GATES` (the ten gates from design.md in that order, each with `name`, `what`, `when(path)`, and either `cmd` with optional `cwd` and `files`, or `check(root)`) and `planGates(files)`; verify `node -e "import('./scripts/verify-lib.mjs').then(m => console.log(m.GATES.map(g => g.name).join(' ')))"` prints `scripts-test env-contract lint-api lint-front typecheck-root typecheck-api typecheck-front test-front test-api e2e`
- [ ] 1.2 Create `scripts/verify.mjs`: changed files from `git diff --name-only`, `--cached` and `ls-files --others --exclude-standard` (git failure exits 1 without running anything; empty diff exits 0 and names `--all`); `--all`, `--dry-run` and gate names as arguments (unknown name exits 1 listing the known ones); gates run in table order, stop at the first failure; a `files` glob with no match prints "not run (vacuous)"; final `PASSED`/`FAILED` lines list ran, planned-but-not-reached and not-planned gates; add `"verify": "node scripts/verify.mjs"` to the root `package.json` and `.tmp/` to `.gitignore`; verify `pnpm verify --dry-run` prints a plan, `pnpm verify nope` exits 1 listing the gates, and `pnpm verify typecheck-root` runs only that gate and passes
- [ ] 1.3 Create `scripts/verify-lib.test.mjs` with `node:test`: for every gate one path that plans it and one that does not; `front/lib/data/cart.ts` plans env-contract, lint-front, typecheck-front, test-front and e2e and not lint-api; `api/src/subscribers/invite.ts` plans env-contract, lint-api, typecheck-api, test-api and e2e; `pnpm-lock.yaml` plans nothing; `planGates` output keeps table order; verify `pnpm verify scripts-test` passes
- [ ] 1.4 Add `treeFingerprint(root)` to `scripts/verify-lib.mjs` (sha1 over `git diff HEAD` plus path and content of each untracked non-ignored file) and make `verify.mjs` write `.tmp/verify.json` (`fingerprint`, `gates`, `at`) after a fully green diff-scoped or `--all` run, never after a named-gate run; add `--status`: exit 0 when the current fingerprint matches, else exit 2 printing the gates the current diff plans; add tests with a temp git repo covering match, edit after green, untracked file after green, named-gate run not counting; verify `pnpm verify scripts-test` passes and, after a green `pnpm verify`, `pnpm verify --status` exits 0 and exits 2 after touching a file

## 2. Env contract

- [ ] 2.1 Add `envContract(root)` to `scripts/verify-lib.mjs`: scan `api/src/**/*.ts` and `api/medusa-config.ts` against `api/.env.template`, and `front/{app,components,lib}/**/*.{ts,tsx}` plus `front/*.ts` against `front/.env.example`, matching `process.env.IDENTIFIER`, exempting `NODE_ENV` and `CI`, returning one line per missing key as `KEY (file:line) missing from <template>`; register it as the `env-contract` check gate; add tests over a temp tree covering a missing key, a key declared empty, and an exempt key; verify `pnpm verify scripts-test` passes
- [ ] 2.2 Run `pnpm verify env-contract` and declare every reported key with an empty value in the matching template (expected in `api/.env.template`: `EVENTS_REDIS_URL`, `WE_REDIS_URL`, `LOCKING_REDIS_URL`, `MEDUSA_WORKER_MODE`, `DISABLE_MEDUSA_ADMIN`, plus anything else reported); verify `pnpm verify env-contract` passes

## 3. Hooks

- [ ] 3.1 Create `.githooks/pre-commit` (`#!/bin/sh`, `exec node scripts/verify.mjs --status`), make it executable, and add `git config core.hooksPath .githooks` to the devcontainer `postCreateCommand`; verify `git commit` on an unverified tree is refused with the plan, both from a shell and from the agent's Bash tool, and succeeds after a green run
- [ ] 3.2 Add `stopDecision({ clean, statusGreen, stopHookActive })` to `scripts/verify-lib.mjs` with tests (blocks only when dirty, not green and not already active) and create `scripts/hooks/stop.mjs` using it; verify the hook exits 0 on a clean tree, 2 with the plan on a dirty unverified tree, and 0 when the input carries `"stop_hook_active": true`
- [ ] 3.3 Add `routeEdit(filePath)` to `scripts/verify-lib.mjs` (returns `{ app, file }` for `.ts`/`.tsx` under `api/` or `front/`, null otherwise) with tests and create `scripts/hooks/post-edit.mjs` that runs `pnpm --dir <app> exec prettier --write <file>` then `pnpm --dir <app> exec eslint <file>`, exiting 2 with eslint's output on errors; verify editing a storefront file to leave an unused import makes the hook exit 2 naming the rule, and a `.md` edit exits 0
- [ ] 3.4 Create `.claude/settings.json` with the three hooks from design.md (`PostToolUse` on `Edit|Write` with timeout 60, `Stop`, `SessionStart`), each invoking `node scripts/hooks/<name>.mjs`; verify in a Claude Code session that ending a turn with unverified edits is held and that a `.ts` edit is formatted
- [ ] 3.5 Create `scripts/hooks/session-start.mjs` printing the `##` headings of `.claude/rules/known-defects.md` and the summary line of `.tmp/verify.json` when present; verify a new session shows the known-defects headings in its opening context

## 4. Continuous integration

- [ ] 4.1 In `.github/workflows/deploy.yml` replace the `check` and `e2e` jobs with one `verify` job: the postgres service and env block from the old `e2e` job plus `DB_HOST=localhost`, the pnpm and Node setup, dependency install, Playwright Chromium install, migrations, seed and credential export, then a single `pnpm verify --all` step, and the Playwright report upload on failure; point `build-api` and `build-front` at `needs: [verify]`; verify `pnpm verify --all` is green in the devcontainer first, including `test-api`
- [ ] 4.2 Push the branch and open the pull request; verify the `verify` job is green, its log shows the API integration tests running, and the `PASSED` line lists every gate

## 5. Rules, config and README

- [ ] 5.1 Create `.claude/rules/verification-gates.md` with no `paths` frontmatter: the one command and its modes, no list of underlying commands, the invariants from the spec (not run is not passed; never weaken a gate; new logic ships with its test; nobody picks gates by hand; never bypass a hook), one paragraph on what the git hook and the three Claude Code hooks do, and what no gate covers (a rendered page beyond the e2e cases, the deployed environment, `process.env[name]` reads); verify the file is under 70 lines and `grep -c 'pnpm lint\|pnpm typecheck\|pnpm test' .claude/rules/verification-gates.md` prints 0
- [ ] 5.2 Replace `rules.tasks` in `openspec/config.yaml` with: split tasks by app, api first when the storefront needs new endpoints; a verify clause names `pnpm verify`, `pnpm verify <gate>` or an observable behaviour, never an underlying tool command; the last task of a change runs `pnpm verify`; verify `openspec instructions tasks --change add-verification-gates --json` shows the new rules and no `cd front` line
- [ ] 5.3 Create `.claude/rules/known-defects.md` with no `paths` frontmatter: the preamble (the single place for current defects; nothing here is a decision; find the cause before adding an entry; do not build on an entry) and one entry for the unwritten integration tests of `add-transactional-emails` (tasks 5.1 to 5.3), with the cause and the reason taken from the developer's answer to design.md open question 1; move that question to `## Answered questions` with its `Changed:` line; verify the file has exactly one `##` entry after the preamble and design.md's open questions read `None.`
- [ ] 5.4 Add to the Develop section of `README.md` that `pnpm verify` runs before a commit, that the git hook enforces it at commit and the stop and edit hooks during a session, how to set `core.hooksPath` outside the devcontainer, and that `pnpm verify --all` runs everything; verify `pnpm verify` on the final tree is green

## Review findings

None.
