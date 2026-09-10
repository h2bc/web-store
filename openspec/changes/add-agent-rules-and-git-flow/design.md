## Context

See proposal.md for motivation. Claude Code loads `.claude/rules/*.md` recursively; a rule with `paths:` globs in its frontmatter loads when a matching file is read or edited, an unscoped rule loads always. The built-in `/code-review` skill and the `code-review` plugin used by `.github/workflows/claude-code-review.yml` both run with the repository's `CLAUDE.md` and rules in context, so a failure list in a rule reaches both. The remote is GitHub (`h2bc/web-store`), `gh` is available in the devcontainer, and history shows merge commits from the GitHub UI with no branch protection. `add-verification-gates` creates `.githooks/` with `core.hooksPath`, `scripts/`, `.claude/settings.json`, and `.claude/rules/` with the gates and known-defects rules. The official plugin marketplace has `commit-commands` (commit, push, PR creation); whether it adds an attribution trailer is not documented.

## Goals / Non-Goals

**Goals:**
- An agent editing `api/` or `front/` has that area's invariants and failure list in context and nothing else's.
- One home per fact: rules for invariants, `docs/architecture.md` for the system, `CLAUDE.md` for layout and style.
- Pushes to `main` and force pushes are refused locally, from the agent or a shell, by one hook.
- Delivery is two commands, one for the commit and push and one for the pull request with its body; merging stays a third because it waits on the owner's accept.

**Non-Goals:**
- Custom agents or a custom review skill.
- Rewriting the existing Claude GitHub Actions.

## Decisions

**Ownership table for instruction content.**

| Content | Home |
|---|---|
| Repo layout, package conventions, code style | `CLAUDE.md` |
| How the system works (apps, data layer, caching, session, checkout, optional services, worker mode, deploy repo) | `docs/architecture.md` |
| Invariants and runtime failure list for `api/` | `.claude/rules/api.md` (`paths: api/**`) |
| Invariants and runtime failure list for `front/` | `.claude/rules/front.md` (`paths: front/**`) |
| Commit conventions, branch model, what the push guard blocks | `.claude/rules/git.md` (always) |
| Gate invariants, known defects | from `add-verification-gates` (always) |
| OpenSpec artifact rules and a pointer to the architecture doc | `openspec/config.yaml` |

Alternative: keep one large `CLAUDE.md`. Rejected: everything loads for every task, and the architecture text is already duplicated in `config.yaml`.

**Review is the existing plugin, fed by rules.** The runtime failure lists live in `api.md` and `front.md`. `/code-review` before a push and the CI action on the PR both read them when they open the changed files. Alternative: a custom `dev-review-changes` skill or a custom reviewer agent. Rejected: the plugin already spawns fresh-context reviewers; a second reviewer with the same inputs adds nothing.

**Push guard as one git hook.** `.githooks/pre-push` reads the refspecs git passes on stdin and refuses when a remote ref is `refs/heads/main` or the push is forced; the decision is `isPushToProtected(refspecs, forced)` in `scripts/verify-lib.mjs` with tests. It fires for the agent's `git push` and a terminal's alike, so no `PreToolUse` hook duplicates it. Alternative: rely on GitHub branch protection alone. Rejected: it does not cover a machine without protection configured yet, and the local refusal explains itself.

**Squash merges, main protected.** With one-line commits the PR title becomes the one commit on `main`. Protection: require a pull request, require the `verify` status check, block force pushes, delete head branches on merge. Applied through `gh api` after this change's own PR merges. Alternative: keep merge commits. Rejected: `main` would keep carrying "WIP" and typo commits inside merges.

**Two delivery skills, ported from Adventures.is with `gh` in place of `az`.** `git-commit-push`: refuse when `pnpm verify --status` is not green (the hook would block anyway; refusing first keeps the message about the cause); when on `main`, create a branch named from the active change or from the argument; list working-tree changes and name any the session did not make before staging the rest by path; scan the staged diff for secrets; write the subject from the diff per `git.md`, strip any trailer, show it, let the argument override; commit; push with `-u` on the first push, integrating by merge and re-running the runner if the remote moved. `git-open-pr`: refuse on `main`, on unpushed commits, and when `gh pr list --head` shows an open PR, reporting its URL and refreshing its body with `gh pr edit --body-file` instead; otherwise fill the template (how to verify from the runner's last `PASSED` line and not-run list, outside-repo steps from the change's `## Outside this repo` group, page loaded from the apply report), strip guidance comments, `gh pr create --body-file`. Both print the browser link and say what to install when `gh` is absent. Alternative: the official `commit-commands` plugin. Rejected: it does not know the runner's output, the PR template or the change artifacts, and whether it adds a trailer is undocumented. Alternative: one combined skill. Rejected by the developer in favour of the Adventures.is split, which keeps a commit-only step for mid-change checkpoints.

**`git-merge-pr` stays a skill.** "Only after the owner accepts" is a judgement about the conversation, not about the tree, so no hook can hold it. Ported from Adventures.is with `gh pr merge --squash --delete-branch`, `gh pr view --json state`, and the guards from the spec.

**No attribution trailer.** The repository rule wins over the harness default that appends `Co-Authored-By`. Recorded here because the two disagree.

**PR template at GitHub's native path.** `.github/pull_request_template.md` with What and why, Changes, How to verify, Risk, Outside this repo.

**Config context becomes a pointer.** `openspec/config.yaml` `context` keeps the one-paragraph brand identity and says to read `docs/architecture.md` before writing an artifact.

## Risks / Trade-offs

- [A path-scoped rule never loads because the file was changed through a shell command] → `git.md` and the gate rules are always-on; `api.md` and `front.md` carry only what `docs/architecture.md` also says.
- [Branch protection blocks the PR that introduces it] → Apply the setting after that PR merges, as the last task.
- [`gh` missing on a machine] → The merge skill prints the browser link and says what to install; it never claims a call ran.
- [`git-commit-push` writes a subject that misdescribes the diff] → The subject is shown before the commit, and the argument overrides it.

## Migration Plan

1. Land rules, the push hook, the three skills, docs and template in one PR, committed and opened through the two delivery skills themselves.
2. Apply branch protection and squash-only merges after that PR merges.

Rollback: delete the rule files, the git hook and the skills; `CLAUDE.md` can be restored from git.

## Open questions

None.

## Answered questions

None.
