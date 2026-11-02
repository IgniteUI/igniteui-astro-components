import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ApiRef from '../../src/components/mdx/ApiRef/ApiRef.astro';
import { MOCK_PLATFORM } from '../setup.ts';

const locals = { platformContext: MOCK_PLATFORM };

describe('ApiRef', () => {
  it('renders a list', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiRef, {
      props: { types: ['Toast'] },
      locals,
    });

    expect(html).toContain('<ul');
    expect(html).toContain('<li');
  });

  it('renders one list item per type', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiRef, {
      props: { types: ['Toast', 'Calendar', 'Combo'] },
      locals,
    });

    const liCount = (html.match(/<li[\s>]/g) ?? []).length;
    expect(liCount).toBe(3);
  });

  it('renders platform-prefixed names', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiRef, {
      props: { types: ['Toast'] },
      locals,
    });

    expect(html).toContain('IgrToast');
  });

  it('skips prefix when prefixed=false', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiRef, {
      props: { types: ['SortingStrategy'], prefixed: false },
      locals,
    });

    expect(html).toContain('SortingStrategy');
    expect(html).not.toContain('IgrSortingStrategy');
  });

  it('renders links pointing to the correct docRoot', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiRef, {
      props: { types: ['Toast'] },
      locals,
    });

    expect(html).toContain('https://example.com/react/igniteui-react/latest');
  });

  it('renders enum links with the correct URL segment', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiRef, {
      props: { types: ['CalendarSelection'], kind: 'enum' },
      locals,
    });

    expect(html).toContain('/enums/');
  });

  it('wraps label in <code>', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ApiRef, {
      props: { types: ['Toast'] },
      locals,
    });

    expect(html).toContain('<code');
  });
});
