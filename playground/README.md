# Playground

A throwaway Astro site for visually testing the components in `../src`
without having to publish the package or wire it into a consumer repo.

## Run it

From the repo root:

```sh
npm install        # installs astro + sass for both root and playground
cd playground
npm run dev
```

Then open http://localhost:4321.

## How it's wired

- `astro.config.mjs` registers a tiny Vite plugin that supplies stub
  implementations of `virtual:docs-template/site-meta` and
  `virtual:docs-template/nav-html` — the two virtual modules normally
  produced by `siteMetaIntegration()`. This lets `DocsLayout`,
  `GlobalNavBar`, `GlobalFooter`, `DocsSidebar`, `ThemingWidget`, etc.
  run without booting the full integration (which expects route
  entrypoints and a Starlight compat shim that don't ship with this
  package yet).
- Components are imported directly via relative paths (`../../../src/...`)
  rather than through the package name, so no npm link / `file:` install
  is required.
- The active platform context (used by `ApiLink`, `ApiRef`,
  `PlatformBlock`, `Sample`) is selected by setting `process.env.PLATFORM`
  at the top of `astro.config.mjs`. Change it to `'Angular'`, `'React'`,
  `'WebComponents'`, or `'Blazor'` to see the platform-conditional
  output flip.

## Pages

| Route | Component(s) under test |
| --- | --- |
| `/` | `DocsLayout`, `DocsSidebar` |
| `/components/sidebar` | `DocsSidebar`, `SidebarTree`, `SidebarItem`, `SidebarFilterInput` |
| `/components/nav-bar` | `GlobalNavBar`, `GlobalFooter` |
| `/components/api-link` | `ApiLink` |
| `/components/api-ref` | `ApiRef` |
| `/components/platform-block` | `PlatformBlock` |

## Caveats

- The global nav/footer prefetch is disabled (`prefetched: false`), so
  you'll see the inline-fallback markup defined in each component.
- The `Sample` MDX component is **not** demoed because it imports
  `../../scripts/sample-widget` from a path that doesn't yet exist in
  this package (the script lives in the upstream `docs-template`
  project). Add `src/scripts/sample-widget.ts` and a Sample demo page
  once the script is ported.
- No MDX integration is wired up; tests use `.astro` pages exclusively.
  Add `@astrojs/mdx` to `playground/package.json` and the `integrations`
  array if you need to test components in `.mdx`.
