/**
 * Shared playground configuration — sidebar tree, product links, and site title.
 *
 * Imported directly by every playground page and passed as props to
 * DocsLayout / DocsSidebar / DocsSubHeader. This demonstrates the prop-driven
 * usage pattern: no virtual module or siteMetaIntegration required at runtime.
 */
import type { SidebarEntry } from '../../src/lib/sidebar/types';

export const SITE_TITLE = 'Components Playground';

export const PRODUCT_LINKS = [
  { label: 'Angular',        href: '#', platform: 'angular' },
  { label: 'React',          href: '#', platform: 'react' },
  { label: 'Web Components', href: '#', platform: 'web-components' },
  { label: 'Blazor',         href: '#', platform: 'blazor' },
] satisfies { label: string; href: string; platform?: string }[];

export const SIDEBAR: SidebarEntry[] = [
  {
    label: 'Getting Started',
    collapsed: false,
    items: [
      { label: 'Introduction', slug: '' },
    ],
  },
  {
    label: 'Components',
    collapsed: false,
    items: [
      { label: 'Sidebar', slug: 'components/sidebar' },
      { label: 'Nav Bar', slug: 'components/nav-bar' },
      { label: 'DocsToc', slug: 'components/docs-toc' },
      {
        label: 'MDX Helpers',
        collapsed: true,
        items: [
          { label: 'ApiLink',       slug: 'components/api-link' },
          { label: 'ApiRef',        slug: 'components/api-ref' },
          { label: 'DocsAside',     slug: 'components/docs-aside' },
          { label: 'PlatformBlock', slug: 'components/platform-block' },
        ],
      },
    ],
  },
  {
    label: 'Reference',
    collapsed: true,
    items: [
      { label: 'Changelog', slug: 'changelog', badge: { text: 'Beta', variant: 'caution' } },
    ],
  },
];
