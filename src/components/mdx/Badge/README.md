# Badge

Renders the docs status badge via `igc-badge`. It uses the same base styling that was previously defined for sidebar badges, with five semantic variants: `preview`, `new`, `updated`, `premium`, and `opensource`.

## Import

```astro
import Badge from 'igniteui-astro-components/components/mdx/Badge.astro';
```

## Props

| Prop          | Type                                                           | Default     | Description                                                                     |
| ------------- | -------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `variant`     | `'preview' \| 'new' \| 'updated' \| 'premium' \| 'opensource'` | `'preview'` | Visual variant controlling color.                                               |
| `class`       | `string`                                                       | —           | Extra CSS classes forwarded to the `igc-badge` element.                         |
| `aria-hidden` | `boolean \| string`                                            | —           | Hides the badge from assistive technology. Useful for purely decorative badges. |
| `aria-label`  | `string`                                                       | —           | Override the accessible label.                                                  |

## Examples

```mdx
{/* Default — preview variant */}

<Badge />

{/* Explicit variants */}

<Badge variant="new" />
<Badge variant="updated" />
<Badge variant="premium" />
<Badge variant="opensource" />

{/* Inside a heading */}

## My Feature <Badge variant="new" />

{/* Custom slot content */}

<Badge variant="preview">Coming Soon</Badge>

{/* Decorative — hidden from screen readers */}

<Badge variant="new" aria-hidden="true" />
```

## Variants

| `variant`    | Default text | Color token group    |
| ------------ | ------------ | -------------------- |
| `preview`    | Preview      | `--igd-preview-*`    |
| `new`        | New          | `--igd-new-*`        |
| `updated`    | Updated      | `--igd-updated-*`    |
| `premium`    | Premium      | `--igd-premium-*`    |
| `opensource` | Open Source  | `--igd-opensource-*` |

## Styling

Colors are driven by CSS custom properties set on the `igc-badge` host:

| Property             | Purpose                              |
| -------------------- | ------------------------------------ |
| `--background-color` | Fill color of the badge chip         |
| `--text-color`       | Label text color                     |
| `--icon-color`       | Icon color (if an icon is projected) |
| `--border-color`     | Border color of the badge chip       |

Token values are defined in `Badge.scss` via per-variant classes (`preview`, `new`, `updated`, `premium`, `opensource`) and reference the `--igd-*-bg`, `--igd-*-color`, and `--igd-*-border` theme tokens. The base badge style in `Badge.scss` matches the sidebar badge style so sidebar badges can reuse the component without local badge styling.
