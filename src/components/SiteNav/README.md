# SiteNav

The Infragistics site navigation, compiled into the package rather than fetched from `/navigation` at build time.

Same visual result as `GlobalNavBar`, different supply route. See [Choosing between SiteNav and GlobalNavBar](#choosing-between-sitenav-and-globalnavbar) — the choice matters more than it looks.

The footer half is [`SiteFooter`](../SiteFooter/README.md), and the trade-off below applies to it identically.

## Import

```astro
import SiteNav from 'igniteui-astro-components/components/SiteNav.astro';
```

## Props

None. The nav is the same on every page and every site; what it links to is data, not configuration.

## Configuration

One environment variable, read at build time:

| Variable                | Default                            | Purpose                                                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_ACCOUNT_ORIGIN` | `https://account.infragistics.com` | Origin for the six customer-portal links (My Account, Contact Support, Product Renewals, License keys, Submit a support request). Point it at the staging portal in a staging build so a tester cannot click through into the real account app. |

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
- Below 991px the panel triggers collapse into a mobile sheet.
- Ships its own CSS (`nav.css`) and one ES module (`site-nav.ts`). No jQuery.
- **Images are bundled, not served from `/assets/`.** The logo, the five
  framework marks and the promo waves are imported from `./assets/`, so Astro
  emits them into your build. The marketing site serves those from its own
  `public/`, where an absolute path resolves — on any other site it 404s.
- Ships a scoped `box-sizing: border-box` reset, for the same reason
  [`SiteFooter`](../SiteFooter/README.md#behaviour) does.

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

## Choosing between SiteNav and GlobalNavBar

|                                                      | `SiteNav`                               | `GlobalNavBar`                                                |
| ---------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| Where the markup comes from                          | this package                            | `GET {origin}/navigation` at build time                       |
| Build-time network                                   | none                                    | required (fails soft to no chrome)                            |
| Breaks when the marketing site restructures its HTML | no                                      | yes — the extraction selectors are a contract nobody enforces |
| Picks up a nav change on the marketing site          | on the next package release             | on your next build, automatically                             |
| Works offline / in a sandboxed CI                    | yes                                     | no                                                            |
| Styling                                              | compiled in, versioned with the package | fingerprinted URLs read from the response                     |

**The honest trade-off is the fourth row.** `GlobalNavBar` tracks the marketing site automatically because it re-reads the real page every build. `SiteNav` cannot: it is a copy, and a copy drifts.

That drift is only acceptable if the marketing site renders **this** component too. Until it does, `SiteNav` is a second implementation of the same nav, and the two will diverge silently — no error, no failed build, just a docs site whose header slowly stops matching www.

So:

- **Use `SiteNav`** when you need determinism more than currency — an offline build, a sandboxed pipeline, a site that must not fail because a fetch did.
- **Use `GlobalNavBar`** when currency matters more, and you accept a build-time dependency on `/navigation`.
- **The end state** is `SiteNav` everywhere, including on the marketing site, with this package as the single source. That is a cross-repo change, not a flag.

## Source

Ported from `src/components/chrome/` and `src/config/navigation.ts` in the Marketing-Infragistics repo. Kept flat here: the panel bodies, `link.ts`, the behaviour module and the stylesheet all sit in this folder, so the component has no imports outside it. `SiteFooter` is ported the same way.

Until the marketing site consumes this package, **changes must be made in both places.** That is the cost of the copy, and the reason the end state above is worth reaching.
