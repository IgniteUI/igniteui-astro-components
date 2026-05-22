import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsSubHeader from '../../src/components/DocsSubHeader/DocsSubHeader.astro';

describe('DocsSubHeader', () => {
  it('renders the subheader container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: { siteTitle: 'IgniteUI' },
    });

    expect(html).toContain('igd-docs-subheader');
    expect(html).toContain('docs-subheader-menu');
  });

  it('renders the logo text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: { siteTitle: 'IgniteUI', logoText: 'IgniteUI' },
    });

    expect(html).toContain('IgniteUI');
  });

  it('renders theme toggle when showThemeToggle=true', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: { showThemeToggle: true },
    });

    expect(html).toContain('data-theme-toggle');
    expect(html).toContain('Toggle light/dark theme');
  });

  it('does not render theme toggle by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: {},
    });

    expect(html).not.toContain('data-theme-toggle');
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

  it('renders sidebar toggle button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsSubHeader, {
      props: {},
    });

    expect(html).toContain('data-sidebar-toggle');
    expect(html).toContain('Toggle sidebar');
  });
});
