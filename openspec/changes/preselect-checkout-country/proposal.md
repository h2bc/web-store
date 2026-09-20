## Why

The checkout address form always preselects Lithuania, so every buyer abroad changes the country by hand. Cloudflare already tells the storefront the visitor's country on every request, so the form can start on the right one.

## What Changes

- The address step preselects the visitor's country when the shop ships there, so an EU buyer skips one field.
- An unknown or unsupported country still preselects Lithuania, so nothing changes for everyone else.
- A cart with a saved shipping address keeps its country, as today.
- Nothing is stored on the device and the browser never asks for location, so no consent is needed.

Source: Deck card 250, https://cloud.h2bcweb.com/index.php/apps/deck/board/3/card/250.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `storefront-region`: the requirement `Checkout offers every shipped-to country` preselects the visitor's country instead of always Lithuania.

## Impact

- `front/app/(main)/checkout/page.tsx` reads the `cf-ipcountry` request header on the address step.
- `front/components/checkout/address-step.tsx` takes the default country as a prop.
- `front/lib/store.ts` gains the pure function that picks the default country.
- `front/tests/` and `tests/checkout.test.ts` gain the new scenarios.
- `docs/architecture.md` states where the checkout default country comes from.
- No new dependency, env key, API change or Caddy change.
- Production needs its DNS record proxied through Cloudflare, like dev.
