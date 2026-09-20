## Context

- The storefront pins `next` and `eslint-config-next` to exact `16.1.6`. React is `19.2.4`, inside the peer range of `next` 16.3.5.
- Production sets `images.unoptimized` to `false`, so `/_next/image` is public and the image optimization advisory is reachable.
- The API reaches `fast-xml-parser` through `@medusajs/medusa`, its S3 file provider and the AWS SDK. The S3 provider is configured in `api/medusa-config.ts`.
- The API reaches `protobufjs` through `@medusajs/cli`, `@medusajs/deps` and the OpenTelemetry gRPC exporter. `api/instrumentation.ts` registers nothing, so the exporter never loads.
- Both vulnerable API packages are transitive, so no direct dependency can be bumped to fix them.

## Goals / Non-Goals

**Goals:**
- `pnpm audit` reports no critical advisory in either app.
- Every test that passes before the change passes after it.

**Non-Goals:**
- A clean audit. Development tooling keeps its high advisories.
- A recurring audit job in CI.

## Decisions

**Next.js goes to the latest 16.3 patch, not the first fixed release.** 16.3.3 fixes both criticals, and 16.3.5 also carries the later high fixes. The alternative was 16.3.3, which is the smaller step but leaves known issues open on the day it lands. `eslint-config-next` moves with it, because the two are released together.

**The API fixes are pnpm overrides, not a Medusa upgrade.** An override in `api/package.json` forces one transitive version and leaves every `@medusajs/*` pin at 2.21.0, as `api-platform` requires. The alternative was waiting for a Medusa release that bumps the AWS SDK and OpenTelemetry, which has no date.

**Each override names an exact version inside the same major.** `fast-xml-parser` stays on 5 and `protobufjs` stays on 7, so the AWS SDK and gRPC keep the API they were built against. The alternative was a range such as `>=5.5.6`, which lets a later install pick a new major silently.

**The image optimizer stays on.** Turning it off would remove the reachable advisory without a bump, but product images would ship unresized. The bump fixes the cause.

**The existing suites are the tests.** A dependency bump adds no behaviour, so no test is written. The baseline run before the bump is what every later run is compared to, as in `upgrade-node-26`.

## Risks / Trade-offs

- Next.js moves two minors, and the proxy, caching or Turbopack may behave differently. Mitigation: the storefront suite, the browser journeys and a production build run before the merge, and the security header journeys cover `front/proxy.ts`.
- An override hides a version the AWS SDK did not test. Mitigation: the versions stay inside the major. Local work uses the local file provider, so S3 is proven only by the staging upload in `tasks.md`.
- An override outlives its reason. Mitigation: a task note says to delete each one when Medusa resolves a fixed version by itself.

## Migration Plan

1. Merge. CI builds both images and deploys to staging.
2. The owner checks staging as listed in `tasks.md` under `## Outside this repo`.
3. Rollback is reverting the squash commit. No data changes.
