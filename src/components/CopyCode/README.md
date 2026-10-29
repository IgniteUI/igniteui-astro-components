# CopyCode

Adds a "Copy code" icon button to every Shiki code block on the page. The
component renders no markup of its own: a client script wraps each
`pre.astro-code, pre.shiki` in `.copy-code-wrapper` and appends an
`igc-icon-button.copy-btn` that copies the block's text to the clipboard.

## Import

```astro
import CopyCode from 'igniteui-astro-components/components/CopyCode.astro';
```

## Props

None.

## Behaviour

- Runs on `astro:page-load`, so it also covers pages reached through view
  transitions. Blocks that already have a wrapper are skipped.
- Copies `<code>` text (falls back to the `<pre>` text). Uses
  `navigator.clipboard.writeText` with a hidden-textarea fallback.
- The icon switches to a check mark and the `aria-label` to "Copied!" for
  1.5 s, or to "Copy failed".
- Button styles live in `src/styles/global/_copy-button.scss`.

## Example

`DocsLayout` mounts it already. Mount it yourself only in a custom page shell:

```astro
---
import CopyCode from 'igniteui-astro-components/components/CopyCode.astro';
---

<CopyCode />
```
