# DoDont

Renders a side-by-side "Do" / "Don't" pair of component screenshots. Each panel is a framed image with a status badge pinned to its top-inline corner — a green check for the recommended usage, a red clear for the one to avoid — and an optional description below it.

The frame supplies the padding around each screenshot, so the source images stay bare crops with no baked-in margin, and it centers anything smaller than its content box rather than blowing it up to fill. Panels share a subgrid, so every frame is as tall as the tallest screenshot in the row and the captions start on a common baseline.

The block is always 100% of its container and stacks into one column as soon as a panel would fall below `--igd-dodont-min-panel-width`, so it responds to the space it is given rather than to the viewport.

## Import

```astro
import DoDont from 'igniteui-astro-components/components/mdx/DoDont.astro';
```

## Props

| Prop        | Type                      | Default      | Description                                                                            |
| ----------- | ------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| `doSrc`     | `ImageMetadata \| string` | _(required)_ | The recommended-usage image. An `astro:assets` import or a URL.                        |
| `doAlt`     | `string`                  | _(required)_ | The recommended-usage image's accessible description. Becomes the inner `<img>` `alt`. |
| `dontSrc`   | `ImageMetadata \| string` | _(required)_ | The usage-to-avoid image. An `astro:assets` import or a URL.                           |
| `dontAlt`   | `string`                  | _(required)_ | The usage-to-avoid image's accessible description. Becomes the inner `<img>` `alt`.    |
| `doLabel`   | `string`                  | `'Do'`       | Label for the recommended panel.                                                       |
| `dontLabel` | `string`                  | `"Don't"`    | Label for the panel to avoid.                                                          |
| `class`     | `string`                  | —            | Extra CSS classes forwarded to the container.                                          |

The image props are `doSrc` / `dontSrc` rather than `do` / `dont` because Astro merges named slots into props ([`jsx-runtime`](https://github.com/withastro/astro) does `Object.assign(vnode.props, slots)`), so a prop sharing a slot's name is silently overwritten by that slot.

## Slots

| Slot   | Description                                                |
| ------ | ---------------------------------------------------------- |
| `do`   | Optional description rendered under the recommended panel. |
| `dont` | Optional description rendered under the panel to avoid.    |

When neither slot is filled the captions collapse to the "Do" / "Don't" labels alone.

## Examples

```mdx
{/* Images only */}

<DoDont
  doSrc={virtualScrollDo}
  doAlt="Virtual Scroll showing a list of 100,000 employees"
  dontSrc={virtualScrollDoNot}
  dontAlt="Virtual Scroll used for a list of only five employees"
/>

{/* With descriptions — blank lines inside each Fragment so the content parses as markdown */}

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

<DoDont doSrc={good} doAlt="…" dontSrc={bad} dontAlt="…" doLabel="Recommended" dontLabel="Avoid" />
```

## Accessibility

`doAlt` and `dontAlt` are required and are validated at build time — an absent, empty or whitespace-only value throws. The images carry the guidance, so describe what each one shows rather than merely naming the component.

The badges are decorative: the "Do" / "Don't" labels already name each panel, so the badges are `aria-hidden` and add no duplicate announcement. That also means the block does not rely on color alone.

## Styling

The component declares its tokens locally on `.igd-dodont` (and its theme tokens on `.igd-dodont__frame` / `.igd-dodont__badge`), so any ancestor can retune them:

| Property                       | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `--igd-dodont-gap`             | Gap between the panels and between a frame and its caption            |
| `--igd-dodont-min-panel-width` | Width below which the panels stack into one column                    |
| `--igd-dodont-padding-block`   | Space above and below a screenshot (the design leaves 56px)           |
| `--igd-dodont-padding-inline`  | Minimum space either side of a screenshot                             |
| `--igd-dodont-image-width`     | Width the screenshots are laid out at (the design default is 360px)   |
| `--igd-dodont-radius`          | Corner radius of the image frame                                      |
| `--igd-dodont-badge-size`      | Size of the pinned badge                                              |
| `--igd-dodont-badge-inset`     | Distance of the badge from the frame's top and inline-start edges     |
| `--igd-dodont-bg`              | Frame canvas, visible in the padding and beside a narrower screenshot |
| `--igd-dodont-border-color`    | Frame border color                                                    |
| `--igd-dodont-accent`          | Label color — success tokens on the Do panel, error tokens on Don't   |

The stylesheet is deliberately **unlayered**. `.igd-main-content__markdown img` and `figure` live in `@layer components` and set a block margin and a corner radius on every image; unlayered rules beat all layers, so the panel's own `margin: 0` and the frame-owned radius win.

Images are drawn at full opacity. The design's `0.7` is applied to the frame's canvas alpha instead — fading a documentation screenshot would cost its text real contrast.
