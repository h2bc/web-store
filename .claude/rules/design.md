---
paths:
  - "front/app/**"
  - "front/components/**"
---

# Design

Applies to every page and component in the storefront.

## Follow the common pattern

- Do what the big e-commerce storefronts do for the same screen. A shopper should never have to learn this shop.
- Look at the pages already in the app before designing one. A new page copies the closest existing page's layout, spacing and tone.
- The same kind of screen looks the same everywhere. A confirmation, an empty state or an error looks like the ones already in the app.

## Reuse

- Reuse in this order: a shared component in `front/components/`, a shadcn primitive in `front/components/ui/`, a shadcn primitive not yet added, then a new component.
- A shadcn primitive is added through the shadcn CLI, never hand-written.
- One heading component, `front/components/layout/heading.tsx`. Page titles use the blackletter font at level 1.

## Review: looks fine, does not belong

Check the diff for each of these and report a match, citing this file.

- A primitive used directly, or a hand-written one, when a shared component or a shadcn primitive already covers it.
- A page whose layout, heading or spacing differs from the nearest existing page without a reason in the change.
