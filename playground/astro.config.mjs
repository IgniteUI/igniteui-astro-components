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
 * The two virtual module stubs below satisfy the Vite module resolver (the
 * components import from them at the top level). Nav HTML is not fetched here
 * — GlobalNavBar and GlobalFooter self-fetch via fetchIgNav() at build time
 * and fall back to static minimal markup when the fetch fails.
 */

import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import mdx from '@astrojs/mdx';
import { getPlatformHead } from '../src/platform.ts';
import { rehypeHeadingAnchors } from '../src/plugins/rehype-heading-anchors.ts';
import { rehypeTableWrapper } from '../src/plugins/rehype-table-wrapper.ts';

// Default the platform context used by ApiLink / ApiRef / PlatformBlock.
process.env.PLATFORM ??= 'React';
process.env.DOCS_BUILD_MODE ??= 'development';
process.env.DOCS_ENV ??= 'development';
process.env.BASE_URL ??= 'http://localhost:4567';

// Platform head entries (IG CSS + JS) injected into <head> by DocsLayout.
const platformHeadEntries = getPlatformHead('angular', 'en');

/**
 * Dev-only Vite plugin: handles POST /api/icons/replace
 * so the IconGallery upload button can replace SVG files in src/assets/icons/.
 * Only active during `astro dev` — no-op in production builds.
 */
function iconUploadPlugin() {
  return {
    name: 'playground:icon-upload',
    configureServer(server) {
      server.middlewares.use('/api/icons/replace', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405).end('Method Not Allowed');
          return;
        }

        let body = '';
        for await (const chunk of req) body += chunk;

        let filename, content;
        try {
          ({ filename, content } = JSON.parse(body));
        } catch {
          res.writeHead(400).end('Invalid JSON');
          return;
        }

        // Security: only allow simple .svg filenames, no path traversal
        if (typeof filename !== 'string' || !/^[\w\-]+\.svg$/.test(filename)) {
          res.writeHead(400).end('Invalid filename');
          return;
        }

        const iconsDir = path.resolve(repoRoot, '../src/assets/icons');
        const dest = path.join(iconsDir, filename);

        // Ensure destination is inside the icons directory
        if (!dest.startsWith(iconsDir + path.sep)) {
          res.writeHead(403).end('Forbidden');
          return;
        }

        try {
          fs.writeFileSync(dest, content, 'utf8');
          // Let Vite's filesystem watcher detect the change naturally (triggers HMR)
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true }));
        } catch (err) {
          res.writeHead(500).end(String(err));
        }
      });
    },
  };
}

/**
 * Vite plugin that supplies stub implementations of the two virtual modules
 * normally provided by `siteMetaIntegration`. This lets the components run
 * standalone in the playground.
 *
 * Nav HTML is intentionally NOT fetched here — GlobalNavBar and GlobalFooter
 * self-fetch via fetchIgNav() at build time (cached per locale, graceful
 * offline fallback). The virtual module stub only needs to satisfy the
 * resolver; the real HTML comes from the components themselves.
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
        // Platform head entries (IG CSS/JS) are included so the nav bar
        // renders with the correct styles.
        return `
export const title = '';
export const sidebar = [];
export const productLinks = [];
export const headEntries = ${JSON.stringify(platformHeadEntries)};
export const trailingSlash = 'ignore';
        `;
      }
      if (id === resolved(navHtmlId)) {
        // Minimal stub — nav HTML is fetched by GlobalNavBarIg / GlobalFooterIg directly.
        return `
export const platform = 'angular';
export const navLang = 'en';
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
const markdownShikiConfig = {
  theme: 'dark-plus',
  wrap: true,
};
export default defineConfig({
  root: repoRoot,
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  // Disable image optimization — playground pages just use plain <img>.
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  integrations: [mdx()],
  markdown: {
    shikiConfig: markdownShikiConfig,
    rehypePlugins: [rehypeHeadingAnchors, rehypeTableWrapper],
  },
  vite: {
    define: {
      __IGD_SAMPLE_CODE_THEME__: JSON.stringify(markdownShikiConfig.theme),
    },
    plugins: [iconUploadPlugin(), virtualDocsModules()],
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
