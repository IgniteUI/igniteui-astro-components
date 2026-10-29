# DocsSubHeader

Secondary fixed header bar rendered below the `GlobalNavBar`. Contains the Pagefind search button and platform product-switch links.

> **Note:** The breadcrumb trail was extracted into the standalone [`DocsBreadcrumb`](../DocsBreadcrumb/README.md) component and is now rendered inside the main content frame, above the page body — not in this bar.

## Import

```astro
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
```

## Props

| Prop              | Type                                                                | Default        | Description                                                                                               |
| ----------------- | ------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| `siteTitle`       | `string`                                                            | virtual module | Site name shown on the left. Set it when not running `siteMetaIntegration`.                               |
| `pageTitle`       | `string \| null`                                                    | —              | Fallback page title when `currentSlug` is not found in the sidebar tree.                                  |
| `currentSlug`     | `string`                                                            | —              | Current page slug, matched against the sidebar tree.                                                      |
| `logoText`        | `string`                                                            | by platform    | Text shown in the logo area while `GlobalNavBar` is visible; `'Ignite UI'` or `'Ultimate UI'` by default. |
| `productLinks`    | `{ label: string; href: string; platform?: string }[]`              | virtual module | Override the cross-product navigation links.                                                              |
| `sidebarItems`    | `SidebarEntry[]`                                                    | virtual module | Override the sidebar tree used to resolve the page title.                                                 |
| `packages`        | `Array<string \| { label: string; value?: string; href?: string }>` | —              | Entries for the package selector. A string is both label and value; `href` navigates on selection.        |
| `selectedPackage` | `string`                                                            | —              | Currently selected package (must match one of `packages`).                                                |
| `packageLabel`    | `string`                                                            | `'Package'`    | Label rendered before the package selector.                                                               |
| `versions`        | `string[]`                                                          | —              | Version labels for the version selector dropdown. Hidden when omitted.                                    |
| `selectedVersion` | `string`                                                            | —              | Currently selected version (must match one of `versions`).                                                |
| `versionLabel`    | `string`                                                            | `'Version'`    | Label rendered before the version selector.                                                               |
| `showThemeToggle` | `boolean`                                                           | `false`        | Show a light/dark theme toggle button.                                                                    |
| `themeStorageKey` | `string`                                                            | `'docs-theme'` | `localStorage` key for persisting the theme preference.                                                   |

## Slots

| Slot     | Default      | Description                                           |
| -------- | ------------ | ----------------------------------------------------- |
| `search` | `<Search />` | Override the search widget rendered in the subheader. |

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
  { label: 'Angular', href: '/angular/', platform: 'angular' },
  { label: 'React', href: '/react/', platform: 'react' },
  { label: 'Web Components', href: '/web-components/', platform: 'web-components' },
];
---

<DocsSubHeader productLinks={productLinks} />
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
