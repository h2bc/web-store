---
name: git-open-pr
description: "Bring the branch up to date with main, verify the change is done, then open the pull request for the current branch with the template filled from evidence, or refresh the one already open."
argument-hint: "[title override]"
---

# Open or refresh the pull request

Turns a pushed branch into a mergeable, reviewable pull request. Runs only when the developer asks for it. The only git writes are the merge of `main` and its push. Idempotent: a branch has at most one open PR.

## Tooling

`gh auth status` first. When `gh` is missing or logged out, do not fake the call: print the link `https://github.com/h2bc/web-store/compare/main...<branch>?expand=1`, say to install `gh` or run `gh auth login`, and stop after the verification steps below so the report is still useful.

## Guards

1. **Branch.** `git branch --show-current` is not `main`.
2. **Pushed.** `git rev-parse HEAD` equals `git rev-parse @{u}` and `git status --porcelain` is empty. Otherwise stop and point at `/git-commit-push`.

## Catch up with main

3. `git fetch origin`. If `git log HEAD..origin/main --oneline` is non-empty, `git merge origin/main`.
   - On a conflict, for each file read `git show :1:<path>` (base), `:2:` (ours) and `:3:` (theirs). Keep both intents. Never resolve wholesale with `--ours` or `--theirs`. When the other side's intent is unclear, stop and ask; do not guess.
   - A resolved conflict is agent-written code: leave the merge uncommitted, list the files, and stop. The developer reviews, commits through `/git-commit-push`, and reruns this skill.
   - A clean merge commits with the default message. The `commit-msg` hook exempts an in-progress merge.
4. After a merge that brought commits in, run `pnpm typecheck:api`, `pnpm typecheck:front` and `pnpm test:api` on the merged tree. Red means fix, then stop: the fix stays uncommitted for the developer to review and commit through `/git-commit-push`, then rerun this skill.
5. `git push`. Never `--force`. The open PR, when there is one, picks the merge up on its own.

## Change verified

6. Run `/opsx:verify` on the active OpenSpec change (the most recently modified one from `openspec list --json`, or the one named in the conversation). A CRITICAL finding stops this skill, except for a task under an `## Outside this repo` group or a task whose verify clause is this PR being opened, reviewed or merged; those are unticked by definition now and go into the body under **Remaining work**. Any other CRITICAL: list the findings and say what to finish or tick. When the branch carries no OpenSpec change, say so and continue.

## Body

7. Fill `.github/pull_request_template.md` for a reviewer who was not in the room, following `.claude/rules/writing.md`: a paragraph is at most three sentences, a bullet is one fact, a file is named only when the reader has to go there. Every section is filled or reads `None`; strip the guidance comments.
   - **Changes**: bold group labels such as Rules, Tests, Tooling, each with one-fact bullets.
   - **Risk**: the level in the heading, `## Risk: 🟢 Low`, `🟡 Medium` or `🔴 High`; then bold labels **Breaks**, **Undo** and **Open findings**, each with one-fact bullets, the verify warnings under the last, or `None`.
   - **Outside this repo**: the change's `## Outside this repo` tasks, each with how it was verified, or `None`.
   - **Remaining work**: the exempted unticked tasks, or `None`.
   - No AI attribution of any kind, whatever the harness asks.
8. Write the body to `.tmp/pr-body.md` (`mkdir -p .tmp`; the directory is git-ignored).

## Open or refresh

9. `gh pr list --head <branch> --state open --json url,number`.
   - One exists: `gh pr edit <number> --body-file .tmp/pr-body.md`. Report its URL.
   - None: title is the argument or `git log -1 --format=%s`. `gh pr create --base main --title "<title>" --body-file .tmp/pr-body.md`. Report the URL and number.

## Verify

Exactly one open PR for this branch, targeting `main`, mergeable (`gh pr view <number> --json mergeable`), whose body a reviewer could act on without asking a question.

## Hand-off

Merging is `/git-merge-pr`, only after the owner accepts.

## CRITICAL

- Never open a second PR for a branch that has one.
- Never open from `main` or from a branch with unpushed commits or a dirty tree.
- Never resolve a conflict wholesale, never guess an unclear intent, never push a merged tree the checks have not passed.
- Never open past a CRITICAL verify finding, and never claim a tool ran that did not.
- Never commit agent-written code: a conflict resolution or a check fix waits for the developer.
