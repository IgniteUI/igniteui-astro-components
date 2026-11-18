import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { readFileSync } from 'node:fs';
import DocsSubHeader from '../../src/components/DocsSubHeader/DocsSubHeader.astro';

const SOURCE = new URL('../../src/components/DocsSubHeader/DocsSubHeader.astro', import.meta.url);

describe('DocsSubHeader', () => {
  it('renders the subheader container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, { props: {} });

    expect(html).toContain('igd-docs-subheader');
    expect(html).toContain('docs-subheader-menu');
  });

  it('renders the logo text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: { logoText: 'IgniteUI' },
    });

    expect(html).toContain('IgniteUI');
  });

  it('renders package selector when packages are provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: {
        packages: ['@igniteui/angular', '@igniteui/react'],
        selectedPackage: '@igniteui/angular',
      },
    });

    expect(html).toContain('@igniteui/angular');
    expect(html).toContain('@igniteui/react');
    expect(html).toContain('package-select');
  });

  it('renders version selector when versions are provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: {
        versions: ['18.x', '17.x'],
        selectedVersion: '18.x',
      },
    });

    expect(html).toContain('18.x');
    expect(html).toContain('17.x');
    expect(html).toContain('version-select');
  });

  it('declares no prop that the markup does not render', () => {
    const props = readFileSync(SOURCE, 'utf8').match(/interface Props \{[\s\S]*?\n\}/)![0];
    for (const dead of [
      'pageTitle',
      'currentSlug',
      'siteTitle',
      'productLinks',
      'sidebarItems',
      'showThemeToggle',
      'themeStorageKey',
    ]) {
      expect(props).not.toContain(`${dead}?:`);
    }
  });

  it('renders sidebar toggle button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: {},
    });

    expect(html).toContain('data-sidebar-toggle');
    expect(html).toContain('Toggle sidebar');
  });
});
