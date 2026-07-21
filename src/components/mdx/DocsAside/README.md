# DocsAside

Renders a styled callout block (note, tip, warning, or danger) with a type-specific icon, color accent, and accessible label. Use it in MDX pages to surface important information inline.

## Import

```astro
import DocsAside from 'igniteui-astro-components/components/mdx/DocsAside.astro';
```

## Props

| Prop    | Type                                       | Default  | Description                                                                                               |
| ------- | ------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------- |
| `type`  | `'note' \| 'tip' \| 'warning' \| 'danger'` | `'note'` | Semantic variant — controls the color accent and default icon.                                            |
| `title` | `string`                                   | auto     | Override the heading text. Defaults to the capitalised `type` name (`Note`, `Tip`, `Warning`, `Danger`).  |
| `color` | `string`                                   | —        | Override the accent color via the `--aside-color` CSS custom property. Accepts any valid CSS color value. |
| `icon`  | `string`                                   | auto     | Override the icon with raw SVG markup. Pass an empty string `""` to suppress the icon entirely.           |
| `class` | `string`                                   | —        | Additional CSS class(es) to add to the `<aside>` element.                                                 |

## Examples

```mdx
{/* Default note */}

<DocsAside>This is a general note.</DocsAside>

{/* Tip variant */}

<DocsAside type="tip">Use keyboard shortcuts to speed up your workflow.</DocsAside>

{/* Warning with custom title */}

<DocsAside type="warning" title="Breaking change">
  The `foo` prop was removed in v2. Use `bar` instead.
</DocsAside>

{/* Danger */}

<DocsAside type="danger">Deleting this record is irreversible.</DocsAside>

{/* Custom accent color */}

<DocsAside type="note" color="hsl(280, 80%, 50%)">
  A purple-accented callout.
</DocsAside>

{/* No icon */}

<DocsAside type="tip" icon="">
  This tip has no icon.
</DocsAside>
```

## Variants

| `type`    | Accent color | Default title |
| --------- | ------------ | ------------- |
| `note`    | Blue         | Note          |
| `tip`     | Green        | Tip           |
| `warning` | Amber        | Warning       |
| `danger`  | Red          | Danger        |

## Icons

The built-in icons live in `src/icons/aside/` as raw SVG files. They are imported with Astro's `?raw` query and injected inline so they inherit the current `color` via `fill: currentColor`.
