# ApiLink

Renders an inline API documentation link with platform-aware resolution.

For TypeDoc symbols, `ApiLink` first queries the generated api-docs link index.
That index contains the real symbol names, packages, URL segments, and member
anchors produced by api-docs. If the index is unavailable, or if a symbol is
missing from it, `ApiLink` renders plain code text instead of generating a
guessed URL.

Sass links are separate and still use `kind="sass"`.

## Import

```astro
import ApiLink from 'igniteui-astro-components/components/mdx/ApiLink.astro';
```

## Preferred Usage

Author MDX with the unprefixed API name:

```mdx
<ApiLink type="Grid" />
<ApiLink type="Grid" member="rowSelection" />
<ApiLink type="CategoryChart" />
```

The resolver handles platform prefix/suffix candidates, package lookup, kind
lookup, URL segment lookup, and member anchor lookup.

Omitting `pkg` relies on `platformContext.apiLinkIndex` being available. When
the index is unavailable, `ApiLink` renders code text and does not guess a URL.

## TypeDoc Props

| Prop       | Type                                                                     | Default      | Description                                                                                                                             |
| ---------- | ------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | `string`                                                                 | _(required)_ | Short symbol name without platform prefix, e.g. `"Grid"` instead of `"IgrGrid"`.                                                        |
| `member`   | `string`                                                                 | —            | Optional member name. Resolved through the generated member map when available.                                                         |
| `label`    | `string`                                                                 | auto         | Override the display text.                                                                                                              |
| `pkg`      | `string`                                                                 | —            | Ambiguity override only. Use when the same symbol exists in multiple packages and the combined index cannot choose safely.              |
| `kind`     | `'class' \| 'interface' \| 'enum' \| 'type' \| 'variable' \| 'function'` | auto         | Optional narrowing. Usually unnecessary when the index is available.                                                                    |
| `prefixed` | `boolean`                                                                | `true`       | Candidate-name override for symbols that are never platform-prefixed. Avoid for new docs when the index can resolve the symbol.         |
| `suffix`   | `boolean`                                                                | `true`       | Candidate-name override for symbols that never use the platform class suffix. Avoid for new docs when the index can resolve the symbol. |

Platform names use `PlatformContext.name`: `Angular`, `React`,
`WebComponents`, or `Blazor`.

## Examples

```mdx
{/* Let the generated index find package, kind, and exact symbol name. */}

<ApiLink type="Grid" />

{/* Member anchors are resolved from the generated member map. */}

<ApiLink type="Grid" member="rowSelection" />

{/* Use pkg only when the symbol name is ambiguous across packages. */}

<ApiLink type="Workbook" pkg="excel" />
```

## ApiLink Index

`ApiLink` resolves TypeDoc symbols from `platformContext.apiLinkIndex`, a compact
registry generated from api-docs TypeDoc data and stored by the docs host. The
component does not fetch api-docs during the documentation build.

The docs host loads one latest registry per platform, for example:

```txt
src/data/api-link-index/angular/staging-latest.json
src/data/api-link-index/webcomponents/staging-latest.json
```

Registry symbol fields are intentionally short because the files are large:

| Field | Meaning                                                 |
| ----- | ------------------------------------------------------- |
| `p`   | Package id that owns the symbol.                        |
| `u`   | Root-relative API URL path for the symbol page.         |
| `k`   | Symbol kind, e.g. `class`, `interface`, `enum`, `type`. |
| `m`   | Member name to anchor map.                              |

When `pkg` is present, `ApiLink` uses it only as a package filter for ambiguous
symbol names; package URLs and kinds still come from the registry.
When a symbol is ambiguous, omitting `pkg` or `kind` causes `ApiLink` to throw
during rendering instead of guessing a URL.
When a symbol is not found, `ApiLink` renders code text instead of generating a
guessed URL.
When a registry symbol exists but the requested member does not, `ApiLink`
renders code text instead of generating a guessed member URL.

## Sass Props

Use `kind="sass"` for Sass API reference links. Sass links do not use the
api-docs link index; they read their base URL from `platformContext.sassApiUrl`.

| Prop     | Type      | Default      | Description                                                                                    |
| -------- | --------- | ------------ | ---------------------------------------------------------------------------------------------- |
| `kind`   | `'sass'`  | _(required)_ | Enables Sass API link mode.                                                                    |
| `module` | `string`  | —            | Sass module path segment, e.g. `"animations"` or `"themes"`.                                   |
| `type`   | `string`  | —            | Anchor fragment without `#`, e.g. `"mixin-slide-in-left"`. Omit it to link to the module page. |
| `label`  | `string`  | auto         | Override the display text. Defaults to `type`, then `module`, then an empty string.            |
| `code`   | `boolean` | `true`       | Wrap the label in `<code>`. Set `false` for prose labels.                                      |

```mdx
<ApiLink kind="sass" module="animations" label="animations Sass module" code={false} />
<ApiLink kind="sass" module="animations" type="mixin-slide-in-left" label="slide-in-left" />
```

Sass URL shape:

```txt
{sassApiUrl}/{module}#{type}
```
