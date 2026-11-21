// Compiles docs-tree.scss and checks the TOC active-label rule reaches past the expand icon.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const root = fileURLToPath(new URL('..', import.meta.url));
const { css } = sass.compile(`${root}src/components/DocsTree/docs-tree.scss`, {
  loadPaths: [`${root}node_modules`],
});

test('the active TOC label rule uses the general sibling combinator', () => {
  assert.match(css, /\.docs-tree-link\[aria-current=true\] ~ \.docs-tree-label \{/);
  assert.doesNotMatch(css, /\[aria-current=true\] \+ \.docs-tree-label/);
});
