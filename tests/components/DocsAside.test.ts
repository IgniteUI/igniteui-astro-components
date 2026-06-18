import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsAside from '../../src/components/mdx/DocsAside/DocsAside.astro';

describe('DocsAside', () => {
  it('renders with default note type', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsAside);

    expect(html).toContain('igd-aside--note');
    expect(html).toContain('role="note"');
  });

  it('renders with type="info"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsAside, {
      props: { type: 'info' },
    });

    expect(html).toContain('igd-aside--info');
    expect(html).toContain('aria-label="Info"');
  });

  it('renders with type="warning"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsAside, {
      props: { type: 'warning' },
    });

    expect(html).toContain('igd-aside--warning');
    expect(html).toContain('aria-label="Warning"');
  });

  it('renders custom title', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsAside, {
      props: { type: 'note', title: 'Custom Title' },
    });

    expect(html).toContain('aria-label="Custom Title"');
    expect(html).toContain('Custom Title');
  });

  it('suppresses icon when icon prop is empty string', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsAside, {
      props: { type: 'info', icon: '' },
    });

    expect(html).not.toContain('igd-aside__icon');
  });

  it('renders custom icon name', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsAside, {
      props: { type: 'note', icon: 'custom-icon' },
    });

    expect(html).toContain('name="custom-icon"');
  });
});
