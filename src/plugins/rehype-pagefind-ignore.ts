import { defineHastPlugin } from 'satteri';

/**
 * Marks code with `data-pagefind-ignore` so Pagefind doesn't index it.
 *
 * Code is full of one-letter tokens (generics `T`, escapes `\t`) that Pagefind
 * matches via weak prefix fallback — a search for "twitter" hits the `t` in
 * `keyof T` across unrelated pages. Excluding `<pre>` (and single-char inline
 * `<code>`) removes that noise; real inline `<code>` like `dataSource` stays.
 */
export function rehypePagefindIgnore() {
  return defineHastPlugin({
    name: 'pagefind-ignore',
    element: {
      filter: ['pre', 'code'],
      visit(node, ctx) {
        // Fenced code blocks (covers their inner <code> via subtree ignore).
        if (node.tagName === 'pre') {
          ctx.setProperty(node, 'data-pagefind-ignore', 'all');
          return;
        }

        // Inline code that reduces to a single alphanumeric token.
        const token = ctx.textContent(node).replace(/[^a-z0-9]/gi, '');
        if (token.length <= 1) {
          ctx.setProperty(node, 'data-pagefind-ignore', 'all');
        }
      },
    },
  });
}
