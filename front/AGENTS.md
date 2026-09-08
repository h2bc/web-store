# AGENTS.md

Guidance for autonomous coding agents (ChatGPT/Cursor/Copilot/etc.) collaborating on this repository.

## Commands & Tooling

- `npm run dev` – Next.js dev server (Turbopack) at http://localhost:3000
- `npm run build` – Production build with Turbopack
- `npm run start` – Serve the production build
- `npm run lint` – ESLint (TypeScript + Next + Prettier)
- `npm run format` – Prettier format pass

No testing framework is configured yet; add relevant tests when introducing critical changes.

## Project Snapshot

- Next.js 15 App Router project using React 19 and TypeScript.
- Tailwind CSS v4 with CSS variables; see `app/globals.css` and `tailwind.config.js`.
- shadcn/ui components live under `components/ui`; feature-specific components are grouped by domain.
- Medusa.js SDK powers the storefront. Data access modules are under `lib/data/`.
- Environment variables required in `.env.local`; consult `.env.example`.
- Layouts split into route groups: `app/(landing)` and `app/(main)`.

## Architectural Patterns

### Data Layer

- Server-only modules in `lib/data/` encapsulate backend access and business logic.
- Use the `cached` helper from `lib/cache.ts` for consistent caching; respect existing TTL/tag patterns.
- Prefer calling data modules directly from Server Components instead of legacy server actions.

### State & Cookies

- Region and cart IDs persist via utilities in `lib/cookies.ts`.
- Proxy (`proxy.ts`) seeds default region selection.

### Styling

- `lib/breakpoints.ts` centralizes Tailwind breakpoint values.
- Use the `cn` helper from `lib/utils.ts` for composing class names.
- Custom fonts are registered in `app/fonts.ts`.

## Contribution Expectations

- Default to TypeScript; maintain strict typing.
- Mark Client Components with `"use client"` when needed; prefer Server Components otherwise.
- Keep file naming in kebab-case (e.g., `product-card.tsx`).
- Add concise comments when logic is non-obvious; avoid noise.
- If you add a test framework or scripts, document usage here and in `README.md`.
- When fetching new Medusa endpoints, mirror existing error handling and sanitization (see `lib/data/contact.ts`).

## Verification Checklist

- Lint: `npm run lint`
- Format: `npm run format` (only if you intentionally format)
- For UI changes, test dev build locally via `npm run dev`.
- Ensure environment-dependent logic is guarded so the app does not crash when Medusa backend is unavailable.

## Coordination Notes

- `CLAUDE.md` contains extra context tailored for Claude Code. Keep both documents aligned when making substantial structural changes.
- If you automate tasks (codegen, scaffolding), note commands and generated files before exiting.
