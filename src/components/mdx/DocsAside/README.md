# DocsAside

Renders a styled callout block (note, info or warning) with a type-specific icon, colour accent and accessible label. Use it in MDX pages to surface important information inline.

## Import

```astro
import DocsAside from 'igniteui-astro-components/components/mdx/DocsAside.astro';
```

## Props

| Prop    | Type                            | Default  | Description                                                                                                       |
| ------- | ------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `type`  | `'note' \| 'info' \| 'warning'` | `'note'` | Semantic variant — controls the colour accent, the default title and the default icon.                            |
| `title` | `string`                        | auto     | Override the heading text. Defaults to `Note`, `Info` or `Warning`.                                               |
| `icon`  | `string`                        | auto     | Name of an icon registered in the `docs` collection (`src/scripts/icon-manifest.ts`). Pass `""` to hide the icon. |
| `class` | `string`                        | —        | Additional CSS class(es) added to the container.                                                                  |

The component also declares a `color` prop, but nothing reads it; use the CSS
custom properties below to change the accent instead.

## Examples

```mdx
{/* Default note */}

<DocsAside>This is a general note.</DocsAside>

{/* Info */}

<DocsAside type="info">The grid virtualises rows by default.</DocsAside>

{/* Warning with custom title */}

<DocsAside type="warning" title="Breaking change">
  The `foo` prop was removed in v2. Use `bar` instead.
</DocsAside>

{/* No icon */}

<DocsAside type="info" icon="">
  This callout has no icon.
</DocsAside>
```

## Variants

| `type`    | Accent            | Default title |
| --------- | ----------------- | ------------- |
| `note`    | Gray              | Note          |
| `info`    | Primary (blue)    | Info          |
| `warning` | Secondary (amber) | Warning       |

## Markup

```html
<div class="igd-aside igd-aside--info" role="note" aria-label="Info">
  <igc-icon class="igd-aside__icon" name="info" collection="docs" aria-hidden="true"></igc-icon>
  <span class="igd-aside__title" aria-hidden="true">Info</span>
  <div class="igd-aside__content">…</div>
</div>
```

## Styling

Layout tokens, defined on `:root` in `src/styles/global/_variables.scss`:

```
--igd-aside-padding          --igd-aside-row-gap        --igd-aside-column-gap
--igd-aside-border-width     --igd-aside-border-style   --igd-aside-border-radius
--igd-aside-margin-bottom
```

Per-variant colour tokens, one set each for `note`, `info` and `warning`:

```
--igd-aside-{type}-bg        --igd-aside-{type}-border  --igd-aside-{type}-title
--igd-aside-{type}-content   --igd-aside-{type}-icon    --igd-aside-{type}-code-background
```

Each colour token uses `light-dark()` so it follows the page's `data-theme`.
