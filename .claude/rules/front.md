---
paths:
  - "front/**"
---

# Storefront

Server-first Next.js App Router. Read `docs/architecture.md` before changing the data layer, caching or checkout.

## Data layer

- Components never call the backend. Every call goes through `front/lib/data/`.
- Reads are `import 'server-only'`, imported by server components only.
- Mutations are `'use server'` actions, which client components call as functions.
- Every function returns a result object with an `error` field and never throws.
- Pages render the degraded state on error.

## Caching

- Reads are wrapped in `cached` from `front/lib/cache.ts` with a tag.
- Mutations invalidate with `revalidatePath` or `revalidateTag`.

## Session and checkout

- The only session state is the cart id, in the httpOnly cookie managed by `front/lib/cookies.ts`.
- Nothing about the cart lives in client state, `localStorage` or a URL.
- Checkout is guest-only. No accounts, login or order history.

## SEO and env

- A public page sets `alternates.canonical`.
- A cart, checkout or order page sets `robots: { index: false }`.
- A new env key is declared in `front/.env.example`.

## Review: passes every check, breaks at runtime

Check the diff for each of these and report a match, citing this file.

- A `'use client'` component importing a `server-only` module, or calling the SDK from `front/lib/medusa.ts` directly.
- A data-layer function that throws or lets the SDK error escape.
- A read outside `cached`, a read without a tag, or a mutation without invalidation.
- Cart or session state in client state, `localStorage`, a query string or a non-httpOnly cookie.
- A new public page without a canonical, or a new transactional page without `noindex`.
