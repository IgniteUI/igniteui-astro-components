// @ts-check
/**
 * Playground Astro config.
 *
 * Goal: render every component shipped from `../src` in isolation so we can
 * style and smoke-test them without depending on a real consumer repo.
 *
 * We deliberately do NOT call `createDocsSite()` / `siteMetaIntegration()`
 * because those helpers inject route entrypoints (`./routes/*`) and a Vite
 * alias (`./compat/starlight-components`) that don't exist in this package
 * yet — they're only meaningful for a fully migrated docs project.
 *
 * Instead we provide a small Vite plugin that supplies the two virtual
 * modules the components import from (`virtual:docs-template/site-meta`
 * and `virtual:docs-template/nav-html`) with stub data.
 */

import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Default the platform context used by ApiLink / ApiRef / Sample / PlatformBlock
// so they have something to render against.
process.env.PLATFORM ??= 'React';
process.env.DOCS_BUILD_MODE ??= 'development';
process.env.DOCS_ENV ??= 'development';
process.env.BASE_URL ??= 'http://localhost:4321';

/** Sample sidebar tree exercising links, groups, badges, nesting and active state. */
const sampleSidebar = [
  {
    label: 'Getting Started',
    collapsed: false,
    items: [
      { label: 'Introduction', slug: '' },
    //   { label: 'Installation', slug: 'installation' },
    //   { label: 'Quick Start', slug: 'quick-start', badge: { text: 'New', variant: 'success' } },
    ],
  },
  {
    label: 'Components',
    collapsed: false,
    items: [
      { label: 'Sidebar', slug: 'components/sidebar' },
      { label: 'Nav Bar', slug: 'components/nav-bar' },
      {
        label: 'MDX Helpers',
        collapsed: true,
        items: [
          { label: 'ApiLink', slug: 'components/api-link' },
          { label: 'ApiRef', slug: 'components/api-ref' },
          { label: 'PlatformBlock', slug: 'components/platform-block' },
        ],
      },
    ],
  },
  {
    label: 'Reference',
    collapsed: true,
    items: [
      { label: 'Changelog', slug: 'changelog', badge: { text: 'Beta', variant: 'caution' } },
    ],
  },
];

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
        return `
export const title = 'Components Playground';
export const sidebar = ${JSON.stringify(sampleSidebar)};
export const productLinks = ${JSON.stringify([
          { label: 'Angular', href: '#', platform: 'angular' },
          { label: 'React', href: '#', platform: 'react' },
          { label: 'Web Components', href: '#', platform: 'web-components' },
          { label: 'Blazor', href: '#', platform: 'blazor' },
        ])};
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
          loadPaths: [path.join(repoRoot, 'node_modules')],
        },
      },
    },
  },
});
