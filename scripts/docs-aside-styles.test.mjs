// Compiles DocsAside.scss and checks the per-variant inline-code background.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const root = fileURLToPath(new URL('..', import.meta.url));
const { css } = sass.compile(`${root}src/components/mdx/DocsAside/DocsAside.scss`, {
  loadPaths: [`${root}node_modules`],
});

for (const type of ['info', 'warning', 'note']) {
  test(`inline code inside a ${type} aside reads --igd-aside-${type}-code-background`, () => {
    const rule = new RegExp(
      `\\.igd-aside--${type} \\.igd-aside__content :not\\(pre\\) > code \\{[^}]*` +
        `background: var\\(--igd-aside-${type}-code-background\\)`,
    );
    assert.match(css, rule);
  });
}

test('fenced blocks inside an aside keep the code theme background', () => {
  assert.doesNotMatch(css, /pre(\s*>)?\s*code\s*\{[^}]*code-background/);
});
