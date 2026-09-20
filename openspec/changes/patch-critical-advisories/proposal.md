## Why

`pnpm audit` reports four critical advisories, two in each app. One is reachable in production: a remote code execution in the Next.js Image Optimization API, which the storefront runs with `unoptimized: false`. The other three are not reachable today, but each has a fix that costs one line.

## What Changes

- `next` and `eslint-config-next` move from 16.1.6 to 16.3.5 in `front/`, because both critical Next.js advisories are fixed in 16.3.3.
- The same bump clears the high Next.js advisories, including three proxy bypasses that matter because the security headers live in `front/proxy.ts`.
- `sharp` moves to 0.35.4 or later with the bump, which clears its two high advisories.
- `api/package.json` gains a pnpm override of `fast-xml-parser` to `5.11.1`, because the AWS SDK under Medusa's S3 file provider resolves 5.3.4.
- `api/package.json` gains a pnpm override of `protobufjs` to `7.6.6`, because the OpenTelemetry gRPC exporter under `@medusajs/deps` resolves 7.5.4.
- Every `@medusajs/*` pin stays at 2.21.0.
- `front/AGENTS.md` and `front/CLAUDE.md` are added. `next dev` 16.3 writes them by default to point AI agents at the docs bundled with the installed release.

Non-goals:

- The high and moderate advisories in development tooling: jest, eslint, vite, the `shadcn` CLI and `@medusajs/test-utils`. None of it runs in production.
- Upgrading Medusa, React or Node.
- Adopting new Next.js 16.2 or 16.3 features.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. No requirement changes, so the change sets `skip_specs`.

## Impact

- `front/package.json`, `front/pnpm-lock.yaml`, `front/AGENTS.md` and `front/CLAUDE.md`.
- `api/package.json` and `api/pnpm-lock.yaml`.
- Any storefront file a Next.js 16.2 or 16.3 type or behaviour change touches.
