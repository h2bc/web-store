// Generates cfg.dtsPropsFor from the TypeScript sources. The converter's
// synth-entry mode has no .d.ts tree to read props from, so this feeds the
// design-system barrel through the converter's own extractor (propsBodyFor)
// and stores the resulting <Name>Props bodies in .design-sync/config.json.
// Run from the repo root after staging .ds-sync/: node .design-sync/gen-dts-props.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { propsBodyFor } from '../.ds-sync/lib/dts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, '.ds-sync/package.json'));
const { Project } = require('ts-morph');

const front = resolve(root, 'front');
const entry = resolve(front, 'design-system/index.tsx');
const project = new Project({
  tsConfigFilePath: resolve(front, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});
project.addSourceFileAtPath(entry);
project.resolveSourceFileDependencies();

// pkgDir scopes the <Name>Props lookup to the storefront's own components
// (front/node_modules would otherwise match, e.g. Radix's SelectProps).
const ctx = { project, entry, pkgDir: resolve(front, 'components').split('\\').join('/') + '/' };
const cfgPath = resolve(root, '.design-sync/config.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const out = {};
const missing = [];
for (const name of Object.keys(cfg.componentSrcMap)) {
  const r = propsBodyFor(name, ctx);
  // A component whose signature takes no props gets an explicit empty contract
  // rather than the converter's `[key: string]: unknown` stub.
  if (r?.body?.trim()) out[name] = r.body;
  else { out[name] = '  // no props'; missing.push(name); }
}
cfg.dtsPropsFor = out;
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
console.error(`gen-dts-props: ${Object.keys(out).length} props bodies` + (missing.length ? `; no props for: ${missing.join(', ')}` : ''));
