import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SidebarFilterInput from '../../src/components/DocsSidebar/SidebarFilterInput.astro';

describe('SidebarFilterInput', () => {
  it('renders the igc-input filter element', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarFilterInput);

    expect(html).toContain('id="sidebar-filter-input"');
    expect(html).toContain('type="search"');
  });

  it('has the correct aria attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarFilterInput);

    expect(html).toContain('aria-label="Filter navigation topics"');
    expect(html).toContain('aria-controls="docs-sidebar"');
  });

  it('renders the filter clear button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarFilterInput);

    expect(html).toContain('data-sidebar-filter-clear');
  });

  it('renders the status paragraph', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarFilterInput);

    expect(html).toContain('role="status"');
    expect(html).toContain('data-sidebar-filter-status');
  });
});
