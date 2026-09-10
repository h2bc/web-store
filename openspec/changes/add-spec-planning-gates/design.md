## Context

See proposal.md for motivation. OpenSpec 1.13 reads `openspec/config.yaml`: `schema` selects the workflow, `rules` keyed by artifact id are injected into that artifact's instructions, and `operations.apply.guidance` and `operations.archive.guidance` are injected into those flows. A project-local schema under `openspec/schemas/<name>/` is a `schema.yaml` plus a `templates/` directory; `openspec schema fork spec-driven <name>` creates it. The expanded profile (`/opsx:verify`, `/opsx:ff`, `/opsx:continue`, `/opsx:new`, `/opsx:onboard`) is switched on per machine with `openspec config profile` and materialized by `openspec update`; `/opsx:verify` reports completeness, correctness and coherence as CRITICAL, WARNING or SUGGESTION and does not block archive on its own. openspec-plus installs `openspec-plus-*` skills, merges rule lines into `config.yaml` without removing existing ones, and keeps its settings in `openspec/.plus/config.yaml`. openspec-tdd adds an `opsx:tdd` step between propose and apply. Status in OpenSpec is derived from artifact existence and checkbox state only. `add-verification-gates` provides the gate runner, the commit hook and `.tmp/`; `add-agent-rules-and-git-flow` provides the rules layout. The in-flight `add-transactional-emails` design has no question sections and its tasks no coverage table.

## Goals / Non-Goals

**Goals:**
- Use what the ecosystem ships before writing anything: expanded profile, openspec-plus, openspec-tdd.
- A deterministic block between planning and implementation, enforced by a script wired into the runner and the commit hook, with guidance as the second line.
- A requirement that no task delivers is visible in one table and caught by a gate.
- Every customization survives `openspec update` and an openspec-plus update.

**Non-Goals:**
- Replacing OpenSpec's status model or editing its generated files.
- Board intake or drift detection against an external source.
- Custom agents.

## Decisions

**Expanded profile on, and pinned for the devcontainer.** The profile is machine configuration, so the devcontainer's `postCreateCommand` runs `openspec config profile expanded` (or the non-interactive equivalent the CLI offers) before `openspec update`, and the generated command and skill files are committed. Alternative: write our own verify-before-archive skill. Rejected: `/opsx:verify` already checks tasks, requirements, scenarios and design coherence.

**Archive guidance makes verify matter.** `operations.archive.guidance` says: run `/opsx:verify` first; a CRITICAL finding stops the archive until fixed or recorded in `known-defects.md`; list warnings in the archive summary. Alternative: a gate in the runner. Rejected: archive is a planning act, not a commit; guidance at the archive step is where it is read.

**openspec-plus and openspec-tdd installed as shipped.** Their skills are not edited. Their rule lines in `config.yaml` are kept as the installer writes them; ours are added below them. `openspec/.plus/config.yaml` sets `questionMode: sequential` and `apply.executionMode: inline`, matching the no-custom-agents decision. `/opsx:tdd` runs after `dev-validate-change` and before `/opsx:apply`; a scenario it cannot test is recorded in the task list. Alternative: write our own discovery and TDD guidance. Rejected: both exist, install beside the generated skills, and are maintained.

**A forked schema, `h2bc`, owns the sections.** `openspec schema fork spec-driven h2bc`, then the templates gain the sections: proposal `## Open for planning`; design `## Open questions` and `## Answered questions` with the three-part shape and the move rule in guidance comments; tasks `## Requirements coverage`, `## Review findings`, `## Outside this repo`. `config.yaml` sets `schema: h2bc`. `rules.design` and `rules.tasks` keep only what a template cannot say (that `None.` is the empty form, that a ticked task is history). Alternative: rules only. Rejected: a rule describes a shape the agent must reconstruct; a template hands it over.

**One parser, ported from Adventures.is `spec/lib.mjs`, at `scripts/spec-lib.mjs`.** `section(markdown, title)`, `openQuestions(markdown)` (throws when absent; `None.` and prose are not questions; a top-level list item is), `requirements(specMarkdown)`, `coverage(tasksMarkdown)`, `checkChange(dir)` returning `{ open, missingCoverage, ticked }`. Headings match case-insensitively. Alternative: two small checks written where each is used. Rejected: they disagree the day a heading moves.

**A CLI over it, `scripts/spec-check.mjs`.** `node scripts/spec-check.mjs [change] [--json]`: exit 0 executable, 2 with the open questions and missing requirements listed, 1 when an artifact cannot be read; no argument checks every active change; a change without `design.md` or `tasks.md` is skipped as still planning.

**A `spec-gates` check gate in the runner.** Planned when `openspec/changes/**` changes; fails only for a change with at least one ticked task and either an open question or a missing coverage row. Since the commit hook requires a green run, a commit that ticks a task while a question is open is blocked. Alternative: fail on any open question anywhere. Rejected: every planning branch would be red.

**Apply guidance in `config.yaml`.** `operations.apply.guidance`: run `node scripts/spec-check.mjs <change>` first and refuse while it exits 2; run `pnpm verify` after each task group and tick only when green; a within-scope finding re-does the task, a beyond-scope finding goes under `## Review findings`; for a task under `front/app` or `front/components`, load the page through the Playwright MCP server and save the screenshot under `.tmp/`, or state that no page was loaded; end unstaged, never commit or push. Alternative: edit `openspec-apply-change/SKILL.md`. Rejected: overwritten by `openspec update`.

**A path-scoped rule for the doctrine.** `.claude/rules/spec-workflow.md` with `paths: openspec/**`: the flow in order (explore, propose, validate, tdd, apply, verify, archive), a ticked task is history, where a decision is recorded, the question shape and move rule, generated and installed files are never hand-edited.

**`dev-validate-change` runs forked.** `context: fork` with the built-in general-purpose agent and `allowed-tools` limited to reading, `node scripts/spec-check.mjs`, `openspec`, and editing under `openspec/changes/`. Steps: read every artifact end to end; open every path a task cites; check every task has a verify clause; re-derive coverage; run the cold test; write each gap as a three-part open question; return the questions simplest first; end with the check's output leading the report. The parent session puts the questions to the developer and moves answers. Alternative: run inline. Rejected: the author re-reading their own plan is not a fresh reader.

**ADRs at `docs/decisions/yyMMdd-slug.md` from `docs/decisions/template.md`.** Date-first naming so parallel branches cannot collide. `dev-add-decision` has the Adventures.is gate. The `spec-driven-with-adr` community schema was considered and rejected: it makes an ADR a mandatory artifact of every change, while the gate here is meant to refuse most candidates.

**Grandfather the in-flight change.** `add-transactional-emails` gets `None.` under its question sections and a coverage table for its `transactional-emails` spec. Its ticked tasks are not edited.

## Risks / Trade-offs

- [Guidance is advisory; an agent skips the check] → The runner's gate and the commit hook are the hard stop.
- [Parser breaks on an unusual heading or list style] → One implementation with fixture tests; a missing section is an error, never a pass.
- [`openspec update` on a machine with the core profile removes the expanded commands] → The devcontainer sets the profile before updating; README says so for other machines.
- [openspec-plus's rule lines conflict with ours] → Ours are appended after and say less; a conflict is resolved by deleting our line, never by editing theirs.
- [The page-load step has no browser in some sessions] → The report must say so.
- [`/opsx:tdd` produces tests for scenarios the e2e suite already covers] → The task list names the level per scenario; duplicates are dropped at validate.

## Migration Plan

1. Enable the profile, install the two community skills, fork the schema, land the parser, check, gate, guidance, rule, skills and ADR template in one PR.
2. Update `add-transactional-emails` in the same PR so the gate reads it.
3. Subsequent changes are proposed under the `h2bc` schema.

Rollback: set `schema: spec-driven`, remove the `spec-gates` entry and the guidance; artifacts written under the new schema stay valid.

## Open questions

None.

## Answered questions

None.
