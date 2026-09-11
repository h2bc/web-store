## ADDED Requirements

### Requirement: Apply and archive guidance lives in the OpenSpec config
`operations.apply.guidance` SHALL say: the named scripts run after each task group and a task is ticked only when they are green; a finding within the task's scope re-does the task and a finding beyond the change's scope is logged under `## Review findings`; a task under `front/app` or `front/components` ends with the page loaded and a screenshot under `.tmp/`, or the report says no page was loaded; apply ends unstaged and never commits or pushes. `operations.archive.guidance` SHALL say: run `/opsx:verify` first; a CRITICAL finding stops the archive until fixed or logged under `## Review findings`; warnings are listed in the archive summary.

#### Scenario: Beyond-scope finding
- **WHEN** implementation notices a pre-existing defect the change does not cover
- **THEN** it is written under `## Review findings` with the task id that met it, and the change's scope stays as written

#### Scenario: Verify finds a missing scenario
- **WHEN** the verify report marks a spec scenario as not implemented
- **THEN** the archive is not performed and the finding is named

### Requirement: Task list rules carry the sections and the doctrine
`rules.tasks` SHALL say: a change that alters how the system works has a task updating `docs/architecture.md`; the list ends with `## Review findings`, reading `None.` at plan time, and, when any step happens outside the repository, `## Outside this repo` with where each step happens and the observable result; a ticked task is history and never edited.

#### Scenario: Data layer contract changes
- **WHEN** a change alters the data layer's return shape
- **THEN** its task list has a task updating the architecture doc, and the reasoning stays in the change's design

#### Scenario: Env var on the deploy repository
- **WHEN** a change needs a variable set in the deploy repository
- **THEN** the task sits under `## Outside this repo`, names the repository and the variable, and the behaviour that proves it took effect
