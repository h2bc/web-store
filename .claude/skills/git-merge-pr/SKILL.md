---
name: git-merge-pr
description: "After the owner's explicit accept: guard-checked squash merge of the current branch's pull request, then sync main and clean up. Fixes nothing."
argument-hint: "[pr number]"
---

# Merge the pull request

Lands what the owner already accepted. Not diagnostic: when a guard fails it stops and names the skill that owns the fix.

## Tooling

`gh auth status` first. When `gh` is missing or logged out, print the PR link `https://github.com/h2bc/web-store/pull/<number>`, say what to install or run, and stop.

## Guards, in order, fixing nothing

1. **Owner accepted.** Point at the message in this conversation where the owner explicitly accepted the merge. "All checks are green" is not an accept. Without one: stop.
2. **Branch** is not `main`.
3. **Clean tree.** `git status --porcelain` prints nothing.
4. **HEAD equals upstream.** `git rev-parse HEAD` equals `git rev-parse @{u}`. Otherwise `/git-commit-push`.
5. **The PR is this branch's.** `gh pr view <number or branch> --json number,headRefName,state,mergeable,statusCheckRollup`; `headRefName` must be the current branch and `state` OPEN.
6. **`Check` is green on HEAD.** In `statusCheckRollup`, the `Check` job has conclusion SUCCESS for the current HEAD sha. Otherwise fix through `/git-commit-push` and a `/git-open-pr` refresh.
7. **Every review thread answered.** `gh api graphql -f query='{repository(owner:"h2bc",name:"web-store"){pullRequest(number:<n>){reviewThreads(first:100){nodes{isResolved comments(first:10){nodes{author{login}}}}}}}}'`; every unresolved thread has a reply after its first comment. Otherwise answer or fix, then come back.
8. **No conflict.** `mergeable` is MERGEABLE. Otherwise merge `main` in through `/git-commit-push`.

## Merge

9. `gh pr merge <number> --squash --delete-branch`. The squash commit takes the PR title as its subject.
10. `gh pr view <number> --json state,mergeCommit`. Anything other than MERGED: stop and report the exact output.
11. `git switch main && git pull --ff-only && git fetch --prune`. Confirm `git log -1 --format=%s` is the PR title.
12. `git branch -D <branch>` only now. A squash rewrites the commits, so `-d` refuses; the authority for "it merged" is step 10.

## Report

The squash commit sha and subject on `main`, and that the local and remote branches are gone.

## CRITICAL

- Never merge without the owner's accept in the conversation.
- Never fix, force, retry or work around a failed guard; stop and surface it.
- The only destructive step, deleting the branch, runs after the merge is confirmed.
