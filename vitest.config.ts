import { getViteConfig } from 'astro/config';

/**
 * Stub for `virtual:docs-template/site-meta` and `virtual:docs-template/nav-html`.
 * These modules are normally provided by `siteMetaIntegration` at build time.
 * The stubs supply the minimal exports the components need so they compile and
 * render without a real Astro site.
 */
function virtualDocsMocks() {
  const SITE_META_ID = 'virtual:docs-template/site-meta';
  const NAV_HTML_ID = 'virtual:docs-template/nav-html';
  const prefix = '\0';

  return {
    name: 'vitest:virtual-docs-mocks',
    resolveId(id: string) {
      if (id === SITE_META_ID) return prefix + SITE_META_ID;
      if (id === NAV_HTML_ID) return prefix + NAV_HTML_ID;
      return null;
    },
    load(id: string) {
      if (id === prefix + SITE_META_ID) {
        return `
export const title = 'Test Site';
export const sidebar = [];
export const productLinks = [];
export const headEntries = [];
export const trailingSlash = 'ignore';
export const navLang = 'en';
        `.trim();
      }
      if (id === prefix + NAV_HTML_ID) {
        return `
export const platform = 'react';
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
        `.trim();
      }
      return null;
    },
  };
}

export default getViteConfig({
  // @ts-expect-error — Vite plugin array type mismatch between astro and vitest; safe at runtime
  plugins: [virtualDocsMocks()],
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
  },
});
