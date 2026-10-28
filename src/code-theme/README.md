# Code theme

Brand syntax-highlighting theme for every code snippet on a docs site: fenced
Markdown/MDX blocks, Astro's `<Code>` component and the Sample component's
code tabs all render with it, in **light and dark** at once.

The two themes are Shiki's bundled **Rosé Pine Moon** (dark) and **Rosé Pine
Dawn** (light) with their nine colour slots swapped for brand colours, matching
the API Docs Figma design (`api-snippet`).

| Export                                 | What it is                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| `igShikiConfig`                        | Drop-in Astro `markdown.shikiConfig`: both themes, `defaultColor: false`, `wrap: true`. |
| `igShikiThemes`                        | `{ light, dark }` theme objects — for `<Code themes>` and `codeToHtml({ themes })`.     |
| `igCodeThemeLight` / `igCodeThemeDark` | The individual Shiki theme objects (`ThemeRegistrationRaw`).                            |
| `IG_CODE_THEME_LIGHT` / `…_DARK`       | Their ids (`'ig-light'`, `'ig-dark'`) to reference a theme by name once loaded.         |
| `IG_CODE_LIGHT` / `IG_CODE_DARK`       | The palettes the themes are built from (see [Tuning the colours](#tuning-the-colours)). |
| `remapTheme()`                         | The helper that recolours a bundled theme — use it to derive another variant.           |

## Quick start

**Sites built with `createDocsSite()` get it automatically** — nothing to
configure. The config applies `igShikiConfig` to `markdown.shikiConfig`, and
`DocsLayout` loads the CSS that resolves the colours.

Any other Astro site uses it in two steps:

```js
// astro.config.mjs
import { defineConfig } from 'astro';
import { igShikiConfig } from 'igniteui-astro-components/code-theme';

export default defineConfig({
  markdown: { shikiConfig: igShikiConfig },
});
```

```scss
// Either the whole package theme…
@use 'igniteui-astro-components/styles/theme.scss';
// …or, if you only want the code styles, this is the rule that activates
// the light/dark colours. `color-scheme` must be set on an ancestor (the
// package does it on `[data-theme='light' | 'dark']`).
pre.astro-code span {
  color: light-dark(var(--shiki-light), var(--shiki-dark));
  font-style: var(--shiki-light-font-style);
}
```

### `<Code>` component

```astro
---
import { Code } from 'astro:components';
import { igShikiThemes } from 'igniteui-astro-components/code-theme';
---

<Code code={snippet} lang="ts" themes={igShikiThemes} defaultColor={false} wrap />
```

### Highlighting outside Markdown (server or client)

```ts
import { createHighlighter } from 'shiki';
import {
  igShikiThemes,
  IG_CODE_THEME_LIGHT,
  IG_CODE_THEME_DARK,
} from 'igniteui-astro-components/code-theme';

const highlighter = await createHighlighter({
  themes: Object.values(igShikiThemes),
  langs: ['ts', 'html', 'css'],
});

const html = highlighter.codeToHtml(code, {
  lang: 'ts',
  themes: { light: IG_CODE_THEME_LIGHT, dark: IG_CODE_THEME_DARK },
  defaultColor: false,
});
```

This is exactly what `src/scripts/sample-widget.ts` does in the browser for the
Sample code tabs, and what an API-reference site does for TypeDoc signatures.

## How it works

With `defaultColor: false` Shiki writes **no inline colours**. Every token gets
two custom properties instead:

```html
<pre class="astro-code" style="--shiki-light:#7d91ab;--shiki-dark:#d2dbe8;…">></pre>
```

The package CSS (`src/styles/global/_code-blocks.scss`) resolves them with
`light-dark()`, so a snippet follows the page's `color-scheme` instantly — no
theme-specific selectors, no re-render, no `!important`. The surface (background,
border, padding, font) comes from the `--igd-code-*` tokens below.

If a consumer passes a single theme instead (`shikiConfig: { theme: 'nord' }`),
Shiki emits inline colours that win over the package CSS; nothing breaks.

### Dark snippets on both page themes

The current product decision is to show the **dark snippet everywhere**, on
light pages too. This is one Sass flag at the top of
`src/styles/global/_code-blocks.scss`:

```scss
$igd-code-scheme: 'dark' !default; // 'auto' = follow the page theme
```

With `'dark'` the snippet and its copy-button containers get
`color-scheme: dark`, so every `light-dark()` they contain — Shiki's token
colours and the `--igd-code-*` surface tokens — resolves to the dark value.
The light theme is still rendered into the HTML, so flipping the flag to
`'auto'` restores the light/dark behaviour with no other change.

## Surface tokens

Defined in `src/styles/global/_variables.scss`; override them from any
stylesheet to retune the look without touching the theme.

| Token                           | Default (light / dark)      | Purpose                                      |
| ------------------------------- | --------------------------- | -------------------------------------------- |
| `--igd-code-bg`                 | `#f3f6fa` / `#00142b`       | Snippet background                           |
| `--igd-code-border-color`       | `#e5ebf3` / `#002b5c`       | Border colour                                |
| `--igd-code-border`             | `1px solid <border-color>`  | Full border shorthand                        |
| `--igd-code-fg`                 | `#7d91ab` / `#d2dbe8`       | Text colour for unhighlighted content        |
| `--igd-code-radius`             | `var(--igd-border-radius)`  | Corner radius                                |
| `--igd-code-padding`            | `36px` (`20px` below 768px) | Inner padding                                |
| `--igd-code-font-family`        | `var(--font-mono)`          | JetBrains Mono Variable                      |
| `--igd-code-font-size`          | `14px`                      | Font size                                    |
| `--igd-code-line-height`        | `24px`                      | Line height                                  |
| `--igd-code-margin-bottom`      | `26px`                      | Space after the block                        |
| `--igd-code-copy-color`         | `#344b65` / `#d2dbe8`       | Copy icon                                    |
| `--igd-code-copy-hover-color`   | `#0176ff`                   | Copy icon on hover / focus                   |
| `--igd-code-copy-hover-bg`      | `#e5ebf3` / `#002b5c`       | Copy button background on hover / focus      |
| `--igd-code-copy-success-color` | `var(--ig-success-500)`     | Check icon after a successful copy           |
| `--igd-code-copy-inset`         | `12px`                      | Copy button offset from the top-right corner |

```css
/* example: tighter snippets on a dense page */
:root {
  --igd-code-padding: 20px;
  --igd-code-line-height: 20px;
}
```

## Tuning the colours

`src/code-theme/palette.ts` is the only file with colour values. Each theme is
a background, a default foreground, one brand colour per Rosé Pine slot, and
the property-key colour:

| Slot     | Recolours                                      | Dark      | Light     |
| -------- | ---------------------------------------------- | --------- | --------- |
| `pine`   | keywords, `import` / `export`, operators       | `#0176ff` | `#0176ff` |
| `gold`   | strings                                        | `#f95924` | `#f95924` |
| `foam`   | types, tags, namespaces, CSS property names    | `#66adff` | `#66adff` |
| `rose`   | numbers, booleans, function / class names      | `#ffa685` | `#e04f1f` |
| `iris`   | attribute names, parameters, inherited classes | `#99c9ff` | `#3392ff` |
| `love`   | invalid code, built-in functions               | `#ff4d25` | `#c6451b` |
| `text`   | identifiers, braces                            | `#a9b8cc` | `#7d91ab` |
| `subtle` | punctuation                                    | `#d2dbe8` | `#7d91ab` |
| `muted`  | comments (italic)                              | `#7d91ab` | `#a9b8cc` |
| —        | `propertyKey`: object / JSON / YAML keys       | `#66adff` | `#66adff` |

Change a value, reload — the Shiki theme is rebuilt from the table at import
time. The `background` of each palette must match `--igd-code-bg` in
`_variables.scss` (it is what a consumer without the package CSS sees).

> **Contrast.** The light values marked in `palette.ts` are the Figma design as
> delivered and fall below WCAG AA on `#f3f6fa` (`text`/`subtle` ≈ 3.3:1,
> `foam`/`propertyKey` ≈ 2.4:1). Retune there once the design team signs off on
> darker shades.

### Deriving another variant

```ts
import rosePineMoon from '@shikijs/themes/rose-pine-moon';
import { remapTheme, ROSE_PINE_MOON_SLOTS } from 'igniteui-astro-components/code-theme';

export const highContrastDark = remapTheme(rosePineMoon, {
  name: 'ig-dark-hc',
  colors: { [ROSE_PINE_MOON_SLOTS.pine]: '#99c9ff', [ROSE_PINE_MOON_SLOTS.gold]: '#ffa685' },
  editorColors: { 'editor.background': '#000000', 'editor.foreground': '#ffffff' },
});
```

Scopes and font styles are inherited from the base theme; only colours change.
Any bundled theme works as a base, not just Rosé Pine.
