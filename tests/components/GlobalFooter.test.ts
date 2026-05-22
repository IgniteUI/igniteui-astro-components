import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GlobalFooter from '../../src/components/GlobalFooter/GlobalFooter.astro';

describe('GlobalFooter', () => {
  it('renders the footer container element', async () => {
    const container = await AstroContainer.create();
    // The component fetches remote footer HTML; it renders an empty div when offline.
    const html = await container.renderToString(GlobalFooter, {
      props: { lang: 'en' },
    });

    expect(html).toContain('data-igd-footer');
  });
});
