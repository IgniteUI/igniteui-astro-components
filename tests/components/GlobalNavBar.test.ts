import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GlobalNavBar from '../../src/components/GlobalNavBar/GlobalNavBar.astro';

describe('GlobalNavBar', () => {
  it('renders the nav bar container element', async () => {
    const container = await AstroContainer.create();
    // The component fetches remote nav HTML; it renders an empty div when offline.
    const html = await container.renderToString(GlobalNavBar, {
      props: { lang: 'en' },
    });

    expect(html).toContain('data-astro-transition-persist="global-nav-bar"');
  });
});
