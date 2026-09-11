# agent-guidance Specification

## Purpose

Defines which instructions an agent has in context when working on which part of the repository, what a review looks for in this repository, and where architecture facts live.

## Requirements

### Requirement: Rules are path-scoped and load with the files they govern
Rules SHALL live as separate files under `.claude/rules/`. The API rule SHALL load when a file under `api/` is read or edited, the storefront rule when a file under `front/` is, and the git rule always. Each rule SHALL state invariants and where to look, not restate architecture narrative.

#### Scenario: Editing the storefront
- **WHEN** an agent edits a file under `front/components/`
- **THEN** the storefront rule is in context and the API rule is not

#### Scenario: Any session
- **WHEN** a session starts with no file open
- **THEN** the git rule is in context and neither area rule is

### Requirement: Each area rule carries its runtime failure list
The storefront rule SHALL list: a client component importing from the server-only data layer; a data-layer function that throws instead of returning an error value; a read without a cache tag or a mutation without invalidation; session state held outside the httpOnly cookies; a new public page without a canonical URL or an explicit noindex rule. The API rule SHALL list: a customization outside modules, workflows, subscribers, routes and links; a subscriber that assumes the server process or an env var the worker may not have; catalog, pricing, region or shipping values hardcoded in code. A review of a change, local or in CI, SHALL check the diff against these lists.

#### Scenario: Client component imports the data layer
- **WHEN** a PR adds a file with `'use client'` that imports from `front/lib/data/`
- **THEN** the review reports it, citing the storefront rule

#### Scenario: Subscriber reads an env var only the server has
- **WHEN** a new subscriber reads a variable that the worker container is not documented to carry
- **THEN** the review reports it, citing the API rule

### Requirement: Architecture facts have one home
The system description (what each app is, the data-layer contract, caching, session, checkout mode, optional services, worker mode, the deploy repository) SHALL live in `docs/architecture.md`. `CLAUDE.md` and the OpenSpec context SHALL point at it and not restate it. A changed architecture fact SHALL change one file.

#### Scenario: Data-layer contract changes
- **WHEN** the data layer's return shape changes
- **THEN** only `docs/architecture.md` and the storefront rule's invariant need updating, and no other instruction file describes the old shape

### Requirement: Customizations never live in generated files
Every project customization SHALL live in `openspec/config.yaml`, in `.claude/rules/`, in `.claude/settings.json`, or in skills whose names do not start with `openspec-`. The generated `opsx` commands and `openspec-*` skills SHALL NOT be edited.

#### Scenario: OpenSpec instruction files regenerated
- **WHEN** `openspec update` rewrites its generated commands and skills
- **THEN** no project rule, hook, guidance or skill is lost
