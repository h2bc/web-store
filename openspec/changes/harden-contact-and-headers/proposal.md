## Why

A security test of the contact form found the storefront sends no security headers, and its throttle hit after two messages instead of five. The code review behind it showed the limit keys on the storefront's own address, so every visitor shares one bucket.

## What Changes

- The storefront sends a Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy on every page, so the page cannot be framed, sniffed or loaded over plain HTTP, and only known origins run scripts or frames.
- The script policy is the strict form from the Next.js and OWASP guides: a nonce per request and `'strict-dynamic'`, no `'unsafe-inline'` for scripts.
- Runtime config reads opt into per-request rendering with `connection()`, so the `force-dynamic` flags go.
- The contact rate limit keys on the visitor's address as forwarded by the storefront, not on the storefront's own address, so one visitor cannot exhaust the limit for everyone.
- The proxy in front of the API trusts the storefront as a proxy, so the visitor's address survives the hop. This lives in `server-proxy-deploy`.

## Capabilities

### New Capabilities
- `storefront-security-headers`: the response headers every storefront page carries and the origins the policy allows.

### Modified Capabilities
- `storefront-contact`: the spam requirement names whose address the limit counts when the request comes through the storefront.

## Impact

- `front/proxy.ts` (new): the nonce and the headers.
- `front/tests/security-headers.test.ts` (new).
- `front/lib/seo.ts`, `front/app/layout.tsx`, `front/app/robots.ts`, `front/app/sitemap.ts`, the checkout pages: `connection()` instead of `force-dynamic`.
- `api/src/api/middlewares.ts`: the rate-limit key.
- `api/tests/contact.test.ts`: one new case.
- `docs/architecture.md`: one bullet each.
- `server-proxy-deploy/Caddyfile.d/web-store.caddy`: `trusted_proxies` on the API host.
