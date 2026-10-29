import { defineHastPlugin } from 'satteri';
import Slugger from 'github-slugger';

const HEADING_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6'];

/**
 * Sätteri HAST plugin that appends a copy-link icon button to every heading
 * (h2–h6).
 *
 * Runs before Astro's internal heading-id pass so it must generate its own slug
 * using the same `github-slugger` algorithm. If the heading already has an `id`
 * (e.g. set in raw HTML), it is reused. Headings without an existing id get one
 * assigned here — the built-in pass will then see the id already present and
 * skip re-assigning it, ensuring the button href and the heading's id always
 * match.
 *
 * Exported as a factory so Sätteri calls it once per document, giving each page
 * a fresh slugger and therefore a fresh duplicate-suffix counter.
 */
export function rehypeHeadingAnchors() {
  const slugger = new Slugger();

  return defineHastPlugin({
    name: 'heading-anchors',
    element: {
      filter: HEADING_TAGS,
      visit(node, ctx) {
        // Reuse an existing id or generate one from heading text.
        const existing = node.properties?.id;
        let id: string;

        if (typeof existing === 'string' && existing) {
          // Keep slugger in sync so it doesn't generate duplicate ids.
          slugger.slug(existing);
          id = existing;
        } else {
          id = slugger.slug(ctx.textContent(node));
          ctx.setProperty(node, 'id', id);
        }

        ctx.appendChild(node, {
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
        });
      },
    },
  });
}
