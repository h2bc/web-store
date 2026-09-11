---
name: git-open-pr
description: "Verify the change is done, then open the pull request for the current branch with the template filled from evidence, or refresh the one already open."
argument-hint: "[title override]"
---

# Open or refresh the pull request

Turns a pushed branch into a reviewable pull request. Runs only when the developer asks for it. Reads git, never writes to it. Idempotent: a branch has at most one open PR.

## Tooling

`gh auth status` first. When `gh` is missing or logged out, do not fake the call: print the link `https://github.com/h2bc/web-store/compare/main...<branch>?expand=1`, say to install `gh` or run `gh auth login`, and stop after the verification steps below so the report is still useful.

## Guards

1. **Branch.** `git branch --show-current` is not `main`.
2. **Pushed.** `git rev-parse HEAD` equals `git rev-parse @{u}`. Otherwise stop and point at `/git-commit-push`.
3. **Change verified.** Run `/opsx:verify` on the active OpenSpec change (the most recently modified one from `openspec list --json`, or the one named in the conversation). A CRITICAL finding stops this skill, except for a task under an `## Outside this repo` group or a task whose verify clause is this PR being opened, reviewed or merged; those are unticked by definition now and go into the body under **Remaining work**. Any other CRITICAL: list the findings and say what to finish or tick. Keep the report's summary line for the body. When the branch carries no OpenSpec change, say so and continue.

## Body

4. Fill `.github/pull_request_template.md` for a reviewer who was not in the room. Every section is filled or reads `None`; strip the guidance comments.
   - **Scripts run**: each script `/git-commit-push` ran on the pushed HEAD, with its result. **Scripts not run**: the rest, with why.
   - **Change verification**: the `/opsx:verify` summary line.
   - **Page loaded**: the storefront page opened during apply to see the change, or `None`.
   - **Risk**: level, what breaks if wrong, the undo step.
   - **Outside this repo**: the change's `## Outside this repo` tasks, each with how it was verified, or `None`.
   - **Remaining work**: the exempted unticked tasks, or `None`.
5. Write the body to `.tmp/pr-body.md` (`mkdir -p .tmp`; the directory is git-ignored).

## Open or refresh

6. `gh pr list --head <branch> --state open --json url,number`.
   - One exists: `gh pr edit <number> --body-file .tmp/pr-body.md`. Report its URL.
   - None: title is the argument or `git log -1 --format=%s`. `gh pr create --base main --title "<title>" --body-file .tmp/pr-body.md`. Report the URL and number.

## Verify

Exactly one open PR for this branch, targeting `main`, whose body a reviewer could act on without asking a question.

## Hand-off

Merging is `/git-merge-pr`, only after the owner accepts.

## CRITICAL

- Never open a second PR for a branch that has one.
- Never open from `main` or from a branch with unpushed commits.
- Never open past a CRITICAL verify finding, and never claim a tool ran that did not.
