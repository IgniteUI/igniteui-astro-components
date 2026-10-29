import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PlatformBlock from '../../src/components/mdx/PlatformBlock/PlatformBlock.astro';
import { MOCK_PLATFORM } from '../setup.ts';

// MOCK_PLATFORM has name: 'React'
const locals = { platformContext: MOCK_PLATFORM };

describe('PlatformBlock', () => {
  it('renders slot content when the platform matches', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlatformBlock, {
      props: { for: 'React' },
      locals,
      slots: { default: '<p>React content</p>' },
    });

    expect(html).toContain('React content');
  });

  it('renders nothing when the platform does not match', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlatformBlock, {
      props: { for: 'Angular' },
      locals,
      slots: { default: '<p>Angular content</p>' },
    });

    expect(html).not.toContain('Angular content');
  });

  it('renders when the platform is in a comma-separated list', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlatformBlock, {
      props: { for: 'Angular, React, Blazor' },
      locals,
      slots: { default: '<p>Multi-platform content</p>' },
    });

    expect(html).toContain('Multi-platform content');
  });

  it('does not render when none of the listed platforms match', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PlatformBlock, {
      props: { for: 'Angular, Blazor' },
      locals,
      slots: { default: '<p>Non-matching content</p>' },
    });

    expect(html).not.toContain('Non-matching content');
  });
});
