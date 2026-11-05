/**
 * Builds the source of the `virtual:docs-template/site-meta` module.
 * The export list is mirrored by the module declaration in virtual-modules.d.ts.
 */
import type { HeadEntry, NavLang, PlatformKey } from './platform.ts';
import type { SidebarItem } from './llms.ts';

export interface ProductLink {
  /** Display label shown in the DocsSubHeader, e.g. `"Angular"`. */
  label: string;
  /** Absolute or root-relative href to the sibling docs site. */
  href: string;
  /**
   * Optional platform key (matches `PlatformKey`).
   * When it equals the current build's platform the link is omitted from the DocsSubHeader.
   */
  platform?: PlatformKey;
}

/** One entry of the DocsSubHeader package selector. */
export type PackageEntry = string | { label: string; value?: string; href?: string; base?: string };

export interface SiteMetaModuleData {
  title: string;
  sidebar: SidebarItem[];
  productLinks: ProductLink[];
  headEntries: HeadEntry[];
  trailingSlash: 'always' | 'never' | 'ignore';
  navLang: NavLang;
  packages?: PackageEntry[];
  selectedPackage?: string;
}

/** Every name the module exports, in emission order. Mirrored by virtual-modules.d.ts. */
export const SITE_META_EXPORTS = [
  'title',
  'sidebar',
  'productLinks',
  'headEntries',
  'trailingSlash',
  'navLang',
  'packages',
  'selectedPackage',
] as const satisfies ReadonlyArray<keyof SiteMetaModuleData>;

/** Returns the module source; an absent `packages` or `selectedPackage` is exported as `undefined`. */
export function buildSiteMetaModule(data: SiteMetaModuleData): string {
  return (
    SITE_META_EXPORTS.map((name) => {
      const value = data[name];
      return `export const ${name} = ${value === undefined ? 'undefined' : JSON.stringify(value)};`;
    }).join('\n') + '\n'
  );
}
