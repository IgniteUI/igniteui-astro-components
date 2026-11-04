# FigmaUiKits

Renders the "Design in Figma" call-to-action banner that links a component topic to the Ignite UI kits in Figma. It belongs between a topic's description and its live demo.

It links to the Indigo.Design UI kits for Material, Fluent, Bootstrap and Indigo out of the box, so a topic only needs `<FigmaUiKits />`. When a kit is republished, update its URL once in `kits.ts` (`DEFAULT_FIGMA_UI_KITS`) and every topic picks it up.

## Import

```astro
import FigmaUiKits from 'igniteui-astro-components/components/mdx/FigmaUiKits.astro';
```

## Props

| Prop           | Type                  | Default                 | Description                                                                                      |
| -------------- | --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `kits`         | `FigmaUiKit[]`        | `DEFAULT_FIGMA_UI_KITS` | One link per kit, in display order. Each is `{ label: string; href: string }`.                   |
| `title`        | `string`              | `'Design in Figma:'`    | Bold lead-in before the description. Localized by default.                                       |
| `compactTitle` | `string`              | `'Design:'`             | Short title for the compact layout. Defaults to `title` when that is set. Localized by default.  |
| `variant`      | `'auto' \| 'compact'` | `'auto'`                | `'auto'` wraps to fit and uses the compact layout on narrow containers; `'compact'` always does. |
| `description`  | `string`              | `'Explore our UI kits'` | Text after the title. Localized by default.                                                      |
| `class`        | `string`              | —                       | Extra CSS classes for the container.                                                             |

It throws at build time when `kits` is an empty array or a kit has an empty `label` or `href`.

`kits.ts` exports the `FigmaUiKit` type and `DEFAULT_FIGMA_UI_KITS`. Pass `kits` only to show a different set, for example a single kit on a theme-specific topic:

```astro
---
import FigmaUiKits from 'igniteui-astro-components/components/mdx/FigmaUiKits.astro';
import { DEFAULT_FIGMA_UI_KITS } from 'igniteui-astro-components/components/mdx/FigmaUiKits/kits';

const materialOnly = DEFAULT_FIGMA_UI_KITS.filter((kit) => kit.label === 'Material');
---

<FigmaUiKits kits={materialOnly} />
```

Give every kit its own URL: several links with different names but the same destination fail WCAG 2.4.4 (link purpose).

## Layout

- **One row** when it fits: the Figma logo and title at the start, the links at the end.
- **Wrapped** when it doesn't: flexbox moves the whole link list to a second row. Nothing switches at a fixed width, so the banner adapts to the copy, the font and the language. For example, the English row needs about 744px, Japanese 737px and Korean 717px.
- **Compact** below 480px (a phone): the title shortens to "Design:", the links stack under it, and the padding tightens. This is a container query on the banner, so it follows the width the banner is given, not the viewport. `variant="compact"` uses this layout at any width.

The outer `.igd-figma-kits` element is the query container and the inner `.igd-figma-kits__banner` is the visible frame, because a container can't restyle itself from its own query. The container has `inline-size: 100%` because size containment ignores its content's width, so it would otherwise collapse inside a shrink-to-fit parent.

## Examples

```mdx
{/* Default: the four kits */}

<FigmaUiKits />

{/* Always compact */}

<FigmaUiKits variant="compact" />

{/* Custom wording */}

<FigmaUiKits title="Prototype it:" description="Start from a ready-made kit" />
```

## Localization

The default `title`, `compactTitle` and `description`, and the hidden link text, follow the site language. The language comes from the docs integration's `navLang` (from `virtual:docs-template/site-meta`), then `Astro.currentLocale`, then English. Kit names are product names and are not translated.

| Language       | `title`           | `compactTitle` | `description`       | Kit link name read out                          |
| -------------- | ----------------- | -------------- | ------------------- | ----------------------------------------------- |
| `en` (default) | Design in Figma:  | Design:        | Explore our UI kits | Material Figma UI kit (opens in a new tab)      |
| `jp` / `ja`    | Figma でデザイン: | デザイン:      | UI キットを見る     | Material Figma UI キット (新しいタブで開きます) |
| `kr` / `ko`    | Figma에서 디자인: | 디자인:        | UI 키트 살펴보기    | Material Figma UI 키트 (새 탭에서 열림)         |

## Accessibility

- Every link opens in a new tab and says so in visually hidden text. Each link also names what it opens, so "Material Figma UI kit (opens in a new tab)" makes sense in a screen reader's links list. The external-link icon and the Figma logo are `aria-hidden`.
- The links are a real `<ul>` with `role="list"`, so assistive tech announces how many there are. The explicit role is needed because Safari drops list semantics from a list styled with `list-style: none`.
- The banner is a plain `<div>`, not an `<aside>` or `<nav>`. It repeats on every topic, and a landmark on every page would clutter the landmark list.
- Links meet the WCAG 2.2 target size and have a visible `:focus-visible` outline. They use the same colours as markdown links (`--igd-link-color`: 5.25:1 on the page and 4.77:1 on the banner in light mode, 12.5:1 or more in dark mode).
- In forced-colors mode the frame keeps a `CanvasText` border.
- The hidden-text class is a local copy of the standard sr-only pattern. Switch to the shared `.visually-hidden` once #177 is fixed.

## Icons

Both icons come from `src/assets/icons/` and are inlined at build time with `?raw` and `set:html`, so the banner needs no client JavaScript:

- `open-link-blank.svg` is the same external-link icon that markdown links use.
- `figma-logo.svg` draws the logo on its white tile, so the brand colours stay in the asset. It is listed under Brand in the icon gallery.

## Styling

The styles are unlayered, so they win over the `@layer components` markdown styles. Those style every `p`, `ul`, `li` and `a`, and add an icon after `a[target=_blank]`.

All values are `--igd-figma-kits-*` tokens on `:root` in `src/styles/global/_variables.scss`. Override them on an ancestor or through `class`:

| Token                                                 | Default                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `--igd-figma-kits-padding-block` / `-inline`          | Regular padding; inline is `--igd-padding-sm`                             |
| `--igd-figma-kits-compact-padding-block` / `-inline`  | Compact (phone) padding                                                   |
| `--igd-figma-kits-gap`                                | `--igd-padding-md`, between links and title ↔ links                       |
| `--igd-figma-kits-row-gap`                            | Gap between rows once the banner wraps                                    |
| `--igd-figma-kits-item-gap`                           | Logo ↔ title and label ↔ icon                                             |
| `--igd-figma-kits-margin-bottom`                      | Same as the other blocks (aside, FAQ, code)                               |
| `--igd-figma-kits-radius`                             | `--igd-border-radius`                                                     |
| `--igd-figma-kits-border-width` / `-style`            | `--igd-app-outline-size` / `-style`                                       |
| `--igd-figma-kits-logo-size`                          | Logo height                                                               |
| `--igd-figma-kits-target-size`                        | Minimum link height                                                       |
| `--igd-figma-kits-underline-offset`                   | Hover underline offset                                                    |
| `--igd-figma-kits-focus-width` / `-offset`            | Focus outline                                                             |
| `--igd-figma-kits-title-weight` / `-link-weight`      | Font weights                                                              |
| `--igd-figma-kits-bg` / `-border-color`               | `gray-100` / `gray-300` light, `gray-50` / `gray-200` dark                |
| `--igd-figma-kits-title-color` / `-description-color` | `gray-900` / `gray-700`                                                   |
| `--igd-figma-kits-link-color` / `-link-hover-color`   | `--igd-link-color` / `--igd-link-hover-color`, shared with markdown links |

The dark gray scale is inverted, so `gray-50` and `gray-200` are the dark counterparts of the light `gray-100` and `gray-300`.
