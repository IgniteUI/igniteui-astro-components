import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsToc from '../../src/components/DocsToc/DocsToc.astro';

describe('DocsToc', () => {
  it('renders nothing when headings is empty', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsToc, {
      props: { headings: [] },
    });

    expect(html).not.toContain('toc-sidebar');
  });

  it('renders TOC with provided headings', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsToc, {
      props: {
        headings: [
          { depth: 2, slug: 'intro', text: 'Introduction' },
          { depth: 2, slug: 'usage', text: 'Usage' },
        ],
      },
    });

    expect(html).toContain('toc-sidebar');
    expect(html).toContain('Introduction');
    expect(html).toContain('Usage');
  });

  it('renders with default label "On this page"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsToc, {
      props: {
        headings: [{ depth: 2, slug: 'section', text: 'Section' }],
      },
    });

    expect(html).toContain('On this page');
  });

  it('renders with custom label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsToc, {
      props: {
        headings: [{ depth: 2, slug: 'section', text: 'Section' }],
        label: 'Page contents',
      },
    });

    expect(html).toContain('Page contents');
  });

  it('generates anchor links for each heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsToc, {
      props: {
        headings: [{ depth: 2, slug: 'my-section', text: 'My Section' }],
      },
    });

    expect(html).toContain('href="#my-section"');
    expect(html).toContain('My Section');
  });
});
