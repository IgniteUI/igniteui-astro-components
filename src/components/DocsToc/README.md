# DocsToc

"On this page" table of contents with scroll-spy. Builds a nested list from the page's `MarkdownHeading[]` and highlights the current section as the user scrolls.

## Import

```astro
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headings` | `MarkdownHeading[]` | `[]` | Array of headings from Astro's `getHeadings()` or MDX frontmatter. |
| `tocConfig` | `false \| { minHeadingLevel?: number; maxHeadingLevel?: number }` | — | Pass `false` to disable the TOC entirely. |
| `label` | `string` | `'On this page'` | Heading label rendered above the list. |

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
```

Used automatically inside `MainLayout` when the `headings` prop is passed.
