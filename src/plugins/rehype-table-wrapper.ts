import { defineHastPlugin } from 'satteri';

/**
 * Sätteri HAST plugin that wraps every <table> in a scroll container div.
 * The wrapper is fully accessible per the recommendations in:
 * https://piccalil.li/blog/styling-tables-the-modern-css-way/
 *
 * - role="region" + aria-labelledby pointing to the <caption> (or a generated id)
 * - tabindex="0" makes the scroll region keyboard-focusable
 *
 * Exported as a factory so Sätteri calls it once per document, resetting the id
 * counter — these ids only have to be unique within a single page.
 */
export function rehypeTableWrapper() {
  let counter = 0;

  return defineHastPlugin({
    name: 'table-wrapper',
    element: {
      filter: ['table'],
      visit(node, ctx) {
        // Find an existing <caption> to use as the accessible label.
        const caption = node.children?.find((c) => c.type === 'element' && c.tagName === 'caption');
        let labelId: string;

        if (caption && caption.type === 'element') {
          // Reuse or assign an id on the caption element.
          const existing = caption.properties?.id;
          labelId =
            typeof existing === 'string' && existing ? existing : `igd-table-caption-${++counter}`;
          ctx.setProperty(caption, 'id', labelId);
        } else {
          // No caption — generate a unique id for the wrapper itself.
          labelId = `igd-table-${++counter}`;
        }

        ctx.wrapNode(node, {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['igd-table-wrapper'],
            role: 'region',
            'aria-labelledby': labelId,
            tabIndex: 0,
          },
          children: [],
        });
      },
    },
  });
}
