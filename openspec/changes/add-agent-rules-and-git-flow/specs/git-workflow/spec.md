## Purpose

Defines what one commit is, which branches are protected, how pushes are guarded, how a change is committed and pushed, how its pull request is opened, and how a merge happens.

## ADDED Requirements

### Requirement: A commit message is one line that says what changed
A commit subject SHALL be one line, start with a capital letter, be in the past tense, and describe one logical change. It SHALL NOT carry a conventional-commit prefix, a `Co-Authored-By` line, or any tool-attribution trailer. A body is present only when the change needs explaining and then says why. A git `commit-msg` hook SHALL refuse a message whose subject starts with a lowercase letter or a `type:` prefix, or that carries a `Co-Authored-By`, `Claude-Session` or `Signed-off-by` line, for the agent and from a terminal alike.

#### Scenario: Commit skill writes the message
- **WHEN** the commit skill commits a fix to the region cookie fallback
- **THEN** the subject reads like `Fixed the region cookie fallback on the cart page` and the message has no trailer of any kind

#### Scenario: Two unrelated edits in the tree
- **WHEN** the working tree mixes a refactor and a bug fix
- **THEN** they become two commits, never one commit for both

#### Scenario: Message with a trailer
- **WHEN** a commit is attempted with a message ending in a `Co-Authored-By` line
- **THEN** the `commit-msg` hook refuses, names the line, and no commit is created

### Requirement: Protected branches take no direct commits or pushes
`main` SHALL be protected on the remote: no direct pushes, no force pushes, changes arrive only through a pull request whose `Check` job passed. Locally, a push to `main` or a force push SHALL be refused by one git pre-push hook, for the agent and from a terminal alike, with the message naming the branch to push instead.

#### Scenario: Agent pushes to main
- **WHEN** the agent runs `git push origin main` or `git push --force`
- **THEN** the git hook refuses and no push happens

#### Scenario: Terminal push to main
- **WHEN** a developer runs `git push origin HEAD:main` in a shell
- **THEN** the same hook refuses, and the remote would reject it anyway

### Requirement: One command commits and pushes the session's work
The commit skill SHALL run `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` and refuse while one fails, naming the failing script; lint and the format check are the `pre-commit` hook's. It SHALL create a work branch named from the active change when `main` is checked out, stage named paths only and name any change the session did not make before touching it, scan the staged diff for secrets and stop on a match, write the commit subject from the diff per the convention with any trailer stripped and show it before committing, and commit. After the commit it SHALL fetch and merge `origin/main` into the branch, re-run the three scripts on the merged tree when the merge brought anything in, and push with an upstream on the first push. A merge conflict SHALL be resolved by reading both sides and the common ancestor and keeping both intents, never by `--ours` or `--theirs`; when the other side's intent is unclear the skill SHALL stop and ask. It SHALL report the commit.

#### Scenario: First commit from main
- **WHEN** the skill runs on `main` with a green run and an active change `add-thing`
- **THEN** it creates and switches to branch `add-thing`, commits with a conforming subject, and pushes with upstream

#### Scenario: A check fails
- **WHEN** the skill runs while `pnpm typecheck:front` reports an error
- **THEN** it stops before staging and names the script that failed

#### Scenario: Main moved
- **WHEN** `origin/main` has commits the branch does not
- **THEN** after committing, the skill merges them in, re-runs the three scripts on the merged tree, and pushes only when they pass

#### Scenario: Conflict with main
- **WHEN** the merge from `origin/main` conflicts in a file
- **THEN** the skill resolves it keeping both sides' changes, or stops and asks when the other side's intent is unclear, and never resolves wholesale with `--ours` or `--theirs`

#### Scenario: Parallel session left changes
- **WHEN** `git status` shows modified files the current session never edited
- **THEN** the skill lists them and asks whether to include or leave them

#### Scenario: Token in the diff
- **WHEN** the staged diff contains a string shaped like an API key or a connection string with a password
- **THEN** the skill stops, reports the file, and makes no commit

### Requirement: One command opens or refreshes the pull request
The PR skill SHALL refuse on `main` and on a branch with unpushed commits. It SHALL run `/opsx:verify` on the active change and refuse while the report carries a CRITICAL finding, listing them. When an open PR exists for the branch it SHALL refresh that PR's body and report its URL, never opening a second one. Otherwise it SHALL open the PR with the title from the argument or the latest commit subject and the body from the template filled from evidence. When the GitHub CLI is unavailable it SHALL print the browser link to create the PR and say what to install, never fake the call.

#### Scenario: First PR
- **WHEN** the skill runs on a pushed branch with no open PR
- **THEN** a PR opens whose body follows the template with every section filled or marked None

#### Scenario: PR already open
- **WHEN** the skill runs again after more commits on the same branch
- **THEN** it refreshes the PR body's verification section and reports the existing URL

#### Scenario: Unpushed commits
- **WHEN** local HEAD is ahead of the upstream branch
- **THEN** the skill refuses and points at the commit skill

#### Scenario: Change incomplete
- **WHEN** `/opsx:verify` reports an unticked task or an unimplemented requirement
- **THEN** the skill refuses to open or refresh the PR and lists the CRITICAL findings

### Requirement: A pull request describes how it was verified
A pull request body, written by the PR skill, SHALL follow the repository template: what and why, the changes, how to verify (the scripts that ran with results, the scripts that did not run, the `/opsx:verify` summary, the page loaded or the statement that none was), the risk and its undo step, and the steps outside this repository with how each was verified, or None.

#### Scenario: Storefront change
- **WHEN** a PR touches `front/components/`
- **THEN** its body names the scripts that ran, the verify summary, and the page that was loaded to check the change

#### Scenario: Deploy-repo step
- **WHEN** a change needs an env var set in `h2bc/web-store-deploy`
- **THEN** the body lists it under Outside this repo with the observable result that confirms it

### Requirement: Merging happens only after the owner accepts, by squash, then cleans up
The merge skill SHALL run only after an explicit accept from the owner. It SHALL stop, fixing nothing, when the tree is dirty, HEAD differs from the remote, the PR is not this branch's, the `Check` job is red on HEAD, a review thread is unanswered, or the PR conflicts with `main`. It SHALL merge by squash so that `main` gains one commit whose subject is the PR title and whose body is empty, confirm the PR reads as merged, fast-forward local `main`, and only then delete the branch.

#### Scenario: No accept given
- **WHEN** the merge skill is invoked without an explicit accept from the owner
- **THEN** it refuses, whatever the state of the checks

#### Scenario: Merge confirmed
- **WHEN** the PR reads as merged
- **THEN** local `main` contains one new commit titled as the PR with no body and no trailer, the local and remote branches are deleted, and the report names that commit
