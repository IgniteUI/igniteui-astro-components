/**
 * Icon Registry
 *
 * All .svg files in /assets/icons are registered automatically.
 * The icon name is derived from the filename: strip the .svg extension
 * and apply a small set of legacy aliases for names already used in markup.
 *
 * Usage in markup:
 *   <igc-icon name="link" collection="docs"></igc-icon>
 *
 * To add a new icon: drop the .svg file into src/assets/icons/ — that's it.
 */

import { registerIconFromText } from 'igniteui-webcomponents';

export const DOCS_COLLECTION = 'docs';

/**
 * Legacy aliases: maps the icon name used in markup → actual filename stem.
 * Only needed when the desired name differs from the filename (minus .svg).
 */
const ALIASES: Record<string, string> = {
  'expand':     'expand-icon',
  'react-logo': 'react',
  'wc-logo':    'web-component-logo',
};

// Vite glob — imports raw SVG content at build time (preferred over URL fetching).
// Relative path so this works regardless of the consuming project's root.
const svgModules = import.meta.glob('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function registerIcons(): void {
  // Build a stem → svg content map from the glob results
  const stemToSvg = new Map<string, string>();
  for (const [path, svg] of Object.entries(svgModules)) {
    const stem = path.split('/').pop()!.replace(/\.svg$/, '');
    stemToSvg.set(stem, svg);
  }

  // Register each icon: prefer alias name, fall back to stem as the icon name
  const registered = new Set<string>();
  for (const [alias, stem] of Object.entries(ALIASES)) {
    if (stemToSvg.has(stem)) {
      registerIconFromText(alias, stemToSvg.get(stem)!, DOCS_COLLECTION);
      registered.add(stem);
    }
  }
  // Register remaining icons using their filename stem as the name
  for (const [stem, svg] of stemToSvg) {
    if (!registered.has(stem)) {
      registerIconFromText(stem, svg, DOCS_COLLECTION);
    }
  }
}

// Auto-register on import.
registerIcons();
