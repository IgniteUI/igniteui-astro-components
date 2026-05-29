/**
 * igniteui-astro-components
 *
 * Public entry barrel. This module re-exports the JavaScript / TypeScript
 * APIs only. `.astro` components must be imported via their explicit
 * subpath exports declared in package.json — they cannot be re-exported
 * from a `.ts` barrel because Astro components are not plain modules.
 *
 * Example:
 *
 *   // JS / TS APIs
 *   import { createDocsSite, buildSidebarFromToc } from 'igniteui-astro-components';
 *
 *   // Astro components
 *   import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
 *   import ApiLink from 'igniteui-astro-components/components/mdx/ApiLink.astro';
 */

// Astro integration helpers
export * from './integration';

// Sidebar build-time helpers
export * from './sidebar';

// Platform helpers
export * from './platform';

// Content helpers
export * from './content-helper';

// Sidebar runtime types & tree helpers
export type {
  SidebarBadge,
  SidebarBadgeVariant,
  SidebarLink,
  SidebarGroup,
  SidebarEntry,
} from './lib/sidebar/types';
export * from './lib/sidebar/helpers';

// Platform context types
export * from './lib/types';
