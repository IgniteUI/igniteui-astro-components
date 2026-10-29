# Sidebar suite

The sidebar is composed of a few focused pieces on top of the shared
[`DocsTree`](../DocsTree/README.md) component:

| File                       | Export path                                         | Description                                                                 |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| `DocsSidebar.astro`        | `…/components/DocsSidebar/DocsSidebar.astro`        | Composition root — logo, filter and the scrollable tree                     |
| `SidebarFilterInput.astro` | `…/components/DocsSidebar/SidebarFilterInput.astro` | Filter `<input>` markup (`data-sidebar-filter-*` hooks)                     |
| `SidebarLabel.astro`       | `…/components/DocsSidebar/SidebarLabel.astro`       | Label renderer passed to `DocsTree` (`node`, `depth`, `isLeaf`, `isActive`) |
| `toTreeNodes.ts`           | `…/components/DocsSidebar/toTreeNodes`              | `SidebarEntry[]` → `TreeNode[]` adapter                                     |
| `sidebar-filter.ts`        | `…/components/DocsSidebar/sidebar-filter`           | `<sidebar-filter>` custom element                                           |
| `sidebar-tooltip.ts`       | (internal)                                          | Full-text tooltip for truncated labels                                      |

---

## DocsSidebar

The only component you need to mount directly.

### Import

```astro
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
```

### Props

| Prop            | Type             | Default             | Description                                                                                                                                       |
| --------------- | ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `currentSlug`   | `string`         | `''`                | Slug of the active page. Highlights the matching link and auto-expands ancestor groups.                                                           |
| `items`         | `SidebarEntry[]` | virtual module      | Sidebar tree to render. **Overrides** the `virtual:docs-template/site-meta` value when provided. Use this when not running `siteMetaIntegration`. |
| `showFilter`    | `boolean`        | `true`              | Render the filter input above the tree.                                                                                                           |
| `trailingSlash` | `boolean`        | from Astro config   | Append a trailing slash to generated links. Derived from the site's `trailingSlash` setting via the virtual module; `true` when unknown.          |
| `logoText`      | `string`         | product family      | Text in the slide-in sidebar's logo area.                                                                                                         |
| `platformLabel` | `string \| null` | from virtual module | Platform label under the logo text (for example `'Angular'`). Pass `null` to hide it.                                                             |

### Example

#### Prop-driven (no `siteMetaIntegration` required)

```astro
---
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';

// Define the tree inline or import from a shared config file.
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
      {
        label: 'Calendar',
        slug: 'components/calendar',
        badges: [{ text: 'New', variant: 'new' }],
      },
    ],
  },
];
---

<DocsSidebar items={sidebar} currentSlug="components/toast" />
```

Place it in the `sidebar` slot of `DocsLayout`:

```astro
<DocsLayout siteTitle="My Library" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" items={sidebar} currentSlug={slug} />
  <slot />
</DocsLayout>
```

#### With `siteMetaIntegration` (integration-driven)

When `createDocsSite()` / `siteMetaIntegration()` is configured, omit
`items` — the tree is read from the virtual module automatically.

```astro
---
import DocsSidebar from 'igniteui-astro-components/components/DocsSidebar/DocsSidebar.astro';
---

<DocsSidebar currentSlug="components/toast" />
```

### Sidebar data

#### Prop-driven

Pass the tree directly via the `items` prop (see example above).
A good pattern is to define the tree in a shared config file:

```ts
// src/site-config.ts
import type { SidebarEntry } from 'igniteui-astro-components/lib/sidebar/types';

export const SIDEBAR: SidebarEntry[] = [/* … */];
```

Then import it in every layout/page:

```astro
import {SIDEBAR} from '../site-config'; // …
<DocsSidebar items={SIDEBAR} currentSlug={slug} />
```

#### Integration-driven

Build the tree at config time using `buildSidebarFromToc()` and pass it to
`siteMetaIntegration` — it is then available automatically via the virtual
module:

```ts
// astro.config.ts
import { buildSidebarFromToc, siteMetaIntegration } from 'igniteui-astro-components/integration';

const sidebar = buildSidebarFromToc({ tocPath: './docs/toc.json', docsDir: './docs/en' });

export default defineConfig({
  integrations: [siteMetaIntegration({ title: 'My Docs', sidebar })],
});
```

### SidebarEntry type

Import from `igniteui-astro-components/lib/sidebar/types`; the file is the
source of truth, this is a summary:

```ts
type SidebarBadge = { text: string; variant: 'new' | 'updated' | 'preview' | 'premium' };

type SidebarLink = {
  label: string;
  slug: string;
  badges?: SidebarBadge[];
  attrs?: Record<string, string | boolean | undefined>;
};

type SidebarGroup = {
  label: string;
  collapsed?: boolean; // false = open by default; true = closed by default
  items: SidebarEntry[];
};

type SidebarEntry = SidebarLink | SidebarGroup;
```

`SIDEBAR_BADGE_VARIANTS` is exported from the same module. Helpers such as
`isGroup`, `isActive`, `getBreadcrumb` and `joinPath` live in
`igniteui-astro-components/lib/sidebar/helpers`.

### Filter behaviour

The `<sidebar-filter>` custom element handles live filtering:

- Typing in the input adds `data-filtering` to the host element.
- Items that match get `data-filter-match`; non-matching items are hidden via CSS.
- "No results" text is set via `data-no-results` on the host element.
- Filter state persists across Astro View Transitions navigations via `sessionStorage`.

### Truncated labels

Leaf labels are clamped to two lines. When a label overflows the clamp, hovering
or focusing its row shows the full text in a shared `<igc-tooltip>` (one per
sidebar, re-anchored to the current row by `sidebar-tooltip.ts`). Rows whose
label fits never show a tooltip; truncation is measured on each interaction, so
it stays correct after the sidebar is resized. Style it via
`.igd-sidebar-tooltip` and the `--ig-tooltip-*` variables. Below the tablet
breakpoint (< 1280px, where the sidebar is a slide-in overlay) labels are not
clamped and the tooltip is not shown.

---

## Building a custom sidebar

`DocsSidebar` converts `SidebarEntry[]` to `TreeNode[]` with `toTreeNodes()`
and renders them through `DocsTree` with `SidebarLabel` as the label renderer.
To build your own layout, reuse those pieces:

```astro
---
import DocsTree from 'igniteui-astro-components/components/DocsTree/DocsTree.astro';
import SidebarLabel from 'igniteui-astro-components/components/DocsSidebar/SidebarLabel.astro';
import { toTreeNodes } from 'igniteui-astro-components/components/DocsSidebar/toTreeNodes';

const nodes = toTreeNodes(sidebar, currentSlug, { trailingSlash: true });
---

<DocsTree
  nodes={nodes}
  variant="sidebar"
  activeId={currentSlug}
  toggleNodeOnClick
  renderLabel={SidebarLabel}
/>
```

See the [DocsTree README](../DocsTree/README.md) for the `TreeNode` shape and
the `--docs-tree-*` styling tokens.
