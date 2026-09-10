## Purpose

Defines what a change's design and task list must carry before implementation may start, how an open question blocks it, how requirement coverage is proven, how a change is verified before archive, and where decisions and beyond-scope findings are recorded.

## ADDED Requirements

### Requirement: The templates carry the planning sections
The project's workflow schema SHALL generate a proposal with an `## Open for planning` section, a design with `## Open questions` and `## Answered questions` in that order, and a task list with `## Requirements coverage`, `## Review findings` and `## Outside this repo`. An empty section SHALL contain the single line `None.` A design without the open-questions section SHALL be read as unreadable, not as having no questions.

#### Scenario: New change scaffolded
- **WHEN** a change is created with the project's default schema
- **THEN** the artifact templates the agent receives contain those sections with their guidance

#### Scenario: Section missing
- **WHEN** the spec check reads a design without a `## Open questions` heading
- **THEN** it exits with an error naming the missing section rather than reporting zero open questions

### Requirement: An open question has a plain-language opening and three parts
Each open question SHALL open with the decision in one ordinary sentence and what goes wrong if it is picked wrong, then carry: a suggested answer with its evidence named, an explicit keep-it-open option, and room for the developer's own answer.

#### Scenario: Question written by planning
- **WHEN** planning cannot settle which cache tag a new read uses
- **THEN** the question states the decision in plain words, suggests a tag with the sibling file it comes from, offers to keep it open, and invites another answer

### Requirement: An answered question moves, with what it changed
Answering a question SHALL move it from `## Open questions` to `## Answered questions` with the answer, a `Changed:` line naming the section, task or option the answer changed, and the date. A question SHALL NOT be struck through or annotated in place.

#### Scenario: Developer answers
- **WHEN** the developer picks the suggested cache tag
- **THEN** the question leaves the open section, appears under answered with `Changed:` naming the task it settled, and the open section reads `None.` if it was the last

### Requirement: An open question blocks implementation
Implementation of a change SHALL NOT start while its design has an open question. The apply flow SHALL run the spec check first and refuse, naming each open question, when any stands. The verification runner SHALL fail when an active change has at least one ticked task and at least one open question, which also blocks the commit through the commit hook.

#### Scenario: Apply with an open question
- **WHEN** the apply flow starts on a change whose design lists one open question
- **THEN** it refuses, prints the question, and says to move it to answered or keep the change blocked

#### Scenario: Ticked task beside an open question
- **WHEN** `tasks.md` has a ticked task and `design.md` has an open question
- **THEN** `pnpm verify` fails in the spec gate naming the change and the question

#### Scenario: Planning-only change with open questions
- **WHEN** a change has open questions and no ticked task
- **THEN** the spec gate passes; the questions block execution, not planning

### Requirement: Every requirement maps to a task or an open question
`tasks.md` SHALL carry a `## Requirements coverage` table with one row per `### Requirement:` in the change's delta specs, mapped to the task id that delivers it or the open question that blocks it. The verification runner SHALL fail when a requirement has no row.

#### Scenario: Requirement dropped from tasks
- **WHEN** a delta spec has six requirements and the coverage table lists five
- **THEN** the spec gate fails and names the missing requirement

#### Scenario: Blocked requirement
- **WHEN** a requirement cannot be delivered until a question is answered
- **THEN** its row names the open question, not a task, and the gate passes

### Requirement: Work outside this repository is listed and verified
Tasks that happen in the deploy repository, in an external dashboard, or in the admin SHALL sit in a final `## Outside this repo` group. Each SHALL name where the step happens and the observable result that verifies it.

#### Scenario: Env var on the worker container
- **WHEN** a change needs an env var set in `h2bc/web-store-deploy`
- **THEN** the task names that repository, the variable, and the behaviour that proves it took effect

### Requirement: Tests come from the scenarios before implementation
Before apply, the change's spec scenarios SHALL be turned into failing tests that fail for the right reason, not placeholders, through the TDD step. A scenario that cannot be tested at the unit, integration or e2e level SHALL be stated as such in the task list.

#### Scenario: Scenario with a testable outcome
- **WHEN** a delta spec scenario says a request returns a given status
- **THEN** a test exists that fails before implementation and names that scenario

### Requirement: Implementation runs the gates per group and logs what it does not fix
The apply flow SHALL run `pnpm verify` after each task group and tick a task only when the runner is green for it. A finding within the task's scope SHALL re-do the task. A finding beyond the change's scope SHALL be logged under `## Review findings` in `tasks.md`, never dropped. Apply SHALL end with unstaged changes and SHALL NOT commit or push.

#### Scenario: Gate red after a group
- **WHEN** the runner fails after task group 2
- **THEN** no task in group 2 is ticked until the failure is fixed and the runner is green

#### Scenario: Beyond-scope finding
- **WHEN** implementation notices a pre-existing defect the change does not cover
- **THEN** it is written under `## Review findings` with the task id that met it, and the change's scope stays as written

### Requirement: A storefront page change ends with the page loaded
A task that touches `front/app` or `front/components` SHALL end by loading the affected page in a browser and saving a screenshot under `.tmp/`. When no browser tool is available the task report SHALL say the page was not loaded.

#### Scenario: Component edited
- **WHEN** a task changes a component used on the product page
- **THEN** the task's verify clause names the page to load, and the report names the screenshot path or states that no page was loaded

### Requirement: A validation pass turns every gap into a question before implementation
A validation skill SHALL run in a fresh context and, on a planned change, open every path a task cites and confirm it exists or is created by an earlier task, confirm every task has a verify clause, re-derive requirement coverage independently of the table, and check that a cold session could execute every task in order. Each gap SHALL become an open question in the three-part shape. The skill SHALL write only the two question sections and unticked tasks, and SHALL lead its report with the spec check's output.

#### Scenario: Task cites a missing file
- **WHEN** a task says to edit a path that does not exist and no earlier task creates it
- **THEN** the validation pass adds an open question naming the path and a suggested fix

#### Scenario: Clean plan
- **WHEN** every path resolves, every task verifies, and coverage matches
- **THEN** the pass reports the change as executable with the list of facts it checked

### Requirement: A change is verified against its specs before archive
Before a change is archived, the verify step SHALL be run and its report reviewed. A CRITICAL finding SHALL stop the archive until it is fixed or recorded as a known defect; warnings SHALL be listed in the archive summary.

#### Scenario: Verify finds a missing scenario
- **WHEN** the verify report marks a spec scenario as not implemented
- **THEN** the archive is not performed and the finding is named

### Requirement: Architecture decisions are recorded only when cross-cutting with alternatives
A decision record SHALL be written under `docs/decisions/` as `yyMMdd-slug.md` from the template only when the call constrains more than one component and real alternatives were weighed. The decision skill SHALL refuse otherwise and name where the decision belongs instead (the change's design, a rule, or the architecture doc).

#### Scenario: Per-change decision
- **WHEN** a decision affects only the change being built
- **THEN** the skill refuses and points at that change's `design.md`

#### Scenario: Cross-cutting decision
- **WHEN** a decision changes how both apps handle a concern and two options were compared
- **THEN** a dated record is created with context, alternatives, decision and consequences

### Requirement: The spec check has one implementation
The apply flow, the validation skill and the verification runner SHALL read open questions and coverage through the same script, so no two readers can disagree about whether a change is blocked.

#### Scenario: Heading style changes
- **WHEN** the question heading's spelling is changed in the parser
- **THEN** every reader changes with it, and the parser's test fails until its fixture is updated
