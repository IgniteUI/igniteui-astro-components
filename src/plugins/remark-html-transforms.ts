/**
 * Sätteri MDAST plugin: inline HTML transforms.
 *
 * Handles legacy HTML patterns in markdown content:
 *   - `<div class="divider--half"></div>` → `<hr/>`
 *   - Normalizes code block language identifiers to lowercase
 */

import { defineMdastPlugin } from 'satteri';

const DIVIDER_PATTERN = /<div\s+class="divider--half"\s*>\s*<\/div>/g;
const IMG_SRC_PATTERN = /src="(\.\.\/)+images\//g;

/** Sätteri MDAST plugin that transforms legacy HTML patterns in the AST. */
export function remarkHtmlTransforms() {
  return defineMdastPlugin({
    name: 'html-transforms',

    // Inline HTML: divider → hr, relative img src → root-relative
    html(node, ctx) {
      if (!node.value) return;
      const value = node.value
        .replace(DIVIDER_PATTERN, '<hr/>')
        .replace(IMG_SRC_PATTERN, 'src="/images/');
      if (value !== node.value) ctx.setProperty(node, 'value', value);
    },

    // Code blocks: normalize language to lowercase
    code(node, ctx) {
      if (!node.lang) return;
      const lang = node.lang.toLowerCase();
      if (lang !== node.lang) ctx.setProperty(node, 'lang', lang);
    },
  });
}
