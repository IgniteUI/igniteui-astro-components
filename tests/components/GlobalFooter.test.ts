import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GlobalFooter from '../../src/components/GlobalFooter/GlobalFooter.astro';
import { fetchIgNav } from '../../src/lib/nav-helpers.ts';

// fetchIgNav hits infragistics.com at render time; stub it so tests stay offline and deterministic.
vi.mock('../../src/lib/nav-helpers.ts', () => ({ fetchIgNav: vi.fn() }));

const OFFLINE = { headerHtml: '', uiFooterHtml: '', footerHtml: '', prefetched: false };

describe('GlobalFooter', () => {
  it('renders the footer container element', async () => {
    vi.mocked(fetchIgNav).mockResolvedValue(OFFLINE);
    const container = await AstroContainer.create();
    const html = await container.renderToString(GlobalFooter, {
      props: { lang: 'en' },
    });

    expect(html).toContain('data-igd-footer');
  });

  it('renders both fetched footer fragments', async () => {
    vi.mocked(fetchIgNav).mockResolvedValue({
      headerHtml: '<header id="header"></header>',
      uiFooterHtml: '<footer class="ui-footer">UI footer</footer>',
      footerHtml: '<footer id="footer">Main footer</footer>',
      prefetched: true,
    });
    const container = await AstroContainer.create();
    const html = await container.renderToString(GlobalFooter, {
      props: { lang: 'en' },
    });

    expect(html).toContain('<footer class="ui-footer">UI footer</footer>');
    expect(html).toContain('<footer id="footer">Main footer</footer>');
  });

  it('renders an empty container when the footer could not be fetched', async () => {
    vi.mocked(fetchIgNav).mockResolvedValue(OFFLINE);
    const container = await AstroContainer.create();
    const html = await container.renderToString(GlobalFooter, {
      props: { lang: 'en' },
    });

    expect(html).not.toContain('<footer');
  });
});
