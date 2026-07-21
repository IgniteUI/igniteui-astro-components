import { visit } from 'unist-util-visit';

/**
 * Marks code with `data-pagefind-ignore` so Pagefind doesn't index it.
 *
 * Code is full of one-letter tokens (generics `T`, escapes `\t`) that Pagefind
 * matches via weak prefix fallback — a search for "twitter" hits the `t` in
 * `keyof T` across unrelated pages. Excluding `<pre>` (and single-char inline
 * `<code>`) removes that noise; real inline `<code>` like `dataSource` stays.
 */

// Concatenate all descendant text of a HAST node.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function textContent(node: any): string {
  if (node.type === 'text') return node.value ?? '';
  if (!node.children) return '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return node.children.map((c: any) => textContent(c)).join('');
}

export function rehypePagefindIgnore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'element', (node: any) => {
      const ignore = () => {
        node.properties = { ...node.properties, 'data-pagefind-ignore': 'all' };
      };

      // Fenced code blocks (covers their inner <code> via subtree ignore).
      if (node.tagName === 'pre') return ignore();

      // Inline code that reduces to a single alphanumeric token.
      if (node.tagName === 'code') {
        const token = textContent(node).replace(/[^a-z0-9]/gi, '');
        if (token.length <= 1) ignore();
      }
    });
  };
}
