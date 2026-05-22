import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MobileTocToggle from '../../src/components/MobileTocToggle/MobileTocToggle.astro';

describe('MobileTocToggle', () => {
  it('renders nothing when headings is empty', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileTocToggle, {
      props: { headings: [] },
    });

    expect(html).not.toContain('mobile-toc');
  });

  it('renders the toggle when headings are provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileTocToggle, {
      props: {
        headings: [{ depth: 2, slug: 'intro', text: 'Introduction' }],
      },
    });

    expect(html).toContain('mobile-toc');
    expect(html).toContain('id="mobile-toc-trigger"');
  });

  it('renders with default label "On this page"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileTocToggle, {
      props: {
        headings: [{ depth: 2, slug: 'intro', text: 'Introduction' }],
      },
    });

    expect(html).toContain('On this page');
  });

  it('renders with custom label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileTocToggle, {
      props: {
        headings: [{ depth: 2, slug: 'intro', text: 'Introduction' }],
        label: 'Contents',
      },
    });

    expect(html).toContain('Contents');
  });

  it('renders heading anchors in the dropdown', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileTocToggle, {
      props: {
        headings: [{ depth: 2, slug: 'my-section', text: 'My Section' }],
      },
    });

    expect(html).toContain('href="#my-section"');
    expect(html).toContain('My Section');
  });

  it('has aria-expanded="false" on the trigger button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MobileTocToggle, {
      props: {
        headings: [{ depth: 2, slug: 'intro', text: 'Introduction' }],
      },
    });

    expect(html).toContain('aria-expanded="false"');
  });
});
