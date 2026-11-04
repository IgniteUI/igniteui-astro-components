# FigmaUiKits

Renders the "Design in Figma" call-to-action banner that links a component topic to the Ignite UI kits in the Figma Community — one link per theme: Material, Fluent, Bootstrap and Indigo. It belongs between a topic's description and its live demo.

The banner is always 100% of its container. Above 760px it is one row — the Figma logo and title at the start, the kit links at the end. At 760px or narrower it switches to the **compact** layout from the mobile design: the title shortens to "Design:", the links stack under it and wrap, and the padding and gaps tighten to 12px. The switch is a container query on the banner, so it follows the width the banner is given rather than the viewport. Pass `variant` to pin either layout.

## Import

```astro
import FigmaUiKits from 'igniteui-astro-components/components/mdx/FigmaUiKits.astro';
```

## Props

| Prop           | Type                               | Default                 | Description                                                                                            |
| -------------- | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `kits`         | `FigmaUiKit[]`                     | `DEFAULT_FIGMA_UI_KITS` | The kits to link to, in display order. Each is `{ label: string; href: string }`.                      |
| `title`        | `string`                           | `'Design in Figma:'`    | Bold lead-in before the description. Localized by default — see below.                                 |
| `compactTitle` | `string`                           | `'Design:'`             | Title used by the compact layout. Falls back to `title` when that is overridden. Localized by default. |
| `variant`      | `'auto' \| 'regular' \| 'compact'` | `'auto'`                | `'auto'` switches to compact at 760px or narrower; the others pin one layout.                          |
| `description`  | `string`                           | `'Explore our UI kits'` | Text after the title. Localized by default.                                                            |
| `class`        | `string`                           | —                       | Extra CSS classes forwarded to the container.                                                          |

A kit with an empty `label` or `href` throws at build time.

The default kit list lives in `kits.ts` and is exported for topics that want to reorder or filter it:

```astro
---
import FigmaUiKits from 'igniteui-astro-components/components/mdx/FigmaUiKits.astro';
import { DEFAULT_FIGMA_UI_KITS } from 'igniteui-astro-components/components/mdx/FigmaUiKits/kits';
---

<FigmaUiKits kits={DEFAULT_FIGMA_UI_KITS.filter((kit) => kit.label !== 'Bootstrap')} />
```

## Examples

```mdx
{/* Default — the four theme kits */}

<FigmaUiKits />

{/* Always compact, whatever the width */}

<FigmaUiKits variant="compact" />

{/* Custom wording */}

<FigmaUiKits title="Prototype it:" description="Start from a ready-made kit" />

{/* Custom kits */}

<FigmaUiKits
  kits={[
    { label: 'Material', href: 'https://www.figma.com/community/file/…' },
    { label: 'Indigo', href: 'https://www.figma.com/community/file/…' },
  ]}
/>
```

## Localization

The default `title`, `compactTitle`, `description` and the screen-reader "(opens in a new tab)" hint follow the site language — the docs integration's `navLang` (from `virtual:docs-template/site-meta`), then `Astro.currentLocale`, then English. Kit names are product names and are not translated.

| Language       | `title`           | `compactTitle` | `description`       |
| -------------- | ----------------- | -------------- | ------------------- |
| `en` (default) | Design in Figma:  | Design:        | Explore our UI kits |
| `jp` / `ja`    | Figma でデザイン: | デザイン:      | UI キットを見る     |
| `kr` / `ko`    | Figma에서 디자인: | 디자인:        | UI 키트 살펴보기    |

## Accessibility

- Every kit link opens in a new tab and carries a visually hidden "(opens in a new tab)" so screen-reader users are not surprised. The external-link icon and the Figma logo are `aria-hidden`.
- The kits are a real `<ul>`, so assistive tech announces "list, 4 items".
- The banner is a plain `<div>`, not an `<aside>` or `<nav>`: it repeats on every topic, and a landmark per page would only add noise to the landmark list.
- Links have a 24px-tall hit area (WCAG 2.2 target size) and a visible `:focus-visible` outline. Link colors match the markdown links in both themes.
- In forced-colors mode the frame keeps a `CanvasText` border.

## Styling

The container reads these custom properties; set them on an ancestor or through `class`:

| Token                             | Default                                   |
| --------------------------------- | ----------------------------------------- |
| `--igd-figma-kits-padding-block`  | `8px` (compact: `12px`)                   |
| `--igd-figma-kits-padding-inline` | `16px` (compact: `12px`)                  |
| `--igd-figma-kits-gap`            | `24px` (between links, and title ↔ links) |
| `--igd-figma-kits-radius`         | `4px`                                     |
| `--igd-figma-kits-bg`             | `gray-100` (light) / `gray-50` (dark)     |
| `--igd-figma-kits-border-color`   | `gray-300` (light) / `gray-200` (dark)    |
