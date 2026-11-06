import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsSidebar from '../../src/components/DocsSidebar/DocsSidebar.astro';
import type { SidebarEntry } from '../../src/lib/sidebar/types.ts';

const ITEMS: SidebarEntry[] = [
  {
    label: 'Getting Started',
    items: [{ label: 'Introduction', slug: 'intro' }],
  },
  { label: 'Button', slug: 'components/button' },
];

describe('DocsSidebar', () => {
  it('renders the sidebar container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSidebar, {
      props: { items: ITEMS },
    });

    expect(html).toContain('docs-sidebar');
    expect(html).toContain('class="docs-sidebar"');
  });

  it('renders all sidebar items', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSidebar, {
      props: { items: ITEMS },
    });

    expect(html).toContain('Getting Started');
    expect(html).toContain('Introduction');
    expect(html).toContain('Button');
  });

  it('marks current page item as active', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSidebar, {
      props: { items: ITEMS, currentSlug: 'components/button' },
    });

    expect(html).toContain('aria-current="page"');
  });

  it('renders the filter input by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSidebar, {
      props: { items: ITEMS },
    });

    expect(html).toContain('sidebar-filter-input');
  });

  it('hides the filter input when showFilter=false', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSidebar, {
      props: { items: ITEMS, showFilter: false },
    });

    expect(html).not.toContain('sidebar-filter-input');
  });
});
