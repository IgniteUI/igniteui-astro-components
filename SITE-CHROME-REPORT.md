# feat(chrome): make `SiteNav` / `SiteFooter` the single source of the Infragistics header and footer, and stop fetching `/navigation`

## Summary

Docs sites built on this package used to download the Infragistics header and footer from `https://www.infragistics.com/navigation` on every build and inline them. This PR replaces that with the components the package already ships, `SiteNav` and `SiteFooter`, brought up to date with the marketing site. `DocsLayout` now renders them on every page, with nothing to configure.

- **The new design.** v9 header ("Nav Dropdown – Category Cards v9"), v4 mobile drawer and the approved v5 footer, ported from `Marketing-Infragistics` (`staging`, merge of #482).
- **Looks the same as www on any site.** Verified element by element against https://astro-staging.infragistics.com inside a real `DocsLayout` page.
- **No `/navigation` fetch** for English and Korean builds.
- **Japanese builds keep the old fetched chrome for now.** There is no Japanese version of the new design yet.
- **Not a breaking change.** `GlobalNavBar` / `GlobalFooter` stay exported and are marked `@deprecated`.

## Why

An audit of the header/footer setup across Infragistics sites (_HANDOFF – Infragistics global header/footer (`/navigation`) audit_) found that this fetch fails silently, and that its source is about to disappear:

| Finding                                            | What it means here                                                                                                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1** — no fallback anywhere                      | A failed fetch shipped a docs site with **no header or footer**, and the build still passed.                                                                     |
| **F2** — extraction depends on someone else's HTML | The header/footer were cut out with regexes on `<header id="header">` / `<footer id="footer">`. Nothing enforced that contract.                                  |
| **F3** — `/navigation` is Umbraco CMS content      | The new Astro marketing site has no `/navigation` (checked: no page in its source, and `/navigationNew` returns 404). At the cutover every fetching site breaks. |
| **F5** — chrome CSS/JS hard-coded to www           | The old jQuery 3.1 (2016), `plugins.nav.js`, `navigation.js`, `navigation.css` and `footer.css` loaded on every docs page.                                       |
| **F8** — this package's own fetch                  | Always production, Korean got English, and an empty header on failure, although the code comment promised a "static fallback".                                   |

The old `/navigation` page also serves the legacy design, so the v9 header and v5 footer could never reach the docs that way.

## What changed

### 1. Header and footer brought up to date with the marketing site

| Here                                                                                                             | Source in `Marketing-Infragistics`                   |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `SiteNav/SiteNav.astro`                                                                                          | `src/components/chrome/SiteHeader.astro`             |
| `SiteNav/site-nav.ts`                                                                                            | `src/components/chrome/siteHeader.ts` (**verbatim**) |
| `SiteNav/nav.css`                                                                                                | `src/styles/nav.css` (**verbatim**)                  |
| `SiteNav/nav-config.ts`                                                                                          | `src/config/navigation.ts`                           |
| `SiteNav/{Products,Docs,Learn}Body`, `NavPanel`, `MobileSheet`, `SearchPanel`, `PromoCard`, `NavIcon`, `link.ts` | `src/components/chrome/nav/`                         |
| `SiteFooter/SiteFooter.astro` (**styles verbatim**)                                                              | `src/components/chrome/SiteFooter.astro`             |
| `SiteFooter/FooterLinks.astro` (new)                                                                             | `src/components/chrome/FooterLinks.astro`            |
| `SiteFooter/footer-config.ts`                                                                                    | `src/config/footer.ts`                               |
| New assets: `ig-logo-dark.svg`, `fw-winui.png`, `ignite-ui-mark.webp`, `app-builder-mark.png`                    | `public/assets/logos/`                               |

Every difference from the marketing source is one of these adaptations:

- config imports point to local files;
- images are imported from `./assets/` instead of `/assets/` URLs, which 404 on any other host;
- `ACCOUNT_ORIGIN` / `SUPPORT_URL` are read from `PUBLIC_ACCOUNT_ORIGIN`;
- Prettier formatting.

`SiteFooter` keeps its props: `columns`, `legal`, `social` and `year`, plus the new `moreProducts`. Two parts are **opt-in**, because they only work where the page provides something extra:

- **`newsletter`** posts to the IS Cloud API, which accepts only allow-listed origins.
- **`cookieSettings`** only works if the page has a consent banner bound to `[data-consent-open]`.

### 2. `components/chrome/chrome.css`: what the marketing site gives the chrome

On www the chrome relies on that site's global stylesheets (`design-system/tokens.css`, `base.css`). A docs site has none of them. In the old port, about 19 `--ig-*` tokens resolved to nothing, and `.ig-sr-only` was undefined, so text meant only for screen readers was **visible** in the Docs panel. `chrome.css` supplies all of it, scoped to `.nv`, `.nv__sheet`, `.nv__scrim` and `.ftr`:

- **Design tokens,** copied verbatim. Scoping them also stops the host's own `--ig-*` palette (Ignite UI themes declare one on `:root`) from leaking into the chrome.
- **Body defaults:** font, size, line height, color.
- **Element defaults:** headings, links, buttons, images, focus ring, `box-sizing`, `ig-sr-only`, and the "(opens in new tab)" announcement.
- **Fonts self-hosted:** Plus Jakarta Sans and DM Sans from the static `@fontsource` packages. They register the same family names Google Fonts uses, so the font stacks stay verbatim. No CDN request.
- **Guards against host resets:** `input { line-height: inherit }` and Bootstrap 3's `kbd` shadow, both found on docs pages.

**Specificity is deliberate.** Element rules are `html :where(.nv, …) a`: two elements, no class.

- That's **below one class**, so the components' own rules always win, whatever order the bundler emits the files in. A class-weight version lost to bundle order in a docs build.
- It's **above one element**, so a host page's bare `a {}` or reset library can't restyle the chrome.

### 3. The `/navigation` fetch removed, except for Japanese

- **`DocsLayout`:** the `IG_CHROME` switch is gone. It renders `SiteNav` / `SiteFooter` unless `navLang === 'jp'` (the `legacyJpChrome` switch), when it renders the deprecated `GlobalNavBar` / `GlobalFooter`.
- **`platform.ts`:** `getPlatformHead()` adds `navigation.css`, `footer.css`, jQuery, `plugins.nav.js` and `navigation.js` **for Japanese builds only**. The unused `getNavConfig()` / `NavConfig` are removed.
- **Deprecated, still exported:** `GlobalNavBar`, `GlobalFooter` and `lib/nav-helpers.ts`. A `@deprecated` JSDoc tag makes editors flag an import, and their READMEs say what to use instead.
- **Playground:** the `nav-bar` page and the nav-HTML stubs are removed. `NAV_LANG=jp npm run playground:dev` shows the Japanese path.

### 4. Bug fixes found while doing this

- **`DocsLayout` sidebar clamp:** `initSidebarHeights()` finds the footer by `[data-igd-footer]`, which only the old `GlobalFooter` wrapper had. With the compiled footer it found nothing, so the sidebar wasn't kept clear of the footer. The new wrapper now has the attribute.
- **Screen-reader-only text visible** in the Docs panel and footer (missing `.ig-sr-only`), fixed through `chrome.css`.

### 5. Docs

- **README:** the "Two ways to get the Infragistics chrome" section is replaced by "The Infragistics chrome", including the Japanese exception.
- **New `NAVIGATION-FETCH-REMOVAL.md`:** the decision record with the pros and cons, the Japanese section, and the steps to remove the fallback.
- **Updated READMEs:** `SiteNav`, `SiteFooter`, `DocsLayout` (new "Header and footer" table), `GlobalNavBar` / `GlobalFooter` (deprecation notes) and the playground.

## Behaviour by build

| Build                          | Header / footer                                                                           | Legacy CSS + JS in `<head>` | Fetches `/navigation`                 |
| ------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------- |
| `navLang` `en` (default)       | `SiteNav` / `SiteFooter`                                                                  | no                          | **no**                                |
| `navLang` `kr`                 | `SiteNav` / `SiteFooter` (English: the old fetch also gave Korean the English www chrome) | no                          | **no**                                |
| `navLang` `jp` (**temporary**) | Legacy Japanese chrome via `GlobalNavBar` / `GlobalFooter`                                | yes                         | yes, `jp.infragistics.com/navigation` |

## Pros

1. **No build-time network dependency** (except Japanese, for now). Builds work offline, in sandboxed CI and when www is down.
2. **No silent "no chrome" failure.** The F1 failure mode is gone.
3. **No coupling to someone else's HTML.** The regex extraction (F2) is gone.
4. **The current design.** The v9 header and v5 footer, which `/navigation` could never deliver.
5. **Survives the Umbraco → Astro cutover** (F3). Nothing depends on a CMS page that's about to disappear.
6. **Less third-party weight per page.** jQuery 3.1, `plugins.nav.js`, `navigation.js`, `navigation.css` and `footer.css` aren't loaded. The new chrome is one ES module plus scoped CSS, with fonts self-hosted.
7. **Faster builds.** No HTTP round trip per locale per build.
8. **Deterministic, reviewable.** A nav change is a diff and a package version.
9. **Typed, reusable data.** `nav-config.ts` / `footer-config.ts` are plain typed data a consumer can import, for a sitemap for example.
10. **Docs CSS can't break the chrome, and the other way round.** Scoped styles, plus guards against host resets.
11. **Not breaking.** The deprecated exports keep existing imports working.

## Cons

1. **It's a copy, and copies drift.** Until the marketing site consumes this package, a nav change on www has to be ported here and released, and each site has to upgrade. Nothing fails; the docs header just falls behind www. This is the main cost (see [Single source of truth](#single-source-of-truth--next-step)).
2. **Two places to change** until that happens.
3. **English only, so two code paths for now.** Japanese builds keep the fetch, so F1 and F2 still apply to Japanese docs until the Japanese design ships.
4. **A content change needs a release.** A link fix or a new menu item means a package version, and every consumer has to pick it up.
5. **A deprecation to finish.** Removing `GlobalNavBar` / `GlobalFooter` later **is** a breaking change, for the major release that ships the Japanese design.
6. **Fewer features than www for now.** The newsletter and Cookie Settings are opt-in, and the hello bar and consent banner aren't part of the package.

### How to reduce them

| Con                         | Mitigation                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drift, two places to change | The marketing site imports `SiteNav` / `SiteFooter` from this package (next section). Until then, a CI check that diffs the ported files against the marketing repo. |
| English only                | Japanese nav/footer data, chosen by the existing `navLang` option, then delete the fallback.                                                                         |
| Release per content change  | Content lives in data files, so changes are small diffs; automate patch releases and consumer upgrades.                                                              |
| Deprecation                 | Release this as a **minor** version with a deprecation note; remove the exports in the major release that ships the Japanese design.                                 |

## Single source of truth — next step

With the fetch gone, the one source of truth comes back if **every Astro site renders the same component**, and the legacy sites fetch HTML **generated from that same component**:

| Site                                                                                                                   | How it gets the chrome                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Marketing-Infragistics** (main site)                                                                                 | imports `SiteNav` / `SiteFooter` from this package                                                                                  |
| docs-template / igniteui-documentation, api-docs                                                                       | import it (this PR, plus the consumer changes below)                                                                                |
| Marketing-Infragistics-Blogs                                                                                           | imports it. The audit (§5.2) shows it currently has its own hand-maintained copy                                                    |
| **Legacy:** docs-tripwire, DocFX sites (Indigo, App Builder, Slingshot), ig-typedoc-theme API docs, Community, sassdoc | keep their pre-built layout and runtime/build fetch, **from a `/navigation` page the marketing site renders from these components** |

What the generated `/navigation` page must guarantee for legacy sites (from the audit):

1. **Keep the old element names:** `#header`, `footer.ui-footer` and `#footer` always present (F2). Staging's Umbraco page already does this for the header: `<header class="nv" id="header">`.
2. **Versioned URLs** for the new chrome's CSS/JS. Each legacy site needs a one-line change to load it, since `igNavigation.init()` doesn't drive the new markup.
3. **Explicit CORS** per caller's origin (F7). tripwire sends credentials.
4. **One page per locale.** Japanese stays on the current Umbraco page until the Japanese design exists.

What blocks the marketing site from consuming this package today:

- It's on Astro `^7.2.6`; the package needs `^7.3.4` (a minor bump).
- It's on `igniteui-theming` **29**; the package declares `^26`, so widen the peer range. `SiteNav` / `SiteFooter` don't use igniteui-theming.
- Its own lead-form client, consent banner and hello bar already fit: the newsletter's object form, `cookieSettings`, and the hello bar staying marketing's own component above the header.

**Open decision:** keep the chrome code here (marketing upgrades the package), or move it into a package published from the marketing repo that this package depends on. The second fits better, because marketing changes the nav often.

## Consumer changes (separate PRs, already tested on `vnext`)

**docs-template**

- Depend on the new package release (root, `docs/angular`, `docs/xplat`).
- `src/platform.ts`: legacy chrome CSS/JS for Japanese builds only; remove the unused `getNavConfig()`.
- Nothing else; it never imported the deprecated components.

**api-docs**

- **Astro 6 → 7**, required by the package:
  - `markdown.processor = satteri({ hastPlugins: [rehypeHeadingAnchors] })`, plus the `@astrojs/markdown-satteri` dependency.
  - A Sass importer for `igniteui-theming`, whose `./sass/**/*.*` export isn't a valid Node pattern, so Vite 8 resolves none of its `sass/` paths. This is the same fix docs-template uses.
  - Declare `unified`, `remark-parse`, `remark-gfm`, `remark-rehype` and `rehype-stringify`, which Astro 6 used to install as a side effect.
- `src/data/global-nav.ts` no longer fetches `/navigation`; it only provides the platform key.
- **Locale bug fixed:** `LOCALE=ja` is now mapped to `navLang: 'jp'`. Unmapped, Japanese API docs would have missed the fallback and shown the English header.
- Legacy chrome CSS/JS only when `LOCALE=ja`.

## Verification

- **Compared with staging element by element:** a headless Chromium script compared computed styles and box sizes of **every element** in the header, the four panels, the phone drawer and the footer against astro-staging.infragistics.com. It used a `DocsLayout` page at 1440 / 1024 / 390 px.
  - **Header, every panel and the drawer:** all matched.
  - **Footer:** all matched, apart from expected differences: the newsletter card isn't rendered on docs pages, and the Subscribe button is disabled on staging.
  - **Leftovers:** two sub-pixel rounding differences of 1px and 0.015px.
- **`npm run playground:check`:** 0 errors, 0 warnings. `oxlint`: clean.
- **Builds:**

  | Build                                 | Header / footer                                       | Legacy CSS/JS |
  | ------------------------------------- | ----------------------------------------------------- | ------------- |
  | Playground, English                   | `SiteNav` / `SiteFooter`                              | none          |
  | Playground, `NAV_LANG=jp`             | Legacy Japanese chrome (95 jp.infragistics.com links) | present       |
  | docs-template `angular:dev:en`        | `SiteNav` / `SiteFooter`                              | none          |
  | docs-template `angular:dev:jp`        | Legacy Japanese chrome                                | present       |
  | api-docs `start:angular:en` (Astro 7) | `SiteNav` / `SiteFooter`                              | none          |
  | api-docs `start:angular:ja` (Astro 7) | Legacy Japanese chrome                                | present       |

## How to test

```sh
npm run playground:build && npm run playground:preview          # English: compiled chrome
NAV_LANG=jp npm run playground:dev                              # Japanese: legacy fallback
```

In a consumer, link this checkout (`"igniteui-astro-components": "file:<path>"`), then run an English and a Japanese build. On the English build, confirm there's no `www.infragistics.com/css/navigation.css` in `<head>` and no `/navigation` request.

## Release notes

- **Minor version.** Nothing breaks.
- **Deprecated:** `components/GlobalNavBar.astro` → use `components/SiteNav.astro`; `components/GlobalFooter.astro` → use `components/SiteFooter.astro`.
- `IG_CHROME` no longer has any effect; the compiled chrome is the default.
- **New dependencies:** `@fontsource/dm-sans`, `@fontsource/plus-jakarta-sans`.

## Follow-ups

- [ ] Widen the `igniteui-theming` peer range so the marketing site can consume the package.
- [ ] Marketing site imports `SiteNav` / `SiteFooter`, and renders a legacy-compatible `/navigation` from them.
- [ ] Japanese nav/footer data, then remove the fallback (four steps in `NAVIGATION-FETCH-REMOVAL.md`) as a major release.
- [ ] Review the remaining shared `<head>` assets (Bootstrap 3, `layout.css`, `animate-custom.css`, fontello, Material Icons) for docs content that still needs them.
- [ ] `DocsLayout` hard-codes `<html lang="en">`; it should follow `navLang`.
- [ ] api-docs: the committed sample data (`igniteui-angular-21.0.x.json`) doesn't match the file names `platforms-config.json` expects (`igniteui-angular.21.0.x.json`), so no API page renders locally without a TypeDoc build.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
