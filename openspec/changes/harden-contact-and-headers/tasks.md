## 1. API: rate limit keyed on the visitor

- [ ] 1.1 In `api/tests/contact.test.ts`, integration level, add the "Two visitors through the storefront" scenario: exhaust five messages with `x-forwarded-for: 10.0.0.6, 172.16.0.2`, then post once with `10.0.0.7, 172.16.0.2`; verify `pnpm test:api` runs it and it fails because the second visitor gets 429 today.
- [ ] 1.2 In `api/src/api/middlewares.ts` give `contactRateLimit` a `keyGenerator` that takes the first `x-forwarded-for` entry through `ipKeyGenerator`, falling back to `req.ip`; verify `pnpm test:api` passes and `pnpm typecheck:api` and `pnpm lint:api` pass.

## 2. Storefront: security headers

- [ ] 2.1 Create `front/tests/security-headers.test.ts`, unit level, importing `proxy` and `config` from `front/proxy.ts` and calling `proxy(new NextRequest('http://localhost:3000/'))`: the response carries the eight headers, `script-src` contains a `'nonce-'` value, `'strict-dynamic'`, `https://js.stripe.com` and `https://*.js.stripe.com` and not `'unsafe-inline'`, `style-src` contains `'unsafe-inline'`, `frame-src` contains `https://js.stripe.com`, `https://*.js.stripe.com`, `https://hooks.stripe.com` and `https://www.youtube.com`, `connect-src` contains `https://api.stripe.com`, `img-src` contains `https://storage.h2bcweb.com`, the policy contains `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'` and `form-action 'self'`, the request header `x-nonce` equals the nonce, two calls give two nonces, and the matcher skips `_next/static`; verify `pnpm test:front` runs it and it fails because the module does not exist.
- [ ] 2.2 Create `front/proxy.ts` with the matcher from the Next.js guide, a nonce from `crypto.randomUUID()` in base64, one function building the policy from a list of directives and the `NODE_ENV` branch that adds `'unsafe-eval'` to `script-src` and `http://localhost:9000` to `img-src` outside production, and the seven fixed headers from the design; set the policy and `x-nonce` on the request headers and every header on the response; verify `pnpm test:front`, `pnpm typecheck:front` and `pnpm lint:front` pass.
- [ ] 2.3 With both apps up, open `http://localhost:3000/`, a product page, the gallery, the contact page and the checkout payment step in the Playwright MCP browser; open a select and trigger a toast; verify the response carries the eight headers, the page source shows the nonce on the framework scripts, the browser console shows no CSP violation, the YouTube player and the Stripe elements render, and a screenshot of the payment step is saved under `.tmp/`.

## 3. Docs

- [ ] 3.1 In `docs/architecture.md`, under Storefront, add that `front/proxy.ts` sets the security headers and the content policy with a nonce per request; under Backend, add that the contact limiter keys on the first forwarded address because the storefront calls the API through the proxy; verify `grep -n "Content-Security-Policy\|first forwarded" docs/architecture.md` finds two lines.

## 4. Verification

- [ ] 4.1 Run `pnpm lint`, `pnpm format`, `pnpm typecheck:api`, `pnpm typecheck:front`, `pnpm test:front`, `pnpm test:api` and `pnpm test:e2e`; verify all pass.

## Outside this repo

- In `server-proxy-deploy/Caddyfile.d/web-store.caddy`, add `trusted_proxies private_ranges` inside the API `reverse_proxy` block and deploy it. Proof: after the deploy, two contact messages from two different networks within 15 minutes both get 200 once one of them has already sent five, and the API log shows the visitor address on the request. If the log shows the host's public address instead, replace `private_ranges` with that address and redeploy.

## Review findings

None.
