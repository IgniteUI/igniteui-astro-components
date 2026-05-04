# MainLayout

Top-level page shell. Composes the global nav bar, sub-header, optional sidebar slot, main content area, "On this page" TOC, and footer into a single full-page layout.

## Import

```astro
import MainLayout from 'igniteui-astro-components/layouts/MainLayout.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Page `<title>` prepended to the site name. Omit to show the site name only. |
| `description` | `string \| null` | — | `<meta name="description">` value. |
| `keywords` | `string \| null` | — | `<meta name="keywords">` value. |
| `hasSidebar` | `boolean` | `true` | Renders the sidebar rail when `true`. Provide content via `<… slot="sidebar">`. |
| `currentSlug` | `string` | `''` | Slug of the current page — used for breadcrumbs in the sub-header. |
| `headings` | `MarkdownHeading[]` | — | Headings from Astro's `getHeadings()` helper. Pass to render the "On this page" TOC. |
| `tocConfig` | `false \| { minHeadingLevel?: number; maxHeadingLevel?: number }` | — | Controls which heading depths appear in the TOC. Pass `false` to disable entirely. |
| `tocLabel` | `string` | `'On this page'` | Label rendered above the TOC list. |
| `siteTitle` | `string` | virtual module | Override the site name used in `<title>` and the sub-header. Use this when not running `siteMetaIntegration`. |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Main page content. |
| `sidebar` | Sidebar content — typically `<DocsSidebar>`. Only rendered when `hasSidebar={true}`. |
| `head` | Extra `<head>` entries injected after platform defaults. |

## Example

### Prop-driven (no `siteMetaIntegration` required)

Pass all data directly as props. The `virtual:docs-template/site-meta` module
still needs to be resolvable at Vite build time — supply a minimal stub (see
[playground/astro.config.mjs](../../../playground/astro.config.mjs)).

```astro
---
import MainLayout from 'igniteui-astro-components/layouts/MainLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';
import type { MarkdownHeading } from 'astro';

const { headings } = Astro.props as { headings: MarkdownHeading[] };
const slug = Astro.params.slug ?? '';

const sidebar: SidebarEntry[] = [
  { label: 'Getting Started', collapsed: false, items: [
    { label: 'Introduction', slug: '' },
  ]},
  { label: 'Components', collapsed: false, items: [
    { label: 'Toast', slug: 'components/toast' },
  ]},
];
---
<MainLayout
  title="Toast"
  siteTitle="My Library"
  hasSidebar
  currentSlug={slug}
  headings={headings}
>
  <DocsSidebar slot="sidebar" items={sidebar} currentSlug={slug} />
  <slot />
</MainLayout>
```

### With `siteMetaIntegration` (integration-driven)

When `createDocsSite()` / `siteMetaIntegration()` is configured, `siteTitle`
can be omitted — it is read from the virtual module automatically.

```astro
---
import MainLayout from 'igniteui-astro-components/layouts/MainLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';

const { headings } = Astro.props;
const slug = Astro.params.slug ?? '';
---
<MainLayout
  title="Toast"
  description="Toast component documentation"
  hasSidebar
  currentSlug={slug}
  headings={headings}
>
  <DocsSidebar slot="sidebar" currentSlug={slug} />
  <slot />
</MainLayout>
```

## Virtual module dependencies

`MainLayout` imports from two virtual modules. When using `siteMetaIntegration`
they are provided automatically. When not, supply minimal stubs via a Vite
plugin (see [playground/astro.config.mjs](../../../playground/astro.config.mjs)
for a reference implementation):

| Module | Used for | Can be overridden by prop |
|--------|----------|--------------------------|
| `virtual:docs-template/site-meta` | Site title, sidebar tree, product links, extra `<head>` entries | `siteTitle` on `MainLayout`, `items` on `DocsSidebar`, `productLinks`/`sidebarItems` on `DocsSubHeader` |
| `virtual:docs-template/nav-html` | Pre-fetched nav/footer HTML, widget script URL, platform key | — (not yet prop-overridable) |
