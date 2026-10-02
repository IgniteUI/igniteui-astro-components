# Dropping the `/navigation` fetch

**Decision:** sites built on `igniteui-astro-components` no longer fetch the
Infragistics header and footer from `https://www.infragistics.com/navigation`
at build time. `SiteNav` and `SiteFooter`, compiled into this package, are the
single source of the chrome, and `DocsLayout` renders them.

**Temporary exception: Japanese builds.** There is no Japanese version of the
new design yet. Until there is, a `navLang: 'jp'` build keeps the old
behaviour: the legacy chrome fetched from `jp.infragistics.com/navigation`,
with the legacy CSS and scripts it needs. See
[Japanese builds](#japanese-builds-temporary).

## What changed

**Removed from the package**

| Removed                                                                                                                  | What it did                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `IG_CHROME` switch in `DocsLayout`                                                                                       | Chose between the fetched and the compiled chrome                            |
| `getNavConfig()` / `NavConfig` in `platform.ts`                                                                          | Mapped a platform to its nav URL (already unused)                            |
| `navigation.css`, `footer.css`, jQuery, `plugins.nav.js`, `navigation.js` in `getPlatformHead()` for non-Japanese builds | Styled and scripted the fetched legacy chrome, loaded from www on every page |
| Playground `nav-bar` page and nav-HTML stubs                                                                             | Demoed the fetched chrome                                                    |

**Deprecated, still exported**

| Deprecated                                                                                                                      | Why it is kept                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GlobalNavBar` / `GlobalFooter` (`components/GlobalNavBar.astro`, `components/GlobalFooter.astro`) and `src/lib/nav-helpers.ts` | A Japanese build still needs them (see [Japanese builds](#japanese-builds-temporary)). Marked `@deprecated` in source, so an editor flags an import; an existing import keeps working, so this is **not** a breaking change |

**Now**

- `DocsLayout` renders `SiteNav` (v9 header, v4 mobile drawer) and `SiteFooter`
  (v5 footer) on every page. Nothing has to be configured.
- `components/chrome/chrome.css` gives both components the design tokens,
  self-hosted fonts and element defaults the marketing site gives them. They
  were checked element by element against astro-staging.infragistics.com
  inside a `DocsLayout` page: header, every panel, the mobile drawer and the
  footer.
- The `navLang` option is still accepted, so existing configs keep working.
  `'jp'` selects the temporary Japanese fallback; any other value gets the
  compiled chrome.

## Pros

1. **No build-time network dependency** (except Japanese builds, for now).
   Builds work offline, in sandboxed CI and when www is down or slow. Before, a
   failed fetch produced a site with **no header or footer**, with no error and
   a green build.
2. **No silent breakage from someone else's HTML.** The fetch extracted
   `<header id="header">` and `<footer id="footer">` with regexes. That
   contract was never enforced: if the marketing site restructured, every docs
   site would ship without chrome and nothing would go red.
3. **The current design.** `/navigation` serves the frozen legacy chrome. The
   v9 header and v5 footer were never reachable through it, because the
   extraction doesn't match their markup.
4. **Deterministic, reviewable releases.** A nav change is a diff in this repo
   and a package version. The same input always produces the same output.
5. **Less third-party weight on every page.** jQuery 3.1 (a 2016 release),
   `plugins.nav.js`, `navigation.js`, `navigation.css` and `footer.css` are no
   longer loaded from www. The new chrome is one ES module and scoped CSS, with
   fonts self-hosted instead of requested from a CDN.
6. **Faster builds.** No HTTP round trip per locale per build.
7. **Typed, reusable data.** The nav and footer structure is plain typed data
   (`nav-config.ts`, `footer-config.ts`), which a consumer can import, for a
   sitemap for example.
8. **Docs styles can't break the chrome.** The chrome's styles are scoped, and
   it's guarded against host resets (such as the Bootstrap 3 rules docs pages
   load). The fetched chrome depended on global CSS from www that docs styles
   could override, and the reverse.

## Cons

1. **It's a copy, and copies drift.** This is the main cost. A change to the
   nav or footer on the marketing site no longer reaches the docs sites by
   itself: it has to be ported here and released, and each docs site has to
   upgrade. Until then the docs header quietly falls behind www. Nothing
   fails; it just stops matching.
2. **Two places to change.** Until the marketing site imports these components
   from this package, every nav or footer change has to be made in both
   repos.
3. **English only, so two code paths for now.** `SiteNav` and `SiteFooter`
   contain the English text only. Japanese builds therefore keep the old fetch
   (see below), which means the package carries both kinds of chrome, and the
   fetch's risks (pros 1 and 2) still apply to Japanese docs until the Japanese
   design ships. Korean sites get the English compiled chrome, as they got
   the English www chrome from the fetch before.
4. **Releases are needed for content changes.** A link fix, a new product or a
   renamed menu item now needs a package release, and every consumer has to
   pick it up.
5. **A deprecation to finish later.** `GlobalNavBar` / `GlobalFooter` stay
   exported, so nothing breaks now, but the deprecation has to be carried
   through: removing them when the Japanese design ships **is** a breaking
   change (major version) for anything still importing them. Setting
   `IG_CHROME` no longer does anything; it simply has no effect.
6. **Fewer features than www for now.** The newsletter signup is opt-in and
   needs its own form script (it posts to the Infragistics accounts API, which
   only accepts allow-listed origins). The hello bar and the consent banner
   aren't part of the package, and "Cookie Settings" is opt-in.

## How to reduce the cons

| Con                         | Mitigation                                                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drift, two places to change | Have the marketing site import `SiteNav` / `SiteFooter` from this package, so there is one copy. Until then, add a CI check that diffs the ported files against the marketing repo and fails on drift.                        |
| English only                | Ship the Japanese version of the design as per-locale nav and footer data, selected by the existing `navLang` option, then delete the Japanese fallback.                                                                      |
| Release needed for content  | Keep the data in `nav-config.ts` / `footer-config.ts`, so content changes are small, reviewable data diffs; automate patch releases.                                                                                          |
| Deprecation to finish       | Release this as a minor version with a deprecation note: `GlobalNavBar` → `SiteNav`, `GlobalFooter` → `SiteFooter`, `IG_CHROME` no longer needed. Remove the two exports in the major release that ships the Japanese design. |

## Japanese builds (temporary)

A build with `navLang: 'jp'` behaves exactly as before this change:

- `DocsLayout` renders `GlobalNavBar` / `GlobalFooter`, which fetch the legacy
  Japanese chrome from `jp.infragistics.com/navigation` at build time
  (`src/lib/nav-helpers.ts`).
- `getPlatformHead(platform, 'jp')` adds the legacy chrome's `navigation.css`,
  `footer.css`, jQuery, `plugins.nav.js` and `navigation.js`.
- `GlobalNavBar` / `GlobalFooter` stay exported but are marked
  `@deprecated`, so an existing import keeps working and an editor warns
  anyone writing a new one.

**When the Japanese design is ready**, delete, in this order:

1. Add Japanese nav and footer data to `SiteNav` / `SiteFooter`, chosen by
   `navLang`.
2. In `DocsLayout`, delete `legacyJpChrome` and the two branches that use it.
3. Delete `src/components/GlobalNavBar/`, `src/components/GlobalFooter/` and
   `src/lib/nav-helpers.ts`, and their two `package.json` exports. This is
   the breaking step: release it as a major version.
4. In `platform.ts`, delete `LEGACY_CHROME_STYLES` / `LEGACY_CHROME_SCRIPTS`
   and the `legacyChrome` line in `getPlatformHead()`.

After that nothing fetches `/navigation` anywhere.

## Follow-ups outside this package

- **docs-template:** its own `src/platform.ts` still injects the legacy
  `navigation.css`, `footer.css`, jQuery, `plugins.nav.js` and
  `navigation.js` for every locale. Keep them for Japanese builds only, as
  this package now does.
- **api-docs:** `src/data/global-nav.ts` still fetches `/navigation` at build
  time, because its `virtual:docs-template/nav-html` module downloads the page
  as soon as anything imports it. That module now only needs to export
  `platform`, so the fetch should be removed (`DocsLayout` does its own
  fetch for a Japanese build). Its `astro.config.mjs` also
  still adds the legacy chrome's CSS and scripts to the head.
- **Shared `<head>` styles:** Bootstrap 3, `layout.css`, `animate-custom.css`,
  `fontello.css` and Material Icons are still injected. They were kept because
  docs content may use them; check what still does, then remove the rest.
- **App Builder:** the App Builder head preset (megamenu, jQuery from
  `staging.appbuilder.dev`) belongs to a different header that this package
  doesn't render. Review it separately.
