import { describe, it, expect, vi, afterEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { JSDOM } from 'jsdom';
import FigmaUiKits from '../../src/components/mdx/FigmaUiKits/FigmaUiKits.astro';
import { DEFAULT_FIGMA_UI_KITS } from '../../src/components/mdx/FigmaUiKits/kits';

// FigmaUiKits reads navLang from the site-meta virtual module to pick its default copy.
const siteMeta = vi.hoisted(() => ({ navLang: 'en' }));
vi.mock('virtual:docs-template/site-meta', () => ({
  get navLang() {
    return siteMeta.navLang;
  },
}));

const KITS = [
  { label: 'Material', href: 'https://www.figma.com/community/file/1' },
  { label: 'Fluent', href: 'https://www.figma.com/community/file/2' },
  { label: 'Bootstrap', href: 'https://www.figma.com/community/file/3' },
  { label: 'Indigo', href: 'https://www.figma.com/community/file/4' },
];

// Renders the component and parses the HTML into a DOM fragment.
const render = async (props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  return JSDOM.fragment(await container.renderToString(FigmaUiKits, { props }));
};

const links = (dom: DocumentFragment) => [...dom.querySelectorAll('a')];
const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim();

describe('FigmaUiKits', () => {
  afterEach(() => {
    siteMeta.navLang = 'en';
  });

  it('renders the four default kits with their own Figma Community files', async () => {
    const kitLinks = links(await render());

    expect(DEFAULT_FIGMA_UI_KITS.map((kit) => kit.label)).toEqual([
      'Material',
      'Fluent',
      'Bootstrap',
      'Indigo',
    ]);
    expect(new Set(DEFAULT_FIGMA_UI_KITS.map((kit) => kit.href)).size).toBe(4);
    expect(kitLinks).toHaveLength(4);
    kitLinks.forEach((link, i) => {
      expect(link.getAttribute('href')).toBe(DEFAULT_FIGMA_UI_KITS[i].href);
      expect(link.getAttribute('href')).toMatch(/^https:\/\/www\.figma\.com\/community\/file\//);
      expect(text(link)).toBe(
        `${DEFAULT_FIGMA_UI_KITS[i].label} Figma UI kit (opens in a new tab)`,
      );
    });
  });

  it('renders the kits passed in instead of the defaults', async () => {
    const dom = await render({ kits: KITS });
    const kitLinks = links(dom);

    expect(kitLinks).toHaveLength(4);
    kitLinks.forEach((link, i) => {
      expect(link.getAttribute('href')).toBe(KITS[i].href);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.querySelector('.igd-figma-kits__sr-only')).not.toBeNull();
      expect(text(link)).toBe(`${KITS[i].label} Figma UI kit (opens in a new tab)`);
    });
  });

  it('shows one title, the same at every width', async () => {
    const dom = await render();

    expect(dom.querySelectorAll('.igd-figma-kits__title')).toHaveLength(1);
    expect(text(dom.querySelector('.igd-figma-kits__title'))).toBe(
      'Explore our free Figma UI kits',
    );
    expect(text(dom.querySelector('.igd-figma-kits__text'))).toBe('Explore our free Figma UI kits');
  });

  it('keeps list semantics on the markerless kit list', async () => {
    const list = (await render()).querySelector('ul.igd-figma-kits__list');

    expect(list?.getAttribute('role')).toBe('list');
    expect(list?.querySelectorAll(':scope > li')).toHaveLength(4);
  });

  it('renders the logo and link icons from the shared assets, hidden from screen readers', async () => {
    const dom = await render({ kits: KITS });
    const logo = dom.querySelector('.igd-figma-kits__logo');
    const icons = [...dom.querySelectorAll('.igd-figma-kits__icon')];

    expect(logo?.getAttribute('aria-hidden')).toBe('true');
    expect(logo?.querySelector('svg')).not.toBeNull();
    expect(icons).toHaveLength(4);
    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.querySelector('svg')).not.toBeNull();
    });
  });

  it.each([
    ['jp', '無料の Figma UI キットを見る', 'Material Figma UI キット (新しいタブで開きます)'],
    ['JP', '無料の Figma UI キットを見る', 'Material Figma UI キット (新しいタブで開きます)'],
    ['kr', '무료 Figma UI 키트 살펴보기', 'Material Figma UI 키트 (새 탭에서 열림)'],
    ['KR', '무료 Figma UI 키트 살펴보기', 'Material Figma UI 키트 (새 탭에서 열림)'],
  ])('localizes the copy for navLang %s', async (lang, title, linkName) => {
    siteMeta.navLang = lang;
    const dom = await render({ kits: KITS });

    expect(text(dom.querySelector('.igd-figma-kits__title'))).toBe(title);
    expect(text(links(dom)[0])).toBe(linkName);
  });

  it('falls back to English for an unknown language', async () => {
    siteMeta.navLang = 'de';
    const dom = await render();

    expect(text(dom.querySelector('.igd-figma-kits__title'))).toBe(
      'Explore our free Figma UI kits',
    );
    expect(text(dom.querySelector('.igd-figma-kits__sr-only'))).toBe(
      'Figma UI kit (opens in a new tab)',
    );
  });

  it('uses a custom title', async () => {
    const dom = await render({ title: 'Figma kits:' });

    expect(text(dom.querySelector('.igd-figma-kits__title'))).toBe('Figma kits:');
  });

  it.each([[{ label: '', href: 'https://www.figma.com' }], [{ label: 'Material', href: ' ' }]])(
    'throws for a kit with an empty label or href',
    async (kit) => {
      await expect(render({ kits: [kit] })).rejects.toThrow(
        'requires every kit to have a non-empty `label` and `href`',
      );
    },
  );

  it('throws for an empty kits list', async () => {
    await expect(render({ kits: [] })).rejects.toThrow('requires at least one kit');
  });

  it.each(['auto', 'compact'])('sets data-variant to %s', async (variant) => {
    const dom = await render({ variant });

    expect(dom.querySelector('.igd-figma-kits')?.getAttribute('data-variant')).toBe(variant);
  });

  it('defaults data-variant to auto', async () => {
    const dom = await render();

    expect(dom.querySelector('.igd-figma-kits')?.getAttribute('data-variant')).toBe('auto');
  });
});
