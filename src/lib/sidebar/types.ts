/**
 * Sidebar data types — shared between the build-time TOC builder
 * (`src/sidebar.ts`) and the runtime sidebar components
 * (`src/components/DocsSidebar/*`).
 *
 * Single source of truth, no duplication.
 */

export const SIDEBAR_BADGE_VARIANTS = ['new', 'updated', 'preview', 'premium'] as const;
export type SidebarBadgeVariant = (typeof SIDEBAR_BADGE_VARIANTS)[number];

export interface SidebarBadge {
  text: string;
  variant: SidebarBadgeVariant;
}

export interface SidebarLink {
  label: string;
  slug: string;
  badges?: SidebarBadge[];
  attrs?: Record<string, string | number | boolean | undefined>;
}

export interface SidebarGroup {
  label: string;
  items: SidebarEntry[];
  /** When `true`, the group is rendered closed by default. Defaults to open. */
  collapsed?: boolean;
}

export type SidebarEntry = SidebarLink | SidebarGroup;
