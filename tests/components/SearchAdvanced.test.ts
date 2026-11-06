import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SearchAdvanced from '../../src/components/SearchAdvanced/SearchAdvanced.astro';

describe('SearchAdvanced', () => {
  it('renders the api-search-advanced custom element', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SearchAdvanced);

    expect(html).toContain('api-search-advanced');
  });

  it('renders the search trigger button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SearchAdvanced);

    expect(html).toContain('data-open-modal');
    expect(html).toContain('class="search-trigger"');
  });

  it('uses default placeholder "Search"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SearchAdvanced);

    expect(html).toContain('aria-label="Search"');
  });

  it('uses custom placeholder when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SearchAdvanced, {
      props: { placeholder: 'Search docs…' },
    });

    expect(html).toContain('aria-label="Search docs…"');
    expect(html).toContain('Search docs…');
  });

  it('serialises tabs to data-tabs', async () => {
    const container = await AstroContainer.create();
    const tabs = [{ id: 'components', label: 'Components', kindCodes: ['__name__'] }];
    const html = await container.renderToString(SearchAdvanced, {
      props: { tabs },
    });

    expect(html).toContain('data-tabs=');
    expect(html).toContain('components');
  });

  it('sets data-show-scope="true" when showScope=true', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SearchAdvanced, {
      props: { showScope: true },
    });

    expect(html).toContain('data-show-scope="true"');
  });

  it('sets data-show-scope="false" by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SearchAdvanced);

    expect(html).toContain('data-show-scope="false"');
  });

  it('renders the search dialog', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SearchAdvanced);

    expect(html).toContain('igd-search-dialog');
  });
});
