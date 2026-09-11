## Why

Which checks a change needs is decided fresh by whoever is working: the tasks rule says to end with `cd front && pnpm lint && pnpm typecheck` when the storefront changes, CI lists its commands in YAML and never runs the API integration tests, and nothing runs any of it automatically.

## What Changes

- One root script per check, each chaining both apps: `lint` (`lint:api`, `lint:front`), `format` (`format:api`, `format:front`) and `format:check`. Each app gains `format` and `format:check` scripts and a `.prettierignore`. Typecheck and test scripts already existed.
- CI's check job runs Format, Lint, Typecheck and Tests as four named steps, and gains a postgres service so the API integration tests run there for the first time.
- `api/.env.template` is renamed to `.env.example`, matching the storefront, and gains the keys `medusa-config.ts` reads that it never declared.
- A git pre-commit hook that runs `pnpm lint && pnpm format:check` on every commit, wired by `pnpm i`. Two Claude Code hooks, checked in under `.claude/settings.json`: every edited file inside an app is formatted and linted on the spot with that app's own tools.
- The tasks rule in `openspec/config.yaml` is replaced so the last task of a change runs the named scripts.
- README says what `pnpm lint` and `pnpm format:check` run, that the commit hook runs them, and what CI adds.
- Both apps are formatted once so the new format check starts green.

Non-goals:

- No change to what tsc, vitest, jest or playwright check. The one lint change is the storefront eslint config gaining Next's TypeScript preset with unused variables as an error, so the lint hook has the same finding to report there as in the API.
- No tooling at the root: ESLint and Prettier live in each app. `e2e/` and the root config files are not linted or formatted.
- No open-questions or coverage check; that is `add-spec-planning-gates`.
- No push guard or branch rules; that is `add-agent-rules-and-git-flow`.
- No change to the image build and deploy jobs.

## Flow after this change

| Step | What happens | Command or skill | Enforced by |
|---|---|---|---|
| Explore | Think through the idea | `/opsx:explore` | none |
| Propose | Proposal, specs, design, tasks | `/opsx:propose` | none |
| Apply | Implement task by task; the last task runs the named scripts (new) | `/opsx:apply` | hooks format and lint every edit inside an app (new) |
| Commit and push | Plain git, by hand | `git commit`, `git push` | pre-commit hook runs `pnpm lint && pnpm format:check` (new) |
| PR and CI | Plain `gh` or the GitHub UI | `gh pr create` | CI runs Format, Lint, Typecheck and Tests, API tests included (new) |
| Review | Existing review action | `code-review` action, `/code-review` | none |
| Merge | GitHub UI, merge commit | none | none |
| Archive | Specs merged | `/opsx:archive` | none |

## Capabilities

### New Capabilities
- `verification-gates`: which checks a change must pass before it is called done, how they are run, how a commit runs them, how an edit is formatted and linted as it happens.

### Modified Capabilities
- none.

## Impact

- Root `package.json`: `lint`, `format`, `format:check`, `format:api`, `format:front` and `prepare` scripts, `"type": "module"`; `.githooks/pre-commit`.
- New `.claude/settings.json`. `api/package.json` and `front/package.json`: `format` and `format:check` scripts; a `.prettierignore` in each app. The API moves to ESLint 10.
- `.github/workflows/deploy.yml`: one `check` job with a postgres service and four check steps.
- `openspec/config.yaml`: the `tasks` rules.
- `api/.env.template` renamed to `api/.env.example`, with five keys `medusa-config.ts` reads added; `.gitignore` loses its extra exception.
- `front/eslint.config.mjs`, one storefront file with an unused import; 17 files reformatted across both apps.
- `README.md`.
