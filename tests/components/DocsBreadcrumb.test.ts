import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsBreadcrumb from '../../src/components/DocsBreadcrumb/DocsBreadcrumb.astro';
import type { SidebarEntry } from '../../src/lib/sidebar/types.ts';

const SIDEBAR: SidebarEntry[] = [
  {
    label: 'Components',
    items: [
      { label: 'Button', slug: 'components/button' },
    ],
  },
];

describe('DocsBreadcrumb', () => {
  it('renders site title', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsBreadcrumb, {
      props: { siteTitle: 'IgniteUI' },
    });

    expect(html).toContain('IgniteUI');
    expect(html).toContain('docs-breadcrumb-home');
  });

  it('renders breadcrumb from sidebarItems when slug matches', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsBreadcrumb, {
      props: {
        siteTitle: 'IgniteUI',
        sidebarItems: SIDEBAR,
        currentSlug: 'components/button',
      },
    });

    expect(html).toContain('Button');
  });

  it('renders pageTitle as fallback crumb when slug is not in sidebar', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsBreadcrumb, {
      props: {
        siteTitle: 'IgniteUI',
        sidebarItems: SIDEBAR,
        currentSlug: 'components/unknown',
        pageTitle: 'My Page',
      },
    });

    expect(html).toContain('My Page');
  });

  it('renders nothing when siteTitle and pageTitle are both empty', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsBreadcrumb, {
      props: { siteTitle: '', pageTitle: '', sidebarItems: [], currentSlug: '' },
    });

    expect(html).not.toContain('docs-breadcrumb');
  });

  it('has aria-label="Breadcrumb" for accessibility', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsBreadcrumb, {
      props: { siteTitle: 'IgniteUI' },
    });

    expect(html).toContain('aria-label="Breadcrumb"');
  });
});
