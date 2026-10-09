/**
 * The `ig-chrome` contract: the shape of the header/footer fragment the
 * marketing site publishes at `/assets/chrome/fragment.html`
 * (Marketing-Infragistics, `src/lib/chromeExport.ts`).
 *
 * Used by the Astro integration (`integration.ts`) to validate a snapshot at
 * build time. The checks are identical to tripwire's `NavCache.Parse()` and to
 * the consumer repos' sync scripts (`scripts/chrome-sync.mjs`), so a fragment
 * one consumer accepts, every consumer accepts.
 *
 * Plain JavaScript, so a consumer's sync script can import it under bare
 * `node` as well (`igniteui-astro-components/chrome/contract`).
 */

/** The fragment shape this code understands. Must match CHROME_CONTRACT in chromeExport.ts. */
export const CHROME_CONTRACT = 'v1';

/**
 * Placeholder the synced snapshot uses for "where this site serves the chrome
 * assets". The integration replaces it with `{base}/_ig-chrome/{build}` at
 * build time, so one snapshot works under every site's base path.
 */
export const ASSET_TOKEN = '%IG_CHROME_ASSETS%';

const STAMP = /<!--\s*ig-chrome\s+(v\d+)\s+build=([A-Za-z0-9]+)/;
/** The site header itself: a <header> whose class list starts with "nv". */
const SITE_HEADER = /<header\b[^>]*\sclass="nv[\s"]/i;

/**
 * Splits a fragment into its parts. Throws on anything that does not match the
 * contract.
 *
 * @param {string} html
 * @returns {{ contract: string, build: string, head: string, header: string, footer: string }}
 */
export function parseFragment(html) {
  const text = html ?? '';
  const stamp = STAMP.exec(text);
  if (!stamp) {
    throw new Error('The fragment carries no ig-chrome version stamp.');
  }
  if (stamp[1] !== CHROME_CONTRACT) {
    throw new Error(
      `The fragment is contract ${stamp[1]}; this version of igniteui-astro-components understands ${CHROME_CONTRACT}.`,
    );
  }

  const fragment = {
    contract: stamp[1],
    build: stamp[2],
    head: part(text, 'head'),
    header: part(text, 'header'),
    footer: part(text, 'footer'),
  };

  // Not tied to ASSET_TOKEN: this also validates the RAW marketing fragment
  if (!fragment.head.includes('chrome.css')) {
    throw new Error("The fragment's head part does not load chrome.css.");
  }
  if (!fragment.head.includes('chrome.js')) {
    throw new Error("The fragment's head part does not load chrome.js.");
  }
  if (!fragment.header.includes('data-ig-chrome="header"')) {
    throw new Error('The fragment\'s header part has no [data-ig-chrome="header"] root.');
  }
  if (!SITE_HEADER.test(fragment.header)) {
    throw new Error('The fragment\'s header part has no <header class="nv"> element.');
  }
  if (!/<footer\b/i.test(fragment.footer)) {
    throw new Error("The fragment's footer part has no <footer> element.");
  }
  return fragment;
}

/**
 * @param {string} html
 * @param {string} name
 */
function part(html, name) {
  const open = `<!-- ig-chrome:${name} -->`;
  const close = `<!-- /ig-chrome:${name} -->`;
  const start = html.indexOf(open);
  const end = start < 0 ? -1 : html.indexOf(close, start + open.length);
  if (start < 0 || end < 0) {
    throw new Error(`The fragment has no '${name}' part.`);
  }
  const body = html.slice(start + open.length, end).trim();
  if (!body) {
    throw new Error(`The fragment's '${name}' part is empty.`);
  }
  return body;
}
