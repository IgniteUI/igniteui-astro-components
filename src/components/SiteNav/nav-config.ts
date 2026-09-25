/**
 * navigation.ts — the global header's information architecture.
 *
 * Transcribed from "Nav Dropdown - Category Cards v7.dc.html" (desktop) and
 * "Nav Mobile v2.dc.html" (the drawer), both under `design/navigation/`.
 *
 * v7 is an IA change, not a restyle of v11: the Components catalogue panel is
 * gone. The bar is Products ▾ · AI · Docs ▾ · Learn & Support ▾ · Pricing, with
 * Search, My Account, GitHub and the trial CTA on the right. AI and Pricing are
 * plain links. The canvas still carries an AI panel and a Demos panel, but
 * neither has a reachable trigger (Demos sits behind a `showDemos` prop that
 * defaults to off), so neither is built.
 *
 * Every section, panel and drawer item is rendered from the data below — the
 * desktop panels and the mobile drawer read the same objects, so they cannot
 * drift apart.
 *
 * HREFS. Root-relative for anything served on this origin, including the docs,
 * blog, forum and help apps that sit behind it. The canvas hardcodes the
 * production origin and `target="_blank"` on every link; both are dropped.
 * Only genuinely external destinations — appbuilder.dev, revealbi.io,
 * slingshotapp.io, github.com, youtube.com, the account app — are marked
 * `external` and open in a new tab.
 *
 * Where a canvas link 404s on production, the working equivalent is used
 * instead (checked 2026-09-25), e.g. API references go to the api-docs roots,
 * which redirect to the current version. `npm run nav:links` checks them all.
 */

import fwAngular from './assets/fw-angular.svg';
import fwBlazor from './assets/fw-blazor.svg';
import fwReact from './assets/fw-react.svg';
import fwWebComponents from './assets/fw-webcomponents.svg';
import fwWindows from './assets/fw-windows.svg';

/**
 * The customer portal's origin, which six links below point into.
 *
 * Read from the environment rather than imported, so this file is
 * self-contained and the package needs no `lib/env` of its own. The default is
 * production; a staging build sets `PUBLIC_ACCOUNT_ORIGIN` to the staging
 * portal, which is what stops a tester clicking through into the real customer
 * account app.
 *
 * `import.meta.env` is Vite's, so this resolves at build time in any Astro
 * consumer; `process.env` is the fallback for a plain Node context (the link
 * checker, tests).
 */
const ACCOUNT_ORIGIN = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.PUBLIC_ACCOUNT_ORIGIN ??
  process.env.PUBLIC_ACCOUNT_ORIGIN ??
  'https://account.infragistics.com'
).replace(/\/$/, '');

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

/** Tile colours behind the card icons. */
export type TileColor = 'blue' | 'royal' | 'pink' | 'violet' | 'teal' | 'cyan' | 'amber';

/** Keys into the icon map in `nav/NavIcon.astro`. */
export type IconKey =
  'post' | 'video' | 'building' | 'book' | 'chat' | 'lifecycle' | 'headset' | 'policy' | 'renew';

export interface NavCard extends NavLink {
  desc: string;
  icon: IconKey;
  tile: TileColor;
}

/** The strip along the bottom of a panel. `Contact Us` always sits on it. */
export interface PanelFooter {
  link?: NavLink;
  note?: string;
  /** Repeat the trial CTA at the right-hand end. */
  cta?: boolean;
}

/* ── the bar ────────────────────────────────────────────────────────────── */

export type PanelKey = 'products' | 'docs' | 'resources';

/** A bar item either opens a panel or is a plain link — never both. */
export type NavSection =
  { label: string; panel: PanelKey; href?: never } | { label: string; href: string; panel?: never };

export const NAV_SECTIONS: NavSection[] = [
  { label: 'Products', panel: 'products' },
  { label: 'AI', href: '/ai-assisted-app-development' },
  { label: 'Docs', panel: 'docs' },
  { label: 'Learn & Support', panel: 'resources' },
  { label: 'Pricing', href: '/how-to-buy/product-pricing' },
];

/**
 * "My Account" points at the account app, not at a route here.
 *
 * This site has NO SIGN-IN, by decision (confirmed 2026-09-11): no OIDC client,
 * no token in the browser, no `/my-account/*` routes served from this repo.
 * The canvas links `/my-account/keys-and-downloads`; that becomes a plain link
 * out to the account app, as every other would-be signed-in destination does.
 */
export const HEADER_ACTIONS = {
  account: { label: 'My Account', href: `${ACCOUNT_ORIGIN}/downloads`, external: true },
  github: { label: 'Ignite UI on GitHub', href: 'https://github.com/IgniteUI', external: true },
  cta: { label: 'Start Free Trial', href: '/free-downloads' },
  contact: { label: 'Contact Us', href: '/about-us/contact-us' },
} satisfies Record<string, NavLink>;

/* ── Products ───────────────────────────────────────────────────────────── */

export interface NavFramework extends NavLink {
  logo: string;
  /** Secondary links indented under the framework name. */
  links?: NavLink[];
}

/**
 * Bundled, not fetched from `/assets/logos/`.
 *
 * The marketing site serves these out of its own `public/`, so an absolute path
 * resolves there and 404s everywhere else. Importing them makes the asset part
 * of the package: Astro emits and fingerprints each file into the consumer's
 * build, and `.src` is the URL it landed at.
 */
const LOGO = {
  angular: fwAngular.src,
  react: fwReact.src,
  wc: fwWebComponents.src,
  blazor: fwBlazor.src,
  windows: fwWindows.src,
};

export const PRODUCTS_PANEL = {
  web: {
    title: 'Web',
    lead: { label: 'Ignite UI', href: '/products/ignite-ui' },
    /* The canvas sends the Web Components and Blazor "Grid" links into the
     * docs. Both products have a grid page on this site, like Angular and
     * React do, so all four land on a product page. */
    frameworks: [
      {
        label: 'Angular',
        href: '/products/ignite-ui-angular',
        logo: LOGO.angular,
        links: [
          { label: 'Grid', href: '/products/angular-data-grid' },
          { label: 'Open Source', href: '/products/ignite-ui-angular/open-source' },
        ],
      },
      {
        label: 'React',
        href: '/products/ignite-ui-react',
        logo: LOGO.react,
        links: [
          { label: 'Grid', href: '/products/react-data-grid' },
          { label: 'Open Source', href: '/products/ignite-ui-react/open-source' },
        ],
      },
      {
        label: 'Web Components',
        href: '/products/ignite-ui-web-components',
        logo: LOGO.wc,
        links: [
          { label: 'Grid', href: '/products/ignite-ui-web-components/grid-table' },
          { label: 'Open Source', href: '/products/ignite-ui-web-components/open-source' },
        ],
      },
      {
        label: 'Blazor',
        href: '/products/ignite-ui-blazor',
        logo: LOGO.blazor,
        links: [
          { label: 'Grid', href: '/products/ignite-ui-blazor/grid-table' },
          { label: 'Open Source', href: '/products/ignite-ui-blazor/open-source' },
        ],
      },
    ] as NavFramework[],
    tail: {
      label: 'App Builder',
      href: 'https://www.appbuilder.dev/platform',
      external: true,
    } as NavLink,
  },
  desktop: {
    title: 'Desktop',
    frameworks: [
      { label: 'Windows Forms', href: '/products/windows-forms', logo: LOGO.windows },
      { label: 'WPF', href: '/products/wpf', logo: LOGO.windows },
    ] as NavFramework[],
  },
  promo: {
    eyebrow: 'Best Value',
    title: 'Three bundles,',
    accent: 'one subscription',
    body: 'Every product line for web, desktop, and mobile, licensed per developer',
    links: [
      {
        label: 'Infragistics Ultimate',
        desc: 'Complete suite for web, desktop, and mobile development',
        href: '/products/ultimate',
      },
      {
        label: 'Infragistics Professional',
        desc: 'Essential tools for professional developers',
        href: '/products/pro',
      },
      {
        label: 'Ignite UI',
        desc: 'UI component library for modern web apps',
        href: '/products/ignite-ui',
      },
    ],
  },
  rail: {
    title: 'More Infragistics Products',
    logos: [
      {
        alt: 'Reveal',
        src: 'https://static.infragistics.com/marketing/reveal/business-teams-reveal-logo-black.svg',
        height: 26,
        href: 'https://www.revealbi.io/',
      },
      {
        alt: 'Slingshot',
        src: 'https://static.infragistics.com/marketing/logos/slingshot/slingshot-logo-registered-symbol.svg',
        height: 24,
        href: 'https://www.slingshotapp.io',
      },
    ],
  },
  footer: {
    link: {
      label: 'Accessibility and WCAG 2.1 Compliance',
      href: '/products/ignite-ui-angular/angular/components/interactivity/accessibility-compliance',
    },
    cta: true,
  } as PanelFooter,
};

/** The tinted band behind a group heading — violet for web, sky for desktop. */
export type GroupTint = 'web' | 'desktop';

/* ── Docs ───────────────────────────────────────────────────────────────── */

export interface DocsFramework {
  label: string;
  logo: string;
  /** The product name under the label. The desktop entries have none. */
  product?: string;
  start: string;
  api: string;
}

/**
 * The web API homes are the api-docs app's per-platform roots; each redirects
 * to the current package version, so no version is hardcoded here. The canvas's
 * `…/general-api-reference` topics do not exist. The desktop products keep
 * their API reference inside their help sites.
 */
export const DOCS_PANEL = {
  groups: [
    {
      title: 'Ignite UI — Web',
      tint: 'web',
      items: [
        {
          label: 'Angular',
          logo: LOGO.angular,
          product: 'Ignite UI for Angular',
          start: '/products/ignite-ui-angular/angular/components/general/getting-started',
          api: '/api/angular/',
        },
        {
          label: 'React',
          logo: LOGO.react,
          product: 'Ignite UI for React',
          start: '/products/ignite-ui-react/react/components/general-getting-started',
          api: '/api/react/',
        },
        {
          label: 'Web Components',
          logo: LOGO.wc,
          product: 'Ignite UI for Web Components',
          start:
            '/products/ignite-ui-web-components/web-components/components/general-getting-started',
          api: '/api/webcomponents/',
        },
        {
          label: 'Blazor',
          logo: LOGO.blazor,
          product: 'Ignite UI for Blazor',
          start: '/products/ignite-ui-blazor/blazor/components/general-getting-started',
          api: '/api/blazor/',
        },
      ] as DocsFramework[],
    },
    {
      title: 'Desktop',
      tint: 'desktop',
      items: [
        {
          label: 'Windows Forms',
          logo: LOGO.windows,
          start: '/help/winforms/win-getting-started',
          api: '/help/winforms/win-api-reference-guide',
        },
        {
          label: 'WPF',
          logo: LOGO.windows,
          start: '/help/wpf/wpf-getting-started-with-wpf',
          api: '/help/wpf/api-reference-guide',
        },
      ] as DocsFramework[],
    },
  ] as Array<{ title: string; tint: GroupTint; items: DocsFramework[] }>,
  links: { start: 'Getting started', api: 'API reference' },
  footer: {
    link: { label: 'Product Lifecycle', href: '/support/product-lifecycle' },
    cta: true,
  } as PanelFooter,
};

/* ── Learn & Support ────────────────────────────────────────────────────── */

export const LEARN_PANEL = {
  title: 'Learn & Support',
  cards: [
    {
      label: 'Blogs',
      desc: 'Engineering posts, release notes, and how-tos',
      href: '/blogs/',
      icon: 'post',
      tile: 'royal',
    },
    {
      label: 'Webinars',
      desc: 'Live and on-demand product sessions',
      href: '/webinars',
      icon: 'video',
      tile: 'pink',
    },
    {
      label: 'Customer Stories',
      desc: 'How enterprise teams ship with Infragistics',
      href: '/resources/case-studies',
      icon: 'building',
      tile: 'teal',
    },
    {
      label: 'eBooks & Whitepapers',
      desc: 'Long-form guides on UX and enterprise UI',
      href: '/resources/whitepapers',
      icon: 'book',
      tile: 'violet',
    },
    {
      label: 'Forums',
      desc: 'Community answers from 2M+ developers',
      href: '/forums/',
      icon: 'chat',
      tile: 'cyan',
    },
    {
      label: 'Product Lifecycle',
      desc: 'Support timelines and release history by product',
      href: '/support/product-lifecycle',
      icon: 'lifecycle',
      tile: 'amber',
    },
    {
      label: 'Contact Support',
      desc: 'Reach our support team by chat or ticket',
      href: `${ACCOUNT_ORIGIN}/chatbot`,
      external: true,
      icon: 'headset',
      tile: 'blue',
    },
    {
      label: 'Support Policies',
      desc: 'Response times, coverage, and support terms',
      href: '/support/support-policies',
      icon: 'policy',
      tile: 'violet',
    },
    {
      label: 'Product Renewals',
      desc: 'Renew subscriptions from your account',
      href: `${ACCOUNT_ORIGIN}/subscriptions`,
      external: true,
      icon: 'renew',
      tile: 'pink',
    },
  ] as NavCard[],
  footer: {
    link: {
      label: 'Video tutorials on YouTube',
      href: 'https://www.youtube.com/@Infragistics/videos',
      external: true,
    },
    cta: true,
  } as PanelFooter,
};

/* ── Search ─────────────────────────────────────────────────────────────── */

export const SEARCH_PANEL = {
  placeholder: 'Search products, documentation, and support',
  aria: 'Search infragistics.com',
  action: '/search',
  columns: [
    {
      title: 'Popular Searches',
      links: [
        { label: 'Data grid', href: '/products/angular-data-grid' },
        { label: 'Charts', href: '/products/ignite-ui-angular/chart' },
        { label: 'Licensing and pricing', href: '/how-to-buy/product-pricing' },
        { label: 'MCP server setup', href: '/products/ignite-ui/ignite-ui-cli-mcp' },
        { label: 'License keys', href: `${ACCOUNT_ORIGIN}/downloads`, external: true },
      ],
    },
    {
      title: 'Search In',
      strong: true,
      links: [
        { label: 'Products', href: '/products/ignite-ui' },
        { label: 'Documentation', href: '/support' },
        { label: 'Forums', href: '/forums/' },
        { label: 'Blogs', href: '/blogs/' },
        /* The canvas's fifth entry, Knowledge Base, is dropped: every URL for it
         * ends on /not-found (checked 2026-09-25). */
      ],
    },
    {
      title: 'Jump To',
      links: [
        { label: 'Free trials and downloads', href: '/free-downloads' },
        { label: 'Release notes', href: '/support/service-releases' },
        {
          label: 'Submit a support request',
          href: `${ACCOUNT_ORIGIN}/support-cases/new`,
          external: true,
        },
        { label: 'Product life cycle', href: '/support/product-lifecycle' },
      ],
    },
  ] as Array<{ title: string; strong?: boolean; links: NavLink[] }>,
  help: {
    eyebrow: "Can't find it?",
    title: 'Ask our engineers directly',
    body: '24x5 support from the team that builds the controls.',
  },
};
