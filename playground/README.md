# Playground

A throwaway Astro site for visually testing the components in `../src`
without having to publish the package or wire it into a consumer repo.

## Run it

From the repo root:

```sh
npm install
npm run playground:dev
```

Then open http://localhost:4567.

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

| Route                        | Component(s) under test                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `/`                          | `DocsLayout`, `DocsSidebar`                                       |
| `/components/sidebar`        | `DocsSidebar`, `SidebarTree`, `SidebarItem`, `SidebarFilterInput` |
| `/components/nav-bar`        | `GlobalNavBar`, `GlobalFooter`                                    |
| `/components/api-link`       | `ApiLink`                                                         |
| `/components/api-ref`        | `ApiRef`                                                          |
| `/components/badge`          | `Badge`                                                           |
| `/components/platform-block` | `PlatformBlock`                                                   |

## Caveats

- The global nav/footer prefetch is disabled (`prefetched: false`), so
  you'll see the inline-fallback markup defined in each component.
- Astro, MDX, Sätteri, and the playground's other development dependencies
  are managed by the repository's root `package.json`.
