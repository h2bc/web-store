## Context

- The row holds `slug`, `title`, `description` and `body`. The title is read by the storefront H1 and by `contentPageMetadata`, both falling back to the route label when the row is missing.
- The seed titles equal the labels in `front/lib/routes.ts`. The nav and footer read those labels, never the row.
- The admin card and drawer expose the title as an editable field. The e2e admin test edits only the body.
- The two specs this change modifies are still deltas inside `add-admin-content-pages` and `show-content-page-empty-state`.

## Goals / Non-Goals

**Goals:**

- One source for the heading, the document title and the menu text: the route label.
- The row and both endpoints carry only what the owner edits: description and body.

**Non-Goals:**

- Moving the description into code. It is copy the owner rewrites with the body.
- Changing the gallery, whose videos keep their titles.

## Decisions

**1. Drop the column with a migration.** A new migration under `api/src/modules/content-page/migrations/` drops `title` in `up` and adds it back as `text not null default ''` in `down`. The model, service, workflow input and compensation, validator, seed and admin types lose the field. Alternative: keep the column and ignore it, rejected as dead schema the code rule forbids.

**2. Route label everywhere on the storefront.** `contentPageMetadata` returns `route.label` as the title in both branches, so the only difference between a row and no row is the description, the canonical and the robots tag. The view already renders `route.label` when the row is null; it does so unconditionally now. Alternative: a `heading` field per route, rejected because no page needs a heading that differs from its menu label today.

**3. Admin header shows the label.** The card header and the drawer title read the `label` prop the route page already passes. Alternative: derive it from the slug, rejected as a second copy of the same text.

## Risks / Trade-offs

- [A deployed database holds titles the migration discards] → They equal the seed labels on every environment, so nothing is lost. `down` restores the column empty.
- [The pending `add-storefront-result-type` change touches the same read] → The read only loses one mapped field, a one-line merge.

## Migration Plan

- Deploy the API. The entrypoint runs the migration on the server container before it starts.
- The storefront ignores unknown fields, so either deploy order works.
