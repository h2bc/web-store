## MODIFIED Requirements

### Requirement: Each area rule carries its runtime failure list
The storefront rule SHALL list: a client component importing from the server-only data layer; a data-layer function that throws, lets an SDK error escape, or has a return type other than the shared result type; a read without a cache tag or a mutation without invalidation; session state held outside the httpOnly cookies; a new public page without a canonical URL or an explicit noindex rule. The API rule SHALL list: a customization outside modules, workflows, subscribers, routes and links; a subscriber that assumes the server process or an env var the worker may not have; catalog, pricing, region or shipping values hardcoded in code. A review of a change, local or in CI, SHALL check the diff against these lists.

#### Scenario: Client component imports the data layer
- **WHEN** a PR adds a file with `'use client'` that imports from `front/lib/data/`
- **THEN** the review reports it, citing the storefront rule

#### Scenario: Data-layer function returns a bare value
- **WHEN** a PR adds a function to `front/lib/data/` whose return type is not the shared result type
- **THEN** the review reports it, citing the storefront rule

#### Scenario: Subscriber reads an env var only the server has
- **WHEN** a new subscriber reads a variable that the worker container is not documented to carry
- **THEN** the review reports it, citing the API rule
