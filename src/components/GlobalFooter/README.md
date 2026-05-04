# GlobalFooter

Renders the platform-appropriate global footer in the light DOM. Supports the same platform themes as `GlobalNavBar`.

## Import

```astro
import GlobalFooter from 'igniteui-astro-components/components/GlobalFooter.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `NavTheme` | virtual module value | Override the platform theme for this instance. |
| `lang` | `NavLang` | virtual module value | Override the locale (`'en'` \| `'jp'` \| `'kr'`). |

## Behaviour

- **Pre-build path** — renders pre-fetched footer HTML when available.
- **Static fallback** — falls back to a minimal server-side footer in dev.
- Separate from Starlight's own Footer override. If you are using Starlight, mount this component *inside* the Starlight Footer override so both footers appear in the correct order.

## Example

```astro
---
import GlobalFooter from 'igniteui-astro-components/components/GlobalFooter.astro';
---
<GlobalFooter />
```

## Configuration

Same as `GlobalNavBar` — set `platform` and `navLang` in `createDocsSite()`.
