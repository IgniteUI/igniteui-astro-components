# ApiLink

Renders an inline API link with platform-aware URL generation.

For TypeDoc symbols, it renders an inline `<a><code>` link to a class,
interface, enum, type alias, variable, or function. It can also render Sass API
links when `kind="sass"`.

## Import

```astro
import ApiLink from 'igniteui-astro-components/components/mdx/ApiLink.astro';
```

## TypeDoc props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | *(required)* | Short symbol name without platform prefix, e.g. `"Toast"`. |
| `kind` | `'class' \| 'interface' \| 'enum' \| 'type' \| 'variable' \| 'function'` | `'class'` | TypeDoc symbol kind — determines the URL path segment. |
| `member` | `string` | — | Optional member name (property/method). Appended as a `#anchor`. |
| `pkg` | `string` | `'core'` | Package key: `'core'` \| `'charts'` \| `'grids'` \| `'gauges'` \| `'maps'` \| `'inputs'` \| `'layouts'` \| `'excel'` \| `'spreadsheet'` \| `'datasources'`. |
| `label` | `string` | auto | Override the display text. Defaults to the prefixed name (+ `.member` when provided). |
| `prefixed` | `boolean` | `true` | When `true`, prepends the platform prefix (`Igr`/`Igx`/`Igc`/`Igb`) to `type`. Set `false` for already-qualified names or non-prefixed symbols like function names. |
| `suffix` | `boolean` | `true` | When `true`, appends the platform class suffix (e.g. `Component` for Angular). Set `false` for utility classes that do not carry a suffix. |
| `exclude` | `string` | — | Comma-separated platform names where the link should not render. Matching platforms render the label as plain inline `<code>`. |
| `excludeSuffixFor` | `string` | — | Comma-separated platform names where `classSuffix` should not be appended, even when `suffix` is `true`. |
| `excludePrefixFor` | `string` | — | Comma-separated platform names where the platform prefix should not be prepended, even when `prefixed` is `true`. |

Platform names use the display form from `PlatformContext.name`: `Angular`,
`React`, `WebComponents`, or `Blazor`.

## Sass props

Use `kind="sass"` for Sass API reference links. Sass links read their base URL
from `platformContext.sassApiUrl`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `kind` | `'sass'` | *(required)* | Enables Sass API link mode. |
| `module` | `string` | — | Sass module path segment, e.g. `"animations"` or `"themes"`. |
| `type` | `string` | — | Anchor fragment without `#`, e.g. `"mixin-slide-in-left"`. Omit it to link to the module page. |
| `label` | `string` | auto | Override the display text. Defaults to `type`, then `module`, then an empty string. |
| `code` | `boolean` | `true` | Wrap the label in `<code>`. Set `false` for prose labels. |

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

{/* Hide a broken API link on selected platforms */}
<ApiLink type="Toast" member="show" exclude="Blazor,WebComponents" />

{/* Keep the symbol unprefixed only for React */}
<ApiLink kind="interface" type="ComboTemplateProps" excludePrefixFor="React" />

{/* Suppress the Angular class suffix for this symbol */}
<ApiLink type="FilteringOperand" excludeSuffixFor="Angular" />

{/* Sass module page */}
<ApiLink kind="sass" module="animations" label="animations Sass module" code={false} />

{/* Sass symbol anchor */}
<ApiLink kind="sass" module="animations" type="mixin-slide-in-left" label="slide-in-left" />
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

For Sass links, make sure `platformContext.sassApiUrl` is configured. The URL is
assembled as:

```txt
{sassApiUrl}/{module}#{type}
```
