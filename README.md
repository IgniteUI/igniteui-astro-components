# igniteui-astro-components

Reusable [Astro](https://astro.build) components, layouts, integrations, and
utilities used to build Infragistics / Ignite UI documentation sites.

This package replaces the default [Starlight](https://starlight.astro.build)
chrome (navbar, sidebar, search, page frame, MDX components) with
project-specific implementations while keeping the integration story simple
for consumer repos.

> **Status:** internal — published from this repo as a parallel copy of the
> components living in `docs-template`. Both trees are kept in sync until
> consumers migrate fully.

---

## Installation

```sh
npm install igniteui-astro-components
```

`astro@^5 || ^6` is required as a peer dependency.

---

## Quick start

Add the integration to your `astro.config.ts`:

```ts
import { defineConfig } from 'astro/config';
import { createDocsSite } from 'igniteui-astro-components/integration';

export default createDocsSite({
  site: 'https://my-org.github.io/my-docs',
  title: 'My Library',
  description: 'Reference docs for My Library.',
  platform: 'angular',          // 'angular' | 'react' | 'web-components' | 'blazor' | …
  navLang: 'en',                // 'en' | 'jp' | 'kr'
  source: {
    tocPath:   './my-docs/toc.yml',
    docsDir:   './my-docs/en/components',
    imagesDir: './my-docs/en/images',
  },
});
```

Use the layout in a route:

```astro
---
import MainLayout from 'igniteui-astro-components/layouts/MainLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';

const { slug } = Astro.params;
---
<MainLayout title="Hello" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" currentSlug={slug} />
  <slot />
</MainLayout>
```

Import MDX components in a page or `mdx-components.ts`:

```ts
export { default as ApiLink }      from 'igniteui-astro-components/components/mdx/ApiLink.astro';
export { default as ApiRef }       from 'igniteui-astro-components/components/mdx/ApiRef.astro';
export { default as PlatformBlock } from 'igniteui-astro-components/components/mdx/PlatformBlock.astro';
export { default as Sample }       from 'igniteui-astro-components/components/mdx/Sample.astro';
```

Pull in the base styles once (e.g. from your root layout or `astro.config`):

```ts
import 'igniteui-astro-components/styles/custom.css';
import 'igniteui-astro-components/styles/ig-theme.scss';
```

---

## Prop-driven usage (without `siteMetaIntegration`)

By default, `MainLayout`, `DocsSidebar`, and `DocsSubHeader` read their data (site title, sidebar tree, product links) from the `virtual:docs-template/site-meta` virtual module that is provided by `siteMetaIntegration` / `createDocsSite`.

If you are not using the integration — for example when consuming the package via a GitHub dependency in a project that builds its own config — every piece of data can be passed directly as a prop instead.

### MainLayout

| Prop | Overrides |
|------|-----------|
| `siteTitle` | `virtual:docs-template/site-meta` → `title` |

```astro
---
import MainLayout from 'igniteui-astro-components/layouts/MainLayout.astro';
---
<MainLayout title="Toast" siteTitle="My Library" hasSidebar currentSlug="components/toast">
  <slot />
</MainLayout>
```

### DocsSidebar

| Prop | Overrides |
|------|-----------|
| `items` | `virtual:docs-template/site-meta` → `sidebar` |

```astro
---
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';

const sidebar: SidebarEntry[] = [
  {
    label: 'Getting Started',
    collapsed: false,
    items: [
      { label: 'Introduction', slug: '' },
      { label: 'Installation', slug: 'installation' },
    ],
  },
  {
    label: 'Components',
    collapsed: false,
    items: [
      { label: 'Toast', slug: 'components/toast' },
    ],
  },
];
---
<DocsSidebar items={sidebar} currentSlug="components/toast" />
```

### DocsSubHeader

| Prop | Overrides |
|------|-----------|
| `siteTitle` | `virtual:docs-template/site-meta` → `title` |
| `productLinks` | `virtual:docs-template/site-meta` → `productLinks` |
| `sidebarItems` | `virtual:docs-template/site-meta` → `sidebar` (used for breadcrumb) |

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';

const productLinks = [
  { label: 'Angular', href: '/angular/', platform: 'angular' },
  { label: 'React',   href: '/react/',   platform: 'react' },
];
---
<DocsSubHeader
  siteTitle="My Library"
  productLinks={productLinks}
  currentSlug="components/toast"
/>
```

### Combining prop-driven components without the integration

A minimal setup that needs no virtual modules or Astro integration:

```astro
---
// src/layouts/DocsLayout.astro
import MainLayout from 'igniteui-astro-components/layouts/MainLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';
import type { MarkdownHeading } from 'astro';

interface Props {
  title: string;
  currentSlug: string;
  headings?: MarkdownHeading[];
}

const { title, currentSlug, headings } = Astro.props;

const sidebar: SidebarEntry[] = [/* … your tree … */];
const productLinks = [{ label: 'React', href: '/react/', platform: 'react' }];
---
<MainLayout
  title={title}
  siteTitle="My Library"
  hasSidebar
  currentSlug={currentSlug}
  headings={headings}
>
  <DocsSidebar slot="sidebar" items={sidebar} currentSlug={currentSlug} />
  <slot />
</MainLayout>
```

> The virtual modules still need to be resolvable at build time (they are declared in `src/virtual-modules.d.ts`). When not using `siteMetaIntegration`, add stub exports to your `astro.config.ts` using the playground's `virtualDocsModules` pattern — see [playground/astro.config.mjs](playground/astro.config.mjs) for a reference implementation.

---

## What's included

### Astro integration

| Export | Purpose |
| --- | --- |
| `igniteui-astro-components/integration` | `createDocsSite()`, `siteMetaIntegration()`, `staticImagesIntegration()`, `buildSidebarFromToc()` re-export |

### Layouts

| Export | Purpose | Docs |
| --- | --- | --- |
| `igniteui-astro-components/layouts/MainLayout.astro` | Top-level page shell — global nav + sub-header + optional sidebar + main frame + footer | [README](src/layouts/MainLayout/README.md) |

### Chrome components

| Export | Purpose | Docs |
| --- | --- | --- |
| `…/components/GlobalNavBar.astro` | IG / AppBuilder global navigation bar | [README](src/components/GlobalNavBar/README.md) |
| `…/components/GlobalFooter.astro` | IG global footer | [README](src/components/GlobalFooter/README.md) |
| `…/components/DocsSubHeader.astro` | Secondary fixed bar — site title + breadcrumb + product links + search | [README](src/components/DocsSubHeader/README.md) |
| `…/components/Search.astro` | Pagefind-powered full-text search modal | [README](src/components/Search/README.md) |
| `…/components/ThemingWidget.astro` | Theming widget | [README](src/components/ThemingWidget/README.md) |
| `…/components/MobileSidebarToggle.astro` | Mobile-only sidebar disclosure button | [README](src/components/MobileSidebarToggle/README.md) |
| `…/components/DocsToc.astro` | "On this page" table of contents with scroll-spy | [README](src/components/DocsToc/README.md) |

### Sidebar suite

| Export | Purpose | Docs |
| --- | --- | --- |
| `…/components/sidebar/DocsSidebar.astro` | Composition root — filter input + recursive tree | [README](src/components/sidebar/README.md) |
| `…/components/sidebar/SidebarTree.astro` | Recursive `<ul>` of items | [README](src/components/sidebar/README.md) |
| `…/components/sidebar/SidebarItem.astro` | One link or `<details>` group | [README](src/components/sidebar/README.md) |
| `…/components/sidebar/SidebarFilterInput.astro` | Filter input markup | [README](src/components/sidebar/README.md) |
| `…/components/sidebar/sidebar-filter` | `<sidebar-filter>` custom element + cross-navigation hooks | [README](src/components/sidebar/README.md) |
| `…/lib/sidebar/types` | `SidebarEntry`, `SidebarGroup`, `SidebarLink`, `SidebarBadge` | — |
| `…/lib/sidebar/helpers` | `isActive`, `isGroup`, `isInitiallyOpen`, `getBreadcrumb`, `joinPath`, … | — |
| `…/sidebar` | `buildSidebarFromToc()` — TOC → sidebar tree converter (build-time) | — |

### MDX components

| Export | Purpose | Docs |
| --- | --- | --- |
| `…/components/mdx/ApiLink.astro` | Inline link to an API symbol with platform-aware URLs | [README](src/components/mdx/ApiLink/README.md) |
| `…/components/mdx/ApiRef.astro` | Block API reference card | [README](src/components/mdx/ApiRef/README.md) |
| `…/components/mdx/PlatformBlock.astro` | Show content only on selected platforms | [README](src/components/mdx/PlatformBlock/README.md) |
| `…/components/mdx/Sample.astro` | Embedded code-view sample widget | [README](src/components/mdx/Sample/README.md) |

### Build helpers

| Export | Purpose |
| --- | --- |
| `…/platform` | Platform / nav-language types |
| `…/content` | Content collection helpers |
| `…/content-config` | Default content collection schema |
| `…/llms` | `llms.txt` manifest generator |
| `…/plugins/remark-docfx` | Remark plugin for docfx-flavored Markdown quirks |

### Styles

| Export | Purpose |
| --- | --- |
| `…/styles/custom.css` | Base tokens + sidebar/code-view/sample styles |
| `…/styles/ig-theme.scss` | IG color palette mapped to design tokens |

---

## Subpath exports

Every component is reachable through an explicit subpath in
[`package.json#exports`](./package.json). Bare-specifier imports
(`igniteui-astro-components`) resolve to the JS/TS barrel
[`src/index.ts`](./src/index.ts) which re-exports the runtime helpers only —
`.astro` files must always be imported via their full subpath because Astro
components are not plain ES modules.

---

## Using from another repo without publishing a package

You do not need to release a version to npm to consume these components. Use one of the two approaches below.

### Option A — npm `file:` link (recommended for active development)

In the consumer repo, add a `file:` reference in `package.json`:

```json
{
  "dependencies": {
    "igniteui-astro-components": "file:../path/to/astro-components"
  }
}
```

Run `npm install` in the consumer repo. npm creates a symlink so every save in the components repo is instantly visible. All `package.json#exports` subpaths work exactly as they would with a published package.

```sh
# Consumer repo
npm install
# or, to refresh after adding new exports:
npm install ../path/to/astro-components
```

> **Windows note:** symlinks require Developer Mode or running your terminal as Administrator.

### Option B — TypeScript / Vite path alias (no install step)

Add a path alias in the consumer's `tsconfig.json` and `astro.config.ts` that maps the package name to the local source:

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "paths": {
      "igniteui-astro-components":            ["../astro-components/src/index.ts"],
      "igniteui-astro-components/*":          ["../astro-components/src/*"]
    }
  }
}
```

**`astro.config.ts`**
```ts
import path from 'node:path';
import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        'igniteui-astro-components': path.resolve('../astro-components/src/index.ts'),
      },
    },
  },
});
```

> The alias covers the JS/TS barrel. `.astro` component imports such as
> `'igniteui-astro-components/layouts/MainLayout.astro'` resolve automatically
> through the `paths` wildcard in `tsconfig.json` — Astro's Vite pipeline
> handles them at build time.

### Option C — direct relative imports (quick prototype)

Import component files directly by relative path without any alias or install:

```astro
---
import MainLayout from '../../astro-components/src/layouts/MainLayout/MainLayout.astro';
import DocsSidebar from '../../astro-components/src/components/sidebar/DocsSidebar.astro';
import ApiLink from '../../astro-components/src/components/mdx/ApiLink/ApiLink.astro';
---
```

This works immediately but ties your import paths to the internal folder structure. Switch to Option A or B before the project matures.

---

## Development

```sh
npm install
```

There is no build step — sources are published as-is and consumers compile
them through their own Astro / Vite pipeline. TypeScript is used only for
type-checking during development:

```sh
npx tsc --noEmit
```

---

## License

[MIT](./LICENSE)
