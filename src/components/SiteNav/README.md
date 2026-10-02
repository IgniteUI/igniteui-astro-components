# SiteNav

The Infragistics site navigation - the single source of the header for every site built on this package. Nothing is fetched: `DocsLayout` renders it on every page. (Temporary exception: a `navLang: 'jp'` build still renders the legacy Japanese header fetched by [`GlobalNavBar`](../GlobalNavBar/README.md), until the Japanese version of this design ships.)

The footer half is [`SiteFooter`](../SiteFooter/README.md).

## Import

```astro
import SiteNav from 'igniteui-astro-components/components/SiteNav.astro';
```

## Props

None. The nav is the same on every page and every site; what it links to is data, not configuration.

## Configuration

One environment variable, read at build time:

| Variable                | Default                            | Purpose                                                                                                                                                                                                                                                                                    |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_ACCOUNT_ORIGIN` | `https://account.infragistics.com` | Origin for the customer-portal links (My Account, Product Renewals, License keys) and the support chatbot at `{origin}/chatbot` (Contact Support, Submit a support request). Point it at the staging portal in a staging build so a tester cannot click through into the real account app. |

Everything else lives in [`nav-config.ts`](./nav-config.ts) — sections, panels, framework lists, the search panel, header actions — as plain typed data. It is exported, so a consumer can read it (to build a sitemap, say) without rendering anything:

```ts
import {
  NAV_SECTIONS,
  PRODUCTS_PANEL,
} from 'igniteui-astro-components/components/SiteNav/nav-config';
```

## Behaviour

- **No network at build.** The markup, styling and behaviour are compiled in.
- Panels open on **click**, never hover — a synthesised `mouseenter` makes the first tap ambiguous on touch.
- `Escape` closes the open panel and returns focus to its trigger; an outside click closes it too.
- At 1040px and below the panel triggers collapse into a mobile sheet.
- Ships its own CSS (`nav.css`) and one ES module (`site-nav.ts`). No jQuery.
- **Renders the same as www on a page that is not www.** On the marketing site
  `nav.css` reads that site's `--ig-*` design tokens and leans on its element
  defaults (body type, heading face, link colour, focus ring, `ig-sr-only`).
  [`../chrome/chrome.css`](../chrome/chrome.css) supplies all of it, scoped to
  `.nv`, the drawer and the footer so nothing reaches your page — and so your
  page's own `--ig-*` palette (Ignite UI themes declare one on `:root`) and
  bare element rules cannot reach the chrome.
- **Fonts are self-hosted.** Plus Jakarta Sans and DM Sans come from the static
  `@fontsource` packages, in the weights the marketing site requests from
  Google Fonts. No CDN request.
- **Images are bundled, not served from `/assets/`.** The logo, the framework
  and product marks and the promo waves are imported from `./assets/`, so Astro
  emits them into your build. The marketing site serves those from its own
  `public/`, where an absolute path resolves — on any other site it 404s.
- **No skip link.** As on the marketing site, the page owns that: put one at the
  top of your layout pointing at your `<main>`.

## Example

```astro
---
import SiteNav from 'igniteui-astro-components/components/SiteNav.astro';
---

<html lang="en">
  <body>
    <SiteNav />
    <main><slot /></main>
  </body>
</html>
```

## Source

Ported from the Marketing-Infragistics repo — "Nav Dropdown - Category Cards v9" and "Nav Mobile v4":

| Here                   | There                                                                             |
| ---------------------- | --------------------------------------------------------------------------------- |
| `SiteNav.astro`        | `src/components/chrome/SiteHeader.astro`                                          |
| `site-nav.ts`          | `src/components/chrome/siteHeader.ts` (verbatim)                                  |
| `nav.css`              | `src/styles/nav.css` (verbatim)                                                   |
| `nav-config.ts`        | `src/config/navigation.ts`                                                        |
| the other `.astro`     | `src/components/chrome/nav/`                                                      |
| `../chrome/chrome.css` | the parts of `src/styles/design-system/tokens.css` and `base.css` the chrome uses |

Every difference from the source is one of four adaptations: config imports point at `./nav-config`, images are imported from `./assets/` instead of `/assets/` URLs, `ACCOUNT_ORIGIN`/`SUPPORT_URL` are read from the environment instead of the marketing site's `lib/env`, and Prettier formatting. Kept flat: the only import outside this folder is the shared `../chrome/chrome.css`. `SiteFooter` is ported the same way.

Until the marketing site consumes this package, **changes must be made in both places.** That is the cost of the copy, and the reason the end state — the marketing site importing this component back — is worth reaching.
