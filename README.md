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

## What's included

### Astro integration

| Export | Purpose |
| --- | --- |
| `igniteui-astro-components/integration` | `createDocsSite()`, `siteMetaIntegration()`, `staticImagesIntegration()`, `buildSidebarFromToc()` re-export |

### Layouts

| Export | Purpose |
| --- | --- |
| `igniteui-astro-components/layouts/MainLayout.astro` | Top-level page shell — global nav + sub-header + optional sidebar + main frame + footer |

### Chrome components

| Export | Purpose |
| --- | --- |
| `…/components/GlobalNavBar.astro` | IG / AppBuilder global navigation bar |
| `…/components/GlobalFooter.astro` | IG global footer |
| `…/components/DocsSubHeader.astro` | Secondary fixed bar — site title + breadcrumb + product links + search |
| `…/components/Search.astro` | Pagefind-powered full-text search modal |
| `…/components/ThemingWidget.astro` | Theming widget |
| `…/components/MobileSidebarToggle.astro` | Mobile-only sidebar disclosure button |

### Sidebar suite

| Export | Purpose |
| --- | --- |
| `…/components/sidebar/DocsSidebar.astro` | Composition root — filter input + recursive tree |
| `…/components/sidebar/SidebarTree.astro` | Recursive `<ul>` of items |
| `…/components/sidebar/SidebarItem.astro` | One link or `<details>` group |
| `…/components/sidebar/SidebarFilterInput.astro` | Filter input markup |
| `…/components/sidebar/sidebar-filter` | `<sidebar-filter>` custom element + cross-navigation hooks |
| `…/lib/sidebar/types` | `SidebarEntry`, `SidebarGroup`, `SidebarLink`, `SidebarBadge` |
| `…/lib/sidebar/helpers` | `isActive`, `isGroup`, `isInitiallyOpen`, `getBreadcrumb`, `joinPath`, … |
| `…/sidebar` | `buildSidebarFromToc()` — TOC → sidebar tree converter (build-time) |

### MDX components

| Export | Purpose |
| --- | --- |
| `…/components/mdx/ApiLink.astro` | Inline link to an API symbol with platform-aware URLs |
| `…/components/mdx/ApiRef.astro` | Block API reference card |
| `…/components/mdx/PlatformBlock.astro` | Show content only on selected platforms |
| `…/components/mdx/Sample.astro` | Embedded code-view sample widget |

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
