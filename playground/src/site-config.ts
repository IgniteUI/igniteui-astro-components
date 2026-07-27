/**
 * Shared playground configuration — sidebar tree, product links, and site title.
 *
 * Imported directly by every playground page and passed as props to
 * DocsLayout / DocsSidebar / DocsSubHeader. This demonstrates the prop-driven
 * usage pattern: no virtual module or siteMetaIntegration required at runtime.
 */
import type { SidebarEntry } from '../../src/lib/sidebar/types';
import type { SearchTab } from '../../src/components/SearchAdvanced/SearchAdvanced.astro';

export const SITE_TITLE = 'IgniteUI';

export const PRODUCT_LINKS = [
  { label: 'Angular', href: '#', platform: 'angular' },
  { label: 'React', href: '#', platform: 'react' },
  { label: 'Web Components', href: '#', platform: 'web-components' },
  { label: 'Blazor', href: '#', platform: 'blazor' },
] satisfies { label: string; href: string; platform?: string }[];

export const SIDEBAR: SidebarEntry[] = [
  {
    label: 'Getting Started',
    collapsed: false,
    items: [{ label: 'Introduction', slug: '' }],
  },
  {
    label: 'Layout Components',
    collapsed: false,
    items: [
      { label: 'Sidebar', slug: 'components/sidebar' },
      { label: 'Nav Bar', slug: 'components/nav-bar' },
      { label: 'DocsSubHeader', slug: 'components/docs-subheader' },
      { label: 'DocsToc', slug: 'components/docs-toc' },
      { label: 'Search', slug: 'components/search' },
      { label: 'SearchAdvanced', slug: 'components/search-advanced' },
    ],
  },
  {
    label: 'MDX Components',
    collapsed: false,
    items: [
      { label: 'ApiLink', slug: 'components/api-link' },
      { label: 'ApiRef', slug: 'components/api-ref' },
      { label: 'Badge', slug: 'components/badge' },
      { label: 'DocsAside', slug: 'components/docs-aside' },
      { label: 'Faq', slug: 'components/faq' },
      { label: 'PlatformBlock', slug: 'components/platform-block' },
      { label: 'Sample', slug: 'components/sample' },
    ],
  },
  {
    label: 'Styles',
    collapsed: false,
    items: [
      { label: 'Colors', slug: 'styles/colors' },
      { label: 'Typography', slug: 'styles/typography' },
      { label: 'Icons', slug: 'styles/icons' },
      { label: 'Lists', slug: 'styles/lists' },
      { label: 'Tables', slug: 'styles/tables' },
      { label: 'Code', slug: 'styles/code' },
      { label: 'Images', slug: 'styles/images' },
      { label: 'Embedded Media', slug: 'styles/media' },
      { label: 'Badges', slug: 'styles/badges' },
      { label: 'Text Elements', slug: 'styles/text-elements' },
    ],
  },
  {
    label: 'Reference',
    collapsed: true,
    items: [{ label: 'Changelog', slug: 'changelog', badges: [{ text: 'Beta', variant: 'new' }] }],
  },
];

export const SEARCH_TABS: SearchTab[] = [
  { id: 'components', label: 'Components', kindCodes: ['__name__'] },
  { id: 'members', label: 'Members', kindCodes: ['p', 'a', 'm', 'e', 'c'] },
  { id: 'enums', label: 'Enums', kindCodes: ['__name__'] },
];

export const PACKAGES = [
  { label: 'Angular', value: '@igniteui/angular' },
  { label: 'React', value: '@igniteui/react' },
  { label: 'Web Components', value: '@igniteui/web-components' },
  { label: 'Blazor', value: '@igniteui/blazor' },
] as const;

export const VERSIONS = ['18.x', '17.x', '16.x', '15.x'] as const;
