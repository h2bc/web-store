## Requirements coverage

| Requirement | Delivered by |
|---|---|
| A commit message is one line that says what changed | 1.3, 3.1 |
| One command commits and pushes the session's work | 3.1 |
| One command opens or refreshes the pull request | 3.2 |
| Protected branches take no direct commits or pushes | 2.1, 5.1 |
| A pull request describes how it was verified | 3.2, 3.3 |
| Merging happens only after the owner accepts, by squash, then cleans up | 3.4, 5.1 |
| Rules are path-scoped and load with the files they govern | 1.2, 1.3 |
| Each area rule carries its runtime failure list | 1.2, 4.1 |
| Architecture facts have one home | 1.1, 1.4 |
| Customizations never live in generated files | 1.4, 4.2 |

## 1. Rules and documentation

- [ ] 1.1 Create `docs/architecture.md` as final state with no history: the two apps and how they are run, Medusa extension points and the admin-owned configuration, optional services switched by env and worker mode, the storefront's server-only data layer contract (`{ data, error }`, never throws), cache tags and invalidation, session in httpOnly cookies, guest-only checkout, the deploy repository and what it owns; every claim checked against a file in the tree (`front/lib/data/products.ts`, `front/lib/cache.ts`, `front/lib/cookies.ts`, `api/medusa-config.ts`); verify each section cites at least one path and the file mentions no planned or past state
- [ ] 1.2 Create `.claude/rules/api.md` with `paths: ["api/**"]` and `.claude/rules/front.md` with `paths: ["front/**"]`, each with that area's invariants, its runtime failure list from the `agent-guidance` spec, and a pointer to `docs/architecture.md`; verify both files are under 60 lines and their frontmatter parses as a `paths` list
- [ ] 1.3 Create `.claude/rules/git.md` with no `paths` frontmatter: the commit convention (one line, capital, past tense, one logical change, no prefixes, no trailers, never `--no-verify`, never force-push a shared branch), the branch model (`main` protected, short-lived branches, squash merge, delete after merge), what the push guard blocks, that commits go through `git-commit-push`, PRs through `git-open-pr` and merging through `git-merge-pr` after the owner's accept; verify the file is under 60 lines
- [ ] 1.4 Rewrite `CLAUDE.md` to layout, package conventions, code style and pointers to `docs/architecture.md` and `.claude/rules/`; rewrite the `context` block in `openspec/config.yaml` to the brand paragraph plus the instruction to read `docs/architecture.md` before writing an artifact; verify `openspec instructions proposal --change add-agent-rules-and-git-flow --json` shows the pointer and `grep -rl 'never throws' CLAUDE.md openspec/config.yaml docs/architecture.md .claude/rules` lists only the architecture doc and `front.md`

## 2. Push guard

- [ ] 2.1 Add `isPushToProtected(refspecs, forced)` to `scripts/verify-lib.mjs` (true when any remote ref is `refs/heads/main` or `forced` is set; false for a feature branch push) with tests, and create `.githooks/pre-push` (`#!/bin/sh`) that passes git's stdin refspecs and the force detection (a non-fast-forward local ref, or `GIT_PUSH_OPTION_*` carrying force) to it and exits 1 with the reason on a match; verify `pnpm verify scripts-test` passes, `git push origin HEAD:main` from a scratch branch is refused both in a shell and from the agent's Bash tool, and a normal branch push goes through

## 3. Commit, PR and merge

- [ ] 3.1 Create `.claude/skills/git-commit-push/SKILL.md` with `argument-hint: "[commit subject or branch name]"`: refuse when `pnpm verify --status` is not green, naming the gates; on `main`, create and switch to a branch named from the active OpenSpec change or the argument; list `git status --porcelain`, name changes the session did not make and ask before staging; stage by path, never `-A`; scan the staged diff for key-like strings and connection strings with passwords and stop on a match; write the subject from the diff per `git.md`, strip any trailer, show it, let the argument override; commit; push with `-u origin <branch>` on the first push, merge the remote in and re-run `pnpm verify` if it moved, never force; verify by committing this change with it from `main`: a branch is created, `git log -1 --format=%B` shows a conforming subject with no trailer, and `git status` reports the branch up to date with origin
- [ ] 3.2 Create `.claude/skills/git-open-pr/SKILL.md` with `argument-hint: "[title override]"`: check `gh auth status` and degrade to the browser link when absent; refuse on `main` and when `git rev-parse HEAD` differs from `@{u}`; `gh pr list --head <branch> --json url,number`; if one exists, refresh its body with `gh pr edit --body-file` and report the URL; otherwise fill `.github/pull_request_template.md` from evidence (runner `PASSED` and not-run lines, the change's `## Outside this repo` group, page loaded or none), strip guidance comments, `gh pr create --title <subject> --body-file .tmp/pr-body.md`; verify by opening this change's PR with it: every template section filled or None, and a second run after another commit updates the same PR and returns its URL
- [ ] 3.3 Create `.github/pull_request_template.md` with What and why, Changes, How to verify (gates run with results, gates not run, page loaded or none), Risk (level, what breaks, the undo step), Outside this repo (deploy repo env, Resend, admin, each with how it was verified, or None); verify this change's PR, opened by `git-open-pr`, shows every section filled or marked None
- [ ] 3.4 Create `.claude/skills/git-merge-pr/SKILL.md`: explicit owner accept required; stop fixing nothing on dirty tree, HEAD not equal to upstream, foreign PR, red `verify` check on HEAD, unanswered thread, conflict; `gh pr merge --squash --delete-branch`; confirm with `gh pr view --json state`; fast-forward local `main`; delete the local branch last; degrade to the browser link when `gh` is absent; verify invoking it without an accept refuses, and with an accept on this change's PR it merges and reports the squash commit

## 4. Verification

- [ ] 4.1 Run `/code-review` on this branch and confirm its report cites `front.md` or `api.md` for at least one finding or states none of the listed failures were found; verify the report names the rule files
- [ ] 4.2 Run `pnpm verify` on the final tree and confirm `git status --porcelain .claude/commands .claude/skills/openspec-*` prints nothing; verify green and empty

## 5. Outside this repo

- [ ] 5.1 After this change's PR merges, on GitHub `h2bc/web-store`: protect `main` (require a pull request, require the `verify` status check, block force pushes), allow squash merges only, and delete head branches on merge, through `gh api` or the repository settings page; verify `gh api repos/h2bc/web-store/branches/main/protection` shows the required check and `gh repo view h2bc/web-store --json squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,deleteBranchOnMerge` prints true, false, false, true

## Review findings

None.
