/**
 * Adapter: Astro `MarkdownHeading[]` → TreeNode[] for the shared DocsTree.
 *
 * Filters headings by `min`/`max` heading level (matching Starlight's TOC
 * config), nests them by depth, and emits TreeNodes whose `href` points
 * at the heading's anchor (`#slug`).
 *
 * Initial state: every node is collapsed. The DocsToc scroll-spy
 * expands the active link's ancestors at runtime.
 */

import type { MarkdownHeading } from 'astro';
import type { TreeNode } from '../DocsTree/types';

export type TocConfig =
  | false
  | { minHeadingLevel?: number; maxHeadingLevel?: number }
  | undefined;

interface TocItem {
  depth: number;
  slug: string;
  text: string;
  children: TocItem[];
}

const injectChild = (items: TocItem[], item: TocItem): void => {
  const last = items.at(-1);
  if (!last || last.depth >= item.depth) {
    items.push(item);
    return;
  }
  injectChild(last.children, item);
};

const buildToc = (headings: MarkdownHeading[], config: TocConfig): TocItem[] => {
  if (config === false) return [];
  const min = (typeof config === 'object' ? config.minHeadingLevel : undefined) ?? 2;
  const max = (typeof config === 'object' ? config.maxHeadingLevel : undefined) ?? 3;
  const toc: TocItem[] = [];
  for (const h of headings.filter(({ depth }) => depth >= min && depth <= max)) {
    injectChild(toc, { ...h, children: [] });
  }
  return toc;
};

const toNode = (item: TocItem): TreeNode => ({
  id: item.slug,
  label: item.text,
  href: `#${item.slug}`,
  children: item.children.length > 0 ? item.children.map(toNode) : undefined,
});

export const headingsToTreeNodes = (
  headings: MarkdownHeading[],
  config: TocConfig,
): TreeNode[] => buildToc(headings, config).map(toNode);
