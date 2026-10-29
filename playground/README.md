# Playground

A throwaway Astro site for visually testing the components in `../src`
without having to publish the package or wire it into a consumer repo.

## Run it

From the repo root:

```sh
npm install
npm run playground        # astro sync + astro dev on http://localhost:4567
npm run playground:check  # astro check (type-checks ../src through the playground)
npm run playground:build  # production build, then `npm run playground:preview`
```

## How it's wired

- `astro.config.mjs` registers a tiny Vite plugin that supplies stub
  implementations of `virtual:docs-template/site-meta` and
  `virtual:docs-template/nav-html` — the two virtual modules normally
  produced by `siteMetaIntegration()`. This lets `DocsLayout`,
  `GlobalNavBar`, `GlobalFooter`, `DocsSidebar`, `ThemingWidget`, etc.
  run without the full integration. `createDocsSite()` is deliberately not
  called.
- Components are imported directly via relative paths (`../../../src/...`)
  rather than through the package name, so no npm link / `file:` install
  is required.
- Site title, product links, sidebar tree, search tabs, packages and
  versions come from `src/site-config.ts` and are passed as props
  (prop-driven usage).
- `src/middleware.ts` sets `Astro.locals.platformContext` (a mock React
  context) and `Astro.locals.envVars`. `ApiLink`, `ApiRef`, `PlatformBlock`,
  `Sample` and `ThemingWidget` read them. Change `MOCK_PLATFORM` there to see
  platform-conditional output flip; the `PLATFORM` env var is not consulted.
- `IG_CHROME_SNAPSHOT=<folder>` renders the marketing site's exported header
  and footer from a snapshot through `igChrome()`; without it the legacy
  `GlobalNavBar` / `GlobalFooter` fetch is used.
- A dev-only `POST /api/icons/replace` route backs the icon gallery's upload
  button.

## Pages

| Route                         | Under test                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                           | `DocsLayout`, `DocsSidebar`, `DocsToc`                                                                                                       |
| `/components/anatomy`         | `Anatomy`                                                                                                                                    |
| `/components/api-link`        | `ApiLink`                                                                                                                                    |
| `/components/api-ref`         | `ApiRef`                                                                                                                                     |
| `/components/badge`           | `Badge`                                                                                                                                      |
| `/components/do-dont`         | `DoDont`                                                                                                                                     |
| `/components/docs-aside`      | `DocsAside`                                                                                                                                  |
| `/components/docs-subheader`  | `DocsSubHeader` with package/version selectors                                                                                               |
| `/components/docs-toc`        | `DocsToc`, `MobileTocToggle`                                                                                                                 |
| `/components/faq`             | `Faq`, `FaqItem` (MDX page)                                                                                                                  |
| `/components/nav-bar`         | `GlobalNavBar`, `GlobalFooter`                                                                                                               |
| `/components/platform-block`  | `PlatformBlock`                                                                                                                              |
| `/components/sample`          | `Sample` (uses the `mock-demo*` pages as iframe targets)                                                                                     |
| `/components/search`          | `Search`                                                                                                                                     |
| `/components/search-advanced` | `SearchAdvanced` with `public/api-search-index/`                                                                                             |
| `/components/sidebar`         | `DocsSidebar`, `SidebarFilterInput`, `DocsTree`                                                                                              |
| `/components/theming-widget`  | `ThemingWidget`                                                                                                                              |
| `/styles/*`                   | Markdown styling: badges, code, colors, icons, images, lists, media, tables, text-elements, typography (MDX pages via `PlaygroundMdxLayout`) |
| `/mock-demo*`                 | Stand-in demo pages embedded by the `Sample` page                                                                                            |

## Adding a page

1. Create `src/pages/components/<name>.astro` (or `.mdx` under `src/pages/styles/`
   using `PlaygroundMdxLayout`).
2. Import the component from `../../../src/...` and render every variant and
   state worth looking at.
3. Add the route to the `SIDEBAR` tree in `src/site-config.ts` so it shows up
   in the navigation, and to the table above.

## Caveats

- The global nav/footer prefetch falls back to inline minimal markup when the
  fetch fails, so offline you'll see a reduced header.
- Astro, MDX, Sätteri and the other development dependencies are managed by
  the repository's root `package.json`.
