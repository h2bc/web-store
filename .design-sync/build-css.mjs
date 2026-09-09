// Compiles the storefront's Tailwind v4 globals.css (plus the design-sync entry's
// safelist) into a static stylesheet the converter ships as cssEntry.
// Run from the repo root: node .design-sync/build-css.mjs
import { createRequire } from 'node:module';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const front = resolve(here, '../front');
// Resolve postcss through the plugin's own dependency tree (pnpm keeps it there).
const require = createRequire(realpathSync(resolve(front, 'node_modules/@tailwindcss/postcss/package.json')));
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

const input = resolve(here, 'tailwind-entry.css');
const out = resolve(front, '.ds-sync-styles.css');
const result = await postcss([tailwind({ base: front, optimize: false })]).process(readFileSync(input, 'utf8'), {
  from: input,
  to: out,
});
writeFileSync(out, result.css);
console.error(`build-css: wrote ${out} (${(result.css.length / 1024).toFixed(0)} KB)`);
