# ApiLink

Renders an inline `<a><code>` link pointing to the TypeDoc API reference for a class, interface, enum, type alias, variable, or function — with platform-aware URL generation.

## Import

```astro
import ApiLink from 'igniteui-astro-components/components/mdx/ApiLink.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | *(required)* | Short symbol name without platform prefix, e.g. `"Toast"`. |
| `kind` | `'class' \| 'interface' \| 'enum' \| 'type' \| 'variable' \| 'function'` | `'class'` | TypeDoc symbol kind — determines the URL path segment. |
| `member` | `string` | — | Optional member name (property/method). Appended as a `#anchor`. |
| `pkg` | `string` | `'core'` | Package key: `'core'` \| `'charts'` \| `'grids'` \| `'gauges'` \| `'maps'` \| `'inputs'` \| `'layouts'` \| `'excel'` \| `'spreadsheet'` \| `'datasources'`. |
| `label` | `string` | auto | Override the display text. Defaults to the prefixed name (+ `.member` when provided). |
| `prefixed` | `boolean` | `true` | When `true`, prepends the platform prefix (`Igr`/`Igx`/`Igc`/`Igb`) to `type`. Set `false` for already-qualified names or non-prefixed symbols like function names. |
| `suffix` | `boolean` | `true` | When `true`, appends the platform class suffix (e.g. `Component` for Angular). Set `false` for utility classes that do not carry a suffix. |

## Examples

```mdx
{/* Core class — auto-prefix applied */}
<ApiLink type="Toast" />
{/* → <a href="…/classes/igniteui-react.igrtoast.html"><code>IgrToast</code></a> */}

{/* Class member */}
<ApiLink type="Toast" member="show" label="Show" />

{/* Sub-package */}
<ApiLink pkg="charts" type="CategoryChart" />

{/* Function — no prefix, no suffix */}
<ApiLink kind="function" type="configureTheme" prefixed={false} />

{/* Type alias */}
<ApiLink kind="type" type="AbsolutePosition" prefixed={false} />

{/* Interface */}
<ApiLink kind="interface" type="ComboTemplateProps" prefixed={false} />

{/* Enum */}
<ApiLink kind="enum" type="CalendarSelection" />

{/* Utility class without platform suffix */}
<ApiLink type="SortingStrategy" suffix={false} />
```

## Platform context

The current platform is read from the `PLATFORM` environment variable (set at build time). Use `siteMetaIntegration({ platform })` or `createDocsSite({ platform })` in `astro.config.ts`:

```ts
createDocsSite({ platform: 'react' });
// prefix → 'Igr', docRoot → 'https://www.infragistics.com/products/ignite-ui-react/docs/typescript/latest'
```

Supported platforms and their prefixes:

| Platform | Prefix | Class suffix |
|----------|--------|--------------|
| `Angular` | `Igx` | `Component` (DV pkgs only) |
| `React` | `Igr` | — |
| `WebComponents` | `Igc` | — |
| `Blazor` | `Igb` | — |
