import { visit } from 'unist-util-visit';
import Slugger from 'github-slugger';

const HEADING_TAGS = new Set(['h2', 'h3', 'h4', 'h5', 'h6']);

// Extract the text content of a hast node (ignores child elements, reads text/raw nodes).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function textContent(node: any): string {
  let text = '';
  visit(node, (child) => {
    if (child.type === 'text' || child.type === 'raw') text += child.value ?? '';
  });
  return text;
}

/**
 * Rehype plugin that appends a copy-link icon button to every heading
 * (h2–h6).
 *
 * Runs before Astro's internal `rehypeHeadingIds` pass so it must
 * generate its own slug using the same `github-slugger` algorithm.
 * If the heading already has an `id` (e.g. set in raw HTML), it is reused.
 * Headings without an existing id get one assigned here — `rehypeHeadingIds`
 * will then see the id already present and skip re-assigning it, ensuring
 * the button href and the heading's id always match.
 */
export function rehypeHeadingAnchors() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    const slugger = new Slugger();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'element', (node: any) => {
      if (!HEADING_TAGS.has(node.tagName)) return;

      node.properties ??= {};

      // Reuse an existing id or generate one from heading text.
      if (typeof node.properties.id !== 'string') {
        node.properties.id = slugger.slug(textContent(node));
      } else {
        // Keep slugger in sync so it doesn't generate duplicate ids.
        slugger.slug(node.properties.id);
      }

      const id = node.properties.id as string;

      const iconButton = {
        type: 'element',
        tagName: 'igc-icon-button',
        properties: {
          class: 'igd-anchor-link',
          href: `#${id}`,
          variant: 'flat',
          'aria-label': 'Link to this section',
          tabIndex: 0,
        },
        children: [
          {
            type: 'element',
            tagName: 'igc-icon',
            properties: {
              name: 'link',
              collection: 'docs',
            },
            children: [],
          },
        ],
      };

      node.children.push(iconButton);
    });
  };
}
