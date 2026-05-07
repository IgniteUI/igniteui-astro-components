// @ts-check
/**
 * Playground Astro config.
 *
 * Goal: render every component shipped from `../src` in isolation so we can
 * style and smoke-test them without depending on a real consumer repo.
 *
 * We deliberately do NOT call `createDocsSite()` / `siteMetaIntegration()`.
 *
 * Sidebar data, product links, and the site title are defined in
 * `src/site-config.ts` and passed as props directly to DocsLayout /
 * DocsSidebar / DocsSubHeader — demonstrating prop-driven usage.
 *
 * The two virtual module stubs below are still needed to satisfy the Vite
 * module resolver (the components import from them at the top level), but
 * `site-meta` exports intentionally empty values — the real data flows
 * through props. Only `nav-html` carries meaningful content (platform key,
 * nav/footer HTML fallback, theming widget config).
 */

import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getNavConfig, getPlatformHead } from '../src/platform.ts';

// Default the platform context used by ApiLink / ApiRef / PlatformBlock.
process.env.PLATFORM ??= 'React';
process.env.DOCS_BUILD_MODE ??= 'development';
process.env.DOCS_ENV ??= 'development';
process.env.BASE_URL ??= 'http://localhost:4321';

// ---------------------------------------------------------------------------
// Nav-fetch helpers (mirrors integration.ts — kept inline so the playground
// has no runtime dependency on the integration entry-point).
// ---------------------------------------------------------------------------

/** Strip all <script> tags from an HTML string. */
function stripScripts(html) {
  let previous;
  let current = html;
  do {
    previous = current;
    current = current
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, '')
      .replace(/<script\b[^>]*\/>/gi, '');
  } while (current !== previous);
  return current;
}

/** Rewrite root-relative href/src/action attributes to absolute URLs. */
function absolutifyNavUrls(html, baseOrigin) {
  return html
    .replace(/(href|src|action)="(\/)([^"]*)"/g, `$1="${baseOrigin}/$3"`)
    .replace(/(href|src|action)='(\/)([^']*)'/g, `$1='${baseOrigin}/$3'`);
}

/**
 * Nesting-aware outer-HTML extractor.
 * Returns the first element whose opening tag matches `openPattern`.
 */
function extractOuterHtml(html, openPattern) {
  const openRe = new RegExp(openPattern, 'i');
  const tagRe = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;

  let tagName = null;
  let depth = 0;
  let startIdx = -1;

  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const full = m[0];
    const name = m[1].toLowerCase();
    const isSelfClose = full.endsWith('/>');
    const isClose = full.startsWith('</');

    if (tagName === null) {
      if (openRe.test(full)) {
        tagName = name;
        startIdx = m.index;
        depth = isSelfClose ? 0 : 1;
        if (depth === 0) return full;
      }
      continue;
    }

    if (name !== tagName) continue;
    if (isSelfClose) continue;
    if (isClose) { depth--; if (depth === 0) return html.slice(startIdx, tagRe.lastIndex); }
    else depth++;
  }

  return '';
}

// Resolved once at config load time.
const NAV_PLATFORM = 'angular';
const NAV_LANG = 'en';
const { navType, navUrl } = getNavConfig(NAV_PLATFORM, NAV_LANG);
const igBase = 'https://www.infragistics.com';

// Platform head entries (IG CSS + JS) — same as a real docs site would use.
const platformHeadEntries = getPlatformHead(NAV_PLATFORM, NAV_LANG);

/** Module-level cache so the nav URL is fetched at most once per build. */
let _navHtmlCache = null;

/**
 * Vite plugin that supplies stub implementations of the two virtual modules
 * normally provided by `siteMetaIntegration`. This lets the components run
 * standalone in the playground.
 */
function virtualDocsModules() {
  const siteMetaId = 'virtual:docs-template/site-meta';
  const navHtmlId = 'virtual:docs-template/nav-html';
  const resolved = (id) => '\0' + id;

  return {
    name: 'playground:virtual-docs-modules',
    resolveId(id) {
      if (id === siteMetaId) return resolved(siteMetaId);
      if (id === navHtmlId) return resolved(navHtmlId);
      return null;
    },
    async load(id) {
      if (id === resolved(siteMetaId)) {
        // Intentionally minimal — sidebar, title, and productLinks are
        // supplied via component props from src/site-config.ts instead.
        // Platform head entries (IG CSS/JS) are included so the nav bar
        // renders with the correct styles.
        return `
export const title = '';
export const sidebar = [];
export const productLinks = [];
export const headEntries = ${JSON.stringify(platformHeadEntries)};
        `;
      }
      if (id === resolved(navHtmlId)) {
        // Return cached result — fetch is performed at most once per build.
        if (_navHtmlCache) return _navHtmlCache;

        let headerHtml = '';
        let uiFooterHtml = '';
        let footerHtml = '';

        // Attempt to prefetch the IG nav HTML. Fails gracefully offline.
        if (navType === 'infragistics' && navUrl) {
          try {
            const res = await fetch(navUrl, {
              credentials: 'omit',
              signal: AbortSignal.timeout(15_000),
            });
            if (res.ok) {
              const html = await res.text();
              headerHtml = absolutifyNavUrls(
                stripScripts(extractOuterHtml(html, '<header[^>]+id="header"')),
                igBase,
              );
              uiFooterHtml = absolutifyNavUrls(
                stripScripts(extractOuterHtml(html, '<footer[^>]+class="[^"]*\\bui-footer\\b')),
                igBase,
              );
              footerHtml = absolutifyNavUrls(
                stripScripts(extractOuterHtml(html, '<footer[^>]+id="footer"')),
                igBase,
              );
              // Strip the hello-bar promotional strip
              headerHtml = headerHtml.replace(/<div[^>]+id="hello-bar"[\s\S]*?<\/div>\s*/i, '');
            } else {
              console.warn(`[playground] Nav fetch returned ${res.status} — using static fallback.`);
            }
          } catch (err) {
            console.warn(`[playground] Could not fetch nav HTML: ${err.message} — using static fallback.`);
          }
        }

        _navHtmlCache = [
          `export const platform = ${JSON.stringify(NAV_PLATFORM)};`,
          `export const navLang = ${JSON.stringify(NAV_LANG)};`,
          `export const themeApiUrl = '';`,
          `export const widgetScriptSrc = '';`,
          `export const prefetched = ${JSON.stringify(!!headerHtml)};`,
          `export const headerHtml = ${JSON.stringify(headerHtml)};`,
          `export const uiFooterHtml = ${JSON.stringify(uiFooterHtml)};`,
          `export const footerHtml = ${JSON.stringify(footerHtml)};`,
          `export const abPrefetched = false;`,
          `export const abHeaderHtml = '';`,
          `export const abFooterHtml = '';`,
          `export const abFooterUtilsHtml = '';`,
          `export const abFooterCopyrightHtml = '';`,
          `export const abContactSalesHtml = '';`,
        ].join('\n');
        return _navHtmlCache;
      }
      return null;
    },
  };
}

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: repoRoot,
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  // Disable image optimization — playground pages just use plain <img>.
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  integrations: [],
  vite: {
    plugins: [virtualDocsModules()],
    css: {
      preprocessorOptions: {
        scss: {
          // Allow `@use 'igniteui-theming'` (in ../src/styles/ig-theme.scss)
          // to resolve from the playground's node_modules even though the
          // file lives outside this folder.
          loadPaths: [
            path.join(repoRoot, 'node_modules'),
            path.resolve(repoRoot, '..', 'node_modules'),
          ],
        },
      },
    },
  },
});
