## Purpose

Defines which checks a change must pass before it is called done, how they are selected from what changed, how the result is reported, how they are enforced at edit, commit and turn end, and where a known deviation from the rules is recorded.

## ADDED Requirements

### Requirement: One command selects the gates from the diff
The repository SHALL expose a single verification command, `pnpm verify`, that reads the working tree (unstaged, staged and untracked files), selects the gates whose path predicates match, and runs only those. The mapping from paths to gates SHALL live in one place in the repository and nowhere else; no rule, README or task list SHALL enumerate the underlying commands.

#### Scenario: Only the storefront changed
- **WHEN** the working tree touches files under `front/` and nothing else
- **THEN** the plan holds the storefront lint, typecheck and unit-test gates and the e2e gate, and the API gates are listed as not run

#### Scenario: Nothing changed
- **WHEN** the working tree is clean
- **THEN** the command prints that no gate applies, exits 0, and names `--all` as the way to force every gate

#### Scenario: Git cannot answer
- **WHEN** the command runs where git is absent or the directory is not a work tree
- **THEN** it exits non-zero without running any gate and says the selection could not be made

### Requirement: Gates run cheapest first and stop at the first failure
Planned gates SHALL run in a fixed order from cheapest to most expensive. The first failing gate SHALL stop the run. The final output SHALL name every gate that ran with its result, every gate that was planned but not reached, and every gate that was not planned.

#### Scenario: A lint gate fails
- **WHEN** the API lint gate fails while typecheck and test gates were also planned
- **THEN** the command exits 1, the failure line names the lint gate, and the typecheck and test gates are listed as not run

#### Scenario: Everything passes
- **WHEN** every planned gate passes
- **THEN** the command exits 0 and prints the list of gates that passed and the list that were not planned

### Requirement: Explicit modes override the diff
`--all` SHALL plan every gate regardless of the diff. A gate name as an argument SHALL plan only that gate. `--dry-run` SHALL print the plan and run nothing. An unknown gate name SHALL exit non-zero and list the known names.

#### Scenario: Named gate
- **WHEN** the command is invoked with `typecheck-front`
- **THEN** only that gate runs, whatever the diff contains

#### Scenario: Unknown gate name
- **WHEN** the command is invoked with a name that is not a gate
- **THEN** it exits non-zero and prints every known gate name

### Requirement: A gate that ran nothing is reported as not run
A gate whose file set is empty SHALL be reported as not run, never as passed, even when its underlying tool would exit 0 on no input.

#### Scenario: No storefront unit tests exist
- **WHEN** the storefront unit-test gate is planned and no `front/unit/**/*.test.ts` file exists
- **THEN** the output says the gate did not run because no files matched, and the run does not count it as passed

### Requirement: A green run is remembered for the exact tree it verified
After a run in which every planned gate passed, the runner SHALL record a fingerprint of the working tree it verified. `pnpm verify --status` SHALL exit 0 when the current tree matches a recorded green run made without a named-gate restriction, and exit non-zero, naming the gates that would now be planned, when it does not.

#### Scenario: Edit after a green run
- **WHEN** a file changes after a green diff-scoped run
- **THEN** `--status` exits non-zero and lists the gates the new diff plans

#### Scenario: Named gate does not count
- **WHEN** only `pnpm verify lint-front` has run green on the current tree
- **THEN** `--status` still exits non-zero, because a single named gate is not the tree's plan

### Requirement: A commit is blocked until the tree has a green run
A commit started by the agent or from a terminal SHALL be refused by one git pre-commit hook while `--status` is not green for the tree being committed, and the refusal SHALL name the gates that need to run. A bypass flag on the git command SHALL NOT be used to get past it.

#### Scenario: Agent commits with unrun gates
- **WHEN** the agent runs `git commit` after editing files and without a green run
- **THEN** the git hook refuses, the planned gates appear in the command output, and no commit is created

#### Scenario: Terminal commit
- **WHEN** a developer runs `git commit` in a shell on a tree without a green run
- **THEN** the same hook refuses with the same message

### Requirement: A turn cannot end over unverified edits
When the agent tries to end its turn with working tree changes that no green run covers, the turn SHALL be held and the agent told which gates to run. A clean tree or a tree with a matching green run ends the turn normally.

#### Scenario: Done claimed too early
- **WHEN** the agent reports work done while `--status` is not green
- **THEN** the stop hook returns the turn with the list of planned gates

### Requirement: An edited TypeScript file is formatted and linted immediately
After the agent writes or edits a `.ts` or `.tsx` file under `api/` or `front/`, the file SHALL be formatted with that app's formatter and linted with that app's linter. Lint errors SHALL be returned to the agent as feedback on the edit.

#### Scenario: Edit introduces a lint error
- **WHEN** an edit to `front/lib/data/cart.ts` leaves an unused import
- **THEN** the post-edit hook reports the eslint finding to the agent before it moves on

### Requirement: A session starts with the known defects in view
At session start the current known-defects entries SHALL be listed to the agent, with the last recorded verify status.

#### Scenario: New session
- **WHEN** a Claude Code session starts in the repository
- **THEN** the agent's context holds the headline of each known-defects entry

### Requirement: Continuous integration runs the same command
CI SHALL verify a push or pull request by running `pnpm verify --all` and nothing else as its gate step. The API integration tests SHALL run in CI.

#### Scenario: Pull request opened
- **WHEN** a pull request is opened against `main`
- **THEN** CI runs `pnpm verify --all`, including the API integration tests against a database service, and the check fails if any gate fails

### Requirement: Every env var the code reads is declared in a template
An env contract gate SHALL fail when code under `api/` reads a `process.env` key that `api/.env.template` does not declare, or code under `front/` reads one that `front/.env.example` does not declare. `NODE_ENV` and `CI` are exempt. A declared key with an empty value counts as declared. The failure output SHALL name each missing key and the file that reads it.

#### Scenario: New env read without a template entry
- **WHEN** a file under `api/src` reads `process.env.NEW_KEY` and `api/.env.template` has no `NEW_KEY=` line
- **THEN** the env contract gate fails and lists `NEW_KEY` with the file that reads it

#### Scenario: Declared empty
- **WHEN** the template has `NEW_KEY=` with no value
- **THEN** the gate passes for that key

### Requirement: Verification clauses in task lists go through the runner
A task's verify clause SHALL name the runner (`pnpm verify` or `pnpm verify <gate>`) or an observable behaviour, never an underlying tool command such as `pnpm typecheck:api`.

#### Scenario: Task list written for an API change
- **WHEN** a tasks.md is created for a change that touches `api/`
- **THEN** its verify clauses reference `pnpm verify` or a named gate, and the last task of the change runs `pnpm verify` with no arguments

### Requirement: The rules carry the gate invariants
An always-loaded rule SHALL state: a gate that was not run is a gate that was not passed and must be reported as such; a gate is never made green by weakening it, disabling a rule, or adding an ignore entry for one's own change; new logic ships with its test in the same change and a bug fix ships with a regression test; nobody decides which gate applies by hand; a hook is never bypassed.

#### Scenario: Agent finishes work with a gate not run
- **WHEN** an agent reports work done and the runner listed a gate as not run
- **THEN** the report quotes the not-run list rather than implying the work is green

### Requirement: Known deviations from the rules are recorded in one place
The repository SHALL hold exactly one file for current defects where reality contradicts the rules. Every entry SHALL state the cause and the reason it is not fixed yet. No other rule or document SHALL describe a workaround as the procedure.

#### Scenario: Review meets a red gate with a recorded cause
- **WHEN** a gate is red for a reason already recorded in the known-defects file
- **THEN** the review reports it as pre-existing rather than as a finding against the change

#### Scenario: Unwritten tests
- **WHEN** a change lands with planned tests unwritten
- **THEN** the known-defects file carries an entry naming the change, the tasks, the cause and the reason

### Requirement: The runner and hooks are tested
The gate table, plan computation, tree fingerprint and hook decisions SHALL be pure functions covered by tests that run without executing any gate, and a change under `scripts/` SHALL plan that test gate.

#### Scenario: Gate table edited
- **WHEN** a file under `scripts/` changes
- **THEN** the plan includes the scripts test gate, and it fails if a path predicate no longer maps a sample path to its expected gate

#### Scenario: Hook decision edited
- **WHEN** the stop hook's decision function or the post-edit file routing changes
- **THEN** a test with sample inputs fails until the fixture is updated
