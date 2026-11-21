// Global script (no top-level import), so every declaration here is ambient and
// the `declare module` blocks resolve the virtual modules for `astro check`.

/**
 * The synced marketing chrome, defined at build time by the igChrome()
 * integration (src/chrome/integration.ts). Undeclared when it isn't
 * registered: read it as `typeof __IG_CHROME__ !== 'undefined'`.
 */
declare const __IG_CHROME__: import('./chrome/integration').IgChromeData;

declare namespace App {
  interface Locals {
    platformContext?: import('./lib/types.ts').PlatformContext;
    envVars?: Record<string, string>;
  }
}

declare module 'virtual:docs-template/site-meta' {
  export const sidebar: { label: string; slug?: string; items?: unknown[] }[];
  export const title: string;
  export const navLang: import('./platform.ts').NavLang;
  /** Cross-product navigation links for the DocsSubHeader. */
  export const productLinks: Array<{
    label: string;
    href: string;
    platform?: string;
  }>;
  /** Extra <head> entries injected by siteMetaIntegration (platform CDN, site-specific entries, etc.). */
  export const headEntries: Array<{
    tag: string;
    attrs?: Record<string, string | boolean | undefined>;
    content?: string;
  }>;
  /** Astro trailingSlash config value: 'always' | 'never' | 'ignore'. */
  export const trailingSlash: 'always' | 'never' | 'ignore';
  /** Optional package switcher entries. */
  export const packages:
    Array<string | { label: string; value?: string; href?: string; base?: string }> | undefined;
  /** Currently selected package. */
  export const selectedPackage: string | undefined;
}

declare module 'virtual:docs-template/nav-html' {
  export const platform:
    | 'igniteui'
    | 'angular'
    | 'react'
    | 'blazor'
    | 'web-components'
    | 'winui'
    | 'uno'
    | 'slingshot'
    | 'appbuilder'
    | null;
}
