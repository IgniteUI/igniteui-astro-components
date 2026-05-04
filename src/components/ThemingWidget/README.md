# ThemingWidget

Renders the `<igniteui-theming-widget>` web component that lets readers switch the component theme live inside embedded sample iframes.

## Import

```astro
import ThemingWidget from 'igniteui-astro-components/components/ThemingWidget.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `language` | `NavLang` | `'en'` | Locale passed to the web component (`'en'` \| `'jp'` \| `'kr'`). |

## Behaviour

- Renders nothing when `themeApiUrl` is absent from the environment config.
- The widget container starts hidden and is revealed client-side only when at least one themeable `<iframe>` is detected on the page.
- Forwards `themeChange` events to all themeable frames via `postMessage`.
- Re-initialises on Astro View Transitions navigation (`astro:page-load`).

## Environment variable

`themeApiUrl` is resolved at build time from `environment.json` by `siteMetaIntegration` and exposed through the `virtual:docs-template/nav-html` virtual module.

## Example

```astro
---
import ThemingWidget from 'igniteui-astro-components/components/ThemingWidget.astro';
---
<ThemingWidget language="en" />
```
