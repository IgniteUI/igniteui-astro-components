# MobileSidebarToggle

Mobile-only fixed disclosure button that toggles the sidebar overlay. Hidden on desktop via CSS.

## Import

```astro
import MobileSidebarToggle from 'igniteui-astro-components/components/MobileSidebarToggle.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Components List'` | Visible button text and aria-label suffix. Typically the active section name. |

## Behaviour

- Sets `aria-expanded` and controls `#docs-sidebar` via `aria-controls`.
- The sidebar overlay open/close CSS is driven by a custom element or a script that toggles a class on the `<nav>`.

## Example

```astro
---
import MobileSidebarToggle from 'igniteui-astro-components/components/MobileSidebarToggle.astro';
---
<MobileSidebarToggle label="Components" />
```

Used automatically inside `MainLayout` when `hasSidebar={true}`.
