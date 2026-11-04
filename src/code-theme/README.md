# Code theme

Brand syntax-highlighting theme for code snippets: Shiki's bundled **Rosé Pine
Moon** recoloured with Shiki's `colorReplacements` to match the API Docs Figma
design (`api-snippet`, dark). Fenced Markdown/MDX blocks, Astro's `<Code>` and
the Sample component's code tabs all use it.

| Export          | What it is                                                   |
| --------------- | ------------------------------------------------------------ |
| `igCodeTheme`   | The Shiki theme object (`ig-dark`).                          |
| `igShikiConfig` | Drop-in Astro `markdown.shikiConfig`: `igCodeTheme`, `wrap`. |

Import them from `igniteui-astro-components/code-theme`.

## Quick start

Sites built with `createDocsSite()` get it automatically. Any other Astro site:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { igShikiConfig } from 'igniteui-astro-components/code-theme';

export default defineConfig({
  markdown: { shikiConfig: igShikiConfig },
});
```

`<Code>` component:

```astro
---
import { Code } from 'astro:components';
import { igCodeTheme } from 'igniteui-astro-components/code-theme';
---

<Code code={snippet} lang="ts" theme={igCodeTheme} wrap />
```

Shiki directly:

```ts
import { createHighlighter } from 'shiki';
import { igCodeTheme } from 'igniteui-astro-components/code-theme';

const highlighter = await createHighlighter({ themes: [igCodeTheme], langs: ['ts'] });
const html = highlighter.codeToHtml(code, { lang: 'ts', theme: igCodeTheme.name });
```

Shiki writes the background, default text and token colours inline. The
surface (border, radius, padding, font, copy button) comes from the package
stylesheet (`igniteui-astro-components/styles/theme.scss`).

## Tokens

Set on `:root` in `src/styles/global/_variables.scss`; override them from any
stylesheet loaded after the package theme.

| Token                           | Default                    | Purpose                                  |
| ------------------------------- | -------------------------- | ---------------------------------------- |
| `--igd-code-border`             | `1px solid #002b5c`        | Snippet border.                          |
| `--igd-code-radius`             | `var(--igd-border-radius)` | Corner radius.                           |
| `--igd-code-padding`            | `36px` (`20px` on mobile)  | Inner padding.                           |
| `--igd-code-font-family`        | `var(--font-mono)`         | Code font.                               |
| `--igd-code-font-size`          | `14px`                     | Code font size.                          |
| `--igd-code-line-height`        | `24px`                     | Code line height.                        |
| `--igd-code-margin-bottom`      | `26px`                     | Space below a snippet.                   |
| `--igd-code-copy-color`         | `#d2dbe8`                  | Copy button icon.                        |
| `--igd-code-copy-hover-color`   | `#0176ff`                  | Copy button icon on hover / focus.       |
| `--igd-code-copy-hover-bg`      | `#002b5c`                  | Copy button background on hover / focus. |
| `--igd-code-copy-success-color` | `var(--ig-success-500)`    | Icon colour after a successful copy.     |
| `--igd-code-copy-inset`         | `12px`                     | Copy button offset from the corner.      |
