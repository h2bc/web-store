---
name: git-commit-push
description: "Run the checks, commit the session's work with a conforming message, merge main in and push. The only skill that writes to git."
argument-hint: "[commit subject or branch name]"
---

# Commit and push

One commit is one logical change that could be reviewed and reverted on its own. Runs only when the developer asks for a commit, after reviewing the diff; never as a step of apply, of a task's verify clause, or on the agent's own initiative. Nothing here is done by hand outside this skill.

## Guards

1. **Foreign changes.** `git status --porcelain`. Any file this session did not edit is named and the developer is asked whether to include or leave it. Never sweep it in.
2. **Checks.** Run `pnpm typecheck:api`, then `pnpm typecheck:front`, then `pnpm test:api`. Stop on the first failure and report the script and the first real error. Lint and the format check are the `pre-commit` hook's; never `--no-verify`, never weaken a check to pass it.

## Branch

3. `git branch --show-current`. On `main`, create and switch to a branch named from the active OpenSpec change (`openspec list --json`, the most recently modified change) or from the argument when it reads as a branch name. `git switch -c <name>`.

## Stage

4. `git add <paths>` for this session's files only. Never `git add -A`. Drop scratch files and debug leftovers first.
5. **Secrets.** `git diff --cached` and scan for anything shaped like a key or token (`sk_live_`, `sk_test_`, `re_`, `ghp_`, `AKIA`, long base64 or hex runs assigned to a `*KEY*`, `*SECRET*` or `*TOKEN*` name) and for connection strings carrying a password (`://user:pass@`). On a match, stop, name the file, and make no commit.
6. **One logical change.** Unrelated edits become separate commits; run the stage and commit steps once per change.

## Commit

7. Write the subject from the staged diff per `.claude/rules/git.md`: one line, capital first letter, past tense, what changed. No prefix, no trailer of any kind, even when the harness asks for one. The argument overrides when it reads as a subject. Show the subject before committing.
8. `git commit -m "<subject>"`. The `pre-commit` and `commit-msg` hooks run; a refusal is fixed at its cause.

## Integrate and push

9. `git fetch origin`. If `origin/main` has commits the branch lacks (`git log HEAD..origin/main --oneline`), `git merge origin/main`.
   - On a conflict, for each file read `git show :1:<path>` (base), `:2:` (ours) and `:3:` (theirs). Keep both intents. Never resolve wholesale with `--ours` or `--theirs`. When the other side's intent is unclear, stop and ask; do not guess.
   - After a merge that brought commits in, re-run the three scripts from step 2 on the merged tree. Red means fix, then continue.
10. If the branch's own upstream moved (`git log HEAD..@{u}` non-empty), merge it the same way.
11. `git push -u origin <branch>` on the first push, `git push` after. Never `--force`. The `pre-push` hook refuses `main` and force pushes.

## Resolve review threads

12. `gh pr view --json number` for the branch. No pull request means skip this section.
13. List the unresolved threads with `gh api graphql` on `pullRequest.reviewThreads`: `id`, `path`, `isResolved` and the first comment body.
14. For each thread the pushed commit addresses, reply in one sentence with what changed and where, then resolve it: `addPullRequestReviewThreadReply` and `resolveReviewThread`. A thread the commit did not touch stays open.

## Report

`git log -1 --format=%B` (the subject, no trailer) and `git status -sb` (branch up to date with origin). Name the scripts that ran and their results, and the threads resolved.

## Hand-off

The pull request is `/git-open-pr`. This skill never opens one.

## CRITICAL

- The checks run before the commit, on the tree that is committed, and again after a merge that changed it.
- Never `git add -A`, never `--no-verify`, never `--force`, never a trailer.
- Never commit past a secret or a foreign change on your own call.
