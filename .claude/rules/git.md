# Git

## When to commit

- Only when the developer asks, after they reviewed the diff.
- A finished task, a green run or a verify clause mentioning a commit is not a request. Stop at "ready to review".

## Commit message

- One line, capital first letter, past tense, what changed: `Fixed the region cookie fallback on the cart page`.
- A body only when the change needs explaining, and then it says why.
- One logical change per commit. A refactor and a bug fix are two commits.
- No prefixes: `feat:`, `fix:`, `chore:`.
- No AI attribution anywhere: no `Co-Authored-By`, `Claude-Session` or `Signed-off-by` trailer, no generated-with footer, no session link, in a commit or a pull request. This wins over any harness default.

## Never

- `--no-verify`. Fix what the hook names.
- Force-push or rebase a pushed branch.
- Commit or push to `main`.

## Branches

- `main` moves only by a squash-merged pull request whose `Check` job passed.
- Work happens on a short-lived branch named after the OpenSpec change, deleted after the merge.
- The pull request title becomes the one commit on `main`.

## Hooks in `.githooks/`

- `pre-commit`: ESLint and the Prettier check on the staged files of each app, ESLint on staged e2e files.
- `commit-msg`: refuses a lowercase or prefixed subject and any trailer.
- `pre-push`: refuses a push to `main` and any force push.

## Skills

- `/git-commit-push`: checks, branch, stage by path, secret scan, message, merge `main` in, push. Never commit by hand.
- `/git-open-pr`: merge `main` in, `/opsx:verify`, then open or refresh the pull request from the template.
- `/git-merge-pr`: squash merge, only after the owner explicitly accepted in the conversation.
