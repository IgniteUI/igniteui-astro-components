/**
 * Checks that llms-full.txt builds, llms.txt covers every export and README
 * with working links, every exported component has a README, and both files
 * are published.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLlmsFull, listReadmes } from './build-llms.mjs';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');
const pkg = JSON.parse(read('package.json'));
const llmsTxt = read('llms.txt');

const exportKeys = Object.keys(pkg.exports).filter(
  (key) => key !== '.' && key !== './package.json',
);

test('llms-full.txt builds from llms.txt and every README', () => {
  const full = buildLlmsFull(rootDir);
  assert.ok(full.includes('## llms.txt\n'), 'llms.txt section missing');
  assert.ok(full.includes('## README.md\n'), 'README section missing');
  for (const rel of listReadmes(rootDir)) {
    assert.ok(full.includes(`## ${rel}\n`), `${rel} section missing`);
  }
});

test('llms.txt mentions every exported subpath', () => {
  const missing = exportKeys.filter((key) => !llmsTxt.includes(`${pkg.name}/${key.slice(2)}`));
  assert.deepEqual(missing, [], `Add these exports to llms.txt: ${missing.join(', ')}`);
});

test('llms.txt links every component README', () => {
  const missing = listReadmes(rootDir).filter((rel) => !llmsTxt.includes(`](${rel})`));
  assert.deepEqual(missing, [], `Link these READMEs from llms.txt: ${missing.join(', ')}`);
});

test('every relative link in llms.txt resolves', () => {
  const targets = [...llmsTxt.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1])
    .filter((target) => !/^(https?:|mailto:|#)/.test(target))
    .map((target) => target.split('#')[0]);
  const broken = targets.filter((target) => !fs.existsSync(path.join(rootDir, target)));
  assert.deepEqual(broken, [], `Broken links in llms.txt: ${broken.join(', ')}`);
});

test('every exported .astro component has a README beside it', () => {
  const missing = exportKeys
    .map((key) => pkg.exports[key])
    .filter((target) => typeof target === 'string' && target.endsWith('.astro'))
    .map((target) => path.posix.join(path.posix.dirname(target), 'README.md'))
    .filter((readme, index, all) => all.indexOf(readme) === index)
    .filter((readme) => !fs.existsSync(path.join(rootDir, readme)));
  assert.deepEqual(missing, [], `Write these READMEs: ${missing.join(', ')}`);
});

test('llms files are published with the package', () => {
  for (const file of ['llms.txt', 'llms-full.txt']) {
    assert.ok(pkg.files.includes(file), `package.json#files must include ${file}`);
  }
  assert.equal(pkg.scripts.prepack, 'npm run build:llms', 'prepack must build llms-full.txt');
});
