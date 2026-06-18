import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MobileSidebarToggle from '../../src/components/MobileSidebarToggle/MobileSidebarToggle.astro';

describe('MobileSidebarToggle', () => {
  it('renders a button with the correct id', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileSidebarToggle);

    expect(html).toContain('id="mobile-sidebar-toggle"');
    expect(html).toContain('<button');
  });

  it('renders with the default label "Components List"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileSidebarToggle);

    expect(html).toContain('Components List');
  });

  it('renders with a custom label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileSidebarToggle, {
      props: { label: 'Navigation' },
    });

    expect(html).toContain('Navigation');
  });

  it('has aria-expanded="false" by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileSidebarToggle);

    expect(html).toContain('aria-expanded="false"');
  });

  it('has aria-controls pointing to docs-sidebar', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileSidebarToggle);

    expect(html).toContain('aria-controls="docs-sidebar"');
  });

  it('includes the aria-label with the custom label text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileSidebarToggle, {
      props: { label: 'Menu' },
    });

    expect(html).toContain('Toggle Menu sidebar');
  });
});
