# DocsSubHeader

Secondary fixed header bar rendered below the `GlobalNavBar`. Contains the site title, breadcrumb trail derived from the sidebar tree, the Pagefind search button, and platform product-switch links.

## Import

```astro
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageTitle` | `string \| null` | — | Fallback label shown when `currentSlug` is not found in the sidebar tree. |
| `currentSlug` | `string` | `''` | Current page slug — used to derive the breadcrumb from the sidebar. |
| `siteTitle` | `string` | virtual module | Override the site name shown on the left. |
| `productLinks` | `{ label: string; href: string; platform?: string }[]` | virtual module | Override the cross-product navigation links. |
| `sidebarItems` | `SidebarEntry[]` | virtual module | Override the sidebar tree used for breadcrumb generation. |

## Behaviour

- The breadcrumb is built by walking `sidebarData` (from `virtual:docs-template/site-meta`) with `getBreadcrumb()`.
- Product links from the virtual module are shown; the currently active platform link is hidden.
- The search button opens the Pagefind dialog (see `Search` component).
- CSS custom properties used for positioning:
  - `--docs-global-nav-height` (default `86px`) — height of the bar above
  - `--docs-subheader-height` (default `40px`) — height of this bar

## Example

### Prop-driven (no `siteMetaIntegration` required)

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';

const sidebar: SidebarEntry[] = [
  { label: 'Getting Started', collapsed: false, items: [
    { label: 'Introduction', slug: '' },
  ]},
  { label: 'Components', collapsed: false, items: [
    { label: 'Toast', slug: 'components/toast' },
  ]},
];

const productLinks = [
  { label: 'Angular',        href: '/angular/',        platform: 'angular' },
  { label: 'React',          href: '/react/',          platform: 'react' },
  { label: 'Web Components', href: '/web-components/', platform: 'web-components' },
];
---
<DocsSubHeader
  siteTitle="My Library"
  productLinks={productLinks}
  sidebarItems={sidebar}
  currentSlug="components/toast"
/>
```

### With `siteMetaIntegration` (integration-driven)

All props are optional when the virtual module provides the data:

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
---
<DocsSubHeader pageTitle="Toast" currentSlug="components/toast" />
```

This component is used automatically inside `MainLayout` — you only need to
mount it directly when building a custom page shell.
