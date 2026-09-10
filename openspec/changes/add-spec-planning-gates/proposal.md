## Why

OpenSpec reads a change's status from which artifacts exist, but nothing stops apply from starting while a design decision is still open, nothing shows a requirement that no task delivers, and tasks that live outside this repo are unchecked boxes nobody reads. `add-transactional-emails` shows all three: three manual steps in the deploy repo, three test tasks left unchecked, and no note saying why. The ecosystem already covers part of this: OpenSpec's expanded profile ships `/opsx:verify`, openspec-plus adds discovery and question rounds to propose, and openspec-tdd writes failing tests from spec scenarios. None of them blocks deterministically or checks coverage.

## What Changes

- OpenSpec's expanded profile is enabled and its generated commands committed: `/opsx:verify` (completeness, correctness, coherence before archive), `/opsx:ff`, `/opsx:continue`, `/opsx:new`. Archive guidance requires a verify report with no CRITICAL finding.
- openspec-plus is installed beside the generated skills for structured discovery, testable scenarios, design alternatives that need a pick, and per-slice verification in apply. openspec-tdd is installed for `/opsx:tdd`, which turns the delta spec's scenarios into failing tests before apply.
- The `spec-driven` schema is forked into `openspec/schemas/h2bc/` so the templates themselves carry `## Open questions` and `## Answered questions` in design, `## Open for planning` in proposal, and `## Requirements coverage`, `## Review findings` and `## Outside this repo` in tasks.
- A spec check script and a `spec-gates` entry in the gate runner: an active change with a ticked task and an open question fails; a requirement in the change's delta specs missing from the coverage table fails. One parser serves the script, the gate and the apply guidance.
- Apply guidance in `openspec/config.yaml`: run the spec check first and refuse while a question stands; run `pnpm verify` after each task group and tick only when green; log beyond-scope findings instead of dropping them; never commit from apply; a task under `front/app` or `front/components` ends by loading the page and saving a screenshot under `.tmp/`.
- A `dev-validate-change` skill that runs in a forked context: a fresh reader opens every path a task cites, checks every task has a verify clause, re-derives coverage, and runs the cold-session test. Every gap becomes an open question.
- `docs/decisions/` for ADRs, with a template and a `dev-add-decision` skill whose gate admits only cross-cutting calls with real alternatives.

Non-goals:

- Board intake. No board exists to pull from; a Nextcloud MCP server is the route when one does.
- Retroactive ADRs for guest-only checkout, the server-only data layer or the single region.
- A design-notes file. There is no designer and no wireframes; the page-load step covers rendering.
- Editing the generated `opsx` commands, `openspec-*` skills, or the installed `openspec-plus-*` skills.
- Custom agents. The validate skill forks into a built-in agent.

## Flow after this change

Rows marked new are what this change adds; the rest exists after the two earlier changes.

| Step | What happens | Command or skill | Enforced by |
|---|---|---|---|
| Explore | Think through the idea | `/opsx:explore` | none |
| Propose | `h2bc` schema templates; discovery and question rounds; open questions in the design (new) | `/opsx:propose` with openspec-plus (new) | templates (new) |
| Validate | Fresh reader checks paths, verify clauses, coverage; gaps become questions; the developer answers (new) | `/dev-validate-change` (new) | `spec-check` script (new) |
| TDD | Failing tests from the spec scenarios (new) | `/opsx:tdd` (new) | none |
| Apply | Refuses while a question is open; verify per group; beyond-scope findings logged; page loaded for storefront tasks (new) | `/opsx:apply` | `spec-check`, `spec-gates` in the runner (new), hooks |
| Commit and push | As before | `/git-commit-push` | pre-commit hook, now covering `spec-gates` (new) |
| PR | As before | `/git-open-pr` | CI |
| Review | As before | `code-review` action, `/code-review` | CI check |
| Merge | As before | `/git-merge-pr` | branch protection |
| Verify | Completeness, correctness, coherence against the specs (new) | `/opsx:verify` (new) | archive guidance: no CRITICAL (new) |
| Archive | Specs merged | `/opsx:archive` | none |
| Any time | Cross-cutting decision with alternatives (new) | `/dev-add-decision` (new) | skill refuses otherwise |

## Open for planning

- None.

## Capabilities

### New Capabilities
- `spec-planning`: what a change's design and tasks must carry before implementation may start, how open questions block it, how coverage is proven, how a change is verified before archive, and where decisions and beyond-scope findings are recorded.

### Modified Capabilities
- none.

## Impact

- `openspec/config.yaml`: `schema: h2bc`, `rules.design` and `rules.tasks` reduced to what the templates cannot express, new `operations.apply.guidance` and `operations.archive.guidance`; openspec-plus merges its own rule lines.
- `openspec/schemas/h2bc/` new: `schema.yaml` and templates.
- `openspec/.plus/config.yaml` new, written by the openspec-plus installer.
- `.claude/commands/opsx/` gains the expanded commands; `.claude/skills/` gains the generated expanded skills, `openspec-plus-*`, `opsx-tdd` (or its skill name), `dev-validate-change`, `dev-add-decision`.
- `scripts/spec-lib.mjs`, `scripts/spec-check.mjs`, their tests, and a new gate in `scripts/verify-lib.mjs`.
- `.claude/rules/spec-workflow.md`, path-scoped to `openspec/**`.
- `docs/decisions/template.md`.
- The in-flight `add-transactional-emails` change gets the two question sections and a coverage table so the new gate reads it.
- `.devcontainer/devcontainer.json` post-create sets the expanded profile so `openspec update` on a fresh container keeps the commands.
- Depends on `add-verification-gates` (the gate table, `.tmp/`) and `add-agent-rules-and-git-flow` (rules layout).
