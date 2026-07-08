/**
 * nav-helpers.ts
 *
 * Shared build-time utilities for fetching and sanitising the Infragistics
 * global nav / footer HTML.
 *
 * Used by:
 *   - integration.ts (siteMetaIntegration virtual-module pipeline)
 *   - components/GlobalNavBar/GlobalNavBar.astro
 *   - components/GlobalFooter/GlobalFooter.astro
 */

import { createRequire } from 'node:module';
import type { NavLang } from '../platform.ts';

// createRequire anchored to this file so it always resolves jsdom from
// igniteui-astro-components/node_modules, regardless of where the consumer
// project has its node_modules.
const _require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Low-level HTML helpers
// ---------------------------------------------------------------------------

/**
 * Strip all <script> tags from an HTML string using a DOM parser.
 *
 * Uses createRequire so Vite/Rollup cannot statically trace the jsdom import —
 * jsdom is resolved at Node runtime and never bundled into the prerender chunk.
 */
export function stripScripts(html: string): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = _require('jsdom') as typeof import('jsdom');
    const dom = new JSDOM(html);
    const { document } = dom.window;
    document.querySelectorAll('script').forEach((el: Element) => el.remove());
    return document.body.innerHTML;
}

/**
 * Rewrite root-relative href/src/action attributes to absolute URLs using
 * the given base origin (e.g. 'https://www.infragistics.com').
 *
 * Without this, links like href="/products/ignite-ui" resolve against the
 * local dev-server origin and Astro's client-side router intercepts them.
 */
export function absolutifyNavUrls(html: string, baseOrigin: string): string {
    return html
        .replace(/(href|src|action)="(\/)([^"]*)"/g, `$1="${baseOrigin}/$3"`)
        .replace(/(href|src|action)='(\/)([^']*)'/g, `$1='${baseOrigin}/$3'`);
}

/**
 * Nesting-aware outer-HTML extractor.
 * Finds the first tag whose opening tag matches `openPattern` and returns the
 * complete element including its closing tag.
 *
 * @param html        - Full HTML string to search.
 * @param openPattern - Regex source for the opening tag (no flags).
 */
export function extractOuterHtml(html: string, openPattern: string): string {
    const openRe = new RegExp(openPattern, 'i');
    const tagRe = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;

    let tagName: string | null = null;
    let depth = 0;
    let startIdx = -1;

    let m: RegExpExecArray | null;
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

// ---------------------------------------------------------------------------
// High-level IG nav prefetch
// ---------------------------------------------------------------------------

export interface IgNavHtml {
    headerHtml: string;
    uiFooterHtml: string;
    footerHtml: string;
    /** True when the fetch succeeded and the HTML fields are populated. */
    prefetched: boolean;
}

/** Module-level cache keyed by locale — fetch runs at most once per locale per build. */
const _cache = new Map<string, IgNavHtml>();

/**
 * Fetch the Infragistics global nav/footer HTML for the given locale.
 *
 * Performs a single HTTP request to `{igBase}/navigation`, extracts the
 * three relevant HTML fragments, strips scripts, and absolutifies URLs.
 * Results are cached per locale so subsequent calls (e.g. from multiple
 * pages using `GlobalNavBarIg`) are free.
 *
 * Fails gracefully: returns `prefetched: false` with empty strings when the
 * network is unavailable (offline builds, CI without outbound access, etc.)
 */
export async function fetchIgNav(lang: NavLang = 'en'): Promise<IgNavHtml> {
    if (_cache.has(lang)) return _cache.get(lang)!;

    const igBase = lang === 'jp' ? 'https://jp.infragistics.com' : 'https://www.infragistics.com';
    const navUrl = `${igBase}/navigation?_=${Date.now()}`;

    let headerHtml = '';
    let uiFooterHtml = '';
    let footerHtml = '';

    try {
        const res = await fetch(navUrl, {
            credentials: 'omit',
            signal: AbortSignal.timeout(15_000),
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, max-age=0', Pragma: 'no-cache' },
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
            console.warn(`[igniteui-astro-components] Nav fetch returned ${res.status} — using static fallback.`);
        }
    } catch (err: unknown) {
        console.warn(`[igniteui-astro-components] Could not fetch IG nav: ${(err as Error).message} — using static fallback.`);
    }

    const result: IgNavHtml = { headerHtml, uiFooterHtml, footerHtml, prefetched: !!headerHtml };
    _cache.set(lang, result);
    return result;
}
