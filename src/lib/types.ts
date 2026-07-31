export type PlatformName = 'Angular' | 'React' | 'WebComponents' | 'Blazor';

export interface ApiPackageConfig {
  /** TypeDoc documentation root URL (no trailing slash). */
  docRoot: string;
  /**
   * Package identifier as it appears in the API docs registry and route,
   * e.g. "igniteui-react" or "igniteui-react-charts".
   */
  packageId: string;
  /**
   * When true the package prefix is omitted from the class URL, e.g.
   * Angular docs use `/classes/IgxGridComponent.html` (no `packageId.` prefix).
   */
  noPackagePrefix?: boolean;
  /**
   * When true the class name casing is preserved as-is (no .toLowerCase()).
   * New-style API sites (react-apis-new, wc-apis-new, blazor-apis-new) use PascalCase URLs.
   */
  preserveCase?: boolean;
  /**
   * Preferred class-name suffix used by ApiLink. The generated registry tries
   * both the suffixed and unsuffixed names, so this does not mean every API
   * symbol is expected to have the suffix.
   */
  classSuffix?: string;
  /**
   * When true, member anchor names are PascalCase (first letter uppercased).
   * Blazor TypeDoc uses PascalCase anchors, e.g. `#SingleExpand` instead of `#singleExpand`.
   */
  pascalCaseMembers?: boolean;
}

/** Compact ApiLink symbol entry as stored in the generated registry JSON. */
type ApiLinkIndexEntry = {
  /** Package id that owns this symbol. */
  p?: string;
  /** Root-relative URL to the symbol page, e.g. "/api/react/igniteui-react/19.5/classes/IgrGrid". */
  u: string;
  /** Symbol kind, e.g. "class", "interface", "enum". */
  k?: string;
  /** Member name to anchor map, e.g. { rowSelection: "rowSelection" }. */
  m?: Record<string, string>;
};

export interface PlatformContext {
  name: PlatformName;
  /** Optional compact ApiLink symbol index loaded by the docs host at build time. */
  apiLinkIndex?: {
    symbols?: Record<string, ApiLinkIndexEntry | ApiLinkIndexEntry[]>;
  };
  /** Lower-case slug used in URLs, e.g. "angular" */
  lower: string;
  /** Component class prefix, e.g. "Igx" / "Igr" / "Igc" / "Igb" */
  prefix: string;
  productName: string;
  productSpinal: string;
  /**
   * Per-package API documentation config keyed by short name.
   * "core" is always the main component package.
   * Other keys match the logical package category: "charts", "grids",
   * "gauges", "maps", "inputs", "layouts", "excel", "spreadsheet", etc.
   *
   * URL for a class:   {docRoot}/classes/{packageId}.{PrefixType}.html
   * URL for a member:  {docRoot}/classes/{packageId}.{PrefixType}.html#{member}
   */
  apiPackages: Record<string, ApiPackageConfig>;
  packages: {
    common: string;
    charts: string;
    grids: string;
    gauges: string;
    maps: string;
  };
  links: {
    github: string;
    forums: string;
    repoSamples: string;
  };
  /**
   * Sass API documentation base URL.
   * Used as a base for link path concatenation - must have **no trailing slash**
   * to avoid accidental `//` in generated URLs.
   * @example `https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/sass`
   */
  sassApiUrl?: string;
}
