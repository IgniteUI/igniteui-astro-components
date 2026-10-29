# DocsToc

"On this page" table of contents with scroll-spy. Builds a nested list from the page's `MarkdownHeading[]` and highlights the current section as the user scrolls.

The component renders a `<docs-toc>` custom element that manages all scroll-spy logic on the client. It supports sticky-header offset compensation, click-pin behaviour, and Astro View Transitions.

## Import

```astro
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';
```

## Props

| Prop           | Type                                                              | Default          | Description                                                                                                                                          |
| -------------- | ----------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headings`     | `MarkdownHeading[]`                                               | `[]`             | Array of headings from Astro's `getHeadings()` or MDX frontmatter.                                                                                   |
| `tocConfig`    | `false \| { minHeadingLevel?: number; maxHeadingLevel?: number }` | —                | Pass `false` to disable the TOC entirely.                                                                                                            |
| `label`        | `string`                                                          | `'On this page'` | Heading label rendered above the list.                                                                                                               |
| `offsetTarget` | `string`                                                          | —                | CSS selector for a sticky element (e.g. a nav bar). Its bottom edge is used as the scroll-spy threshold and sets `scroll-padding-top` automatically. |

`tocConfig` defaults:

- `minHeadingLevel`: `2` (i.e. `##`)
- `maxHeadingLevel`: `3` (i.e. `###`)

## Example

```astro
---
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';

const { headings } = Astro.props;
---

<DocsToc headings={headings} />

<!-- Only h2 -->
<DocsToc headings={headings} tocConfig={{ minHeadingLevel: 2, maxHeadingLevel: 2 }} />

<!-- Disabled -->
<DocsToc headings={headings} tocConfig={false} />

<!-- Compensate for a sticky nav bar -->
<DocsToc headings={headings} offsetTarget=".site-header" />
```

Place it in the `toc` slot of `DocsLayout`: `<DocsToc slot="toc" headings={headings} />`.

## Scroll-spy behaviour

- The active link is determined by comparing each heading's position to a threshold (the bottom of the `offsetTarget` element + 8 px, or 160 px when no offset target is set).
- At the bottom of the page the last heading is always highlighted, even if its section is too short to ever cross the threshold.
- **Click-pin**: clicking a TOC link immediately marks it active and suppresses the scroll-spy until the user interacts with the page via wheel, touch, or keyboard.
- The component uses `requestAnimationFrame` batching so scroll and resize handlers are cheap.
- `scroll-padding-top` is set dynamically via a `ResizeObserver` on the offset target element so anchor-jump scrolling always lands below the sticky header.

## Astro View Transitions

Because bundled `<script>` modules run only once, the component listens for `astro:page-load` at the document level. After every navigation it calls `init()` on each `<docs-toc>` element to re-attach listeners and re-run the initial highlight pass against the new page's headings.

## CSS

The component ships global styles. Place the TOC inside an element with the `.toc-sidebar` class to get the built-in fixed sidebar layout (visible above `84rem`).

| CSS custom property | Default | Description                     |
| ------------------- | ------- | ------------------------------- |
| `--ig-toc-width`    | `24rem` | Width of the fixed TOC sidebar. |

`.toc-sidebar:not(:has(docs-toc))` is set to `display: none` so the sidebar collapses automatically when the TOC has no items to render.
