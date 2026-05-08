/**
 * Adapter: SidebarEntry[] → TreeNode[] for the shared DocsTree component.
 *
 * Preserves the data-* attributes the sidebar-filter-igc custom element
 * relies on:
 *   • data-path       (every item)
 *   • data-group-key  (groups only)
 *   • data-label      (every item)
 *   • data-slug       (leaves only)
 *
 * SSR active state and group auto-expansion use the pure helpers from
 * `src/lib/sidebar/helpers.ts`.
 */

import type { TreeNode } from '../DocsTree/types';
import type { SidebarEntry } from '../../lib/sidebar/types';
import { isGroup, isInitiallyOpen, joinPath, normalizeSlug } from '../../lib/sidebar/helpers';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const linkHref = (slug: string): string => {
  const normalized = normalizeSlug(slug);
  return normalized ? `${base}/${normalized}/` : `${base}/`;
};

const toNode = (
  entry: SidebarEntry,
  ancestors: string[],
  currentSlug: string,
): TreeNode => {
  const path = joinPath(ancestors, entry.label);

  if (isGroup(entry)) {
    return {
      id: path,
      label: entry.label,
      expanded: isInitiallyOpen(entry, currentSlug) || undefined,
      children: entry.items.map((child) =>
        toNode(child, [...ancestors, entry.label], currentSlug),
      ),
      itemData: {
        path,
        groupKey: path,
        label: entry.label,
      },
    };
  }

  return {
    id: normalizeSlug(entry.slug),
    label: entry.label,
    href: linkHref(entry.slug),
    itemData: {
      path,
      label: entry.label,
      slug: entry.slug,
    },
    linkAttrs: entry.attrs,
    meta: entry.badge ? { badge: entry.badge } : undefined,
  };
};

export const toTreeNodes = (
  entries: SidebarEntry[],
  currentSlug: string,
): TreeNode[] => entries.map((entry) => toNode(entry, [], currentSlug));
