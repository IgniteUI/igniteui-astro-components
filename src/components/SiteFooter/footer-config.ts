/**
 * The customer portal's origin, which four links below point into.
 *
 * Read from the environment rather than imported, so this file is
 * self-contained and the package needs no `lib/env`. Default is production; a
 * staging build sets `PUBLIC_ACCOUNT_ORIGIN` to the staging portal.
 */
const ACCOUNT_ORIGIN = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.PUBLIC_ACCOUNT_ORIGIN ??
  process.env.PUBLIC_ACCOUNT_ORIGIN ??
  'https://account.infragistics.com'
).replace(/\/$/, '');
/**
 * footer.ts — the global footer's link structure.
 *
 * Column shape is from the redesign canvas; the hrefs are the real ones from
 * the live infragistics.com footer (the canvas uses `#` placeholders for most
 * of them). Root-relative for anything this site owns.
 */

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  /** Renders a small "(updated)" note, as the design does on the legal links. */
  note?: string;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

/** Column 1 holds two stacked groups, as does column 3. */
export const FOOTER_COLUMNS: FooterGroup[][] = [
  [
    {
      title: 'Products',
      links: [
        { label: 'Design & Development', href: '/products/ultimate' },
        { label: 'UX Pros', href: '/products/indigo-design/desktop' },
        {
          label: 'Embedded Analytics',
          href: 'https://www.revealbi.io/embedded-analytics',
          external: true,
        },
        { label: 'Work Management', href: 'https://www.slingshotapp.io/', external: true },
        { label: 'View All', href: '/products/all' },
        { label: 'Free Trials', href: '/free-downloads' },
      ],
    },
    {
      title: 'Open-Source Components',
      links: [
        { label: 'Angular', href: '/products/ignite-ui-angular/open-source' },
        { label: 'Blazor', href: '/products/ignite-ui-blazor/open-source' },
        { label: 'React', href: '/products/ignite-ui-react/open-source' },
        { label: 'Web Components', href: '/products/ignite-ui-web-components/open-source' },
      ],
    },
  ],
  [
    {
      title: 'Learn & Support',
      links: [
        { label: 'Help & API Docs', href: '/support' },
        { label: 'Blogs', href: '/blogs/' },
        { label: 'Technical Support Chat', href: `${ACCOUNT_ORIGIN}/chatbot`, external: true },
        { label: 'Forums', href: '/forums/' },
        {
          label: 'Submit a Request',
          href: `${ACCOUNT_ORIGIN}/support-cases/submit`,
          external: true,
        },
        { label: 'Service Health', href: '/status' },
      ],
    },
  ],
  [
    {
      title: 'My Account',
      links: [
        {
          label: 'Manage My Subscriptions',
          href: `${ACCOUNT_ORIGIN}/subscriptions`,
          external: true,
        },
        { label: 'Support Requests', href: `${ACCOUNT_ORIGIN}/support-cases`, external: true },
      ],
    },
    {
      title: 'Compare',
      links: [
        { label: 'Angular Compare', href: '/angular-compare' },
        { label: 'Blazor Compare', href: '/blazor-compare' },
      ],
    },
  ],
  [
    {
      title: 'Corporate',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Careers', href: '/about-us/careers' },
        { label: 'Legal', href: '/legal/license' },
        { label: 'News & Events', href: '/about-us/in-the-news' },
        { label: 'Partners', href: '/about-us/alliances-partners' },
      ],
    },
  ],
];

export const FOOTER_LEGAL: FooterLink[] = [
  { label: 'Privacy Policy', href: '/legal/privacy', note: '(updated)' },
  { label: 'Cookies', href: '/legal/cookie-policy' },
  { label: 'Terms of Use', href: '/legal/terms-of-use', note: '(updated)' },
];

export const FOOTER_SOCIAL = [
  { label: 'RSS', href: '/rss' },
  { label: 'X', href: 'https://twitter.com/infragistics' },
  { label: 'Facebook', href: 'https://www.facebook.com/infragistics' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/infragistics' },
  { label: 'YouTube', href: 'https://www.youtube.com/user/Infragistics' },
  { label: 'Discord', href: 'https://discord.com/invite/infragistics' },
] as const;
