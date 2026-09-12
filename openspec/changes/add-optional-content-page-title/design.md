## Context

- The row holds `slug`, `description` and `body`. `drop-content-page-title` removed `title` last week with a migration whose `down` restores it as `text not null default ''`.
- The storefront view renders `route.label` as the H1 for every page, with or without a row. `contentPageMetadata` returns `route.label` as the document title in both branches.
- The admin card header shows the sidebar label, and the drawer has the description and body fields.
- The Playwright storefront journey asserts the H1 equals the route label on every seeded page. The admin journey edits only the body.

## Goals / Non-Goals

**Goals:**

- The H1 on a content page is the owner's, or absent.
- The tab title and the menu keep the route label, so the storefront never invents a heading.

**Non-Goals:**

- A rich text editor, blocks, or any change to the markdown body.
- Moving the meta description out of the admin. It summarises the body, so it follows the body.

## Decisions

**1. Nullable column, new migration.** A migration under `api/src/modules/content-page/migrations/` adds `title text null` in `up` and drops it in `down`; the model declares `model.text().nullable()`. Alternative: reuse the `down` of the drop migration, rejected because it makes the column `not null default ''` and an empty string would then stand for "no title", a second way to say null.

**2. Empty means null at the API.** The validator takes `title` as an optional string of at most 120 characters and the workflow stores an empty or missing title as null, so the storefront checks one condition. Alternative: store the empty string and treat it as absent on the storefront, rejected because two representations of the same state leak into every reader.

**3. Seed writes the label as the title.** The seed carries a slug-to-label map matching `front/lib/routes.ts`, so seeded pages show the same heading they did before and the storefront journey keeps asserting it. Alternative: a lorem title, rejected because the journey would then assert generated text; seeding no title, rejected because no seeded page would show the heading path at all.

**4. H1 only when set, nowhere else.** `content-page-view.tsx` renders the blackletter `Heading` when `contentPage.title` is set and nothing otherwise, including the no-row state. The document title stays `route.label` in `contentPageMetadata`, untouched. Alternative: fall back to the route label when the title is empty, rejected by the owner: the visible title is theirs and can be absent.

**5. Admin: one more field, same components.** The drawer gains an `Input` labelled Title above the meta description, and the card gains a Title row showing a dash when null, the same row component as the other two. The header keeps the sidebar label because it names the screen. Alternative: put the title in the card header, rejected because an empty title would leave the screen unnamed.

## Risks / Trade-offs

- [The storefront journey asserts the label as the H1] → The seed writes the label as the title, so the journey passes unchanged; the no-title path is covered at the unit level in `front/tests/`.
- [A deployed database has rows without a title] → The column is nullable, so existing rows render without a heading until the owner sets one, which is the intended behaviour.
- [The pending `add-storefront-result-type` change touches the same read] → One mapped field more, a one-line merge.

## Migration Plan

- Deploy the API. The entrypoint runs the migration on the server container before it starts.
- The storefront ignores unknown fields, so either deploy order works. Until the storefront deploys, pages keep the label as the H1.
