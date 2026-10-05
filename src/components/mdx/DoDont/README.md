# DoDont

Renders a side-by-side "Do" / "Don't" pair of component screenshots. Each panel is a framed image with a status badge pinned to its top-inline corner — a green check for the recommended usage, a red clear for the one to avoid — and a required description below it that says why.

The frame supplies the padding around each screenshot, so the source images stay bare crops with no baked-in margin, and it centers anything smaller than its content box rather than blowing it up to fill. Panels share a subgrid, so every frame is as tall as the tallest screenshot in the row and the captions start on a common baseline.

The block is always 100% of its container and stacks into one column as soon as a panel would fall below `--igd-dodont-min-panel-width`, so it responds to the space it is given rather than to the viewport.

## Import

```astro
import DoDont from 'igniteui-astro-components/components/mdx/DoDont.astro';
```

## Props

| Prop        | Type                      | Default       | Description                                                                                                                                      |
| ----------- | ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `doSrc`     | `ImageMetadata \| string` | _(required)_  | The recommended-usage image. An `astro:assets` import or a URL.                                                                                  |
| `doAlt`     | `string`                  | _(required)_  | The recommended-usage image's accessible description. Becomes the inner `<img>` `alt`.                                                           |
| `dontSrc`   | `ImageMetadata \| string` | _(required)_  | The usage-to-avoid image. An `astro:assets` import or a URL.                                                                                     |
| `dontAlt`   | `string`                  | _(required)_  | The usage-to-avoid image's accessible description. Becomes the inner `<img>` `alt`.                                                              |
| `doLabel`   | `string`                  | `'Do'`        | Label for the recommended panel. Localized by default — see [Localization](#localization).                                                       |
| `dontLabel` | `string`                  | `"Don't"`     | Label for the panel to avoid. Localized by default.                                                                                              |
| `loading`   | `'lazy' \| 'eager'`       | `'lazy'`      | Image loading strategy. Use `'eager'` when the block is the first content on the page.                                                           |
| `errorText` | `string`                  | _(localized)_ | Notice shown with a broken-image icon inside a frame whose image failed to load. Hidden from assistive tech, which still gets the image's `alt`. |
| `class`     | `string`                  | —             | Extra CSS classes forwarded to the container.                                                                                                    |

### Imports vs. URLs

Pass an `astro:assets` import whenever you can. An import is rendered through Astro's `<Image>`, which converts the format (WebP by default), emits a `srcset` with 1x/2x/3x candidates clamped to the source size, and writes the intrinsic `width`/`height` so the frame holds its final size before the file arrives.

A plain URL string is rendered as a bare `<img>`. Astro cannot inspect a URL at build time, so it gets no `srcset` and **no dimensions**, and the frame grows when the image loads — a layout shift. Reserve URLs for assets that genuinely live outside the build.

### Loading

The default `loading="lazy"` is right for a block somewhere down a topic. If the block is the first thing on the page, pass `loading="eager"`: a lazy image above the fold delays the largest contentful paint. Eager images are also fetched with `fetchpriority="high"`.

While an image is pending, a soft shimmer sweeps the frame's canvas. A small client script marks a frame whose image has not loaded and clears the mark on load or error; without JavaScript nothing is marked and the frame is simply static. The animation is disabled under `prefers-reduced-motion`.

If an image fails to load, the frame gets `data-error` and shows a broken-image icon with a short notice ("Sorry, this image could not be loaded.", localized like the labels, or your own `errorText`). The notice is `aria-hidden` — it only explains the empty box to a sighted reader, and the `<img>` keeps exposing its `alt` to assistive tech. The label and description are unaffected. A URL cannot be checked at build time, which is one more reason to prefer an `astro:assets` import: a missing imported file fails the build instead of the page.

The image props are `doSrc` / `dontSrc` rather than `do` / `dont` because Astro merges named slots into props ([`jsx-runtime`](https://github.com/withastro/astro) does `Object.assign(vnode.props, slots)`), so a prop sharing a slot's name is silently overwritten by that slot.

## Slots

| Slot   | Description                                                   |
| ------ | ------------------------------------------------------------- |
| `do`   | **Required.** Why the recommended panel is the one to follow. |
| `dont` | **Required.** Why the other panel is the one to avoid.        |

Both slots are validated at build time — a missing, empty or whitespace-only slot throws, exactly like a missing `alt`. A screenshot is never self-explanatory: the slot text is what search engines index, translators translate and screen readers read, and it is the only place the _reason_ for the guidance lives.

## Examples

```mdx
{/* Blank lines inside each Fragment so the content parses as markdown */}

<DoDont
  doSrc={virtualScrollDo}
  doAlt="Virtual Scroll showing a list of 100,000 employees"
  dontSrc={virtualScrollDoNot}
  dontAlt="Virtual Scroll used for a list of only five employees"
>
<Fragment slot="do">

Use the Virtual Scroll for a long list that is too large to render at once.

</Fragment>
<Fragment slot="dont">

Render a short list directly with the [List](../list.mdx).

</Fragment>
</DoDont>

{/* Custom labels */}

<DoDont doSrc={good} doAlt="…" dontSrc={bad} dontAlt="…" doLabel="Recommended" dontLabel="Avoid">
  <Fragment slot="do">…</Fragment>
  <Fragment slot="dont">…</Fragment>
</DoDont>
```

## Localization

The default labels follow the site language, so a Japanese topic does not ship with English "Do" / "Don't" baked in:

| Language       | `doLabel` | `dontLabel` |
| -------------- | --------- | ----------- |
| `en` (default) | Do        | Don't       |
| `jp` / `ja`    | 推奨      | 非推奨      |
| `kr` / `ko`    | 권장      | 비권장      |

The broken-image notice (`errorText`) is localized the same way.

The language is read from `LANG_CODE`, which the docs integration sets at build time from its `navLang`, falling back to `Astro.currentLocale` for sites that use Astro's i18n routing, then to English. Pass `doLabel` / `dontLabel` to override on any page.

## Accessibility

`doAlt` and `dontAlt` are required and are validated at build time — an absent, empty or whitespace-only value throws. Describe what each screenshot shows rather than merely naming the component. The `do` / `dont` slots are required for the same reason: the alt says what the picture shows, the slot says why it is right or wrong, and a reader who cannot see the image needs both.

Each panel is a `<figure>` whose `<figcaption>` holds the label and description, so assistive tech announces the panel as, e.g., "figure, Do: Use the Virtual Scroll for a long list…" and then the image's `alt`. The colon is a visually hidden separator; without it the label and description read as one run-on phrase.

The badges are decorative: the labels already name each panel, so the badges are `aria-hidden` and add no duplicate announcement. That also means the block does not rely on color alone.

The label colors meet WCAG AA for normal-size text in both themes. The "Don't" accent is `--ig-error-800` in the light theme rather than the design's `--ig-error-700`, which measures 4.1:1 on white and fails the 4.5:1 minimum. In forced-colors mode the frame keeps an outline, since box-shadow is dropped there.

## Styling

The component declares its tokens locally on `.igd-dodont` (and its theme tokens on `.igd-dodont__frame` / `.igd-dodont__badge`), so any ancestor can retune them:

| Property                       | Purpose                                                                  |
| ------------------------------ | ------------------------------------------------------------------------ |
| `--igd-dodont-gap`             | Gap between the panels and between a frame and its caption               |
| `--igd-dodont-min-panel-width` | Width below which the panels stack into one column                       |
| `--igd-dodont-padding-block`   | Space above and below a screenshot (the design leaves 86px)              |
| `--igd-dodont-padding-inline`  | Minimum space either side of a screenshot (20px)                         |
| `--igd-dodont-image-width`     | Width the screenshots are laid out at (the design default is 360px)      |
| `--igd-dodont-radius`          | Corner radius of the image frame                                         |
| `--igd-dodont-badge-size`      | Size of the pinned badge                                                 |
| `--igd-dodont-badge-inset`     | Distance of the badge from the frame's top and inline-start edges (30px) |
| `--igd-dodont-caption-gap`     | Space between a label and its description (16px)                         |
| `--igd-dodont-stack-extra`     | Added between panels when they stack, so the 26px gap becomes 46px       |
| `--igd-dodont-bg`              | Frame canvas, visible in the padding and beside a narrower screenshot    |
| `--igd-dodont-border-color`    | Frame border color                                                       |
| `--igd-dodont-accent`          | Label color — success tokens on the Do panel, error tokens on Don't      |

The stylesheet is deliberately **unlayered**. `.igd-main-content__markdown img` and `figure` live in `@layer components` and set a block margin and a corner radius on every image; unlayered rules beat all layers, so the panel's own `margin: 0` and the frame-owned radius win.

Images are drawn at full opacity. In the light theme the frame canvas is solid `gray-100` with a `gray-300` border, as the design specifies; fading a documentation screenshot would cost its text real contrast.
