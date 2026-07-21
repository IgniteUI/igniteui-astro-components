# DocsLayout

Top-level page shell. Composes the global nav bar, sub-header, optional sidebar slot, main content area, "On this page" TOC slot, and footer into a single full-page layout.

## Import

```astro
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
```

## Props

| Prop          | Type             | Default        | Description                                                                                                   |
| ------------- | ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| `title`       | `string`         | —              | Page `<title>` prepended to the site name. Omit to show the site name only.                                   |
| `description` | `string \| null` | —              | `<meta name="description">` value.                                                                            |
| `keywords`    | `string \| null` | —              | `<meta name="keywords">` value.                                                                               |
| `hasSidebar`  | `boolean`        | `true`         | Renders the sidebar rail when `true`. Provide content via `<… slot="sidebar">`.                               |
| `currentSlug` | `string`         | `''`           | Slug of the current page — used for breadcrumbs in the sub-header.                                            |
| `siteTitle`   | `string`         | virtual module | Override the site name used in `<title>` and the sub-header. Use this when not running `siteMetaIntegration`. |

## Slots

| Slot        | Description                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| _(default)_ | Main page content.                                                                                                     |
| `sidebar`   | Sidebar content — typically `<DocsSidebar>`. Only rendered when `hasSidebar={true}`.                                   |
| `toc`       | "On this page" column — pass `<DocsToc slot="toc" headings={headings} />` here. Omit to hide the TOC sidebar entirely. |
| `head`      | Extra `<head>` entries injected after platform defaults.                                                               |

## Example

### With TOC (prop-driven, no `siteMetaIntegration` required)

Pass all data directly as props. The `virtual:docs-template/site-meta` module
still needs to be resolvable at Vite build time — supply a minimal stub (see
[playground/astro.config.mjs](../../../playground/astro.config.mjs)).

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
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
  <DocsToc slot="toc" headings={headings} offsetTarget=".docs-subheader" />
  <slot />
</DocsLayout>
```

### Without TOC

Omit the `toc` slot entirely — the TOC sidebar collapses automatically via CSS.

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';

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
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';

const { headings } = Astro.props;
const slug = Astro.params.slug ?? '';
---

<DocsLayout title="Toast" description="Toast component documentation" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" currentSlug={slug} />
  <DocsToc slot="toc" headings={headings} offsetTarget=".docs-subheader" />
  <slot />
</DocsLayout>
```

## Virtual module dependencies

`DocsLayout` imports from two virtual modules. When using `siteMetaIntegration`
they are provided automatically. When not, supply minimal stubs via a Vite
plugin (see [playground/astro.config.mjs](../../../playground/astro.config.mjs)
for a reference implementation):

| Module                            | Used for                                                        | Can be overridden by prop                                                                               |
| --------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `virtual:docs-template/site-meta` | Site title, sidebar tree, product links, extra `<head>` entries | `siteTitle` on `DocsLayout`, `items` on `DocsSidebar`, `productLinks`/`sidebarItems` on `DocsSubHeader` |
| `virtual:docs-template/nav-html`  | Pre-fetched nav/footer HTML, widget script URL, platform key    | — (not yet prop-overridable)                                                                            |
