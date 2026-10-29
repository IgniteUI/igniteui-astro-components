# igniteui-astro-components

Reusable [Astro](https://astro.build) components, layouts, integrations, and
utilities used to build Infragistics / Ignite UI documentation sites.

This package provides the navbar, sidebar, search, page frame, and MDX
components for Infragistics documentation sites, keeping the integration
story simple for consumer repos.

> **Status:** internal. Consumed by
> [igniteui-documentation](https://github.com/IgniteUI/igniteui-documentation)
> (`docs-template`), api-docs and the Infragistics blog. The docs repo keeps its
> own fork of the Astro integration and uses this package as a component library.

> **For AI agents:** start with [`llms.txt`](./llms.txt) — an index of every
> export with its props and a link to the README that documents it. The package
> ships it, so in a consumer it is at
> `node_modules/igniteui-astro-components/llms.txt`. Working on this repo? Read
> [`AGENTS.md`](./AGENTS.md).

---

## Installation

```sh
npm install igniteui-astro-components
```

Peer dependencies: `astro@^7.3.5`, `igniteui-theming@^29`,
`igniteui-webcomponents@^7.4.1`. There is no build step: the package ships its
`.astro`, `.ts` and `.scss` sources and your Astro/Vite pipeline compiles them.

---

## Quick start

This is the setup every current consumer uses: the package as a component
library, with the host owning its Astro config.

**1. Astro config.** Enable MDX and let Sass resolve the package's bare
`@use 'igniteui-theming/...'` imports:

```ts
// astro.config.ts
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { rehypeHeadingAnchors } from 'igniteui-astro-components/plugins/rehype-heading-anchors';

export default defineConfig({
  integrations: [mdx()],
  markdown: { rehypePlugins: [rehypeHeadingAnchors] },
  vite: { css: { preprocessorOptions: { scss: { loadPaths: ['node_modules'] } } } },
});
```

**2. Virtual modules.** `DocsLayout`, `DocsSidebar`, `DocsSubHeader`,
`GlobalNavBar` and `GlobalFooter` import `virtual:docs-template/site-meta` and
`virtual:docs-template/nav-html` at module level, so both must resolve. Either
run `siteMetaIntegration()` or stub them with a small Vite plugin — copy
`virtualDocsModules()` from [playground/astro.config.mjs](playground/astro.config.mjs).
The contract is in [src/virtual-modules.d.ts](src/virtual-modules.d.ts).

**3. Middleware.** `ApiLink`, `ApiRef`, `PlatformBlock`, `Sample` and
`ThemingWidget` read `Astro.locals.platformContext` and
`Astro.locals.envVars`. Set them in `src/middleware.ts`; see
[playground/src/middleware.ts](playground/src/middleware.ts) for the shape
(`PlatformContext` is exported from `igniteui-astro-components/lib/types`).

**4. A page.** `DocsLayout` imports `styles/theme.scss` and the JetBrains Mono
font itself, so nothing else is needed:

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';

const { slug } = Astro.params;
const { headings } = Astro.props;
---

<DocsLayout title="Hello" siteTitle="My Library" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" items={sidebar} currentSlug={slug} />
  <DocsToc slot="toc" headings={headings} offsetTarget=".docs-subheader" />
  <slot />
</DocsLayout>
```

**5. MDX components.** Nothing is auto-registered. Import what a topic uses at
the top of the MDX file (the convention in the docs repos):

```mdx
import Sample from 'igniteui-astro-components/components/mdx/Sample.astro';
import ApiLink from 'igniteui-astro-components/components/mdx/ApiLink.astro';
import DocsAside from 'igniteui-astro-components/components/mdx/DocsAside.astro';
import PlatformBlock from 'igniteui-astro-components/components/mdx/PlatformBlock.astro';
```

or pass them through the `components` map of `<Content />` when the MDX is
authored without imports.

### The reference integration

`igniteui-astro-components/integration` exports `createDocsSite()` and
`siteMetaIntegration()`: a full docs-site config (site meta virtual modules,
sidebar from a JSON TOC, static images, remark/rehype pipeline, Pagefind index,
`llms.txt` generation, the Infragistics chrome). It is the origin of the docs
repo's integration, but it is **not usable as-is today**: it injects route files
that are not in this package, it imports `pagefind` without declaring it, and it
registers no middleware. Treat it as reference code until those issues are
closed.

---

## Fonts

`DocsLayout` imports the **JetBrains Mono** variable font from
`@fontsource-variable/jetbrains-mono` (self-hosted, no CDN request) and
`styles/theme.scss` sets `--font-mono: 'JetBrains Mono Variable'` on `:root`.
The sans-serif stack is the Infragistics brand font through
`--igd-font-sans`, and code uses `--igd-font-mono`. Override either custom
property to change the fonts site-wide.

---

## Prop-driven usage (without `siteMetaIntegration`)

By default, `DocsLayout`, `DocsSidebar`, and `DocsSubHeader` read their data (site title, sidebar tree, product links) from the `virtual:docs-template/site-meta` virtual module that is provided by `siteMetaIntegration` / `createDocsSite`.

If you are not using the integration — for example when consuming the package via a GitHub dependency in a project that builds its own config — every piece of data can be passed directly as a prop instead.

### DocsLayout

| Prop        | Overrides                                   |
| ----------- | ------------------------------------------- |
| `siteTitle` | `virtual:docs-template/site-meta` → `title` |

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
---

<DocsLayout title="Toast" siteTitle="My Library" hasSidebar currentSlug="components/toast">
  <slot />
</DocsLayout>
```

### DocsSidebar

| Prop    | Overrides                                     |
| ------- | --------------------------------------------- |
| `items` | `virtual:docs-template/site-meta` → `sidebar` |

```astro
---
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
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
    items: [{ label: 'Toast', slug: 'components/toast' }],
  },
];
---

<DocsSidebar items={sidebar} currentSlug="components/toast" />
```

### DocsSubHeader

| Prop           | Overrides                                                           |
| -------------- | ------------------------------------------------------------------- |
| `siteTitle`    | `virtual:docs-template/site-meta` → `title`                         |
| `productLinks` | `virtual:docs-template/site-meta` → `productLinks`                  |
| `sidebarItems` | `virtual:docs-template/site-meta` → `sidebar` (used for breadcrumb) |

```astro
---
import DocsSubHeader from 'igniteui-astro-components/components/DocsSubHeader.astro';

const productLinks = [
  { label: 'Angular', href: '/angular/', platform: 'angular' },
  { label: 'React', href: '/react/', platform: 'react' },
];
---

<DocsSubHeader siteTitle="My Library" productLinks={productLinks} currentSlug="components/toast" />
```

### Combining prop-driven components without the integration

A minimal setup that needs no virtual modules or Astro integration:

```astro
---
// src/layouts/MyDocsLayout.astro
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';
import type { MarkdownHeading } from 'astro';

interface Props {
  title: string;
  currentSlug: string;
  headings?: MarkdownHeading[];
}

const { title, currentSlug, headings } = Astro.props;

const sidebar: SidebarEntry[] = [/* … your tree … */];
---

<DocsLayout title={title} siteTitle="My Library" hasSidebar currentSlug={currentSlug}>
  <DocsSidebar slot="sidebar" items={sidebar} currentSlug={currentSlug} />
  {headings && <DocsToc slot="toc" headings={headings} offsetTarget=".docs-subheader" />}
  <slot />
</DocsLayout>
```

> The virtual modules still need to be resolvable at build time (they are declared in `src/virtual-modules.d.ts`). When not using `siteMetaIntegration`, add stub exports to your `astro.config.ts` using the playground's `virtualDocsModules` pattern — see [playground/astro.config.mjs](playground/astro.config.mjs) for a reference implementation.

---

## What's included

### Astro integration

| Export                                  | Purpose                                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `igniteui-astro-components/integration` | `createDocsSite()`, `siteMetaIntegration()`, `staticImagesIntegration()`, `buildSidebarFromToc()` re-export |

### Layouts

| Export                                               | Purpose                                                                                 | Docs                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `igniteui-astro-components/layouts/DocsLayout.astro` | Top-level page shell — global nav + sub-header + optional sidebar + main frame + footer | [README](src/layouts/DocsLayout/README.md) |

### Chrome components

| Export                                   | Purpose                                                                            | Docs                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `…/components/GlobalNavBar.astro`        | IG global navigation bar — legacy, fetched from `/navigation`                      | [README](src/components/GlobalNavBar/README.md)        |
| `…/components/GlobalFooter.astro`        | IG global footer — legacy, fetched from `/navigation`                              | [README](src/components/GlobalFooter/README.md)        |
| `…/chrome`                               | `igChrome()` — render the header/footer from a synced snapshot                     | [below](#the-infragistics-header-and-footer)           |
| `…/chrome/contract`                      | `parseFragment()` — the `ig-chrome` contract checks, for sync scripts              | [below](#the-infragistics-header-and-footer)           |
| `…/components/DocsSubHeader.astro`       | Secondary fixed bar — site title, product links, package/version selectors, search | [README](src/components/DocsSubHeader/README.md)       |
| `…/components/Search.astro`              | Pagefind-powered full-text search modal                                            | [README](src/components/Search/README.md)              |
| `…/components/SearchAdvanced.astro`      | Client-side API symbol search over a JSON index (api-docs)                         | [README](src/components/SearchAdvanced/README.md)      |
| `…/components/ThemingWidget.astro`       | Theme / colour-mode picker                                                         | [README](src/components/ThemingWidget/README.md)       |
| `…/components/CopyCode.astro`            | Adds a copy button to every Shiki code block                                       | [README](src/components/CopyCode/README.md)            |
| `…/components/MobileSidebarToggle.astro` | Mobile-only sidebar disclosure button                                              | [README](src/components/MobileSidebarToggle/README.md) |
| `…/components/MobileTocToggle.astro`     | Mobile-only "On this page" dropdown                                                | [README](src/components/MobileTocToggle/README.md)     |
| `…/components/DocsToc.astro`             | "On this page" table of contents with scroll-spy                                   | [README](src/components/DocsToc/README.md)             |
| `…/components/DocsToc/toTreeNodes`       | `headingsToTreeNodes()`, `TocConfig` — headings → `TreeNode[]`                     | [README](src/components/DocsToc/README.md)             |

`DocsBreadcrumb` and `LicenseIndicator` are rendered by `DocsLayout` but are
not exported yet.

### Sidebar and tree

| Export                                              | Purpose                                                                                    | Docs                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `…/components/DocsSidebar/DocsSidebar.astro`        | Composition root — logo, filter input, tree                                                | [README](src/components/DocsSidebar/README.md) |
| `…/components/DocsSidebar/SidebarFilterInput.astro` | Filter input markup                                                                        | [README](src/components/DocsSidebar/README.md) |
| `…/components/DocsSidebar/SidebarLabel.astro`       | Label renderer used with `DocsTree`                                                        | [README](src/components/DocsSidebar/README.md) |
| `…/components/DocsSidebar/toTreeNodes`              | `toTreeNodes()` — `SidebarEntry[]` → `TreeNode[]`                                          | [README](src/components/DocsSidebar/README.md) |
| `…/components/DocsSidebar/sidebar-filter`           | `<sidebar-filter>` custom element + cross-navigation hooks                                 | [README](src/components/DocsSidebar/README.md) |
| `…/components/DocsTree/DocsTree.astro`              | Generic `<igc-tree>` renderer shared by sidebar and TOC                                    | [README](src/components/DocsTree/README.md)    |
| `…/components/DocsTree/DocsTreeItem.astro`          | One `<igc-tree-item>`, recursive                                                           | [README](src/components/DocsTree/README.md)    |
| `…/components/DocsTree/types`                       | `TreeNode`, `TreeVariant`                                                                  | [README](src/components/DocsTree/README.md)    |
| `…/components/DocsTree/docs-tree.css`               | Tree styles (export points at a missing file, see #159; the real file is `docs-tree.scss`) | [README](src/components/DocsTree/README.md)    |
| `…/lib/sidebar/types`                               | `SidebarEntry`, `SidebarGroup`, `SidebarLink`, `SidebarBadge`, `SIDEBAR_BADGE_VARIANTS`    | —                                              |
| `…/lib/sidebar/helpers`                             | `isActive`, `isGroup`, `isInitiallyOpen`, `getBreadcrumb`, `joinPath`, …                   | —                                              |
| `…/lib/types`                                       | `PlatformName`, `ApiPackageConfig`, `PlatformContext`                                      | —                                              |
| `…/sidebar`                                         | `buildSidebarFromToc()` — JSON TOC → sidebar tree converter (build-time)                   | —                                              |

### MDX components

| Export                                 | Purpose                                                   | Docs                                                 |
| -------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `…/components/mdx/ApiLink.astro`       | Inline link to an API symbol with platform-aware URLs     | [README](src/components/mdx/ApiLink/README.md)       |
| `…/components/mdx/ApiRef.astro`        | Block "API References" list                               | [README](src/components/mdx/ApiRef/README.md)        |
| `…/components/mdx/Sample.astro`        | Embedded live sample with code tabs and live-edit buttons | [README](src/components/mdx/Sample/README.md)        |
| `…/components/mdx/PlatformBlock.astro` | Show content only on selected platforms                   | [README](src/components/mdx/PlatformBlock/README.md) |
| `…/components/mdx/DocsAside.astro`     | Note / info / warning callout                             | [README](src/components/mdx/DocsAside/README.md)     |
| `…/components/mdx/Badge.astro`         | Status chip (preview, new, updated, premium, opensource)  | [README](src/components/mdx/Badge/README.md)         |
| `…/components/mdx/Anatomy.astro`       | Framed component anatomy image                            | [README](src/components/mdx/Anatomy/README.md)       |
| `…/components/mdx/DoDont.astro`        | Side-by-side Do / Don't image guidance panels             | [README](src/components/mdx/DoDont/README.md)        |
| `…/components/mdx/Faq.astro`           | FAQ accordion                                             | [README](src/components/mdx/Faq/README.md)           |
| `…/components/mdx/FaqItem.astro`       | One question/answer panel                                 | [README](src/components/mdx/Faq/README.md)           |
| `…/components/mdx/Faq/types`           | `FaqEntry`, `FaqIndicatorPosition`                        | [README](src/components/mdx/Faq/README.md)           |

### Build helpers

| Export                             | Purpose                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `…/platform`                       | `PlatformKey`, `NavLang`, `getPlatformHead()`, `getNavConfig()`, `PLATFORM_DEFS` |
| `…/content`                        | `createDocsCollection()` content collection helper                               |
| `…/content-config`                 | Default content collection schema                                                |
| `…/llms`                           | `buildLlmsTxt()` — generates `llms.txt` files for a docs _site_                  |
| `…/plugins/remark-env-vars`        | Remark plugin — `{Environment.X}` token substitution                             |
| `…/plugins/remark-md-links`        | Remark plugin — `.md` → slug link rewriting + `DOCS_BASE` prepending             |
| `…/plugins/remark-html-transforms` | Remark plugin — divider→`<hr>`, code lang normalization, img src fixes           |
| `…/plugins/rehype-heading-anchors` | Rehype plugin — anchor links on headings (used by every consumer)                |
| `…/plugins/rehype-table-wrapper`   | Rehype plugin — wraps tables for horizontal scrolling                            |
| `…/plugins/rehype-pagefind-ignore` | Rehype plugin — `data-pagefind-ignore` on code blocks                            |

### Styles

| Export                | Purpose                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `…/styles/theme.scss` | The only stylesheet: igniteui-theming setup, layer order, `--igd-*` tokens, markdown and code-block styles. `DocsLayout` imports it. |

Design tokens are CSS custom properties prefixed `--igd-` and defined on
`:root` in [src/styles/global/\_variables.scss](src/styles/global/_variables.scss)
(fonts, accent, surfaces, spacing, radius, badges, asides, FAQ, tables).
Override them in the host's own stylesheet; there are no Sass `!default`
variables to configure.

---

## The Infragistics header and footer

The marketing site (Marketing-Infragistics) is the single source of the
Infragistics header and footer. It publishes them at
`/assets/chrome/fragment.html`: one versioned fragment (`ig-chrome v1`) with
scoped CSS and one classic script. tripwire renders it server-side; a site built
on this package keeps a **snapshot** of it in its own repo and renders it from
there.

### Which header and footer a page gets

`DocsLayout` decides per build:

| Build                                       | Renders                                                      | Source                                                          |
| ------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| the site registers `igChrome({ snapshot })` | the **marketing site's exported chrome**                     | the site's snapshot folder; nothing fetched at build or runtime |
| `navLang: 'jp'`                             | the legacy Japanese chrome (`GlobalNavBar` / `GlobalFooter`) | fetched from `jp.infragistics.com/navigation` at build          |
| the site does not register `igChrome`       | the legacy chrome (`GlobalNavBar` / `GlobalFooter`)          | fetched from `www.infragistics.com/navigation` at build         |

Japanese builds stay on the legacy chrome even with `igChrome`, until a
Japanese fragment is published.

### Using the snapshot

**1. Keep a snapshot in the repo.** One folder, shared by every Astro project in
the repo, with one subfolder per source:

```
ig-chrome/
  staging/       from https://astro-staging.infragistics.com/assets/chrome/fragment.html
  production/    from https://www.infragistics.com/assets/chrome/fragment.html
    manifest.json      contract, build hash, source, sync time
    fragment.html      asset URLs written as %IG_CHROME_ASSETS%/…
    assets/chrome.css
    assets/chrome.js
    assets/media/*     every image the chrome loads from the marketing host
```

Each consumer repo owns the script that writes it (`scripts/chrome-sync.mjs` in
docs-template and api-docs). It validates the fragment with this package's
`igniteui-astro-components/chrome/contract`, the same checks the build and
tripwire apply, and writes nothing when the build hash is unchanged.

The **marketing site's deploy runs it**: after each deploy, its `sync-chrome` job
(Marketing-Infragistics, `.github/workflows/deploy.yml`) hands each docs repo the
export it just deployed, runs that repo's script, and opens a PR when the chrome
changed. Nothing in a docs repo has to reach the marketing site's hosts. To
sync by hand, run the script locally (see the docs repo's README).

**2. Register the integration**, with the snapshot for the build's environment:

```ts
import { igChrome } from 'igniteui-astro-components/chrome';

integrations: [
  igChrome({ snapshot: isProduction ? './ig-chrome/production' : './ig-chrome/staging' }),
];
```

or `createDocsSite({ chrome: { snapshot } })`, which also drops the legacy
chrome's `navigation.css`, `footer.css`, jQuery, `plugins.nav.js` and
`navigation.js` from `<head>` (`getPlatformHead(platform, lang, { legacyChrome: false })`).

Per build, `igChrome`:

- validates the snapshot against the contract. A missing, broken or
  incompatible snapshot **fails the build**, naming the folder;
- has `DocsLayout` render its head, header and footer parts;
- serves the CSS, JS and images from the site's own build, under its base path:
  `{base}/_ig-chrome/{build}/…`. Every deployment is self-contained: nothing is
  loaded from the marketing host at runtime except the Google Fonts stylesheet
  the fragment links. Pages carry `<meta name="ig-chrome" content="v1 build=…">`.

### How a nav change reaches a site

```
Marketing-Infragistics: push to staging / main
        │
        ├─ deploy job ──► build ──► S3  (publishes /assets/chrome/fragment.html, build=abc123)
        │                   └──► uploads the export as an artifact
        │
        └─ sync-chrome job, for each docs repo (igniteui-documentation, api-docs)
                │  checks out the repo, runs ITS scripts/chrome-sync.mjs on the export
                │
                ├─ same build hash ──► nothing to do
                └─ new build ────────► PR in the docs repo:
                                       ig-chrome/staging     (deploys from staging)
                                       ig-chrome/production  (deploys from main)
                                       │
                                       review, merge ──► the next docs build renders it
```

A sync changes only the snapshot folder. No release of this package is needed
when the marketing site changes its navigation. The `sync-chrome` job needs a
GitHub App with write access to the docs repos; until it is configured the job
is skipped and a sync is run locally.

### Why the legacy chrome is still here

`GlobalNavBar` / `GlobalFooter` and their `/navigation` fetch stay for now:

- **Japanese** has no fragment yet, so Japanese builds use them.
- **Sites that haven't adopted `igChrome`** keep exactly the behaviour they had,
  so adopting the snapshot is a per-site change, not a breaking release.

Once a Japanese fragment exists and every site using `DocsLayout` has a
snapshot, the legacy chrome and its fetch can be removed.

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
      "igniteui-astro-components": ["../astro-components/src/index.ts"],
      "igniteui-astro-components/*": ["../astro-components/src/*"]
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
> `'igniteui-astro-components/layouts/DocsLayout.astro'` resolve automatically
> through the `paths` wildcard in `tsconfig.json` — Astro's Vite pipeline
> handles them at build time.

### Option C — direct relative imports (quick prototype)

Import component files directly by relative path without any alias or install:

```astro
---
import DocsLayout from '../../astro-components/src/layouts/DocsLayout/DocsLayout.astro';
import DocsSidebar from '../../astro-components/src/components/DocsSidebar/DocsSidebar.astro';
import ApiLink from '../../astro-components/src/components/mdx/ApiLink/ApiLink.astro';
---
```

This works immediately but ties your import paths to the internal folder structure. Switch to Option A or B before the project matures.

---

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, the playground, tests,
lint/format, how to add a component, and how releases work. The short version:

```sh
npm ci
npm run playground        # http://localhost:4567
npm test && npm run lint && npm run playground:check
```

---

## License

[MIT](./LICENSE)
