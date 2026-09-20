## Context

- The default country is set in one place, `front/components/checkout/address-step.tsx`, as `saved?.country_code ?? DEFAULT_COUNTRY_CODE`.
- `front/app/(main)/checkout/page.tsx` is `force-dynamic` and already builds `countryCodes`, uppercase, from the cart region.
- Every storefront domain is proxied through Cloudflare, then the self-hosted Caddy. Checked on `https://dev.h2bcweb.com`: `server: cloudflare`, `via: 1.1 Caddy`.
- Cloudflare adds `CF-IPCountry` to every proxied request by default. Caddy's `reverse_proxy` forwards request headers unchanged.

## Goals / Non-Goals

**Goals:**

- The address form starts on the visitor's country when the shop ships there.
- No new dependency, env key, cookie or client code.

**Non-Goals:**

- Prices, regions and product queries. `DEFAULT_COUNTRY_CODE` in `front/lib/data/products.ts` stays as it is.
- A country selector outside checkout.
- Trusting the header for anything beyond a form default.

## Decisions

**Read Cloudflare's `CF-IPCountry` header.** The edge already resolved the IP to a country, so the storefront reads one header through `headers()` from `next/headers`. The alternative was the `maxmind` package with a GeoLite2 database on a volume, which adds a dependency, a licence key and a refresh job for a value we already receive. A Caddy GeoIP plugin was also considered and dropped, because it needs a custom Caddy build on a single-maintainer plugin at the front door of the whole site.

**Pick the default in a pure function in `front/lib/store.ts`.** `getDefaultCountryCode(visitorCountry, countryCodes)` returns the visitor's country when it is in `countryCodes`, and `DEFAULT_COUNTRY_CODE` otherwise. It sits next to the constant it falls back to and needs no mocks in Vitest. The alternative was inlining the check in the page, which leaves the fallback rules untested below the e2e level.

**The page reads the header, the component takes a prop.** The checkout page reads `cf-ipcountry`, calls the function and passes `defaultCountryCode` to `AddressStep`, which uses `saved?.country_code ?? defaultCountryCode`. The component stays a client component with no server import. The alternative was a data-layer read in `front/lib/data/`, which is for backend calls and this is not one.

**No special case for Cloudflare's `XX` and `T1`.** Unknown and Tor values are not in the region list, so the membership check already sends them to Lithuania. The alternative was an explicit deny list, which is code for a case that cannot occur.

**The e2e test adds the header to storefront requests only.** The `CheckoutPage` page object gets a `visitFrom(country)` action that uses `page.route` on the storefront origin to add `cf-ipcountry`. The alternative was `extraHTTPHeaders`, which also lands on Stripe's cross-origin requests and breaks their CORS preflight.

## Risks / Trade-offs

- A request that bypasses Cloudflare can fake the header. It only changes a form default, so nothing is gained by it.
- The header is missing when Cloudflare's visitor location setting is off or the DNS record is not proxied. The form then shows Lithuania, which is today's behaviour.
- A VPN or a traveller gets the wrong guess. The shopper changes the country as they do today.
- Local dev and CI have no header, so they show Lithuania and the existing e2e test keeps passing.
