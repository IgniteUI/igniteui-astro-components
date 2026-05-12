# DocsSubHeader

Secondary fixed header bar rendered below the `GlobalNavBar`. Contains the Pagefind search button and platform product-switch links.

> **Note:** The breadcrumb trail was extracted into the standalone [`DocsBreadcrumb`](../DocsBreadcrumb/README.md) component and is now rendered inside the main content frame, above the page body — not in this bar.

## Import

```astro
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `productLinks` | `{ label: string; href: string; platform?: string }[]` | virtual module | Override the cross-product navigation links. |

## Behaviour

- Product links from the virtual module are shown; the currently active platform link is hidden.
- The search button opens the Pagefind dialog (see `Search` component).
- CSS custom properties used for positioning:
  - `--docs-global-nav-height` (default `4.7rem`) — height of the `GlobalNavBar` above
  - `--docs-subheader-height` (default `2.5rem`) — height of this bar

## Example

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';

const productLinks = [
  { label: 'Angular',        href: '/angular/',        platform: 'angular' },
  { label: 'React',          href: '/react/',          platform: 'react' },
  { label: 'Web Components', href: '/web-components/', platform: 'web-components' },
];
---
<DocsSubHeader productLinks={productLinks} />
```

This component is used automatically inside `DocsLayout` — you only need to
mount it directly when building a custom page shell.
