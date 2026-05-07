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

// Default the platform context used by ApiLink / ApiRef / PlatformBlock.
process.env.PLATFORM ??= 'React';
process.env.DOCS_BUILD_MODE ??= 'development';
process.env.DOCS_ENV ??= 'development';
process.env.BASE_URL ??= 'http://localhost:4321';

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
    load(id) {
      if (id === resolved(siteMetaId)) {
        // Intentionally minimal — sidebar, title, and productLinks are
        // supplied via component props from src/site-config.ts instead.
        return `
export const title = '';
export const sidebar = [];
export const productLinks = [];
export const headEntries = [];
        `;
      }
      if (id === resolved(navHtmlId)) {
        // Fall back to the static (non-prefetched) renderings of the global
        // nav/footer — keeps the playground offline-friendly.
        return `
export const platform = 'igniteui';
export const navLang = 'en';
export const themeApiUrl = '';
export const widgetScriptSrc = '';
export const prefetched = false;
export const headerHtml = '';
export const uiFooterHtml = '';
export const footerHtml = '';
export const abPrefetched = false;
export const abHeaderHtml = '';
export const abFooterHtml = '';
export const abFooterUtilsHtml = '';
export const abFooterCopyrightHtml = '';
export const abContactSalesHtml = '';
        `;
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
