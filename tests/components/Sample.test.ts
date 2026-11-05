import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Sample from '../../src/components/mdx/Sample/Sample.astro';
import { MOCK_PLATFORM, MOCK_ENV } from '../setup.ts';

const locals = {
  platformContext: MOCK_PLATFORM,
  envVars: MOCK_ENV,
};

/**
 * Renders a Sample and returns its HTML with every build warning it logged.
 * The warnings are deduplicated for the whole test file, so each caller passes
 * a `src` of its own.
 */
async function renderWithWarnings(props: Record<string, unknown>) {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, { props, locals });
    return { html, warnings: warn.mock.calls.map(([message]) => message) };
  } finally {
    warn.mockRestore();
  }
}

describe('Sample', () => {
  it('renders the demo widget container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button' },
      locals,
    });

    expect(html).toContain('igd-code-view');
    expect(html).toContain('data-iframe-src');
  });

  it('includes the iframe src derived from demosBaseUrl', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button' },
      locals,
    });

    expect(html).toContain('https://demo.example.com/components/button');
  });

  it('uses dvDemosBaseUrl for DV-prefixed paths', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/charts/data-chart/axis-crossing' },
      locals,
    });

    expect(html).toContain('https://dv-demo.example.com/charts/data-chart/axis-crossing');
  });

  it('uses dvDemosBaseUrl when dv=true', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button', dv: true },
      locals,
    });

    expect(html).toContain('https://dv-demo.example.com/components/button');
  });

  it('renders only the iframe with chrome="bare"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button', chrome: 'bare' },
      locals,
    });

    expect(html).toContain('igd-sample-container');
    expect(html).not.toContain('igd-code-view');
  });

  it('keeps the bare backdrop transparent by default, and paints it with noBackground={false}', async () => {
    const container = await AstroContainer.create();
    const transparent = await container.renderToString(Sample, {
      props: { src: '/components/button', chrome: 'bare' },
      locals,
    });
    const painted = await container.renderToString(Sample, {
      props: { src: '/components/button', chrome: 'bare', noBackground: false },
      locals,
    });

    expect(transparent).toContain('igd-sample-container--no-background');
    expect(painted).not.toContain('igd-sample-container--no-background');
  });

  it('keeps the widget backdrop transparent by default without a theme picker', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button' },
      locals,
    });

    expect(html).toContain('igd-sample-container--no-background');
  });

  it('renders the widget frame without the tabs with chrome="demo"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button', chrome: 'demo' },
      locals,
    });

    expect(html).toContain('data-chrome="demo"');
    expect(html).not.toContain('<igc-tabs');
  });

  it('still renders only the iframe with the deprecated iframeOnly, and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const container = await AstroContainer.create();
      const html = await container.renderToString(Sample, {
        props: { src: '/components/button', iframeOnly: true },
        locals,
      });

      expect(html).toContain('igd-sample-container');
      expect(html).not.toContain('igd-code-view');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('iframeOnly is deprecated'));
    } finally {
      warn.mockRestore();
    }
  });

  it('renders the demo chrome with the deprecated hideCode, and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const container = await AstroContainer.create();
      const html = await container.renderToString(Sample, {
        props: { src: '/components/button', hideCode: true },
        locals,
      });

      expect(html).toContain('data-chrome="demo"');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('hideCode is deprecated'));
    } finally {
      warn.mockRestore();
    }
  });

  it('warns once when the same usage renders again', async () => {
    // A src of its own: the warnings are deduplicated for the whole test file.
    const props = { src: '/components/warn-once', iframeOnly: true } as const;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const container = await AstroContainer.create();
      await container.renderToString(Sample, { props, locals });
      await container.renderToString(Sample, { props, locals });

      expect(warn).toHaveBeenCalledOnce();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('/components/warn-once: iframeOnly is deprecated'),
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('renders no full-screen button for fullscreenBtn with chrome="widget", and warns', async () => {
    const { html, warnings } = await renderWithWarnings({
      src: '/components/fullscreen-widget',
      chrome: 'widget',
      fullscreenBtn: true,
    });

    expect(html).toContain('data-chrome="widget"');
    expect(html).not.toContain('igd-full-screen-btn');
    expect(warnings).toEqual([
      '[Sample] /components/fullscreen-widget: fullscreenBtn only applies to chrome="bare". The widget footer already has a full-screen button.',
    ]);
  });

  it('renders no theme picker for showThemePicker with chrome="bare", and warns', async () => {
    const { html, warnings } = await renderWithWarnings({
      src: '/components/picker-bare',
      chrome: 'bare',
      showThemePicker: true,
    });

    expect(html).toContain('igd-sample-container');
    expect(html).not.toContain('igd-sample-theming');
    expect(warnings).toEqual([
      '[Sample] /components/picker-bare: showThemePicker has no effect with chrome="bare", which renders no footer for the picker.',
    ]);
  });

  it('falls back to the widget for an unknown chrome, and warns', async () => {
    const { html, warnings } = await renderWithWarnings({
      src: '/components/unknown-chrome',
      chrome: 'fancy',
    });

    expect(html).toContain('data-chrome="widget"');
    expect(html).toContain('<igc-tabs');
    expect(warnings).toEqual([
      '[Sample] /components/unknown-chrome: chrome="fancy" is not one of widget, demo, bare, so the widget renders.',
    ]);
  });

  it('lets the deprecated iframeOnly win over hideCode, and warns about both', async () => {
    const { html, warnings } = await renderWithWarnings({
      src: '/components/iframe-only-and-hide-code',
      iframeOnly: true,
      hideCode: true,
    });

    expect(html).toContain('igd-sample-container');
    expect(html).not.toContain('igd-code-view');
    expect(warnings).toEqual([
      '[Sample] /components/iframe-only-and-hide-code: iframeOnly is deprecated and will be removed in igniteui-astro-components 2.0.0. Use chrome="bare" instead.',
      '[Sample] /components/iframe-only-and-hide-code: hideCode is deprecated and will be removed in igniteui-astro-components 2.0.0. Use chrome="demo" instead.',
    ]);
  });

  it('lets an explicit chrome win over both deprecated props, and says they are ignored', async () => {
    const { html, warnings } = await renderWithWarnings({
      src: '/components/explicit-chrome',
      chrome: 'widget',
      iframeOnly: true,
      hideCode: true,
    });

    expect(html).toContain('data-chrome="widget"');
    expect(html).toContain('<igc-tabs');
    expect(warnings).toEqual([
      '[Sample] /components/explicit-chrome: iframeOnly is deprecated and will be removed in igniteui-astro-components 2.0.0. Use chrome="bare" instead. chrome="widget" is set, so iframeOnly is ignored.',
      '[Sample] /components/explicit-chrome: hideCode is deprecated and will be removed in igniteui-astro-components 2.0.0. Use chrome="demo" instead. chrome="widget" is set, so hideCode is ignored.',
    ]);
  });

  it('applies the custom height', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button', height: 600 },
      locals,
    });

    expect(html).toContain('600px');
  });

  it('uses the platform name in the iframe title', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button', alt: '' },
      locals,
    });

    // platform name is 'React'
    expect(html).toContain('React Example');
  });
});
