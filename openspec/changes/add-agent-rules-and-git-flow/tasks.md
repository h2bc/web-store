## Requirements coverage

| Requirement | Delivered by |
|---|---|
| A commit message is one line that says what changed | 1.3, 2.1, 3.1 |
| One command commits and pushes the session's work | 3.1 |
| One command opens or refreshes the pull request | 3.2 |
| Protected branches take no direct commits or pushes | 2.2, 5.1 |
| A pull request describes how it was verified | 3.2, 3.3 |
| Merging happens only after the owner accepts, by squash, then cleans up | 3.4, 5.1 |
| Rules are path-scoped and load with the files they govern | 1.2, 1.3 |
| Each area rule carries its runtime failure list | 1.2, 4.1 |
| Architecture facts have one home | 1.1, 1.4 |
| Customizations never live in generated files | 1.4, 4.2 |

## 1. Rules and documentation

- [ ] 1.1 Create `docs/architecture.md` as final state with no history: the two apps and how they are run, Medusa extension points and the admin-owned configuration, optional services switched by env and worker mode, the storefront's server-only data layer contract (`{ data, error }`, never throws), cache tags and invalidation, session in httpOnly cookies, guest-only checkout, the deploy repository and what it owns; every claim checked against a file in the tree (`front/lib/data/products.ts`, `front/lib/cache.ts`, `front/lib/cookies.ts`, `api/medusa-config.ts`); verify each section cites at least one path and the file mentions no planned or past state
- [ ] 1.2 Create `.claude/rules/api.md` with `paths: ["api/**"]` and `.claude/rules/front.md` with `paths: ["front/**"]`, each with that area's invariants, its runtime failure list from the `agent-guidance` spec, and a pointer to `docs/architecture.md`; verify both files are under 60 lines and their frontmatter parses as a `paths` list
- [ ] 1.3 Create `.claude/rules/git.md` with no `paths` frontmatter: the commit convention (one line, capital, past tense, one logical change, no prefixes, no trailers, never `--no-verify`, never force-push a shared branch), the branch model (`main` protected, short-lived branches, squash merge titled as the PR, delete after merge), what the `commit-msg` and `pre-push` hooks refuse, that commits go through `git-commit-push`, PRs through `git-open-pr` and merging through `git-merge-pr` after the owner's accept; verify the file is under 60 lines
- [ ] 1.4 Rewrite `CLAUDE.md` to layout, package conventions, code style and pointers to `docs/architecture.md` and `.claude/rules/`; rewrite the `context` block in `openspec/config.yaml` to the brand paragraph plus the instruction to read `docs/architecture.md` before writing an artifact, leaving `rules` untouched; verify `openspec instructions proposal --change add-agent-rules-and-git-flow --json` shows the pointer and `grep -rl 'never throws' CLAUDE.md openspec/config.yaml docs/architecture.md .claude/rules` lists only the architecture doc and `front.md`

## 2. Git hooks

- [ ] 2.1 Create `.githooks/commit-msg` (`#!/bin/sh`, executable) that reads `$1` and exits 1 naming the offending line when the subject starts with a lowercase letter or matches `^[a-z]+(\([^)]*\))?!?:`, or when any line starts with `Co-Authored-By`, `Claude-Session` or `Signed-off-by`, letting subjects that start with `Merge ` through; verify `git commit --allow-empty -m 'feat: x'`, `-m 'lowercase subject'` and a message ending in a `Co-Authored-By` line are each refused with the line named, and `-m 'Added the commit hook'` is accepted, then reset the test commit
- [ ] 2.2 Create `.githooks/pre-push` (`#!/bin/sh`, executable) that reads the `local_ref local_sha remote_ref remote_sha` lines git passes on stdin and exits 1 with the reason when a `remote_ref` is `refs/heads/main` (naming the branch to push instead) or when `remote_sha` is non-zero and `git merge-base --is-ancestor remote_sha local_sha` fails; verify `git push origin HEAD:main` from this branch is refused both in a shell and from the agent's Bash tool, a push of an amended commit to a scratch branch is refused, and a normal branch push goes through

## 3. Commit, PR and merge

- [ ] 3.1 Create `.claude/skills/git-commit-push/SKILL.md` with `argument-hint: "[commit subject or branch name]"`: run `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` and refuse on the first failure, naming the script; on `main`, create and switch to a branch named from the active OpenSpec change or the argument; list `git status --porcelain`, name changes the session did not make and ask before staging; stage by path, never `-A`; scan the staged diff for key-like strings and connection strings with passwords and stop on a match; write the subject from the diff per `git.md`, strip any trailer, show it, let the argument override; commit; `git fetch origin` and `git merge origin/main`, on a conflict read `:1:`, `:2:`, `:3:` of each file and keep both intents or stop and ask, never `--ours`/`--theirs`, re-run the three scripts when the merge brought commits in; push with `-u origin <branch>` on the first push, never force; verify by committing this change with it: `git log -1 --format=%B` shows a conforming subject with no trailer, `git merge-base --is-ancestor origin/main HEAD` succeeds and `git status` reports the branch up to date with origin, and on a scratch checkout of `main` with one edited file it creates the branch before committing
- [ ] 3.2 Add `.tmp/` to `.gitignore` and create `.claude/skills/git-open-pr/SKILL.md` with `argument-hint: "[title override]"`: check `gh auth status` and degrade to the browser link, saying to run `gh auth login`, when absent or logged out; refuse on `main` and when `git rev-parse HEAD` differs from `@{u}`; run `/opsx:verify` on the active change and refuse while the report has a CRITICAL finding, listing them; `gh pr list --head <branch> --json url,number`; if one exists, refresh its body with `gh pr edit --body-file` and report the URL; otherwise fill `.github/pull_request_template.md` from evidence (the scripts the session ran with their results, the scripts not run, the verify summary line, the change's `## Outside this repo` group, page loaded or none), strip guidance comments, `gh pr create --title <subject> --body-file .tmp/pr-body.md`; verify by opening this branch's PR with it: with one task still unticked it refuses and names the task, after ticking every template section is filled or None and carries the verify summary, the CI `Check` job runs on it, and a second run after another commit updates the same PR and returns its URL
- [ ] 3.3 Create `.github/pull_request_template.md` with What and why, Changes, How to verify (scripts run with results, scripts not run, `/opsx:verify` summary, page loaded or none), Risk (level, what breaks, the undo step), Outside this repo (deploy repo env, Resend, admin, each with how it was verified, or None); verify this branch's PR, opened by `git-open-pr`, shows every section filled or marked None
- [ ] 3.4 Create `.claude/skills/git-merge-pr/SKILL.md`: explicit owner accept required; stop fixing nothing on dirty tree, HEAD not equal to upstream, foreign PR, red `Check` job on HEAD, unanswered thread, conflict; `gh pr merge --squash --delete-branch`; confirm with `gh pr view --json state`; fast-forward local `main`; delete the local branch last; degrade to the browser link when `gh` is absent or logged out; verify invoking it without an accept refuses, and with an accept on this branch's PR it merges and reports the squash commit

## 4. Verification

- [ ] 4.1 Run `/code-review` on this branch and confirm its report cites `front.md` or `api.md` for at least one finding or states none of the listed failures were found; verify the report names the rule files, and if the CI review on the PR does not, record the one-line `prompt` fallback from the design under Review findings
- [ ] 4.2 Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` on the final tree and confirm `git status --porcelain .claude/commands .claude/skills/openspec-*` prints nothing; verify green and empty

## 5. Outside this repo

- [ ] 5.1 After this branch's PR merges, on GitHub `h2bc/web-store`: protect `main` (require a pull request, require the `Check` status check, block force pushes), allow squash merges only with the squash title taken from the PR title and the squash body blank, and delete head branches on merge, through `gh api` or the repository settings page; verify `gh api repos/h2bc/web-store/branches/main/protection` shows the required check and `gh repo view h2bc/web-store --json squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,deleteBranchOnMerge,squashMergeCommitTitle,squashMergeCommitMessage` prints true, false, false, true, PR_TITLE, BLANK

## Review findings

None.
