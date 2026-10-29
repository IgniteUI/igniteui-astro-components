import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GlobalNavBar from '../../src/components/GlobalNavBar/GlobalNavBar.astro';
import { fetchIgNav } from '../../src/lib/nav-helpers.ts';

// fetchIgNav hits infragistics.com at render time; stub it so tests stay offline and deterministic.
vi.mock('../../src/lib/nav-helpers.ts', () => ({ fetchIgNav: vi.fn() }));

const OFFLINE = { headerHtml: '', uiFooterHtml: '', footerHtml: '', prefetched: false };

describe('GlobalNavBar', () => {
  it('renders the nav bar container element', async () => {
    vi.mocked(fetchIgNav).mockResolvedValue(OFFLINE);
    const container = await AstroContainer.create();
    const html = await container.renderToString(GlobalNavBar, {
      props: { lang: 'en' },
    });

    expect(html).toContain('data-astro-transition-persist="global-nav-bar"');
  });

  it('renders the fetched header HTML', async () => {
    vi.mocked(fetchIgNav).mockResolvedValue({
      ...OFFLINE,
      headerHtml: '<header id="header">IG nav</header>',
      prefetched: true,
    });
    const container = await AstroContainer.create();
    const html = await container.renderToString(GlobalNavBar, {
      props: { lang: 'en' },
    });

    expect(html).toContain('<header id="header">IG nav</header>');
  });

  it('renders an empty container when the nav could not be fetched', async () => {
    vi.mocked(fetchIgNav).mockResolvedValue(OFFLINE);
    const container = await AstroContainer.create();
    const html = await container.renderToString(GlobalNavBar, {
      props: { lang: 'en' },
    });

    expect(html).not.toContain('<header');
  });

  it('fetches the nav for the requested locale', async () => {
    vi.mocked(fetchIgNav).mockResolvedValue(OFFLINE);
    const container = await AstroContainer.create();
    await container.renderToString(GlobalNavBar, {
      props: { lang: 'jp' },
    });

    expect(fetchIgNav).toHaveBeenLastCalledWith('jp');
  });
});
