export type PlatformName = 'Angular' | 'React' | 'WebComponents' | 'Blazor';

export interface ApiPackageConfig {
    /** TypeDoc documentation root URL (no trailing slash). */
    docRoot: string;
    /**
     * Package identifier as it appears in the TypeDoc URL path.
     * Core packages use hyphens ("igniteui-react"),
     * sub-packages use underscores ("igniteui_react_charts").
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
     * Optional suffix appended to the class name before lowercasing, e.g.
     * Angular DV packages append "Component" so `CategoryChart` resolves to
     * `igniteui_angular_charts.igxcategorychartcomponent.html`.
     * Only applied when `prefixed={true}`.
     */
    classSuffix?: string;
    /**
     * When true, member anchor names are PascalCase (first letter uppercased).
     * Blazor TypeDoc uses PascalCase anchors, e.g. `#SingleExpand` instead of `#singleExpand`.
     */
    pascalCaseMembers?: boolean;
}

export interface PlatformContext {
    name: PlatformName;
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
