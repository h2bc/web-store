## Why

Which checks a change needs is decided fresh by whoever is working: the tasks rule says to end with `cd front && pnpm lint && pnpm typecheck` when the storefront changes, CI lists its commands in YAML and never runs the API integration tests, nothing checks that an env var the code reads is declared in a template, and nothing stops a commit or an "I'm done" while a check is red or unrun. A gate nobody ran cannot fail, and `add-transactional-emails` shipped with its integration tests unwritten and no record of why.

## What Changes

- One gate runner, `pnpm verify`, at the repo root. It reads the working tree diff, maps changed paths to gates, runs them cheapest first, stops at the first failure and prints what ran and what did not. `--all` runs every gate, a gate name runs that one, `--dry-run` prints the plan, `--status` says whether the current tree has a green run behind it.
- A git pre-commit hook that blocks any commit, from the agent or a terminal, until the runner is green on the tree being committed. Claude Code hooks, checked in under `.claude/settings.json`, add three more moments: a turn cannot end with edits that no green run covers; every edited TypeScript file is formatted and linted on the spot; a session starts with the current known defects in view.
- CI's check job runs `pnpm verify --all` instead of its own list of commands, and gains a postgres service so the API integration tests run there for the first time.
- An env contract gate: every `process.env.X` read in `api/` and `front/` code must be declared in `api/.env.template` or `front/.env.example`. Missing keys are listed; the fix is declaring them.
- A `.claude/rules/verification-gates.md` rule carrying the invariants: a gate you did not run is a gate you did not pass; never make a gate green by weakening it; new logic ships with its test; a task's verify clause names a gate through the runner, never the underlying command.
- A `.claude/rules/known-defects.md` file, the single place where reality contradicts the rules, seeded with the unwritten email tests.
- The tasks rule in `openspec/config.yaml` is replaced so verify clauses go through the runner.
- README tells contributors to run `pnpm verify` before committing and how the hooks behave.

Non-goals:

- No new lint rules, no change to what eslint, tsc, vitest, jest or playwright check.
- No open-questions or coverage gate; that is `add-spec-planning-gates`, which adds its check to this runner.
- No push guard or branch rules; that is `add-agent-rules-and-git-flow`.
- No change to the image build and deploy jobs.

## Flow after this change

Rows marked new are what this change adds; the rest exists today.

| Step | What happens | Command or skill | Enforced by |
|---|---|---|---|
| Explore | Think through the idea | `/opsx:explore` | none |
| Propose | Proposal, specs, design, tasks | `/opsx:propose` | none |
| Apply | Implement task by task; every verify clause runs `pnpm verify` (new) | `/opsx:apply` | stop hook holds the turn over unverified edits (new); post-edit hook formats and lints (new) |
| Commit and push | Plain git, by hand | `git commit`, `git push` | git pre-commit hook: green run required, agent and terminal (new) |
| PR and CI | Plain `gh` or the GitHub UI | `gh pr create` | CI runs `pnpm verify --all`, API tests included (new) |
| Review | Existing review action | `code-review` action, `/code-review` | none |
| Merge | GitHub UI, merge commit | none | none |
| Archive | Specs merged | `/opsx:archive` | none |

## Open for planning

- Whether the e2e gate should be planned for any `front/` or `api/` change, or only for `e2e/` changes. Resolved in design.

## Capabilities

### New Capabilities
- `verification-gates`: which checks a change must pass before it is called done, how they are selected from the diff, how the result is reported, how the checks are enforced at edit, commit and turn end, and where a known deviation from the rules is recorded.

### Modified Capabilities
- none.

## Impact

- New `scripts/` at the root: the runner, its pure gate table, the three hook entry points, and their `node:test` files.
- Root `package.json`: a `verify` script. No new dependency.
- New `.claude/settings.json` with the hook configuration; `.githooks/pre-commit` and a `core.hooksPath` set by the devcontainer's post-create command.
- `.github/workflows/deploy.yml`: the check job calls the runner and gets a postgres service.
- New `.claude/rules/` directory with two files.
- `openspec/config.yaml`: the `tasks` rules.
- `api/.env.template` and `front/.env.example` gain whatever keys the env gate reports missing.
- `.gitignore` gains `.tmp/`, where the runner keeps its last green marker.
- `README.md`, `.devcontainer/devcontainer.json`.
- The in-flight `add-transactional-emails` change is untouched; its tasks are history.
