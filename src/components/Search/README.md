# Search

Pagefind-powered full-text search modal. Renders a trigger button (`Ctrl+K`) and a `<dialog>` container that is populated client-side by the Pagefind UI library.

## Import

```astro
import Search from 'igniteui-astro-components/components/Search.astro';
```

## Props

None — the component is self-contained.

## Behaviour

- The search index (`/pagefind/`) is written by `siteMetaIntegration`'s `astro:build:done` hook through the Pagefind JS API (`createIndex` → `addDirectory({ rootSelector: 'main' })`). Only `<main data-pagefind-body>` content is indexed; `DocsToc` and code blocks carry `data-pagefind-ignore`.
- In development the button renders but the dynamic Pagefind import resolves as a no-op — no runtime errors.
- Keyboard shortcut: `Ctrl+K` / `⌘K` to open, `Escape` to close.

## Example

`Search` is included automatically inside `DocsSubHeader` / `DocsLayout`. Mount it directly if you build a custom header:

```astro
---
import Search from 'igniteui-astro-components/components/Search.astro';
---

<Search />
```

## Build setup

The package imports `pagefind` but does not declare it as a dependency (issue #157), so the
host site must install it:

```sh
npm install --save-dev pagefind
```

If you do not use `siteMetaIntegration`, build the index yourself after
`astro build`, for example `pagefind --site dist`, or call the JS API from your
own integration.
