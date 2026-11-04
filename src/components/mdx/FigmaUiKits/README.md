# FigmaUiKits

Renders the "Design in Figma" call-to-action banner that links a component topic to the Ignite UI kits in Figma. It belongs between a topic's description and its live demo.

By default the banner has one link, "Explore our UI kits", to the Infragistics Figma Community profile, which lists every kit. When each kit has its own Community file, pass `kits` to render one link per theme (Material, Fluent, Bootstrap, Indigo) instead. Don't point several kit links at the same page: each link name has to describe where it goes (WCAG 2.4.4).

## Import

```astro
import FigmaUiKits from 'igniteui-astro-components/components/mdx/FigmaUiKits.astro';
```

## Props

| Prop           | Type                  | Default                 | Description                                                                                       |
| -------------- | --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| `kits`         | `FigmaUiKit[]`        | —                       | One link per kit, in display order. Each is `{ label: string; href: string }`.                    |
| `href`         | `string`              | `FIGMA_UI_KITS_URL`     | Target of the single link shown when `kits` is not set: the Infragistics Figma Community profile. |
| `title`        | `string`              | `'Design in Figma:'`    | Bold lead-in before the description. Localized by default.                                        |
| `compactTitle` | `string`              | `'Design:'`             | Short title for the compact layout. Defaults to `title` when that is set. Localized by default.   |
| `variant`      | `'auto' \| 'compact'` | `'auto'`                | `'auto'` wraps to fit and uses the compact layout on narrow containers; `'compact'` always does.  |
| `description`  | `string`              | `'Explore our UI kits'` | Text after the title; the link text when `kits` is not set. Localized by default.                 |
| `class`        | `string`              | —                       | Extra CSS classes for the container.                                                              |

It throws at build time when `kits` is an empty array or a kit has an empty `label` or `href`.

`kits.ts` exports the `FigmaUiKit` type and `FIGMA_UI_KITS_URL`:

```astro
---
import FigmaUiKits from 'igniteui-astro-components/components/mdx/FigmaUiKits.astro';
import type { FigmaUiKit } from 'igniteui-astro-components/components/mdx/FigmaUiKits/kits';

const kits: FigmaUiKit[] = [
  { label: 'Material', href: 'https://www.figma.com/community/file/…' },
  { label: 'Indigo', href: 'https://www.figma.com/community/file/…' },
];
---

<FigmaUiKits kits={kits} />
```

## Layout

- **One row** when it fits: the Figma logo and title at the start, the links at the end.
- **Wrapped** when it doesn't: flexbox moves the whole link list to a second row. Nothing switches at a fixed width, so the banner adapts to the copy, the font and the language. For example, the English row needs about 744px, Japanese 737px and Korean 717px.
- **Compact** below 480px (a phone): the title shortens to "Design:", the links stack under it, and the padding tightens. This is a container query on the banner, so it follows the width the banner is given, not the viewport. `variant="compact"` uses this layout at any width.

The outer `.igd-figma-kits` element is the query container and the inner `.igd-figma-kits__banner` is the visible frame, because a container can't restyle itself from its own query. The container has `inline-size: 100%` because size containment ignores its content's width, so it would otherwise collapse inside a shrink-to-fit parent.

## Examples

```mdx
{/* Default: one link to the Figma profile */}

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

- Every link opens in a new tab and says so in visually hidden text. Kit links also name what they open, so "Material Figma UI kit (opens in a new tab)" makes sense in a screen reader's links list. The external-link icon and the Figma logo are `aria-hidden`.
- Kit links are a real `<ul>`, so assistive tech announces how many there are.
- The banner is a plain `<div>`, not an `<aside>` or `<nav>`. It repeats on every topic, and a landmark on every page would clutter the landmark list.
- Links meet the WCAG 2.2 target size and have a visible `:focus-visible` outline. They use the same colours as markdown links.
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
