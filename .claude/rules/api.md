---
paths:
  - "api/**"
---

# API

Stock Medusa v2. Read `docs/architecture.md` before changing anything outside a single route or step.

## Extension points

- Customise only under `api/src/`: `modules/`, `workflows/`, `subscribers/`, `api/`, `links/`, `jobs/`.
- Never patch framework code or override a core module.
- Side effects go in a workflow with compensation, never inline in a subscriber or route.

## Admin data

- Catalog, prices, regions, shipping options and payment providers live in the admin.
- Code reads them. It never hardcodes them.

## Services and env

- Every external service is optional and switched on by env in `api/medusa-config.ts`.
- The app starts with none of them configured.
- A new env key is declared in `api/.env.example` with an empty value.

## Worker

- Subscribers and jobs run in the worker container.
- They use only env the worker carries.
- They never assume the admin, the HTTP server or the server container's file system.

## Review: passes every check, breaks at runtime

Check the diff for each of these and report a match, citing this file.

- A customisation outside the extension points.
- A subscriber or job reading server-only env, resolving the admin, or assuming the server process.
- A catalog, pricing, region, currency, country or shipping value written in code.
- A module or provider registered unconditionally when its API key is missing.
- A route or workflow throwing a plain `Error` instead of `MedusaError`.

## Medusa

For Medusa API questions, fetch https://docs.medusajs.com/llms.txt and follow its links.
