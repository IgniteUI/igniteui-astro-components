import { describe, it, expect, vi, afterEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DoDont from '../../src/components/mdx/DoDont/DoDont.astro';
import anatomyPng from '../../src/assets/images/anatomy-test.png';

// DoDont reads navLang from the site-meta virtual module to pick its default labels.
const siteMeta = vi.hoisted(() => ({ navLang: 'en' }));
vi.mock('virtual:docs-template/site-meta', () => ({
  get navLang() {
    return siteMeta.navLang;
  },
}));

const PROPS = {
  doSrc: '/images/do.png',
  doAlt: 'A list of 100,000 employees in a virtual scroll',
  dontSrc: '/images/dont.png',
  dontAlt: 'A virtual scroll holding only five employees',
};

const SLOTS = {
  do: 'Use the Virtual Scroll for a long list.',
  dont: 'Render a short list directly with the List.',
};

const render = async (
  props: Record<string, unknown> = {},
  slots: Record<string, string> = SLOTS,
) => {
  const container = await AstroContainer.create();
  return container.renderToString(DoDont, { props: { ...PROPS, ...props }, slots });
};

const images = (html: string) => html.match(/<img[^>]*>/g) ?? [];

describe('DoDont', () => {
  afterEach(() => {
    siteMeta.navLang = 'en';
  });

  it('renders a do panel and a dont panel', async () => {
    const html = await render();

    expect(html).toContain('class="igd-dodont"');
    expect(html).toContain('igd-dodont__panel--do');
    expect(html).toContain('igd-dodont__panel--dont');
    expect(html.indexOf('igd-dodont__panel--do')).toBeLessThan(
      html.indexOf('igd-dodont__panel--dont'),
    );
  });

  it('renders URL images as plain img tags with their alt text', async () => {
    const [doImg, dontImg] = images(await render());

    expect(doImg).toContain('src="/images/do.png"');
    expect(doImg).toContain(`alt="${PROPS.doAlt}"`);
    expect(dontImg).toContain('src="/images/dont.png"');
    expect(dontImg).toContain(`alt="${PROPS.dontAlt}"`);
  });

  it('renders imported images through astro:assets with a srcset and dimensions', async () => {
    const [doImg] = images(await render({ doSrc: anatomyPng }));

    expect(doImg).toContain('srcset=');
    expect(doImg).toContain('sizes="(max-width: 400px) 100vw, 360px"');
    expect(doImg).toMatch(/\swidth="\d+"/);
    expect(doImg).toMatch(/\sheight="\d+"/);
    expect(doImg).toContain(`alt="${PROPS.doAlt}"`);
  });

  it('renders both slot descriptions in the captions', async () => {
    const html = await render();

    expect(html).toContain(SLOTS.do);
    expect(html).toContain(SLOTS.dont);
  });

  it('marks the badges as decorative', async () => {
    const html = await render();
    const badges = html.match(/<igc-badge[^>]*>/g) ?? [];

    expect(badges).toHaveLength(2);
    for (const badge of badges) {
      expect(badge).toContain('aria-hidden="true"');
    }
    expect(badges[0]).toContain('variant="success"');
    expect(badges[1]).toContain('variant="danger"');
    expect(html).toContain('name="check-bold"');
    expect(html).toContain('name="clear-bold"');
  });

  it('separates each label from its description with a visually hidden colon', async () => {
    const html = await render();

    expect(html).toMatch(/>Do<span class="igd-dodont__sr-only"[^>]*>: <\/span>/);
    expect(html).toMatch(/>Don&#39;t<span class="igd-dodont__sr-only"[^>]*>: <\/span>/);
  });

  it('lazy-loads images by default', async () => {
    for (const img of images(await render())) {
      expect(img).toContain('loading="lazy"');
      expect(img).not.toContain('fetchpriority');
    }
  });

  it('loads eager images at high priority', async () => {
    for (const img of images(await render({ loading: 'eager' }))) {
      expect(img).toContain('loading="eager"');
      expect(img).toContain('fetchpriority="high"');
    }
  });

  it('puts the error notice on each frame', async () => {
    const html = await render();

    expect(html.match(/data-error-text="Sorry, this image could not be loaded."/g)).toHaveLength(2);
  });

  it('accepts custom labels and error text', async () => {
    const html = await render({ doLabel: 'Yes', dontLabel: 'No', errorText: 'Image missing' });

    expect(html).toMatch(/>Yes<span class="igd-dodont__sr-only"/);
    expect(html).toMatch(/>No<span class="igd-dodont__sr-only"/);
    expect(html).toContain('data-error-text="Image missing"');
  });

  it.each([
    ['jp', '推奨', '非推奨'],
    ['ja', '推奨', '非推奨'],
    ['kr', '권장', '비권장'],
    ['ko', '권장', '비권장'],
    ['de', 'Do', 'Don&#39;t'],
  ])('localizes default labels for navLang "%s"', async (lang, doLabel, dontLabel) => {
    siteMeta.navLang = lang;
    const html = await render();

    expect(html).toContain(`>${doLabel}<span class="igd-dodont__sr-only"`);
    expect(html).toContain(`>${dontLabel}<span class="igd-dodont__sr-only"`);
  });

  it('appends extra classes to the container', async () => {
    const html = await render({ class: 'narrow' });

    expect(html).toContain('class="igd-dodont narrow"');
  });

  it.each(['doSrc', 'dontSrc'])('throws when %s is empty', async (key) => {
    await expect(render({ [key]: ' ' })).rejects.toThrow(`<DoDont> requires a \`${key}\` image`);
  });

  it.each(['doAlt', 'dontAlt'])('throws when %s is empty', async (key) => {
    await expect(render({ [key]: ' ' })).rejects.toThrow(
      `<DoDont> requires a non-empty \`${key}\``,
    );
  });

  it.each(['do', 'dont'])('throws when the "%s" slot is missing', async (key) => {
    const slots: Record<string, string> = { ...SLOTS };
    delete slots[key];

    await expect(render({}, slots)).rejects.toThrow(`<DoDont> requires a non-empty "${key}" slot`);
  });

  it('throws when a slot holds only markup and whitespace', async () => {
    await expect(render({}, { ...SLOTS, do: '<p>&nbsp; </p>' })).rejects.toThrow(
      '<DoDont> requires a non-empty "do" slot',
    );
  });
});
