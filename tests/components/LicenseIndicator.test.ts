import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import LicenseIndicator from '../../src/components/LicenseIndicator/LicenseIndicator.astro';

describe('LicenseIndicator', () => {
  it('renders nothing when license is undefined', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LicenseIndicator, {
      props: {},
    });

    expect(html.trim()).toBe('');
  });

  it('renders nothing when license is false', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LicenseIndicator, {
      props: { license: false },
    });

    expect(html.trim()).toBe('');
  });

  it('renders a Premium badge when license="premium"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LicenseIndicator, {
      props: { license: 'premium' },
    });

    expect(html).toContain('Premium');
    expect(html).toContain('class="sidebar-badge premium"');
  });

  it('renders an Open Source badge when license="opensource"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LicenseIndicator, {
      props: { license: 'opensource' },
    });

    expect(html).toContain('Open Source');
    expect(html).toContain('class="sidebar-badge opensource"');
  });

  it('renders the premium icon when license="premium"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LicenseIndicator, {
      props: { license: 'premium' },
    });

    expect(html).toContain('name="premium"');
  });

  it('does not render the premium icon for opensource', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LicenseIndicator, {
      props: { license: 'opensource' },
    });

    expect(html).not.toContain('name="premium"');
  });
});
