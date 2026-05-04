# Sidebar suite

The sidebar is composed of four focused components and a custom element:

| File | Export path | Description |
|------|-------------|-------------|
| `DocsSidebar.astro` | `…/components/sidebar/DocsSidebar.astro` | Composition root — filter + scrollable tree |
| `SidebarFilterInput.astro` | `…/components/sidebar/SidebarFilterInput.astro` | Filter `<input>` markup |
| `SidebarTree.astro` | `…/components/sidebar/SidebarTree.astro` | Recursive `<ul>` renderer |
| `SidebarItem.astro` | `…/components/sidebar/SidebarItem.astro` | Single link or `<details>` group |
| `sidebar-filter.ts` | `…/components/sidebar/sidebar-filter` | `<sidebar-filter>` custom element |

---

## DocsSidebar

The only component you need to mount directly.

### Import

```astro
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentSlug` | `string` | `''` | Slug of the active page. Highlights the matching link and auto-expands ancestor groups. |
| `items` | `SidebarEntry[]` | virtual module | Sidebar tree to render. **Overrides** the `virtual:docs-template/site-meta` value when provided. Use this when not running `siteMetaIntegration`. |

### Example

#### Prop-driven (no `siteMetaIntegration` required)

```astro
---
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
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
      { label: 'Calendar', slug: 'components/calendar', badge: { text: 'New', variant: 'success' } },
    ],
  },
];
---
<DocsSidebar items={sidebar} currentSlug="components/toast" />
```

Place it in the `sidebar` slot of `MainLayout`:

```astro
<MainLayout siteTitle="My Library" hasSidebar currentSlug={slug}>
  <DocsSidebar slot="sidebar" items={sidebar} currentSlug={slug} />
  <slot />
</MainLayout>
```

#### With `siteMetaIntegration` (integration-driven)

When `createDocsSite()` / `siteMetaIntegration()` is configured, omit
`items` — the tree is read from the virtual module automatically.

```astro
---
import DocsSidebar from 'igniteui-astro-components/components/sidebar/DocsSidebar.astro';
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

export const SIDEBAR: SidebarEntry[] = [ /* … */ ];
```

Then import it in every layout/page:

```astro
import { SIDEBAR } from '../site-config';
// …
<DocsSidebar items={SIDEBAR} currentSlug={slug} />
```

#### Integration-driven

Build the tree at config time using `buildSidebarFromToc()` and pass it to
`siteMetaIntegration` — it is then available automatically via the virtual
module:

```ts
// astro.config.ts
import { buildSidebarFromToc, siteMetaIntegration } from 'igniteui-astro-components/integration';

const sidebar = buildSidebarFromToc({ tocPath: './docs/toc.yml', docsDir: './docs/en' });

export default defineConfig({
  integrations: [
    siteMetaIntegration({ title: 'My Docs', sidebar }),
  ],
});
```

### SidebarEntry type

```ts
type SidebarLink = {
  label: string;
  slug: string;
  badge?: { text: string; variant: 'note' | 'tip' | 'caution' | 'danger' | 'success' | 'default' };
  attrs?: Record<string, string | boolean | undefined>;
};

type SidebarGroup = {
  label: string;
  collapsed?: boolean;   // false = open by default; true = closed by default
  items: SidebarEntry[];
};

type SidebarEntry = SidebarLink | SidebarGroup;
```

### Filter behaviour

The `<sidebar-filter>` custom element handles live filtering:
- Typing in the input adds `data-filtering` to the host element.
- Items that match get `data-filter-match`; non-matching items are hidden via CSS.
- "No results" text is set via `data-no-results` on the host element.
- Filter state persists across Astro View Transitions navigations via `sessionStorage`.

---

## SidebarTree / SidebarItem

These are used internally by `DocsSidebar`. Import them directly only when building a fully custom sidebar layout.

```astro
import SidebarTree from 'igniteui-astro-components/components/sidebar/SidebarTree.astro';
import SidebarItem from 'igniteui-astro-components/components/sidebar/SidebarItem.astro';
```

`SidebarTree` props: `items: SidebarEntry[]`, `currentSlug: string`, `ancestors?: string[]`

`SidebarItem` props: `item: SidebarEntry`, `currentSlug: string`, `ancestors?: string[]`
