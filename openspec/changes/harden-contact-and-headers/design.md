## Context

See proposal.md for why. What shapes the approach:

- The storefront calls the API through its public domain, so the request reaches Medusa through Caddy. Caddy overwrites `X-Forwarded-For` with the caller's address unless `trusted_proxies` lists it, and Medusa hardcodes `trust proxy 1`, so the limiter sees the storefront's address.
- The contact action already forwards the visitor's address in `X-Forwarded-For`. After Caddy trusts the storefront, Medusa receives `visitor, storefront`.
- The browser never calls the Medusa API. Fonts are local. Images go through the framework's image route in production and straight from the local API in development. Stripe Elements and the YouTube embeds are the only third-party loads. Stripe address autocomplete is disabled, so no Google Maps.
- Every page already renders per request: the site header reads the cart cookie and the root layout carries `force-dynamic`. Data is cached through `unstable_cache`, not the HTML. A nonce costs nothing extra.
- Next 16 has `proxy.ts` and stamps the nonce from the request's policy header onto its own scripts. Stripe.js injects its script tag from code, which `'strict-dynamic'` allows.
- The Radix components behind `front/components/ui` and the toaster set inline `style` attributes. A nonce covers `<style>` elements only.
- Stripe lists `https://js.stripe.com` and `https://*.js.stripe.com` for scripts and frames, `https://hooks.stripe.com` for redirect frames and `https://api.stripe.com` for connections.

## Goals / Non-Goals

**Goals:**

- Every page carries the eight headers, in production and in development, with the same policy shape.
- No `'unsafe-inline'` in `script-src`. The nonce and `'strict-dynamic'` form from the Next.js and OWASP guides.
- The limiter counts the visitor whether the message came through the storefront or straight to the API.

**Non-Goals:**

- A nonce for styles.
- HSTS preload or `includeSubDomains`.
- Cross-Origin-Embedder-Policy. Stripe states it does not support cross-origin isolation.
- Security headers on the API domain.
- Static pages, Partial Prerendering or the `force-dynamic` flags. How runtime config reaches the image is a separate decision.

## Decisions

**1. All headers live in `front/proxy.ts`, not in Caddy or `next.config.ts`.** The nonce is per request, so the policy has to be built in the proxy, and one function building all eight keeps one place and one test. Alternatives, a `header` block in the Caddy site and the fixed headers in `next.config.ts`, were rejected: the first makes the deploy repo track storefront dependencies, the second is two places for one concern.

**2. `script-src` is `'self' 'nonce-<value>' 'strict-dynamic' 'wasm-unsafe-eval'` plus the two Stripe script origins, no `'unsafe-inline'`.** Next stamps the nonce on its own scripts, `'strict-dynamic'` lets them load Stripe.js, the Stripe origins cover browsers without it, and `'wasm-unsafe-eval'` lets the landing page compile WebAssembly without allowing `eval`. Alternative, the config-file form with `'unsafe-inline'`, was rejected because it is the weaker documented form and the pages are already per request.

**3. `style-src` keeps `'unsafe-inline'`.** Radix select, dialog, dropdown and popper, and the toaster, set `style` attributes, which only `'unsafe-inline'` allows, and inline CSS cannot run code. Alternative, a style nonce as in the Next.js example, was rejected because it breaks every popover and toast.

**4. Development adds `'unsafe-eval'` to `script-src` and the local API image host, in a `NODE_ENV` branch.** React uses eval in development for server error stacks. Alternative, sending headers only in production, was rejected because a policy nobody runs locally breaks at deploy time.

**5. The other headers are `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin-allow-popups` and `Cross-Origin-Resource-Policy: same-site`.** These are the OWASP header list minus embedder policy. Opener policy allows popups so a redirect payment method that opens a window keeps its opener, which is why `same-origin` was rejected.

**6. HSTS is one year, no `includeSubDomains`, no preload.** The storage, admin and API hosts share the parent domain and are not this repo's to lock in. Alternative, the full preload form, was rejected for that reason.

**7. The proxy matcher skips `_next/static`, `_next/image`, the favicon and router prefetches.** That is the matcher from the Next.js guide; those responses carry no HTML.

**8. The limiter keys on the client address `proxy-addr` resolves, trusting loopback and private ranges.** It is the algorithm behind Express `trust proxy`, which Medusa pins to 1, and it ignores forged entries on the left of the forwarded chain. Alternatives, the first forwarded entry and an internal API URL that skips Caddy, were rejected: the first is whatever the sender wrote, and the storefront has one backend URL that the browser redirect flows also need.

**9. Caddy gets `trusted_proxies private_ranges` on the API host only.** That is the smallest change that appends instead of overwriting, and only containers on the proxy network are private. Alternative, listing the storefront container's address, was rejected because compose assigns it.

**10. One Vitest file calls `proxy()` with a `NextRequest`.** `front/tests/security-headers.test.ts`, unit level, asserts the eight headers, the nonce in `script-src` and its absence of `'unsafe-inline'`, the origins, `frame-ancestors 'none'`, and that two calls give two nonces. Alternative, an e2e request check, was rejected because the proxy is pure and the suite would need both apps up.

## Risks / Trade-offs

- A script the nonce misses fails silently for users and loudly in the console; task 2.3 walks the pages with the console open.
- Stripe adds a new origin in a later release and the checkout breaks; the policy is one place to update and the checkout e2e journey catches it.
- A route the proxy matcher misses ships without headers; the test asserts the matcher and the browser check reads the headers on real responses.
- Until the Caddy change is deployed the first forwarded entry is still the storefront's address, so the shared bucket stays; the API change alone is harmless.
- A direct caller who is on a private range, that is another container, can forge the first entry; nothing on that network is untrusted.
- The storefront calls the API through the public domain, so Docker may route the call out and back in and Caddy sees the host's public address, which `private_ranges` does not match. The API log after the deploy shows which address arrived; if it is the host's, `trusted_proxies` lists that address instead.
