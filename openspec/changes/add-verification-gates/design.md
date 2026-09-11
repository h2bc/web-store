## Context

See proposal.md for motivation. Root `package.json` already wraps both apps with `<cmd>:<scope>` scripts. CI in `.github/workflows/deploy.yml` had a `check` job (lint, typecheck, `test:front`) and an `e2e` job with a postgres service; `test:api` ran nowhere in CI. `api/.env.test` is tracked and holds the `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` the Medusa integration runner uses. Node is 24 in the devcontainer and 25 in CI.

Claude Code hooks are shell commands configured in `.claude/settings.json` under `hooks`, keyed by event with a tool matcher. A hook receives the event as JSON on stdin (for `PostToolUse` on Edit or Write, `tool_input.file_path`) and `$CLAUDE_PROJECT_DIR` in its environment.

## Goals / Non-Goals

**Goals:**
- The same named scripts run locally, in the commit hook and in CI.
- No new dependency at the root.
- The setup reads as plain scripts, not a framework.

**Non-Goals:**
- Selecting checks from the diff, caching results, or remembering green runs.
- Holding the agent's turn; the commit hook and CI are the enforcement.
- Replacing the per-app scripts; the root scripts chain them.
- A single umbrella command.

## Decisions

**One root script per check, chaining the apps.** `lint` is `lint:api && lint:front`; `format` is `format:api && format:front`; `format:check` calls each app's `format:check`. Each app owns its `format` (`prettier --write .`) and `format:check` (`prettier --check .`), with a `.prettierignore` for its lock file, and in the storefront the Google site-verification page. Alternatives: a single `verify` chain of every check, built first in this change; and a Node runner that plans checks from the changed paths and remembers green runs by tree fingerprint (ported from Adventures.is). Rejected: an umbrella command hides which check failed and adds a name that is not a check, and the runner was more machinery than the repo needs. The standard `lint`, `format`, `typecheck` and `test` names are what a reader expects.

**ESLint and Prettier live only in the apps.** Nothing at the root formats or lints; root devDependencies are Playwright, `@types/node` and TypeScript. Files outside `api/` and `front/` (`e2e/`, root configs, workflows) are not formatted or checked. Alternative: root Prettier and ESLint with an empty root `eslint.config.js`, built first in this change. Rejected: a second copy of each tool at the root only to cover `e2e/`, and a root config that exists to say nothing.

**The pre-commit hook runs `pnpm lint && pnpm format:check`.** `.githooks/pre-commit` is two lines; a `prepare` script in the root `package.json` runs `git config core.hooksPath .githooks` on every `pnpm i`, which the devcontainer and CI already run. Typecheck and tests are left to CI so a commit takes seconds. Alternative: the hook runs every check, about three minutes per commit. Rejected: too slow for a per-commit gate.

**CI collapses `check` and `e2e` into one `check` job with four named steps.** Format runs `pnpm format:check`, Lint `pnpm lint`, Typecheck the root, api and storefront typecheck scripts, Tests `pnpm test:api && pnpm test:e2e`. Each step is a script name, so a red step says which check failed. The job keeps the postgres service, migrations, seed, credential export and Chromium install as setup steps. `test-api` reads its database from `api/.env.test` with `DB_HOST`, `DB_USERNAME` and `DB_PASSWORD` overridden by the job env, since Medusa's `loadEnv` does not override variables already set.

**Two inline Claude Code hooks in `settings.json`, format and lint on edit, per file, with the app's own tools.** `PostToolUse` on `Edit|Write` reads `tool_input.file_path`, strips `$CLAUDE_PROJECT_DIR/`, and by the `api/` or `front/` prefix runs `pnpm --dir <app> exec prettier --write` and `pnpm --dir <app> exec eslint` on that one file; lint output goes to stderr and exit 2 returns it to the agent. Files outside both apps are skipped. The API is on ESLint 10; the storefront stays on 9 because `eslint-config-next` depends on `eslint-plugin-react`, which has no ESLint 10 release yet. The storefront eslint config gained `eslint-config-next/typescript` with `@typescript-eslint/no-unused-vars` as an error, as in the API config. Alternative: root-installed tools with ESLint's `v10_config_lookup_from_file` flag, built first. Rejected with the root tooling. Alternative: hooks calling `pnpm lint:front` and `pnpm format:front` over the whole app. Rejected: per file is what the Claude Code docs' formatter example does, and whole-app runs on every edit are slow.

**`api/.env.template` is renamed to `.env.example`** so both apps use one name for the file a developer copies. The root `package.json` is `"type": "module"`.

**No rules file and no Verification section in `CLAUDE.md`.** Verification is enforced by the pre-commit hook, the edit hooks and CI. The `.claude/rules/` directory and the known-defects file from the Adventures.is setup were built and dropped, as was a two-sentence Verification section in `CLAUDE.md`: hooks and CI enforce the checks, prose does not.

**The tasks rule in `config.yaml` names the scripts the last task runs.** `pnpm lint`, `pnpm format:check`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api`. It replaces the `cd front && pnpm lint && pnpm typecheck` line.

## Risks / Trade-offs

- [A type error or failing test gets committed] → CI's Typecheck and Tests steps catch it on the pull request; the hook stays fast.
- [A page breaks and the local run stays green] → CI runs e2e on the pull request.
- [`test-api` needs more env in CI than the three DB keys] → The change lands through a pull request, so CI on that PR proves the job.
- [`e2e/` drifts in formatting] → Nothing checks it. Accepted: a small directory, and the alternative is root tooling.

## Migration Plan

1. Land the hooks, settings, example files, config and CI change in one pull request. CI on that PR is the first run of the four steps.
2. Dev databases seeded before the single-region change need a reseed for the checkout e2e to pass locally.

Rollback: revert the workflow file and delete `.claude/settings.json`.

## Open questions

None.

## Answered questions

2. Should the storefront gain an unused-variable lint rule so the format and lint hooks can report the spec's scenario, given the non-goal of no new lint rules? Answer: yes, add Next's TypeScript preset with the rule as an error. Changed: `front/eslint.config.mjs`, the proposal's non-goals, the hooks decision above.
3. Should there be one umbrella `verify` command, or one script per check? Answer: one script per check under the standard names, with ESLint and Prettier in the apps only and nothing at the root. Changed: root and app `package.json`, the pre-commit hook, the edit hooks, the CI job, the config rule, README, and the first five decisions above.
