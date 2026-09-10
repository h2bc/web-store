## Purpose

Defines what one commit is, which branches are protected, how pushes are guarded, how a change is committed and pushed, how its pull request is opened, and how a merge happens.

## ADDED Requirements

### Requirement: A commit message is one line that says what changed
A commit subject SHALL be one line, start with a capital letter, be in the past tense, and describe one logical change. It SHALL NOT carry a conventional-commit prefix, a `Co-Authored-By` line, or any tool-attribution trailer. A body is present only when the change needs explaining and then says why.

#### Scenario: Commit skill writes the message
- **WHEN** the commit skill commits a fix to the region cookie fallback
- **THEN** the subject reads like `Fixed the region cookie fallback on the cart page` and the message has no trailer of any kind

#### Scenario: Two unrelated edits in the tree
- **WHEN** the working tree mixes a refactor and a bug fix
- **THEN** they become two commits, never one commit for both

### Requirement: Protected branches take no direct commits or pushes
`main` SHALL be protected on the remote: no direct pushes, no force pushes, changes arrive only through a pull request whose verify check passed. Locally, a push to `main` or a force push SHALL be refused by one git pre-push hook, for the agent and from a terminal alike, with the message naming the branch to push instead.

#### Scenario: Agent pushes to main
- **WHEN** the agent runs `git push origin main` or `git push --force`
- **THEN** the git hook refuses and no push happens

#### Scenario: Terminal push to main
- **WHEN** a developer runs `git push origin HEAD:main` in a shell
- **THEN** the same hook refuses, and the remote would reject it anyway

### Requirement: One command commits and pushes the session's work
The commit skill SHALL refuse while the tree has no green verify run, naming the gates to run. It SHALL create a work branch named from the active change when `main` is checked out, stage named paths only and name any change the session did not make before touching it, scan the staged diff for secrets and stop on a match, write the commit subject from the diff per the convention with any trailer stripped and show it before committing, commit, and push with an upstream on the first push. It SHALL report the commit.

#### Scenario: First commit from main
- **WHEN** the skill runs on `main` with a green run and an active change `add-thing`
- **THEN** it creates and switches to branch `add-thing`, commits with a conforming subject, and pushes with upstream

#### Scenario: Unverified tree
- **WHEN** the skill runs while `pnpm verify --status` is not green
- **THEN** it stops before staging and names the gates to run

#### Scenario: Parallel session left changes
- **WHEN** `git status` shows modified files the current session never edited
- **THEN** the skill lists them and asks whether to include or leave them

#### Scenario: Token in the diff
- **WHEN** the staged diff contains a string shaped like an API key or a connection string with a password
- **THEN** the skill stops, reports the file, and makes no commit

### Requirement: One command opens or refreshes the pull request
The PR skill SHALL refuse on `main` and on a branch with unpushed commits. When an open PR exists for the branch it SHALL refresh that PR's body and report its URL, never opening a second one. Otherwise it SHALL open the PR with the title from the argument or the latest commit subject and the body from the template filled from evidence. When the GitHub CLI is unavailable it SHALL print the browser link to create the PR and say what to install, never fake the call.

#### Scenario: First PR
- **WHEN** the skill runs on a pushed branch with no open PR
- **THEN** a PR opens whose body follows the template with every section filled or marked None

#### Scenario: PR already open
- **WHEN** the skill runs again after more commits on the same branch
- **THEN** it refreshes the PR body's verification section and reports the existing URL

#### Scenario: Unpushed commits
- **WHEN** local HEAD is ahead of the upstream branch
- **THEN** the skill refuses and points at the commit skill

### Requirement: A pull request describes how it was verified
A pull request body, written by the PR skill, SHALL follow the repository template: what and why, the changes, how to verify (the gates that ran with results, the gates that did not run, the page loaded or the statement that none was), the risk and its undo step, and the steps outside this repository with how each was verified, or None.

#### Scenario: Storefront change
- **WHEN** a PR touches `front/components/`
- **THEN** its body names the gates the runner reported and the page that was loaded to check the change

#### Scenario: Deploy-repo step
- **WHEN** a change needs an env var set in `h2bc/web-store-deploy`
- **THEN** the body lists it under Outside this repo with the observable result that confirms it

### Requirement: Merging happens only after the owner accepts, by squash, then cleans up
The merge skill SHALL run only after an explicit accept from the owner. It SHALL stop, fixing nothing, when the tree is dirty, HEAD differs from the remote, the PR is not this branch's, the verify check is red on HEAD, a review thread is unanswered, or the PR conflicts with `main`. It SHALL merge by squash, confirm the PR reads as merged, fast-forward local `main`, and only then delete the branch.

#### Scenario: No accept given
- **WHEN** the merge skill is invoked without an explicit accept from the owner
- **THEN** it refuses, whatever the state of the checks

#### Scenario: Merge confirmed
- **WHEN** the PR reads as merged
- **THEN** local `main` contains the squash commit, the local and remote branches are deleted, and the report names the merge commit
