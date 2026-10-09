/**
 * `igChrome()` — render the Infragistics header and footer from a snapshot of
 * the marketing site's own export.
 *
 * The marketing site (Marketing-Infragistics) is the single source of the
 * Infragistics chrome. It publishes it at `/assets/chrome/fragment.html`: one
 * versioned fragment (`ig-chrome v1`) with scoped CSS and one classic script.
 * A consumer repo keeps a copy of that export (written by its own sync script,
 * which the marketing site's deploy runs) and registers this integration with the
 * snapshot's folder:
 *
 *   integrations: [igChrome({ snapshot: './ig-chrome/production' })]
 *
 * Then, per build:
 *
 *   - the snapshot is validated against the ig-chrome contract. A missing,
 *     broken or incompatible snapshot FAILS the build, naming the folder: no
 *     site ships without chrome;
 *   - DocsLayout renders its head, header and footer parts (read through the
 *     build-time `__IG_CHROME__` constant this defines);
 *   - the CSS, JS and images are served from this site's own build, under its
 *     base path: `{base}/_ig-chrome/{build}/…`. Nothing is loaded from the
 *     marketing host at runtime.
 *
 * Japanese builds (`navLang: 'jp'`) keep the legacy fetched chrome until a
 * Japanese fragment is published. Without this integration, DocsLayout keeps
 * its legacy fetched chrome for every language.
 *
 * SNAPSHOT LAYOUT (written by the consumer's sync script):
 *
 *   <snapshot>/manifest.json       contract, build hash, source, sync time
 *   <snapshot>/fragment.html       asset URLs written as %IG_CHROME_ASSETS%/…
 *   <snapshot>/assets/chrome.css
 *   <snapshot>/assets/chrome.js
 *   <snapshot>/assets/media/*
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { parseFragment, ASSET_TOKEN } from './contract.mjs';

export interface IgChromeOptions {
  /**
   * The snapshot folder, absolute or relative to the Astro project root. In a
   * repo with several Astro projects, point them all at one shared folder.
   */
  snapshot: string | URL;
}

/** What DocsLayout reads, via `__IG_CHROME__`. */
export interface IgChromeData {
  contract: string;
  build: string;
  head: string;
  header: string;
  footer: string;
}

const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

export function igChrome(options: IgChromeOptions): AstroIntegration {
  let snapshotDir = '';
  let assetsDir = '';
  let build = '';

  return {
    name: 'igniteui:chrome',
    hooks: {
      'astro:config:setup'({ config, updateConfig, logger }) {
        const root = fileURLToPath(config.root);
        snapshotDir =
          options.snapshot instanceof URL
            ? fileURLToPath(options.snapshot)
            : path.resolve(root, options.snapshot);
        assetsDir = path.join(snapshotDir, 'assets');

        const fragmentFile = path.join(snapshotDir, 'fragment.html');
        if (!fs.existsSync(fragmentFile)) {
          throw new Error(
            `[igniteui:chrome] no snapshot at ${snapshotDir}. Run the repo's chrome sync script first.`,
          );
        }
        let parsed;
        try {
          parsed = parseFragment(fs.readFileSync(fragmentFile, 'utf8'));
        } catch (err) {
          throw new Error(
            `[igniteui:chrome] the snapshot at ${snapshotDir} is invalid: ${(err as Error).message}`,
          );
        }
        for (const file of ['chrome.css', 'chrome.js']) {
          if (!parsed.head.includes(`${ASSET_TOKEN}/${file}`)) {
            throw new Error(
              `[igniteui:chrome] the snapshot at ${snapshotDir} does not load ${ASSET_TOKEN}/${file}. Re-run the repo's chrome sync script.`,
            );
          }
          if (!fs.existsSync(path.join(assetsDir, file))) {
            throw new Error(
              `[igniteui:chrome] the snapshot at ${snapshotDir} has no assets/${file}.`,
            );
          }
        }
        build = parsed.build;

        const base = (config.base || '/').replace(/\/+$/, '');
        const prefix = `${base}/_ig-chrome/${build}`;
        const resolve = (text: string) => text.split(ASSET_TOKEN).join(prefix);
        const data: IgChromeData = {
          contract: parsed.contract,
          build,
          head: resolve(parsed.head),
          header: resolve(parsed.header),
          footer: resolve(parsed.footer),
        };

        updateConfig({
          vite: {
            define: { __IG_CHROME__: JSON.stringify(data) },
            plugins: [
              {
                /* `astro dev`: serve the snapshot's assets at the URLs the build emits. */
                name: 'igniteui:chrome-dev-assets',
                configureServer(server) {
                  // Astro may strip the base from req.url before this runs (it does
                  // when the dev server itself runs under a base), so accept both.
                  const prefixes = [`${prefix}/`, `/_ig-chrome/${build}/`];
                  server.middlewares.use((req, res, next) => {
                    const url = (req.url || '').split('?')[0]!;
                    const match = prefixes.find((p) => url.startsWith(p));
                    if (!match) return next();
                    const file = path.join(assetsDir, decodeURIComponent(url.slice(match.length)));
                    const relative = path.relative(assetsDir, file);
                    if (
                      !relative ||
                      relative === '..' ||
                      relative.startsWith(`..${path.sep}`) ||
                      path.isAbsolute(relative) ||
                      !fs.statSync(file, { throwIfNoEntry: false })?.isFile()
                    ) {
                      return next();
                    }
                    res.setHeader(
                      'Content-Type',
                      MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
                    );
                    fs.createReadStream(file).pipe(res);
                  });
                },
              },
            ],
          },
        });
        logger.info(`header/footer from snapshot build ${build}`);
      },

      'astro:build:done'({ dir, logger }) {
        // Each site carries its own copy, so every deployment is self-contained.
        const target = path.join(fileURLToPath(dir), '_ig-chrome', build);
        fs.cpSync(assetsDir, target, { recursive: true });
        logger.info(`copied the chrome assets to /_ig-chrome/${build}/`);
      },
    },
  };
}
