## Requirements coverage

| Requirement | Delivered by |
|---|---|
| The templates carry the planning sections | 1.2, 2.1 |
| An open question has a plain-language opening and three parts | 1.2, 3.1 |
| An answered question moves, with what it changed | 1.2, 3.1 |
| An open question blocks implementation | 2.3, 2.4, 3.2 |
| Every requirement maps to a task or an open question | 2.1, 2.4, 3.2 |
| Work outside this repository is listed and verified | 1.2 |
| Tests come from the scenarios before implementation | 1.3, 3.1 |
| Implementation runs the gates per group and logs what it does not fix | 3.2 |
| A storefront page change ends with the page loaded | 3.2 |
| A validation pass turns every gap into a question before implementation | 4.1 |
| A change is verified against its specs before archive | 1.1, 3.3 |
| Architecture decisions are recorded only when cross-cutting with alternatives | 4.2 |
| The spec check has one implementation | 2.1, 2.3, 2.4 |

## 1. Ecosystem pieces

- [ ] 1.1 Enable OpenSpec's expanded profile in the devcontainer (`openspec config profile`, selecting the workflow commands), run `openspec update`, commit the generated `opsx` commands and skills, and add the profile selection to the devcontainer `postCreateCommand` before its `openspec update` step; verify `/opsx:verify`, `/opsx:ff`, `/opsx:continue` and `/opsx:new` appear in the command list and `openspec update` on a fresh container keeps them
- [ ] 1.2 Fork the schema with `openspec schema fork spec-driven h2bc`, set `schema: h2bc` in `openspec/config.yaml`, and edit the templates: proposal gains `## Open for planning`; design gains `## Open questions` and `## Answered questions` with guidance comments stating the three-part shape, the `None.` empty form and the move-with-`Changed:` rule; tasks gain `## Requirements coverage` (table, one row per delta-spec requirement), `## Review findings` (empty at plan time) and `## Outside this repo` (where and observable result); verify `openspec schema validate h2bc` passes and `openspec instructions design --change add-spec-planning-gates --json` shows the new template
- [ ] 1.3 Install openspec-plus and openspec-tdd in the devcontainer following each README, keeping their skills unedited; set `openspec/.plus/config.yaml` to `questionMode: sequential` and `apply.executionMode: inline`; verify `ls .claude/skills` lists the `openspec-plus-*` skills and the tdd skill, `openspec/config.yaml` still holds this project's context and rules, and `/opsx:tdd` is available

## 2. Parser, check and gate

- [ ] 2.1 Create `scripts/spec-lib.mjs` exporting `section(markdown, title)`, `openQuestions(markdown)` (throws when the section is absent; top-level list items only; `None.` and prose are not questions), `requirements(specMarkdown)`, `coverage(tasksMarkdown)`, and `checkChange(dir)` returning `{ open, missingCoverage, ticked }` reading every `specs/**/spec.md`; verify `pnpm verify scripts-test` passes with the tests from 2.2
- [ ] 2.2 Create `scripts/spec-lib.test.mjs` with fixtures: no section throws; `None.` yields zero; two questions with nested bullets yield two; `## Open Questions` capitalization is accepted; coverage complete versus one requirement missing, whitespace-insensitive; `ticked` true only when a `- [x]` task exists; verify `pnpm verify scripts-test` passes
- [ ] 2.3 Create `scripts/spec-check.mjs`: `node scripts/spec-check.mjs [change] [--json]`, no argument checks every directory under `openspec/changes/` except `archive/`, skips a change with no `design.md` or no `tasks.md`, exits 0 when nothing is open and coverage is complete, 2 listing each open question and missing requirement, 1 when an artifact cannot be read, and ends with the instruction to move an answered question into `## Answered questions`; verify it exits 2 on a scratch copy of this change with one question added, 0 on this change as written, and 1 on `add-transactional-emails` before task 5.1
- [ ] 2.4 Add a `spec-gates` check gate to `GATES` in `scripts/verify-lib.mjs`, planned when a path starts with `openspec/changes/`, failing only for a change where `ticked` is true and `open` or `missingCoverage` is non-empty, naming the change and each item; add tests with fixture change directories for ticked-plus-open (fails), unticked-plus-open (passes) and ticked-plus-missing-coverage (fails); verify `pnpm verify scripts-test` and, after 5.1, `pnpm verify spec-gates` pass

## 3. Guidance and rules

- [ ] 3.1 In `openspec/config.yaml` reduce `rules.design` and `rules.tasks` to what the templates cannot express (`None.` is the empty form; a ticked task is never edited; an unticked task is still a plan) and add `rules.tasks` line that each scenario the TDD step cannot test at any level is named in the task list; verify `openspec instructions tasks --change add-spec-planning-gates --json` shows both the openspec-plus lines and these, and no line restates a template section
- [ ] 3.2 Add `operations.apply.guidance` to `openspec/config.yaml`: run `node scripts/spec-check.mjs <change>` first and refuse while it exits 2; run `pnpm verify` after each task group and tick only when green; a within-scope finding re-does the task, a beyond-scope finding is logged under `## Review findings`; a task under `front/app` or `front/components` ends by loading the page through the Playwright MCP server and saving a screenshot under `.tmp/`, or the report states no page was loaded; end unstaged, never commit or push; verify `openspec instructions apply --change add-spec-planning-gates --json` shows an `operationGuidance` array with those items
- [ ] 3.3 Add `operations.archive.guidance` to `openspec/config.yaml`: run `/opsx:verify` first; a CRITICAL finding stops the archive until fixed or recorded in `.claude/rules/known-defects.md`; list warnings in the archive summary; verify `openspec instructions archive --change add-spec-planning-gates --json` shows the guidance
- [ ] 3.4 Create `.claude/rules/spec-workflow.md` with `paths: ["openspec/**"]`: the flow in order (explore, propose, validate, tdd, apply, verify, archive) naming the command or skill for each step; a ticked task is history and never edited, an unticked task is still a plan; where a decision is recorded (the change's design, a rule for a law, an ADR only across components with alternatives, the architecture doc for a fact with no alternatives); the question shape and the move rule; generated `opsx`, `openspec-*` and `openspec-plus-*` files are never hand-edited; verify the file is under 60 lines and its frontmatter parses

## 4. Skills and decision records

- [ ] 4.1 Create `.claude/skills/dev-validate-change/SKILL.md` with `context: fork`, `agent: general-purpose`, and `allowed-tools: Read, Grep, Glob, Bash(node scripts/spec-check.mjs *), Bash(openspec *), Edit`: read every artifact end to end; open every path a task cites and confirm it exists or an earlier task creates it; confirm every task has a verify clause; re-derive coverage from the delta specs independently of the table; run the cold test; write each gap as a three-part open question in `design.md`; return the questions simplest first with the check's output leading the report; writes only the two question sections and unticked tasks; verify by running it on `add-agent-rules-and-git-flow` and receiving a report that starts with the check's output
- [ ] 4.2 Create `docs/decisions/template.md` (title as outcome, status, date, context with checkable facts, alternatives each with the reason it lost, decision, consequences) and `.claude/skills/dev-add-decision/SKILL.md` that refuses unless the decision constrains more than one component and alternatives were weighed, names where it belongs instead, and otherwise writes `docs/decisions/yyMMdd-slug.md` from the template; verify invoking it with a decision scoped to one change refuses and names that change's `design.md`

## 5. In-flight change and verification

- [ ] 5.1 In `openspec/changes/add-transactional-emails/design.md` add `## Open questions` and `## Answered questions` reading `None.`; in its `tasks.md` add a `## Requirements coverage` table with one row per requirement in `specs/transactional-emails/spec.md` mapped to the existing task ids, and an empty `## Review findings` section, editing no ticked task; verify `node scripts/spec-check.mjs add-transactional-emails` exits 0
- [ ] 5.2 Run `/opsx:verify` on this change and then `pnpm verify` on the final tree; verify the verify report has no CRITICAL finding and the runner is green with `spec-gates` among the gates that ran

## Review findings

None.
