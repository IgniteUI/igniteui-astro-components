import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ThemingWidget from '../../src/components/ThemingWidget/ThemingWidget.astro';

describe('ThemingWidget', () => {
  it('renders nothing when themeApiUrl is empty (default mock)', async () => {
    // The virtual mock exports themeApiUrl = '' so nothing should render.
    const container = await AstroContainer.create();
    const html = await container.renderToString(ThemingWidget, {
      props: {},
    });

    expect(html).not.toContain('theming-widget-container');
  });
});
