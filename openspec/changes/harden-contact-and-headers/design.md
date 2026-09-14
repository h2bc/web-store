## Context

See proposal.md for why. What shapes the approach:

- The storefront calls the API through its public domain, so the request reaches Medusa through Caddy. Caddy overwrites `X-Forwarded-For` with the caller's address unless `trusted_proxies` lists it, and Medusa hardcodes `trust proxy 1`, so the limiter sees the storefront's address.
- The contact action already forwards the visitor's address in `X-Forwarded-For`. After Caddy trusts the storefront, Medusa receives `visitor, storefront`.
- The browser never calls the Medusa API. Fonts are local. Images go through the framework's image route in production and straight from the local API in development. Stripe Elements and the YouTube embeds are the only third-party loads. Stripe address autocomplete is disabled, so no Google Maps.
- Every page already renders per request: the site header reads the cart cookie. Data is cached through `unstable_cache`, not the HTML. A nonce costs nothing extra.
- Next 16 has `proxy.ts` and stamps the nonce from the request's policy header onto its own scripts. Stripe.js injects its script tag from code, which `'strict-dynamic'` allows.
- The Radix components behind `front/components/ui` and the toaster set inline `style` attributes. A nonce covers `<style>` elements only.
- Stripe lists `https://js.stripe.com` and `https://*.js.stripe.com` for scripts and frames, `https://hooks.stripe.com` for redirect frames and `https://api.stripe.com` for connections.
- `siteUrl` and `isIndexable` read the environment at request time because the deploy repo owns runtime env and one image serves every environment.

## Goals / Non-Goals

**Goals:**

- Every page carries the eight headers, in production and in development, with the same policy shape.
- No `'unsafe-inline'` in `script-src`. The nonce and `'strict-dynamic'` form from the Next.js and OWASP guides.
- No `force-dynamic` flag. Runtime reads opt in with `connection()`.
- The limiter counts the visitor whether the message came through the storefront or straight to the API.

**Non-Goals:**

- A nonce for styles.
- HSTS preload or `includeSubDomains`.
- Cross-Origin-Embedder-Policy. Stripe states it does not support cross-origin isolation.
- Security headers on the API domain.
- Static pages or Partial Prerendering.

## Decisions

**1. All headers live in `front/proxy.ts`, not in Caddy or `next.config.ts`.** The nonce is per request, so the policy has to be built in the proxy, and one function building all eight keeps one place and one test. Alternative, a `header` block in the Caddy site, was rejected because the deploy repo would then have to track storefront dependencies. Alternative, the fixed headers in `next.config.ts` and only the policy in the proxy, was rejected as two places for one concern.

**2. `script-src` is `'self' 'nonce-<value>' 'strict-dynamic'` plus the two Stripe script origins, no `'unsafe-inline'`.** Next stamps the nonce on its hydration scripts. Stripe.js is loaded from a nonced script, so `'strict-dynamic'` allows it; the origins stay listed for browsers without it. JSON-LD blocks are data, not executed, so the policy ignores them. Alternative, the config-file form with `'unsafe-inline'`, was rejected because it is the weaker documented form and the pages are already per request.

**3. `style-src` keeps `'unsafe-inline'`.** Radix select, dialog, dropdown and popper, and the toaster, set `style` attributes, which only `'unsafe-inline'` allows. Inline CSS cannot run code and the OWASP strict policy does not cover it. Alternative, a style nonce as in the Next.js example, was rejected because it breaks every popover and toast.

**4. Development adds `'unsafe-eval'` to `script-src` and the local API image host, in a `NODE_ENV` branch.** React uses eval in development for server error stacks. Alternative, sending headers only in production, was rejected because a policy nobody runs locally breaks at deploy time.

**5. The other headers are `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin-allow-popups` and `Cross-Origin-Resource-Policy: same-site`.** These are the OWASP header list minus embedder policy. Opener policy allows popups so a redirect payment method that opens a window keeps its opener. Alternative, `same-origin`, was rejected for that reason.

**6. HSTS is one year, no `includeSubDomains`, no preload.** The storage, admin and API hosts share the parent domain and are not this repo's to lock in. Alternative, the full preload form, was rejected for that reason.

**7. The proxy matcher skips `_next/static`, `_next/image`, the favicon and router prefetches.** That is the matcher from the Next.js guide; those responses carry no HTML.

**8. `siteUrl` and `isIndexable` become async and `await connection()` before reading the environment. The `force-dynamic` flags go from the layout, robots, sitemap and the checkout pages.** The read itself declares that it needs a request, which is the documented idiom. Pages stay per request through the cart cookie and the nonce; robots and sitemap through the helper. Alternative, `NEXT_PUBLIC_` build args as in the Medusa starter, was rejected because the deploy repo owns runtime env and the image would become per environment.

**9. The limiter's `keyGenerator` takes the first `X-Forwarded-For` entry through the library's `ipKeyGenerator`, falling back to `req.ip`.** With Caddy trusting the storefront the first entry is the visitor; for a direct caller Caddy sets it to the caller, so it cannot be spoofed. The helper normalises IPv6 so the library's key validation stays quiet. Alternative, an internal API URL for the storefront so the request skips Caddy, was rejected because the storefront has one backend URL and the browser-side redirect flows need the public one.

**10. Caddy gets `trusted_proxies private_ranges` on the API host only.** That is the smallest change that appends instead of overwriting, and only containers on the proxy network are private. Alternative, listing the storefront container's address, was rejected because compose assigns it.

**11. One Vitest file calls `proxy()` with a `NextRequest`.** `front/tests/security-headers.test.ts`, unit level, asserts the eight headers, the nonce in `script-src` and its absence of `'unsafe-inline'`, the origins, `frame-ancestors 'none'`, and that two calls give two nonces. Alternative, an e2e request check, was rejected because the proxy is pure and the suite would need both apps up.

## Risks / Trade-offs

- A script the nonce misses fails silently for users and loudly in the console; task 2.5 walks the pages with the console open.
- Stripe adds a new origin in a later release and the checkout breaks; the policy is one place to update and the checkout e2e journey catches it.
- A route the proxy matcher misses ships without headers; the test asserts the matcher and the browser check reads the headers on real responses.
- Until the Caddy change is deployed the first forwarded entry is still the storefront's address, so the shared bucket stays; the API change alone is harmless.
- A direct caller who is on a private range, that is another container, can forge the first entry; nothing on that network is untrusted.
- The storefront calls the API through the public domain, so Docker may route the call out and back in and Caddy sees the host's public address, which `private_ranges` does not match. The API log after the deploy shows which address arrived; if it is the host's, `trusted_proxies` lists that address instead.
