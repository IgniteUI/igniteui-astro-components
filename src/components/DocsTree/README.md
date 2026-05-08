# DocsTree

Base tree component shared by `DocsSidebar` and `DocsToc`. Wraps
`<igc-tree>` from `igniteui-webcomponents` and recursively renders
`<igc-tree-item>`s from a generic `TreeNode[]`.

The single styling locus is [`docs-tree.css`](./docs-tree.css). Designers
tune values via the `--docs-tree-*` CSS custom properties; per-variant
tweaks live at the bottom of the file under `[data-variant="sidebar"]`
and `[data-variant="toc"]` selectors.

## Usage

```astro
---
import DocsTree from 'igniteui-astro-components/components/DocsTree/DocsTree.astro';
import type { TreeNode } from 'igniteui-astro-components/components/DocsTree/types';
import MyLabel from './MyLabel.astro';

const nodes: TreeNode[] = [/* your tree */];
---
<DocsTree
  nodes={nodes}
  variant="sidebar"
  activeId="getting-started"
  toggleNodeOnClick
  renderLabel={MyLabel}
/>
```

## Props

| Prop                | Type                          | Notes |
| ---                 | ---                           | --- |
| `nodes`             | `TreeNode[]`                  | Required. Root of the tree. |
| `variant`           | `'sidebar' \| 'toc'`          | Required. Drives variant CSS rules. |
| `activeId`          | `string`                      | Optional. SSR-time match against `TreeNode.id`. **See active-state contract below.** |
| `toggleNodeOnClick` | `boolean`                     | Optional. Forwarded to `<igc-tree>`. |
| `renderLabel`       | Astro component               | Optional. Receives `{ node, depth, isLeaf, isActive }`. Falls back to a plain `<span>{node.label}</span>` when omitted. |

## TreeNode shape

```ts
interface TreeNode {
  id: string;                    // → data-tree-id
  label: string;                 // plain-text fallback
  href?: string;                 // when set, label is wrapped in <a href>
  expanded?: boolean;            // SSR expand hint
  children?: TreeNode[];
  itemData?: Record<string, string>;   // → kebab-case data-* attrs on <igc-tree-item>
  linkAttrs?: Record<string, string | number | boolean | undefined>;  // spread on leaf <a>
  meta?: Record<string, unknown>;      // free-form, read by renderLabel
}
```

A node with both `href` and `children` (e.g. a TOC h2 with h3 subheadings)
renders as a clickable parent — the `<a>` carries the `href`, and child
nodes render as nested `<igc-tree-item>`s.

## Active-state contract

DocsTree supports two non-overlapping ways to mark the active node:

1. **SSR (sidebar style):** pass `activeId`. The matching node's `<a>`
   gets `aria-current="page"` at render. The component never mutates
   `aria-current` after hydration.

2. **Runtime (toc style):** omit `activeId` and let a wrapper custom
   element (e.g. `<docs-toc>`) set `aria-current="true"` on links it
   selects via scroll-spy.

**Do not pass `activeId` AND mutate `aria-current` at runtime in the
same tree.** The two paths use different attribute *values* and would
flicker.

## Styling

All structural and per-variant rules are in
[`docs-tree.css`](./docs-tree.css). The file is imported once by
`DocsTree.astro`; Astro hoists and dedupes it.

Overridable tokens (set on `igc-tree`):

```
--docs-tree-row-pad-y
--docs-tree-row-pad-x
--docs-tree-row-radius
--docs-tree-row-color
--docs-tree-row-hover-bg
--docs-tree-row-hover-color
--docs-tree-row-active-bg
--docs-tree-row-active-color
--docs-tree-group-color
--docs-tree-nested-rule
--docs-tree-nested-pad-x
```

## Adapters

Consumers convert their domain types to `TreeNode[]` via small adapters:

- [`src/components/DocsSidebar/toTreeNodes.ts`](../DocsSidebar/toTreeNodes.ts)
  for `SidebarEntry[]`.
- [`src/components/DocsToc/toTreeNodes.ts`](../DocsToc/toTreeNodes.ts) for
  `MarkdownHeading[]`.
