# DocsBreadcrumb

Breadcrumb trail rendered inside the main content frame, above the page body. Shows the site title followed by the sidebar-derived crumb path for the current page.

The crumb list is built by walking the sidebar tree with `getBreadcrumb()`. Falls back to `pageTitle` when the current slug is not found in the tree.

> **Layout note:** This component is placed inside `.igd-main-content` in `DocsLayout`, not in the fixed subheader bar. See `DocsSubHeader` for the top bar.

## Import

```astro
import DocsBreadcrumb from 'igniteui-astro-components/components/DocsBreadcrumb.astro';
```

## Props

| Prop           | Type             | Default        | Description                                                                         |
| -------------- | ---------------- | -------------- | ----------------------------------------------------------------------------------- |
| `currentSlug`  | `string`         | `''`           | Slug of the current page — used to derive the crumb path from the sidebar tree.     |
| `pageTitle`    | `string \| null` | —              | Fallback label shown as the last crumb when `currentSlug` is not found in the tree. |
| `siteTitle`    | `string`         | virtual module | Override the site name shown as the first crumb.                                    |
| `sidebarItems` | `SidebarEntry[]` | virtual module | Override the sidebar tree used for crumb generation.                                |

## Behaviour

- Renders a semantic `<nav aria-label="Breadcrumb"><ol>` structure.
- The first item is the site title (from `virtual:docs-template/site-meta` or the `siteTitle` prop).
- Subsequent items are the ancestor labels from the sidebar tree leading to the current page.
- The last crumb (current page) is visually emphasised.
- Renders nothing when both `siteTitle` and the crumb list are empty.

## Example

### Prop-driven (no `siteMetaIntegration` required)

```astro
---
import DocsBreadcrumb from 'igniteui-astro-components/components/DocsBreadcrumb.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';

const sidebar: SidebarEntry[] = [
  { label: 'Components', collapsed: false, items: [{ label: 'Toast', slug: 'components/toast' }] },
];
---

<DocsBreadcrumb siteTitle="My Library" currentSlug="components/toast" sidebarItems={sidebar} />
```

### With `siteMetaIntegration` (integration-driven)

All props are optional when the virtual module provides the data:

```astro
---
import DocsBreadcrumb from 'igniteui-astro-components/components/DocsBreadcrumb.astro';
---

<DocsBreadcrumb currentSlug="components/toast" pageTitle="Toast" />
```

This component is used automatically inside `DocsLayout` — you only need to
mount it directly when building a custom page shell.
