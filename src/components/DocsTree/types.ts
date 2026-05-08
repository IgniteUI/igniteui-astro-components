/**
 * Shared tree data shape for DocsTree — the base tree component that backs
 * both DocsSidebarIgc and DocsToc.
 *
 * Consumers (DocsSidebar, DocsToc) keep their own domain types
 * (SidebarEntry, MarkdownHeading) and convert to TreeNode via small adapters
 * colocated with each consumer:
 *   • `src/components/DocsSidebar/toTreeNodes.ts`
 *   • `src/components/DocsToc/toTreeNodes.ts`
 */

export type TreeVariant = 'sidebar' | 'toc';

export interface TreeNode {
  /** Stable identity. Surfaced as `data-tree-id` on the rendered <igc-tree-item>. */
  id: string;

  /** Plain-text label. Used as the default fallback when no `renderLabel` is given. */
  label: string;

  /**
   * Present on leaves and on toc nodes (toc parents are also links to their
   * own heading). When present, the label slot is wrapped in `<a href>`.
   */
  href?: string;

  /** SSR-time expand hint. Sidebar uses isInitiallyOpen; toc forces always-open. */
  expanded?: boolean;

  children?: TreeNode[];

  /**
   * camelCase keys → kebab-case `data-*` attributes on the <igc-tree-item>.
   * The sidebar filter custom element relies on `data-path`, `data-group-key`,
   * `data-label`, `data-slug`. Pass them here so they survive into the DOM.
   */
  itemData?: Record<string, string>;

  /** Spread on the leaf <a>. Used for the sidebar's `attrs` passthrough. */
  linkAttrs?: Record<string, string | number | boolean | undefined>;

  /** Free-form metadata for the consumer's `renderLabel` to read (e.g. badge). */
  meta?: Record<string, unknown>;
}
