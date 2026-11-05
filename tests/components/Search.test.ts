import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Search from '../../src/components/Search/Search.astro';

describe('Search', () => {
  it('renders the search trigger button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Search);

    expect(html).toContain('id="search-trigger"');
    expect(html).toContain('class="search-trigger"');
  });

  it('has the correct aria-label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Search);

    expect(html).toContain('aria-label="Search documentation"');
  });

  it('renders the search dialog', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Search);

    expect(html).toContain('id="search-dialog"');
    expect(html).toContain('igd-search-dialog');
  });

  it('renders the search input inside the dialog', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Search);

    expect(html).toContain('igd-search-input');
    expect(html).toContain('placeholder="Search documentation"');
  });

  it('renders the keyboard shortcut hint', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Search);

    expect(html).toContain('search-trigger__hint');
  });
});
