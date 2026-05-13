# GlobalFooter

Renders the global footer in the light DOM.

## Import

```astro
import GlobalFooter from 'igniteui-astro-components/components/GlobalFooter.astro';
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `lang` | `NavLang` | **Required.** Locale — `'en'` \| `'jp'` \| `'kr'`. |

## Behaviour

- Fetches the IG footer HTML at build time via `fetchIgNav(lang)`.

## Example

```astro
---
import GlobalFooter from 'igniteui-astro-components/components/GlobalFooter.astro';
---
<GlobalFooter lang="en" />
```

## Configuration

Same as `GlobalNavBar` — `lang` is provided automatically by `DocsLayout` from `navLang` in `virtual:docs-template/site-meta`.
