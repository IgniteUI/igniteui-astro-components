/**
 * Remark plugin: rewrite relative .md links to Astro-compatible URLs.
 *
 * Transforms `[label](./some-page.md)` or `[label](../folder/page.md#section)`
 * into root-relative URLs like `/products/.../some-page/` (with DOCS_BASE prepended).
 *
 * Also prepends DOCS_BASE to bare root-relative internal links (e.g. `/grids/grid/...`)
 * that are already absolute but missing the site base path.
 */

import { defineMdastPlugin } from 'satteri';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolve a relative .md link to an absolute Astro URL.
 * Non-relative, non-.md, and external links are returned unchanged.
 */
function rewriteMdLink(url: string, filePath: string, docsDir: string): string {
  if (!url) return url;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/') ||
    url.startsWith('#') ||
    url.startsWith('mailto:')
  )
    return url;

  const hashIdx = url.indexOf('#');
  const qIdx = url.indexOf('?');
  const splitAt = hashIdx !== -1 ? hashIdx : qIdx !== -1 ? qIdx : -1;
  let mdPath = splitAt !== -1 ? url.slice(0, splitAt) : url;
  const suffix = splitAt !== -1 ? url.slice(splitAt) : '';

  if (!mdPath.endsWith('.md')) return url;

  const fileDir = path.dirname(filePath);
  const resolved = path.resolve(fileDir, mdPath);
  const rel = path.relative(docsDir, resolved).replace(/\\/g, '/');
  const slug = rel.endsWith('.md') ? rel.slice(0, -3) : rel;

  const docsBase = (process.env.DOCS_BASE ?? '').replace(/\/$/, '');
  return docsBase + '/' + slug.toLowerCase() + '/' + suffix;
}

/** Resolve the source file path and docs root for the document being compiled. */
function resolvePaths(fileURL: URL | undefined): { filePath: string; docsDir: string } {
  const filePath = fileURL ? fileURLToPath(fileURL) : '';
  const docsDir = process.env.DOCS_SOURCE_PATH
    ? path.resolve(process.env.DOCS_SOURCE_PATH)
    : filePath
      ? path.dirname(filePath)
      : '';
  return { filePath, docsDir };
}

/**
 * Satteri MDAST plugin that rewrites relative .md links, prepends DOCS_BASE,
 * and fixes relative image paths.
 */
export function remarkMdLinks() {
  return defineMdastPlugin({
    name: 'md-links',

    link(node, ctx) {
      if (!node.url) return;
      const { filePath, docsDir } = resolvePaths(ctx.fileURL);
      let url = rewriteMdLink(node.url, filePath, docsDir);

      // Prepend DOCS_BASE to root-relative internal links not already prefixed.
      const docsBase = (process.env.DOCS_BASE ?? '').replace(/[/]$/, '');
      if (
        docsBase &&
        url.startsWith('/') &&
        !url.startsWith('//') &&
        !url.startsWith(docsBase + '/')
      ) {
        url = docsBase + url;
      }

      if (url !== node.url) ctx.setProperty(node, 'url', url);
    },

    // Rewrite relative `../images/` paths in markdown image nodes to root-relative `/images/`.
    // Generated MDX files may contain relative image references that Vite cannot resolve.
    image(node, ctx) {
      if (!node.url) return;
      const url = node.url.replace(/^([.][.][/])+images[/]/, '/images/');
      if (url !== node.url) ctx.setProperty(node, 'url', url);
    },
  });
}
