import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ApiLink from '../../src/components/mdx/ApiLink/ApiLink.astro';
import { MOCK_PLATFORM } from '../setup.ts';

const locals = { platformContext: MOCK_PLATFORM };

describe('ApiLink', () => {
  it('renders an anchor element', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiLink, {
      props: { type: 'Toast' },
      locals,
    });

    expect(html).toContain('<a ');
    expect(html).toContain('</a>');
  });

  it('renders type name inside <code>', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiLink, {
      props: { type: 'Toast' },
      locals,
    });

    expect(html).toContain('<code');
    expect(html).toContain('IgrToast');
  });

  it('applies the platform prefix to the type name', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiLink, {
      props: { type: 'Calendar' },
      locals,
    });

    expect(html).toContain('IgrCalendar');
  });

  it('skips the prefix when prefixed=false', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiLink, {
      props: { type: 'configureTheme', kind: 'function', prefixed: false },
      locals,
    });

    expect(html).toContain('configureTheme');
    expect(html).not.toContain('IgrconfigureTheme');
  });

  it('uses custom label when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiLink, {
      props: { type: 'Toast', label: 'My Toast' },
      locals,
    });

    expect(html).toContain('My Toast');
  });

  it('appends member anchor to the URL', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiLink, {
      props: { type: 'Toast', member: 'show' },
      locals,
    });

    expect(html).toContain('#show');
  });

  it('builds URL from the correct docRoot', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiLink, {
      props: { type: 'Toast' },
      locals,
    });

    expect(html).toContain('https://example.com/react/igniteui-react/latest');
  });

  it('renders kind="sass" link using sassApiUrl', async () => {
    const container = await AstroContainer.create();
    const localsWithSass = {
      platformContext: {
        ...MOCK_PLATFORM,
        sassApiUrl: 'https://example.com/sass',
      },
    };
    const html = await container.renderToString(ApiLink, {
      props: { kind: 'sass', module: 'animations', type: 'mixin-slide-in-left' },
      locals: localsWithSass,
    });

    expect(html).toContain('https://example.com/sass/animations#mixin-slide-in-left');
  });
});
