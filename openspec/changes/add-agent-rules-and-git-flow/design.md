## Context

See proposal.md for motivation. Claude Code loads `.claude/rules/*.md` recursively; a rule with `paths:` globs in its frontmatter loads when a matching file is read or edited, an unscoped rule loads always. The built-in `/code-review` skill and the `code-review` plugin used by `.github/workflows/claude-code-review.yml` both run with the repository's `CLAUDE.md` and rules in context, so a failure list in a rule reaches both. The remote is GitHub (`h2bc/web-store`), `gh` is available in the devcontainer but needs a one-time `gh auth login`, and history shows merge commits from the GitHub UI with no branch protection. `add-verification-gates` has landed: root scripts `lint`, `format`, `typecheck:api`, `typecheck:front`, `test:api`, `test:e2e`; `.githooks/pre-commit` running `pnpm lint && pnpm format`, wired by the `prepare` script setting `core.hooksPath`; `.claude/settings.json` with post-edit format and lint hooks; a CI job named `Check` with Format, Lint, Typecheck and Tests steps. There is no `scripts/` directory, no `.claude/rules/` directory and no `.tmp/` yet. The Adventures.is skills this change was to port are not reachable from this repo, so the three skills are written from the `git-workflow` spec.

## Goals / Non-Goals

**Goals:**
- An agent editing `api/` or `front/` has that area's invariants and failure list in context and nothing else's.
- One home per fact: rules for invariants, `docs/architecture.md` for the system, `CLAUDE.md` for layout and style.
- The commit convention, pushes to `main` and force pushes are enforced locally by git hooks, for the agent and a shell alike.
- Delivery is two commands, one for the commit and push and one for the pull request with its body; merging stays a third because it waits on the owner's accept. The commit command is the only one that writes to git; the PR command reads.

**Non-Goals:**
- Custom agents or a custom review skill.
- Rewriting the existing Claude GitHub Actions.
- A gate runner or status file; the named scripts are the checks.

## Decisions

**Ownership table for instruction content.**

| Content | Home |
|---|---|
| Repo layout, package conventions, code style | `CLAUDE.md` |
| How the system works (apps, data layer, caching, session, checkout, optional services, worker mode, deploy repo) | `docs/architecture.md` |
| Invariants and runtime failure list for `api/` | `.claude/rules/api.md` (`paths: api/**`) |
| Invariants and runtime failure list for `front/` | `.claude/rules/front.md` (`paths: front/**`) |
| Commit conventions, branch model, what the hooks refuse, which skill does what | `.claude/rules/git.md` (always) |
| Which scripts are the checks and when the last task runs them | `openspec/config.yaml` `rules.tasks` and `README.md`, from `add-verification-gates` |
| OpenSpec artifact rules and a pointer to the architecture doc | `openspec/config.yaml` |

Alternative: keep one large `CLAUDE.md`. Rejected: everything loads for every task, and the architecture text is already duplicated in `config.yaml`.

**Review is the existing plugin, fed by rules.** The runtime failure lists live in `api.md` and `front.md`. The CI action on the PR reads them when it opens the changed files, and `/code-review` does the same when run by hand; neither delivery skill runs it, unlike the Adventures.is commit skill, because every PR gets the CI review anyway. Alternative: a custom `dev-review-changes` skill or a custom reviewer agent. Rejected: the plugin already spawns fresh-context reviewers; a second reviewer with the same inputs adds nothing. If task 4.1 shows the CI reviewers do not load path-scoped rules, the fallback is to name the two rule files in the action's `prompt`, which the non-goal on rewriting the workflows allows as a one-line edit.

**Two kinds of verification, at two steps.** The scripts prove the code runs; `/opsx:verify` proves the change is done. The commit skill runs `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` before staging and refuses on the first failure; `pnpm lint` and `pnpm format` are already the `pre-commit` hook's, and `pnpm test:e2e` is CI's because it needs a seeded backend. The PR skill runs `/opsx:verify` on the active change, which marks every unticked task and unimplemented requirement CRITICAL, so it only makes sense once the change claims done; a CRITICAL refuses to open the PR, and the report summary goes into How to verify. Alternative: run `/opsx:verify` at commit time. Rejected: a mid-change checkpoint is always incomplete, so it would refuse every checkpoint. Alternative: leave typecheck and tests to CI. Rejected: the first proof would arrive after the push, when a broken commit is already history.

**Convention enforced by a `commit-msg` hook.** `.githooks/commit-msg` reads the message file and exits 1 naming the line when the subject starts with a lowercase letter or a `word:` prefix, or when any line starts with `Co-Authored-By`, `Claude-Session` or `Signed-off-by`. Merge commits (`Merge ` subjects) pass so `git-commit-push` can integrate the remote. Alternative: the rule text alone. Rejected: the harness appends its own attribution trailer by default, and only a hook holds the line deterministically.

**Push guard as one shell hook.** `.githooks/pre-push` reads the refspecs git passes on stdin and refuses when a remote ref is `refs/heads/main`, or when the remote sha is non-zero and not an ancestor of the local sha, which is what a force push looks like from inside the hook. It fires for the agent's `git push` and a terminal's alike, so no `PreToolUse` hook duplicates it. Alternative: a JavaScript decision function with unit tests. Rejected: there is no `scripts/` directory or root test harness, and a ten-line `sh` script is verified by pushing. Alternative: rely on GitHub branch protection alone. Rejected: it does not cover a machine without protection configured yet, and the local refusal explains itself.

**Squash merges, main protected, squash message is the title.** Protection: require a pull request, require the `Check` status check, block force pushes, delete head branches on merge. Repository merge settings: squash only, squash commit title from the PR title, squash commit body blank; otherwise GitHub concatenates every commit body and adds its own `Co-authored-by` trailers, which the convention forbids. Applied through `gh api` after this change's own PR merges. Alternative: keep merge commits. Rejected: `main` would keep carrying "WIP" and typo commits inside merges.

**`main` is merged in at commit time.** After the commit, `git-commit-push` fetches, merges `origin/main` into the branch, re-runs the three scripts when the merge brought anything in, and pushes. One skill owns every git write, `git-open-pr` stays read-only so its "HEAD equals upstream" guard keeps its meaning, conflicts surface at each checkpoint while small, and the scripts run on the tree CI will test. The merge commits stay inside the branch and vanish at squash; their `Merge ` subjects pass the `commit-msg` hook. A conflict is resolved inside the skill by reading `:1:`, `:2:` and `:3:` of each file and keeping both intents, never wholesale with `--ours` or `--theirs`; an unclear other side stops the skill and asks. Alternative: merge `main` in `git-open-pr`. Rejected: the PR skill would then commit and push, and Adventures.is keeps it read-only for the same reason. Alternative: a separate `git-resolve-conflicts` skill, as in Adventures.is. Rejected: three rules of conduct do not need their own skill.

**Three delivery skills, written from the spec; the reference has five.** Adventures.is chains `git-commit-push`, `git-open-pr`, `git-finalize-pr`, `git-merge-pr` and `git-resolve-conflicts`. Here `git-commit-push`: run the three scripts and refuse on the first failure, naming it; when on `main`, create a branch named from the active change or from the argument; list working-tree changes and name any the session did not make before staging the rest by path; scan the staged diff for secrets; write the subject from the diff per `git.md`, strip any trailer, show it, let the argument override; commit; merge `origin/main` in as above; push with `-u` on the first push, never force. `git-open-pr`: check `gh auth status`; refuse on `main` and on unpushed commits; run `/opsx:verify` and refuse on CRITICAL; when `gh pr list --head` shows an open PR, refresh its body with `gh pr edit --body-file` and report its URL; otherwise fill the template (how to verify from the scripts the session ran and their results, the scripts not run, the verify summary, outside-repo steps from the change's `## Outside this repo` group, page loaded from the apply report), strip guidance comments, write the body to `.tmp/pr-body.md`, `gh pr create --body-file`. Both print the browser link and say what to install or run when `gh` is absent or logged out. `git-finalize-pr` is not ported: `git-merge-pr` already refuses on a red `Check` or an unanswered thread and names the fix, and the fix is another `git-commit-push` and a `git-open-pr` refresh. Alternative: the official `commit-commands` plugin. Rejected: it does not know the scripts, the PR template or the change artifacts, and whether it adds a trailer is undocumented. Alternative: one combined skill. Rejected by the developer in favour of a commit-only step for mid-change checkpoints.

**`git-merge-pr` stays a skill.** "Only after the owner accepts" is a judgement about the conversation, not about the tree, so no hook can hold it. It uses `gh pr merge --squash --delete-branch`, `gh pr view --json state`, and the guards from the spec.

**No attribution trailer.** The repository rule wins over the harness default that appends `Co-Authored-By` and `Claude-Session`. Recorded here because the two disagree; the `commit-msg` hook is what makes the rule hold.

**PR template at GitHub's native path.** `.github/pull_request_template.md` with What and why, Changes, How to verify, Risk, Outside this repo.

**Config context becomes a pointer.** `openspec/config.yaml` `context` keeps the one-paragraph brand identity and says to read `docs/architecture.md` before writing an artifact. `rules.tasks` is untouched.

## Risks / Trade-offs

- [A path-scoped rule never loads because the file was changed through a shell command] → `git.md` is always-on; `api.md` and `front.md` carry only what `docs/architecture.md` also says.
- [Branch protection blocks the PR that introduces it] → Apply the setting after that PR merges, as the last task.
- [`gh` missing or logged out on a machine] → The PR and merge skills print the browser link and say what to install or run; they never claim a call ran.
- [`git-commit-push` writes a subject that misdescribes the diff] → The subject is shown before the commit, and the argument overrides it.
- [The API tests take minutes on every commit] → That is the price of a green commit; CI would catch the same failure later and cost a round trip.
- [`/opsx:verify` refuses a PR for a change that is intentionally partial] → Tick or drop the tasks first; the refusal lists exactly which ones, and a PR is the unit that claims the change is done.
- [The `commit-msg` hook refuses a legitimate message] → The refusal names the offending line; `--no-verify` stays forbidden by `git.md`, so the fix is the message.

## Migration Plan

1. Land rules, the two git hooks, the three skills, docs and template in one PR, committed and opened through the two delivery skills themselves. This branch also carries `add-verification-gates`, whose last task is to open the PR and see the `Check` job green, so that PR is this one.
2. Apply branch protection and the squash settings after that PR merges.

Rollback: delete the rule files, the two git hooks and the skills; `CLAUDE.md` and `openspec/config.yaml` can be restored from git.

## Open questions

None.

## Answered questions

- Should the checks be a runner with a status file, as first planned? No: `add-verification-gates` landed as named scripts and a `pre-commit` hook, and this change builds on that as is.
- Should the push guard have unit tests? No: a shell hook is verified by pushing; there is no root test harness to hold them.
- Should the convention be enforced by a hook? Yes: the harness default appends a trailer, so the rule text alone would be broken on the first commit.
- Where is `main` merged into the branch? In `git-commit-push`, after the commit, so the PR skill never writes to git and conflicts show up at every checkpoint.
- Which verify runs where? The typechecks and API tests at commit time; `/opsx:verify` at PR time, refusing on CRITICAL.
- Which Adventures.is git skills are ported? Commit-push, open-pr and merge-pr. Finalize-pr and resolve-conflicts are folded into the merge guards and the commit skill.
