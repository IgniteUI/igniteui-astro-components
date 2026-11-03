import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Anatomy from '../../src/components/mdx/Anatomy/Anatomy.astro';

const PROPS = {
  src: '/images/anatomy/button.png',
  alt: 'Button anatomy: label, prefix icon, and suffix icon',
};

describe('Anatomy', () => {
  it('renders the image inside a figure frame', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Anatomy, { props: PROPS });

    expect(html).toContain('<figure class="igd-anatomy"');
    expect(html).toContain('class="igd-anatomy__image"');
    expect(html).toContain('src="/images/anatomy/button.png"');
  });

  it('forwards alt to the img', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Anatomy, { props: PROPS });

    expect(html).toContain('alt="Button anatomy: label, prefix icon, and suffix icon"');
  });

  it('lazy-loads and async-decodes the image', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Anatomy, { props: PROPS });

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it('appends extra classes to the frame', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Anatomy, {
      props: { ...PROPS, class: 'wide' },
    });

    expect(html).toContain('class="igd-anatomy wide"');
  });

  it.each(['', '   '])('throws when src is %j', async (src) => {
    const container = await AstroContainer.create();

    await expect(container.renderToString(Anatomy, { props: { ...PROPS, src } })).rejects.toThrow(
      '<Anatomy> requires a `src`',
    );
  });

  it.each(['', '   '])('throws when alt is %j', async (alt) => {
    const container = await AstroContainer.create();

    await expect(container.renderToString(Anatomy, { props: { ...PROPS, alt } })).rejects.toThrow(
      '<Anatomy> requires a non-empty `alt`',
    );
  });
});
