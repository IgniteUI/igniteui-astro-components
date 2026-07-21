import { visit } from 'unist-util-visit';

let _counter = 0;

/**
 * Rehype plugin that wraps every <table> in a scroll container div.
 * The wrapper is fully accessible per the recommendations in:
 * https://piccalil.li/blog/styling-tables-the-modern-css-way/
 *
 * - role="region" + aria-labelledby pointing to the <caption> (or a generated id)
 * - tabindex="0" makes the scroll region keyboard-focusable
 */
export function rehypeTableWrapper() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== 'table' || !parent || index == null) return;

      // Find an existing <caption> to use as the accessible label.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caption = node.children?.find((c: any) => c.tagName === 'caption');
      let labelId: string;

      if (caption) {
        // Reuse or assign an id on the caption element.
        labelId = caption.properties?.id || `igd-table-caption-${++_counter}`;
        caption.properties = { ...caption.properties, id: labelId };
      } else {
        // No caption — generate a unique id for the wrapper itself.
        labelId = `igd-table-${++_counter}`;
      }

      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['igd-table-wrapper'],
          role: 'region',
          'aria-labelledby': labelId,
          tabIndex: 0,
        },
        children: [node],
      };

      parent.children[index] = wrapper;
    });
  };
}
