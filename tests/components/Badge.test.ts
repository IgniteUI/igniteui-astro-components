import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Badge from '../../src/components/mdx/Badge/Badge.astro';

describe('Badge', () => {
  it('renders an igc-badge with the preview variant by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, { props: {} });

    expect(html).toContain('<igc-badge');
    expect(html).toContain('class="igd-badge preview"');
    expect(html).toMatch(/<span[^>]*>Preview<\/span>/);
  });

  it.each([
    ['new', 'New'],
    ['updated', 'Updated'],
    ['premium', 'Premium'],
    ['opensource', 'Open Source'],
  ] as const)('renders the "%s" variant with its default text', async (variant, text) => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, { props: { variant } });

    expect(html).toContain(`class="igd-badge ${variant}"`);
    expect(html).toMatch(new RegExp(`<span[^>]*>${text}</span>`));
  });

  it('renders slot content instead of the default text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      props: { variant: 'new' },
      slots: { default: 'Beta' },
    });

    expect(html).toContain('Beta');
    expect(html).not.toContain('New');
  });

  it('appends extra classes after the variant class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      props: { variant: 'new', class: 'my-badge' },
    });

    expect(html).toContain('class="igd-badge new my-badge"');
  });

  it('forwards aria attributes to igc-badge', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      props: { 'aria-hidden': 'true', 'aria-label': 'New feature' },
    });

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('aria-label="New feature"');
  });
});
