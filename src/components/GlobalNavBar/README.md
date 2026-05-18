# GlobalNavBar

Renders the global navigation bar in the light DOM. Supports IG-family platforms (`angular`, `react`, `blazor`, `web-components`, `slingshot`, `igniteui`).

## Import

```astro
import GlobalNavBar from 'igniteui-astro-components/components/GlobalNavBar.astro';
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `lang` | `NavLang` | **Required.** Locale — `'en'` \| `'jp'` \| `'kr'`. |

`NavLang`: `'en' | 'jp' | 'kr'`

## Behaviour

- Fetches the IG header HTML at build time via `fetchIgNav(lang)`.
- The nav bar is marked `transition:persist="global-nav-bar"` so it does not re-render during Astro View Transitions navigation.

## Example

```astro
---
import GlobalNavBar from 'igniteui-astro-components/components/GlobalNavBar.astro';
---
<GlobalNavBar lang="en" />
```

## Configuration

`lang` is provided automatically by `DocsLayout` from the `navLang` value in the `virtual:docs-template/site-meta` virtual module, which is set in `astro.config.ts`:

```ts
createDocsSite({
  navLang: 'en',
  // …
});
```
