# ApiRef

Renders a block "API References" section listing one or more types as hyperlinks. Typically placed at the bottom of a component documentation page.

## Import

```astro
import ApiRef from 'igniteui-astro-components/components/mdx/ApiRef.astro';
```

## Props

| Prop       | Type                                                                     | Default      | Description                                                                          |
| ---------- | ------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------ |
| `types`    | `string[]`                                                               | _(required)_ | Short symbol names without platform prefix. All types must be from the same package. |
| `kind`     | `'class' \| 'interface' \| 'enum' \| 'type' \| 'variable' \| 'function'` | `'class'`    | TypeDoc symbol kind shared by all `types` in this call.                              |
| `pkg`      | `string`                                                                 | `'core'`     | Package key — same options as `ApiLink`.                                             |
| `prefixed` | `boolean`                                                                | `true`       | Prepend the platform prefix automatically. Set `false` for already-qualified names.  |
| `suffix`   | `boolean`                                                                | `true`       | Append the platform class suffix. Set `false` for utility classes.                   |

## Examples

```mdx
{/* Core classes */}

<ApiRef types={['Toast', 'Combo', 'Calendar']} />

{/* Charts sub-package */}

<ApiRef pkg="charts" types={['CategoryChart', 'FinancialChart']} />

{/* Interface — no prefix */}

<ApiRef kind="interface" types={['ComboTemplateProps']} prefixed={false} />

{/* Enum */}

<ApiRef kind="enum" types={['CalendarSelection']} />

{/* Fully-qualified names (Blazor) */}

<ApiRef types={['IgbToast']} prefixed={false} />
```

## Platform context

Same as `ApiLink` — resolved from the `Platform` env var via `getPlatformContext()`.

When a page mixes types from different packages or different kinds, use separate `<ApiRef>` blocks:

```mdx
<ApiRef types={['Toast']} />
<ApiRef kind="enum" types={['CalendarSelection']} />
<ApiRef pkg="charts" types={['CategoryChart']} />
```
