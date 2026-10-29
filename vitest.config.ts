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
        return `export const platform = 'react';`;
      }
      return null;
    },
  };
}

export default getViteConfig({
  plugins: [virtualDocsMocks()],
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
});
