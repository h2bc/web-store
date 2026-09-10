## Context

See proposal.md for motivation. Root `package.json` already wraps both apps with `<cmd>:<scope>` scripts. CI in `.github/workflows/deploy.yml` has a `check` job (lint, typecheck, `test:front`) and an `e2e` job with a postgres service, migrations, seed and Playwright; `test:api` runs nowhere in CI. `api/.env.test` is tracked and holds the `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` the Medusa integration runner uses. `front/unit/` does not exist yet; `vitest run --passWithNoTests` exits 0 on nothing. `playwright.config.ts` starts both dev servers itself and reuses running ones outside CI. Node is 24 in the devcontainer and 25 in CI. There is no `scripts/`, no `.claude/rules/`, no `.claude/settings.json` and no hook anywhere, in this repo or in the Adventures.is reference.

Claude Code hooks are shell commands configured in `.claude/settings.json` under `hooks`, keyed by event (`PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`) with a tool matcher. A hook receives the event as JSON on stdin (for `PreToolUse` on Bash, `tool_input.command`; for `PostToolUse` on Edit or Write, `tool_input.file_path`). Exit code 2 blocks the action (or holds the turn, for `Stop`) and feeds stderr back to the agent; exit 0 lets it through; `SessionStart` stdout is added to the context. A `timeout` in seconds is set per hook.

## Goals / Non-Goals

**Goals:**
- One decision, made once in code, of which gate a change needs; identical locally, in hooks and in CI.
- A gate that ran nothing is visibly not passed, and an unrun gate cannot be committed or declared done.
- No new dependency at the root.

**Non-Goals:**
- Speeding up the underlying tools or running gates in parallel.
- Replacing the per-app scripts; the runner calls them.
- Guarding pushes or branches; that is the git-flow change.

## Decisions

**Plain Node ESM at `scripts/`, ported from the Adventures.is runner.** `scripts/verify.mjs` supplies the environment (repo root, git, process spawning); `scripts/verify-lib.mjs` holds the gate table, `planGates(files)`, `treeFingerprint(root)` and the pure hook decisions, so all of it is testable without running a gate. Commands are argv arrays spawned without a shell, `cwd` is repo-relative. Alternative: a task runner such as turbo. Rejected: adds a dependency and cannot report a gate as not run.

**Gate table, cheapest first.** Each gate has `name`, `what`, `when(path)`, and either `cmd` (with optional `cwd` and `files`) or `check(root)`:

| Gate | Planned when | Runs |
|---|---|---|
| `scripts-test` | `scripts/**` | `node --test scripts/` |
| `env-contract` | `api/src/**`, `api/medusa-config.ts`, `api/.env.template`, `front/**` outside `node_modules`, `front/.env.example` | in-process check |
| `lint-api` | `api/**` | `pnpm lint:api` |
| `lint-front` | `front/**` | `pnpm lint:front` |
| `typecheck-root` | `e2e/**`, `playwright.config.ts`, `tsconfig.json` | `pnpm typecheck` |
| `typecheck-api` | `api/**` | `pnpm typecheck:api` |
| `typecheck-front` | `front/**` | `pnpm typecheck:front` |
| `test-front` | `front/**`; `files: front/unit/**/*.test.ts` | `pnpm test:front` |
| `test-api` | `api/**`; `files: api/integration/**/*.test.ts` | `pnpm test:api` |
| `e2e` | `e2e/**`, `playwright.config.ts`, `front/**`, `api/src/**` | `pnpm test:e2e` |

`when` predicates match the forward-slash paths git prints; lockfiles and `node_modules/` plan nothing on their own. `add-spec-planning-gates` appends a `spec-gates` check to this table.

**The e2e gate is planned for storefront and API source changes, not only for `e2e/` changes.** It is the only gate that loads a rendered page or exercises the API over HTTP. It is last in the table, the suite is small, and Playwright reuses running dev servers locally. Alternative: plan it only for `e2e/**` and rely on manual page loads. Rejected: a manual step is the judgement call the runner exists to remove.

**Changed files come from git: unstaged, staged and untracked.** `null` from git means the selection cannot be made and the runner exits non-zero. CI uses `--all` and never relies on the diff.

**A green run writes `.tmp/verify.json` with the tree fingerprint.** `treeFingerprint` hashes `git diff HEAD` plus the path and content of every untracked, non-ignored file. A run that passed every planned gate, with no named-gate restriction, writes `{ fingerprint, gates, at }`. `--status` recomputes the fingerprint and compares; on mismatch it exits 2 and prints the plan for the current diff. `.tmp/` is gitignored. Alternative: compare against `HEAD` only. Rejected: untracked new files would not invalidate a green run.

**One git hook for the commit gate, and three Claude Code hooks for moments git does not see.** The commit gate is `.githooks/pre-commit` running `node scripts/verify.mjs --status`; the devcontainer's `postCreateCommand` sets `git config core.hooksPath .githooks`. It fires for the agent's `git commit` and for a terminal's alike, so no `PreToolUse` hook duplicates it. `--no-verify` is forbidden by the rule; it is not blocked technically, and that is accepted. The Claude Code hooks, each a thin entry point over the library, are configured in a checked-in `.claude/settings.json`:

| Event, matcher | Script | Decision |
|---|---|---|
| `PostToolUse`, `Edit\|Write` | `scripts/hooks/post-edit.mjs` | for `.ts`/`.tsx` under `api/` or `front/`: `pnpm --dir <app> exec prettier --write <file>`, then `pnpm --dir <app> exec eslint <file>`; eslint errors exit 2 with the output; other files exit 0; timeout 60 |
| `Stop` | `scripts/hooks/stop.mjs` | clean tree or `--status` green exits 0; otherwise exit 2 with the plan; never blocks twice in a row for the same fingerprint (reads `stop_hook_active`) |
| `SessionStart` | `scripts/hooks/session-start.mjs` | prints the `##` headings of `.claude/rules/known-defects.md` and the last `verify.json` summary |

The command-matching, file-routing and status decisions are pure functions in `verify-lib.mjs` with tests. Alternative: put the logic in shell one-liners inside `settings.json`. Rejected: untestable and unreadable.

**CI collapses `check` and `e2e` into one `verify` job that runs `pnpm verify --all`.** The job keeps the postgres service, migrations, seed, credential export and Chromium install as setup steps, then runs the runner once. The two build jobs depend on `verify`. Alternative: keep two jobs and pass named gates to each. Rejected: a gate list in YAML is the second copy that drifts. Trade-off: lint feedback waits for the database setup.

**`test-api` in CI reads its database from the tracked `api/.env.test` with `DB_HOST` overridden by the job env.** Medusa's `loadEnv` does not override variables already set in the process, so `DB_HOST=localhost` in the job env wins. Alternative: a second env file for CI. Rejected: two files with the same keys drift.

**Env contract is an in-process `check` gate.** It scans `api/src/**/*.ts`, `api/medusa-config.ts`, and `front/{app,components,lib}/**/*.{ts,tsx}` plus `front/*.ts` for `process.env.IDENTIFIER`, exempts `NODE_ENV` and `CI`, and compares against the `KEY=` lines of the matching template. Keys reported missing today are added with empty values in this change. Dynamic reads are not detected; stated in the rule. Alternative: a typed env schema library. Rejected: Medusa reads env itself, and it adds a runtime dependency.

**Rules directory starts here with two always-loaded files.** `.claude/rules/verification-gates.md` carries the invariants, the hook behaviour in one paragraph, and points at the runner without listing commands. `.claude/rules/known-defects.md` is the single defects file. Alternative: put known defects under `docs/`. Rejected: nothing would load it when it matters.

**The tasks rule in `config.yaml` says how a verify clause is written.** It replaces the `cd front && pnpm lint && pnpm typecheck` line. The in-flight `add-transactional-emails` tasks are history and keep their old clauses.

## Risks / Trade-offs

- [Commit gate seems slow] → The hook only checks `--status`, which is a hash comparison; the agent runs the gates itself when told, and the plan is scoped to the diff.
- [Stop hook loops] → It reads `stop_hook_active` and never blocks a second time on the same fingerprint.
- [Post-edit hook slows large edits] → prettier and eslint on one file are sub-second; only `.ts`/`.tsx` under the two apps qualify.
- [`test-api` needs more env in CI than `DB_HOST`] → The change lands through a pull request, so CI on that PR proves the job.
- [The env regex misses indirect reads] → Accepted; stated in the rule.
- [A gate predicate is wrong and a change lands unverified] → The gate table has tests with sample paths per gate.
- [`core.hooksPath` not set on a machine outside the devcontainer] → No commit gate there until it is set; README says how, and the stop hook still holds unverified turns.

## Migration Plan

1. Land the runner, the git hook, the Claude Code hooks, settings, rules, templates, config and CI change in one pull request. CI on that PR is the first `pnpm verify --all` run.
2. Rebuild the devcontainer once so `core.hooksPath` is set.

Rollback: revert the workflow file and delete `.claude/settings.json`; the runner stays usable locally.

## Open questions

1. Why were tasks 5.1 to 5.3 of `add-transactional-emails` (the three integration tests) left unwritten? The known-defects entry needs the cause and the reason it is not fixed yet. Suggested: they were deferred to keep the change small and no runner would have caught it; keep it open until the developer confirms; or the developer states another cause. Deferrable: the entry's text changes, the tasks do not.

## Answered questions

None.
