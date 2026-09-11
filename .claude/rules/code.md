# Code

Applies to every code change in either app.

## Reuse first

- Prefer what exists over custom code, in this order: a Medusa or Next.js feature, a component or helper already in the repo, a well-maintained library, then hand-written code.
- Prefer the plain solution over the clever one. One developer and an agent maintain this.

## Style

- No legacy compatibility. When behavior, APIs, configs or schemas change, update callers and tests to the new shape and delete the old path: no shims, aliases or dead code.
- Small methods: short, single-purpose functions. A name starts with a verb: `get` when it returns a value, the action otherwise, like `placeOrder`.
- Functional patterns: immutable data, pure functions, `map`/`filter`/`reduce` over loops and mutation. The one class is a Playwright page object.
- Blank lines inside a function follow the ESLint padding rule: after declarations, before `return`, around multi-line blocks. `eslint --fix` places them.
- No comments. The only exceptions are markers such as TODO and a note about something genuinely non-obvious.
