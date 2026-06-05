/**
 * Icon Manifest — side-effect-free module.
 *
 * Provides the full list of icon names and their raw SVG content.
 * Imported by both icon-registry.ts (to register icons) and
 * the playground IconGallery component (to render the gallery).
 */

export const DOCS_COLLECTION = 'docs';

/**
 * Legacy aliases: maps the icon name used in markup → actual filename stem.
 * Only needed when the desired name differs from the filename (minus .svg).
 */
export const ALIASES: Record<string, string> = {
  'expand':     'expand-icon',
  'react-logo': 'react',
  'wc-logo':    'web-component-logo',
};

/** Icon names that belong to the "brand" category (logos). */
export const BRAND_ICONS = new Set([
  'angular-logo', 'blazor-logo', 'react-logo', 'wc-logo',
  'github-logo', 'chatgpt', 'claude',
]);

// Vite glob — imports raw SVG content at build time.
const svgModules = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface IconEntry {
  /** The name used in `<igc-icon name="...">` */
  name: string;
  /** The actual filename stem (without .svg) */
  stem: string;
  /** The actual filename (with .svg) */
  filename: string;
  /** Raw SVG content */
  svg: string;
}

function buildIconList(): IconEntry[] {
  const stemToSvg = new Map<string, string>();
  for (const [p, svg] of Object.entries(svgModules)) {
    const stem = p.split('/').pop()!.replace(/\.svg$/, '');
    stemToSvg.set(stem, svg);
  }

  const entries: IconEntry[] = [];
  const registeredStems = new Set<string>();

  // Alias entries first
  for (const [alias, stem] of Object.entries(ALIASES)) {
    if (stemToSvg.has(stem)) {
      entries.push({ name: alias, stem, filename: stem + '.svg', svg: stemToSvg.get(stem)! });
      registeredStems.add(stem);
    }
  }

  // Remaining icons use stem as name
  for (const [stem, svg] of stemToSvg) {
    if (!registeredStems.has(stem)) {
      entries.push({ name: stem, stem, filename: stem + '.svg', svg });
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

export const ICON_LIST: IconEntry[] = buildIconList();
