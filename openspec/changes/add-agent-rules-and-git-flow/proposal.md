## Why

Everything an agent must know about this repo sits in one `CLAUDE.md` and in a `config.yaml` context block that only OpenSpec artifacts see, and the same architecture facts are written in both. There is no commit convention (the log has "worklfow fix", "udpated the spec", "WIP: seo support"), no branch or merge rule, nothing stops a push to `main`, and there is no PR body shape. The code-review action on pull requests reviews against generic practice because no rule tells it what breaks at runtime in this repo.

## What Changes

- Path-scoped rules in `.claude/rules/`: `api.md` loads when `api/` is touched, `front.md` when `front/` is touched, `git.md` always. Each area rule carries that area's invariants and the list of things that pass every check and break at runtime, so the built-in `/code-review` skill and the CI review action both check for them.
- The architecture narrative moves to `docs/architecture.md`; `CLAUDE.md` shrinks to layout, code style and pointers; the `config.yaml` context points at the architecture doc instead of restating it.
- Commit convention: one line, capital first letter, past tense, one logical change per commit, no conventional-commit prefixes, no `Co-Authored-By` or other tool trailer, never `--no-verify`, never force-push a shared branch. A git `commit-msg` hook refuses a message that breaks it.
- Branch model: `main` is protected, work happens on short-lived branches, PRs are squash-merged with the PR title as the commit subject, the branch is deleted after merge. **BREAKING** for current habit: no direct commits to `main`, and merges switch from merge commits to squash.
- A git `pre-push` hook: a `git push` to `main`, or any force push, is refused, from the agent or a terminal.
- Two delivery skills: `git-commit-push` runs the typechecks and the API tests and refuses when one fails, creates a work branch when on `main`, stages only this session's work, writes a conforming commit message from the diff, commits, merges `main` into the branch, re-runs the scripts on the merged tree and pushes; `git-open-pr` runs `/opsx:verify` on the active change, refuses on a CRITICAL finding, and opens the pull request with the template filled from the script results, the verify report and the change's artifacts, or refreshes the body of the one already open. Nothing in either step is done by hand.
- One skill, `git-merge-pr`: runs only after the owner's explicit accept, checks the PR is green and every thread answered, squash-merges, confirms, and cleans up.
- A PR template at `.github/pull_request_template.md` whose "How to verify" section names the scripts that ran, the scripts that did not, the `/opsx:verify` summary and the page loaded, plus an "Outside this repo" section for deploy-repo and dashboard steps.

Non-goals:

- No custom review skill and no custom agents; the code-review plugin already runs fresh-context reviewers locally and in CI.
- No handoff skill; Claude Code's own session continuity covers it.
- No change to the Claude GitHub Actions workflows.
- No ADRs; that is `add-spec-planning-gates`.
- No generated-file sync layer. This repo is Claude Code only, so rules and skills are written directly.
- No change to the checks themselves or to the `pre-commit` hook; they are `add-verification-gates`, already landed.
- No finalize-pr loop and no conflicts skill: the merge skill's guards plus another commit and PR refresh cover the loop, and conflict handling lives inside `git-commit-push`.
- No local `/code-review` in the chain; the CI review action reads every pull request.

## Flow after this change

Rows marked new are what this change adds; the rest exists after `add-verification-gates`.

| Step | What happens | Command or skill | Enforced by |
|---|---|---|---|
| Explore | Think through the idea with `docs/architecture.md` and the area rules in context (new) | `/opsx:explore` | none |
| Propose | Proposal, specs, design, tasks | `/opsx:propose` | none |
| Apply | Implement task by task with `api.md` or `front.md` invariants loaded (new); the last task runs the named scripts | `/opsx:apply` | post-edit hooks format and lint every edit inside an app |
| Commit and push | Typechecks and API tests, branch from `main`, selective staging, secret scan, conforming message, merge `main` in, push (new) | `/git-commit-push` (new) | `pre-commit` hook runs lint and the format check; `commit-msg` hook refuses a non-conforming message (new); `pre-push` hook blocks `main` and force pushes (new) |
| PR | `/opsx:verify` on the change, no CRITICAL; body from the template: scripts run, not run, verify summary, page loaded, outside-repo steps (new) | `/git-open-pr` (new) | CI `Check` job |
| Review | Existing review action, now checking the runtime failure lists in the rules (new) | `code-review` action, `/code-review` | CI check |
| Merge | After the owner's accept: squash, confirm, pull `main`, delete branch (new) | `/git-merge-pr` (new) | GitHub branch protection, squash only (new) |
| Archive | Specs merged | `/opsx:archive` | none |

## Open for planning

- None.

## Capabilities

### New Capabilities
- `git-workflow`: what a commit is, which branches are protected, how pushes are guarded, how a change is committed and pushed, how its pull request is opened, and how a merge happens.
- `agent-guidance`: which instructions an agent has in context when working on which part of the repo, what a review checks, and where architecture facts live.

### Modified Capabilities
- none.

## Impact

- `.claude/rules/api.md`, `front.md`, `git.md`; this change creates the directory.
- `.claude/skills/git-commit-push/SKILL.md`, `.claude/skills/git-open-pr/SKILL.md` and `.claude/skills/git-merge-pr/SKILL.md`. The generated `openspec-*` skills and `opsx` commands are not edited.
- `.githooks/commit-msg` and `.githooks/pre-push`, beside the existing `pre-commit`; `core.hooksPath` already points there.
- `docs/architecture.md` new; `CLAUDE.md` and `openspec/config.yaml` context rewritten.
- `.github/pull_request_template.md` new; `.gitignore` gains `.tmp/` for the skills' scratch files.
- GitHub repository settings: branch protection on `main`, squash-only merges with the PR title as the message, delete branch on merge. Manual, outside the repo files.
- Depends on `add-verification-gates`: the named scripts, `.githooks/pre-commit` with `core.hooksPath`, and `.claude/settings.json` come from it.
