# DocsSubHeader

Secondary fixed header bar rendered below the `GlobalNavBar`. Contains the logo, the search button and the package and version selectors.

> **Note:** The breadcrumb trail was extracted into the standalone [`DocsBreadcrumb`](../DocsBreadcrumb/README.md) component and is now rendered inside the main content frame, above the page body — not in this bar.

## Import

```astro
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
```

## Props

| Prop              | Type                                                                               | Default        | Description                                                                                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logoText`        | `string`                                                                           | by platform    | Text shown in the logo area while `GlobalNavBar` is visible; `'Ignite UI'` or `'Ultimate UI'` by default.                                                                                                                                               |
| `packages`        | `Array<string \| { label: string; value?: string; href?: string; base?: string }>` | virtual module | Entries for the package selector. A string is both label and value; `href` navigates on selection; `base` swaps the site base to keep the current page. Falls back to the virtual module's `packages`; the selector is hidden only when both are empty. |
| `selectedPackage` | `string`                                                                           | virtual module | Currently selected package (must match one of `packages`). Falls back to the virtual module's `selectedPackage`, then to the first entry.                                                                                                               |
| `packageLabel`    | `string`                                                                           | `'Package'`    | `aria-label` of the package selector (not a visible label).                                                                                                                                                                                             |
| `versions`        | `string[]`                                                                         | —              | Version labels for the version selector dropdown. Hidden when omitted.                                                                                                                                                                                  |
| `selectedVersion` | `string`                                                                           | —              | Currently selected version (must match one of `versions`).                                                                                                                                                                                              |
| `versionLabel`    | `string`                                                                           | `'Version'`    | `aria-label` of the version selector (not a visible label).                                                                                                                                                                                             |

The breadcrumb props (`siteTitle`, `pageTitle`, `currentSlug`, `sidebarItems`), `productLinks`
and the theme-toggle props (`showThemeToggle`, `themeStorageKey`) were removed in #187 (issue #180): the
sub-header rendered none of them. Pass `currentSlug` and `siteTitle` to `DocsLayout`, which renders
`DocsBreadcrumb`; the theme is restored from the `'docs-theme'` key by `DocsLayout`.

`PackageEntry` is `{ label: string; value?: string; href?: string; base?: string }`:

| Field   | Description                                                                      |
| ------- | -------------------------------------------------------------------------------- |
| `label` | Text shown in the dropdown.                                                      |
| `value` | Value matched against `selectedPackage`. Defaults to `label`.                    |
| `href`  | Where selecting the entry navigates, e.g. the platform's getting started page.   |
| `base`  | Root URL of the entry's docs site. Switching keeps the current page (see below). |

## Slots

| Slot     | Default      | Description                                           |
| -------- | ------------ | ----------------------------------------------------- |
| `search` | `<Search />` | Override the search widget rendered in the subheader. |

## Behaviour

- Selecting a package navigates to its `href`. When the entry also has a `base`, it goes to the same
  page on that site instead: the current URL with this site's base (`import.meta.env.BASE_URL`)
  swapped for `base`, keeping the query and `#hash`. Nothing checks that the page exists there, so
  the server should redirect missing pages, e.g. to the platform's getting started page.
- The search button opens the Pagefind dialog (see `Search` component).
- `DocsLayout` sets `--docs-global-nav-height` on the wrapper from the measured nav height; no stylesheet in this package reads it or `--docs-subheader-height`.

## Example

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
---

<DocsSubHeader />
```

This component is used automatically inside `DocsLayout` — you only need to
mount it directly when building a custom page shell.

### With package/version selectors

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';
import SearchAdvanced from 'igniteui-astro-components/components/SearchAdvanced.astro';
---

<DocsSubHeader
  packages={['igniteui-angular', 'igniteui-charts']}
  selectedPackage="igniteui-angular"
  packageLabel="Package"
  versions={['19.1 (latest)', '18.2', '18.1']}
  selectedVersion="19.1 (latest)"
  versionLabel="Version"
>
  <SearchAdvanced slot="search" showScope tabs={[]} />
</DocsSubHeader>
```

`#package-select` and `#version-select` are `igc-select` elements and emit
`igcChange` (not a native `change` event); attach your own navigation logic
via `document.getElementById`.
