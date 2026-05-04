# GlobalNavBar

Renders the platform-appropriate global navigation bar in the light DOM. Supports IG-family platforms (`angular`, `react`, `blazor`, `web-components`, `slingshot`, `igniteui`) and AppBuilder.

## Import

```astro
import GlobalNavBar from 'igniteui-astro-components/components/GlobalNavBar.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `NavTheme` | virtual module value | Override the platform theme for this instance. |
| `lang` | `NavLang` | virtual module value | Override the locale (`'en'` \| `'jp'` \| `'kr'`). |

`NavTheme`: `'igniteui' | 'angular' | 'react' | 'blazor' | 'web-components' | 'slingshot' | 'appbuilder'`

## Behaviour

- **Pre-build path** — when `siteMetaIntegration` has already fetched the header HTML, it is injected via `set:html`.
- **Static fallback** — when pre-fetched HTML is unavailable (local dev), a minimal server-side nav is rendered.
- The nav bar is marked `transition:persist="global-nav-bar"` so it does not re-render during Astro View Transitions navigation.

## Example

```astro
---
import GlobalNavBar from 'igniteui-astro-components/components/GlobalNavBar.astro';
---
<!-- Default: reads platform and locale from virtual module -->
<GlobalNavBar />

<!-- Override per-page -->
<GlobalNavBar theme="react" lang="en" />
```

## Configuration

Platform and locale are set once in `astro.config.ts` via `createDocsSite` / `siteMetaIntegration`:

```ts
createDocsSite({
  platform: 'angular',
  navLang: 'en',
  // …
});
```
