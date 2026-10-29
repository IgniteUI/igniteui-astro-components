# MobileTocToggle

Mobile-only sticky row rendered below the sub-header. Shows "On this page"
with the current active heading and a chevron; tapping it opens a dropdown with
the table-of-contents links rendered through `DocsTree`. Hidden on tablet and
above, where the full `DocsToc` sidebar is shown instead.

## Import

```astro
import MobileTocToggle from 'igniteui-astro-components/components/MobileTocToggle.astro';
```

## Props

| Prop        | Type                | Default          | Description                                                                    |
| ----------- | ------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `headings`  | `MarkdownHeading[]` | `[]`             | Astro's `headings` for the page. Renders nothing when empty.                   |
| `tocConfig` | `TocConfig`         | —                | Depth filter, same shape `DocsToc` accepts (`components/DocsToc/toTreeNodes`). |
| `label`     | `string`            | `'On this page'` | Trigger text.                                                                  |

## Example

```astro
---
import DocsLayout from 'igniteui-astro-components/layouts/DocsLayout.astro';
import DocsToc from 'igniteui-astro-components/components/DocsToc.astro';
import MobileTocToggle from 'igniteui-astro-components/components/MobileTocToggle.astro';

const { headings } = Astro.props;
---

<DocsLayout title="Grid">
  <MobileTocToggle slot="mobile-toc" headings={headings} />
  <DocsToc slot="toc" headings={headings} offsetTarget=".docs-subheader" />
  <slot />
</DocsLayout>
```

## Markup

`.mobile-toc` → `button.mobile-toc__trigger#mobile-toc-trigger` (`aria-expanded`,
`aria-controls="mobile-toc-dropdown"`) with `.mobile-toc__label`,
`.mobile-toc__active` and `.mobile-toc__chevron`, followed by the dropdown.
Styles are in `MobileTocToggle.scss`.
