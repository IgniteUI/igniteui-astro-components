/**
 * The customer portal's origin, which the account links below point into, and
 * the support chatbot inside it.
 */
const ACCOUNT_ORIGIN = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.PUBLIC_ACCOUNT_ORIGIN ??
  process.env.PUBLIC_ACCOUNT_ORIGIN ??
  'https://account.infragistics.com'
).replace(/\/+$/, '');
const SUPPORT_URL = `${ACCOUNT_ORIGIN}/chatbot`;

/**
 * footer.ts - the global footer's link structure.
 */

export interface FooterLink {
  label: string;
  /** Absent turns the entry into a plain sub-heading ("Web", "Desktop"). */
  href?: string;
  external?: boolean;
  srSuffix?: string;
  /** Nested list, drawn with the indented rule the canvas uses. */
  children?: FooterLink[];
}

/**
 * A legal-bar entry, where `href` is NOT optional.
 */
export type FooterLegalLink = FooterLink & { href: string };

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

/** Five columns; columns 2-4 stack more than one group. */
export const FOOTER_COLUMNS: FooterGroup[][] = [
  [
    {
      title: 'Products',
      links: [
        {
          label: 'Web',
          children: [
            {
              label: 'Ignite UI',
              href: '/products/ignite-ui',
              children: [
                { label: 'Angular', href: '/products/ignite-ui-angular' },
                { label: 'React', href: '/products/ignite-ui-react' },
                { label: 'Web Components', href: '/products/ignite-ui-web-components' },
                { label: 'Blazor', href: '/products/ignite-ui-blazor' },
              ],
            },
            { label: 'App Builder', href: 'https://www.appbuilder.dev/platform', external: true },
          ],
        },
        {
          label: 'Desktop',
          children: [
            { label: 'Windows Forms', href: '/products/windows-forms' },
            { label: 'WPF', href: '/products/wpf' },
          ],
        },
        {
          label: 'Bundles',
          children: [
            { label: 'Infragistics Ultimate', href: '/products/ultimate' },
            { label: 'Infragistics Professional', href: '/products/pro' },
            { label: 'Ignite UI', href: '/products/ignite-ui' },
          ],
        },
      ],
    },
  ],
  [
    {
      title: 'AI Tools',
      links: [
        {
          label: 'AI-Assisted App Dev',
          href: '/ai-assisted-app-development',
          children: [
            { label: 'AI Agent Skills', href: '/products/ignite-ui/ignite-ui-ai-agent-skills' },
            { label: 'CLI MCP Server', href: '/products/ignite-ui/ignite-ui-cli-mcp' },
            { label: 'Theming MCP Server', href: '/products/ignite-ui/ignite-ui-theming-mcp' },
          ],
        },
      ],
    },
    {
      title: 'Open Source',
      links: [
        {
          label: 'Angular',
          href: '/products/ignite-ui-angular/open-source',
          srSuffix: ' open source',
        },
        { label: 'React', href: '/products/ignite-ui-react/open-source', srSuffix: ' open source' },
        {
          label: 'Web Components',
          href: '/products/ignite-ui-web-components/open-source',
          srSuffix: ' open source',
        },
        {
          label: 'Blazor',
          href: '/products/ignite-ui-blazor/open-source',
          srSuffix: ' open source',
        },
      ],
    },
    {
      title: 'Compare',
      links: [
        { label: 'Angular', href: '/angular-compare', srSuffix: ' compare' },
        { label: 'React', href: '/react-compare', srSuffix: ' compare' },
        { label: 'Blazor', href: '/blazor-compare', srSuffix: ' compare' },
      ],
    },
  ],
  [
    {
      title: 'Docs',
      links: [
        { label: 'Documentation', href: '/support' },
        { label: 'Product Lifecycle', href: '/support/product-lifecycle' },
      ],
    },
    {
      title: 'Learn & Support',
      links: [
        { label: 'Blogs', href: '/blogs/' },
        { label: 'Webinars', href: '/webinars' },
        { label: 'Customer Stories', href: '/resources/case-studies' },
        { label: 'eBooks & Whitepapers', href: '/resources/whitepapers' },
        { label: 'Forums', href: '/forums/' },
        { label: 'Sample Applications', href: '/resources/sample-applications' },
        { label: 'Contact Support', href: SUPPORT_URL, external: true },
        { label: 'Support Policies', href: '/support/support-policies' },
        { label: 'Service Health', href: '/status' },
      ],
    },
  ],
  [
    {
      title: 'Pricing',
      links: [
        { label: 'Product Pricing', href: '/how-to-buy/product-pricing' },
        { label: 'Free Trials', href: '/free-downloads' },
        {
          label: 'Renewals & Subscriptions',
          href: `${ACCOUNT_ORIGIN}/subscriptions`,
          external: true,
        },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Use', href: '/legal/terms-of-use' },
        { label: 'License Agreements', href: '/legal/license' },
        { label: 'Patents', href: '/legal/patents' },
        { label: 'Third-Party OSS', href: '/legal/third-party-oss' },
        { label: 'SBOM', href: '/legal/sbom' },
        { label: 'Cyber Resilience Act (CRA)', href: '/legal/cyber-resilience-act-cra' },
      ],
    },
  ],
  [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Careers', href: '/about-us/careers' },
        { label: 'News & Events', href: '/about-us/in-the-news' },
        { label: 'Contact Us', href: '/about-us/contact-us' },
      ],
    },
  ],
];

/** The strip under the columns: the other Infragistics products. */
export const FOOTER_MORE_PRODUCTS: FooterLink[] = [
  { label: 'Reveal', href: 'https://www.revealbi.io/', external: true },
  { label: 'Slingshot', href: 'https://www.slingshotapp.io/', external: true },
];

/** The bottom bar. "Cookie Settings" is a button, and is drawn separately. */
export const FOOTER_LEGAL: FooterLegalLink[] = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Cookie Policy', href: '/legal/cookie-policy' },
];

/**
 * `LandingFooter`'s list.
 */
export const FOOTER_LANDING_LEGAL: FooterLegalLink[] = [
  ...FOOTER_LEGAL,
  { label: 'Terms of Use', href: '/legal/terms-of-use' },
];

/**
 * Social mark
 */
export interface FooterSocial {
  label: string;
  title: string;
  href: string;
  /** Per-mark: the canvas sizes each glyph by eye, they are not equally dense. */
  size: number;
  /** Inline geometry, so the footer carries no icon font or sprite. */
  paths: readonly string[];
  /** RSS alone is drawn with strokes rather than filled, and ends in a dot. */
  stroke?: boolean;
  dot?: { cx: number; cy: number; r: number };
}

export const FOOTER_SOCIAL: readonly FooterSocial[] = [
  /*
   * The feed itself, not the blog index.
   */
  {
    label: 'RSS',
    title: 'Infragistics RSS',
    href: '/blogs/feed',
    size: 17,
    paths: ['M4 11a9 9 0 0 1 9 9', 'M4 4a16 16 0 0 1 16 16'],
    stroke: true,
    dot: { cx: 5, cy: 19, r: 1 },
  },
  {
    label: 'X',
    title: 'Infragistics on X',
    href: 'https://x.com/infragistics',
    size: 15,
    paths: [
      'M18.9 2h3.3l-7.2 8.2L23.5 22h-6.6l-5.2-6.8L5.8 22H2.5l7.7-8.8L2 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z',
    ],
  },
  {
    label: 'Facebook',
    title: 'Infragistics on Facebook',
    href: 'https://www.facebook.com/infragistics',
    size: 16,
    paths: [
      'M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v1.8H8v3h2.6V22H14v-8.5h2.6l.4-3H14Z',
    ],
  },
  {
    label: 'LinkedIn',
    title: 'Infragistics on LinkedIn',
    href: 'https://www.linkedin.com/company/infragistics',
    size: 15,
    paths: [
      'M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.6h.05c.53-1 1.83-2.06 3.77-2.06C20.6 8.54 22 10.2 22 13.4V21h-4v-6.7c0-1.6-.03-3.65-2.22-3.65-2.22 0-2.56 1.73-2.56 3.53V21H9V9Z',
    ],
  },
  {
    label: 'YouTube',
    title: 'Infragistics on YouTube',
    href: 'https://www.youtube.com/@Infragistics?sub_confirmation=1',
    size: 17,
    paths: [
      'M23 7.5c-.26-1-1-1.75-2-2C19.2 5 12 5 12 5s-7.2 0-9 .5c-1 .25-1.74 1-2 2C.5 9.3.5 12 .5 12s0 2.7.5 4.5c.26 1 1 1.75 2 2C4.8 19 12 19 12 19s7.2 0 9-.5c1-.25 1.74-1 2-2 .5-1.8.5-4.5.5-4.5s0-2.7-.5-4.5ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z',
    ],
  },
  {
    label: 'Discord',
    title: 'Infragistics on Discord',
    href: 'https://discord.com/invite/c6e9Xdg3ty',
    size: 17,
    paths: [
      'M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z',
    ],
  },
  {
    label: 'GitHub',
    title: 'Ignite UI on GitHub',
    href: 'https://github.com/IgniteUI',
    size: 17,
    paths: [
      'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z',
    ],
  },
];

export const ORGANIZATION_SAME_AS: string[] = FOOTER_SOCIAL.filter((s) => s.label !== 'RSS').map(
  (s) => s.href.split('?')[0],
);
