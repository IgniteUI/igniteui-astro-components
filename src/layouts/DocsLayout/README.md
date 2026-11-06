# DocsLayout

Top-level page shell. Composes the global nav bar, sub-header, optional sidebar slot, main content area, "On this page" TOC slot, and footer into a single full-page layout.

## Import

```astro
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
```

## Props

| Prop              | Type             | Default        | Description                                                                                                   |
| ----------------- | ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| `title`           | `string`         | —              | Page `<title>` prepended to the site name. Omit to show the site name only.                                   |
| `description`     | `string \| null` | —              | `<meta name="description">` value.                                                                            |
| `keywords`        | `string \| null` | —              | `<meta name="keywords">` value.                                                                               |
| `hasSidebar`      | `boolean`        | `true`         | Renders the sidebar rail when `true`. Provide content via `<… slot="sidebar">`.                               |
| `currentSlug`     | `string`         | `''`           | Slug of the current page — used for the breadcrumb above the content.                                         |
| `siteTitle`       | `string`         | virtual module | Override the site name used in `<title>` and the breadcrumb. Use this when not running `siteMetaIntegration`. |
| `license`         | `string`         | —              | `license` frontmatter value. `'commercial'` shows a Premium badge, `'MIT'` an Open Source badge.              |
| `is404`           | `boolean`        | `false`        | Adds the `igd-page-layout--404` modifier class on 404 pages.                                                  |
| `packages`        | `string[]`       | —              | Entries for the sub-header package selector. Hidden when omitted.                                             |
| `selectedPackage` | `string`         | —              | Currently selected package (must match one of `packages`).                                                    |
| `packageLabel`    | `string`         | `'Package'`    | `aria-label` of the sub-header package selector (not a visible label).                                        |
| `versions`        | `string[]`       | —              | Entries for the sub-header version selector. Hidden when omitted.                                             |
| `selectedVersion` | `string`         | —              | Currently selected version (must match one of `versions`).                                                    |
| `versionLabel`    | `string`         | `'Version'`    | `aria-label` of the sub-header version selector (not a visible label).                                        |
| `showThemeToggle` | `boolean`        | `false`        | Forwarded to `DocsSubHeader`, which does not render a toggle; no effect today.                                |
| `themeStorageKey` | `string`         | `'docs-theme'` | Forwarded to `DocsSubHeader` and unused; the layout's restore script reads the `'docs-theme'` key only.       |

`hasToc` (`boolean`, default `true`) is also read at runtime and hides the `toc`
slot when `false`, but it is not yet declared in the `Props` interface (issue #161), so
TypeScript consumers must spread it in (`{...{ hasToc: false }}`).

## Slots

| Slot         | Description                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| _(default)_  | Main page content, rendered inside `<main data-pagefind-body>`.                                                        |
| `sidebar`    | Sidebar content — typically `<DocsSidebar>`. Only rendered when `hasSidebar={true}`.                                   |
| `toc`        | "On this page" column — pass `<DocsToc slot="toc" headings={headings} />` here. Omit to hide the TOC sidebar entirely. |
| `mobile-toc` | Mobile-only TOC row below the sub-header — pass `<MobileTocToggle slot="mobile-toc" headings={headings} />`.           |
| `subheader`  | Replaces the default `<DocsSubHeader>`; use it to mount your own sub-header (for example with `SearchAdvanced`).       |
| `head`       | Extra `<head>` entries injected after platform defaults.                                                               |

## What the layout brings in

- `styles/theme.scss` (the package's global stylesheet) and the JetBrains Mono
  variable font from `@fontsource-variable/jetbrains-mono`. You do not need to
  import either yourself.
- `GlobalNavBar`, `DocsSubHeader`, `DocsBreadcrumb`, `LicenseIndicator`,
  `CopyCode` and `GlobalFooter`.
- `<html data-theme="light|dark">`, restored from `localStorage` before paint.
- Astro's `<ClientRouter>` for view transitions.

## Host requirements

- The two virtual modules below must resolve (stub them if you do not use the
  integration).
- Components rendered inside the layout that read
  `Astro.locals.platformContext` or `Astro.locals.envVars` (`ApiLink`,
  `ApiRef`, `PlatformBlock`, `Sample`, `ThemingWidget`) need a middleware that
  sets them — see [Quick start](../../../README.md#quick-start) step 3.

## Example

### With TOC (prop-driven, no `siteMetaIntegration` required)

Pass all data directly as props. The `virtual:docs-template/site-meta` module
still needs to be resolvable at Vite build time — supply a minimal stub (see
[Quick start](../../../README.md#quick-start) step 2).

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';
import type { MarkdownHeading } from 'astro';

const { headings } = Astro.props as { headings: MarkdownHeading[] };
const slug = Astro.params.slug ?? '';

const sidebar: SidebarEntry[] = [
  { label: 'Getting Started', collapsed: false, items: [{ label: 'Introduction', slug: '' }] },
  { label: 'Components', collapsed: false, items: [{ label: 'Toast', slug: 'components/toast' }] },
];
---

<DocsLayout title="Toast" siteTitle="My Library" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" items={sidebar} currentSlug={slug} />
  <DocsToc slot="toc" headings={headings} />
  <slot />
</DocsLayout>
```

### Without TOC

Omit the `toc` slot entirely — the TOC sidebar collapses automatically via CSS.

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';

const slug = Astro.params.slug ?? '';
---

<DocsLayout title="Changelog" siteTitle="My Library" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" currentSlug={slug} />
  <slot />
</DocsLayout>
```

### With `siteMetaIntegration` (integration-driven)

When `createDocsSite()` / `siteMetaIntegration()` is configured, `siteTitle`
can be omitted — it is read from the virtual module automatically.

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';

const { headings } = Astro.props;
const slug = Astro.params.slug ?? '';
---

<DocsLayout title="Toast" description="Toast component documentation" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" currentSlug={slug} />
  <DocsToc slot="toc" headings={headings} />
  <slot />
</DocsLayout>
```

## Header and footer

`DocsLayout` renders the Infragistics header and footer itself; which one
depends on the build:

| Build                                       | Header / footer                                                  |
| ------------------------------------------- | ---------------------------------------------------------------- |
| the site registers `igChrome({ snapshot })` | the marketing site's exported chrome, from the site's snapshot   |
| `navLang: 'jp'`                             | the legacy chrome fetched from `jp.infragistics.com/navigation`  |
| otherwise                                   | the legacy chrome fetched from `www.infragistics.com/navigation` |

With a snapshot, the head part goes into `<head>` (with
`<meta name="ig-chrome" content="v1 build=…">`), the header into the sticky,
persisted `global-nav-bar` wrapper, and the footer into a full-width grid cell
with `data-igd-footer`, persisted across navigations. See
[The Infragistics header and footer](../../../README.md#the-infragistics-header-and-footer).

## Virtual module dependencies

`DocsLayout` imports from two virtual modules. Supply them with a Vite plugin
(see [Quick start](../../../README.md#quick-start) step 2; `siteMetaIntegration`
does not emit `packages` and `selectedPackage`, so it cannot provide them
today):

| Module                            | Used for                                                                                                     | Can be overridden by prop                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `virtual:docs-template/site-meta` | `title`, `sidebar`, `productLinks`, `headEntries`, `trailingSlash`, `navLang`, `packages`, `selectedPackage` | `siteTitle` on `DocsLayout`, `items`/`trailingSlash` on `DocsSidebar`, `packages`/`selectedPackage` on `DocsSubHeader` |
| `virtual:docs-template/nav-html`  | Pre-fetched nav/footer HTML, widget script URL, platform key                                                 | — (not yet prop-overridable)                                                                                           |
