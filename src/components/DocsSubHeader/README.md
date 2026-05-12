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
| `packages` | `string[]` | — | Package names for the package selector dropdown. Hidden when omitted. |
| `selectedPackage` | `string` | — | Currently selected package (must match one of `packages`). |
| `packageLabel` | `string` | `'Package'` | Label rendered before the package selector. |
| `versions` | `string[]` | — | Version labels for the version selector dropdown. Hidden when omitted. |
| `selectedVersion` | `string` | — | Currently selected version (must match one of `versions`). |
| `versionLabel` | `string` | `'Version'` | Label rendered before the version selector. |
| `showThemeToggle` | `boolean` | `false` | Show a light/dark theme toggle button. |
| `themeStorageKey` | `string` | `'docs-theme'` | `localStorage` key for persisting the theme preference. |

## Slots

| Slot | Default | Description |
|------|---------|-------------|
| `search` | `<Search />` | Override the search widget rendered in the subheader. |

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

This component is used automatically inside `DocsLayout` — you only need to
mount it directly when building a custom page shell.

### With package/version selectors and theme toggle

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
import SearchAdvanced from 'igniteui-astro-components/components/SearchAdvanced.astro';
---
<DocsSubHeader
  siteTitle="Ignite UI for Angular"
  packages={['igniteui-angular', 'igniteui-charts']}
  selectedPackage="igniteui-angular"
  packageLabel="Package"
  versions={['19.1 (latest)', '18.2', '18.1']}
  selectedVersion="19.1 (latest)"
  versionLabel="Version"
  showThemeToggle
  themeStorageKey="api-docs-theme"
  productLinks={[]}
>
  <SearchAdvanced slot="search" showScope tabs={[]} />
</DocsSubHeader>
```

The `#package-select` and `#version-select` elements emit native `change`
events — attach your own navigation logic via `document.getElementById`.
