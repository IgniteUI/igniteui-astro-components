import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Sample from '../../src/components/mdx/Sample/Sample.astro';
import { MOCK_PLATFORM, MOCK_ENV } from '../setup.ts';

const locals = {
  platformContext: MOCK_PLATFORM,
  envVars: MOCK_ENV,
};

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

  it('renders only the iframe when iframeOnly=true', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sample, {
      props: { src: '/components/button', iframeOnly: true },
      locals,
    });

    expect(html).toContain('igd-sample-container');
    expect(html).not.toContain('igd-code-view');
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
