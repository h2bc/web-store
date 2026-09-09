# design-sync notes (h2bc storefront)

The design system is the Next.js storefront in `front/` (no Storybook, no
library build). Sync runs from the repo root; config home is `.design-sync/`.

## How the build is wired
- `front/design-system/index.tsx` is the synced surface: a barrel re-exporting
  `components/ui/*` plus the app components that render without the Next.js
  runtime. `cfg.srcDir` points at that directory so the converter's synth entry
  is exactly this barrel. Add a component = add a line there + a
  `componentSrcMap` pin (the pin gives it its real source path, hence its group
  and JSDoc). The barrel lives under `front/` (not `.design-sync/`) so the
  group derivation from real paths yields `general` for `components/ui`.
- `cfg.entry` is a deliberately non-existent `front/dist/index.js`: it only
  tells the converter the package dir is `front/` (it walks up from the entry);
  the `[NO_DIST] ... synthesizing` lines on every build are expected.
- `front/design-system/next-runtime-shim.ts` defines `globalThis.process.env`
  and sets `__NEXT_IMAGE_OPTS` to `unoptimized` so `next/link` / `next/image`
  work in a plain browser (Next's client modules read `process.env.__NEXT_*` at
  module init). It must stay the barrel's first import.
- `cfg.buildCmd` runs two repo-owned scripts before the converter:
  `.design-sync/build-css.mjs` compiles Tailwind v4 (`front/app/globals.css`
  via `.design-sync/tailwind-entry.css`, sources = components + app + previews
  + an inline safelist of layout/typography/color utilities for the design
  agent's own glue) into `front/.ds-sync-styles.css` (gitignored, = `cssEntry`);
  `.design-sync/gen-dts-props.mjs` feeds the barrel through the converter's own
  `propsBodyFor` (ts-morph over the TS sources, `front/tsconfig.json` paths)
  and writes `cfg.dtsPropsFor` for every pinned component - synth mode has no
  `.d.ts` tree, so without this every contract is `[key: string]: unknown`.
  `dtsPropsFor` is therefore GENERATED - never hand-edit it, re-run buildCmd.
- Fonts: `.design-sync/fonts.css` ships UnifrakturMaguntia and Edwardian
  Script ITC from `front/public/fonts`; `tailwind-entry.css` sets
  `--font-unifraktur` / `--font-edwardian` on `:root` (next/font sets them on
  `<body>` in the app).
- Converter deps live in `.ds-sync/` (gitignored): `esbuild ts-morph
  @types/react playwright@1.63.0` (playwright pinned to the cached
  chromium-1243 build; the repo's `@playwright/test` is the same version).

## Excluded from the surface (need the Next runtime or app data)
AddressStep, DeliveryStep, PaymentStep (server actions, Stripe), ContactForm,
CartLineItem, CartPreview, CartPreviewItem, CheckoutSummary (all wrap
CartLineItem: server actions + next/navigation), FooterBar, SiteHeader,
NavLinks, BurgerMenu, HeaderLogo, RegionSelector, MobileRegionSelector
(next/navigation hooks), ProductDetails, ProductImageCarousel,
ProductImageModal, Logo3DViewer (three.js / model-viewer), JsonLd,
ClientToastErrorHandler (not visual).

## Repo change made for the sync (2026-09-09)
- Removed the dead `validateQueryParams` helper (and its `next/server` + `zod`
  imports) from `front/lib/utils.ts`: nothing called it, and `next/server`
  pulled Node-only code (`__dirname`) into the browser bundle via `cn()`.

## Preview authoring gotchas
- Previews import from `'h2bc-web-front'`; `lucide-react` and `react-icons`
  imports bundle fine. Tailwind classes used only in previews are compiled
  because `.design-sync/previews` is a `@source` - but only on a full
  `buildCmd` + `package-build` run; `preview-rebuild.mjs` does not recompile
  CSS, so stick to utilities the components/pages already use or the safelist.
- Overlay components (DropdownMenu, Select, Sheet, Toaster) use
  `cfg.overrides.<Name>: {cardMode: 'single', viewport}`; render them `open`
  / `defaultOpen` in the preview.

## Preview authoring gotchas (from the authoring wave)
- `react-hook-form`'s `useForm` bundles from a preview; seed errors with
  `form.setError` in a `useEffect`. Import `toast` from `sonner` directly;
  `useTheme()` without a ThemeProvider falls back to `system`.
- Stepper and SizeSelector are controlled: previews wrap them in a small
  `React.useState` component.
- The repo has no product photos (Medusa serves them); ProductCard /
  ProductCardImage / ProductGrid previews build inline SVG data-URL garment
  silhouettes. `ProductCardImage` uses `fill` and needs a
  `relative aspect-square w-*` parent or it renders empty without error.
  `ProductGrid` returns a fragment, so the preview supplies the `grid` box.
- Default grid cell is ~650x530px: two rows of `max-w-sm` product cards get
  clipped, so the grid stories use one `grid-cols-4` row (or would need a
  `cardMode` override).
- Utilities missing from the compiled CSS that previews reached for: `w-80`,
  `w-96` (safelist stops at `w-64`; use `max-w-xs/sm`), and the app's own
  `text-md` (not a Tailwind v4 class - app nit in CategoryFilter/SizeSelector).
- `toast` is exported from the barrel on purpose: sonner keeps a module-level
  store, so a preview (or design) importing sonner separately gets a second
  copy whose toasts never reach the bundled `Toaster`.
- Hover-image variants can't show statically (hover layer is `opacity-0`).
- The capture browser's clock is not today's date: RightsNotice prints an
  older year in sheets. Harmless.
- Changing `cfg.overrides` for a component makes `preview-rebuild.mjs`
  refuse it with `[CONFIG_STALE]` until a full `package-build.mjs` re-stamps
  the keys - set overrides BEFORE a wave's full build, not during it.

## Known render warns
- (none)

## Re-sync risks
- `dtsPropsFor` is regenerated by buildCmd; if a component's props go empty
  the gen script prints `no props for: ...` - expected only for
  NoProductsLabel, ProductCardSkeleton, RightsNotice, SocialIcons.
- The Tailwind safelist in `tailwind-entry.css` is hand-curated; new theme
  tokens in `globals.css` need matching entries to reach the design agent.
- Next major upgrades may change what `next/link` / `next/image` read from
  `process.env`; the shim is the first place to look when cards throw
  `process is not defined` / images 404 to `/_next/image`.
