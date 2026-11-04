import { describe, it, expect, vi, afterEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FigmaUiKits from '../../src/components/mdx/FigmaUiKits/FigmaUiKits.astro';
import { FIGMA_UI_KITS_URL } from '../../src/components/mdx/FigmaUiKits/kits';

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

const render = async (props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(FigmaUiKits, { props });
  // Drop the dev-only source attributes so assertions can match whole tags.
  return html.replace(/ data-astro-source-[a-z]+="[^"]*"/g, '');
};

const links = (html: string) => html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
const text = (html: string) =>
  html
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

describe('FigmaUiKits', () => {
  afterEach(() => {
    siteMeta.navLang = 'en';
  });

  it('renders one link to the Figma profile by default', async () => {
    const html = await render();
    const [link, ...rest] = links(html);

    expect(rest).toHaveLength(0);
    expect(html).not.toContain('igd-figma-kits__list');
    expect(link).toContain(`href="${FIGMA_UI_KITS_URL}"`);
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noopener noreferrer"');
    expect(text(link)).toBe('Explore our UI kits (opens in a new tab)');
  });

  it('renders one link per kit with a contextual accessible name', async () => {
    const html = await render({ kits: KITS });
    const kitLinks = links(html);

    expect(kitLinks).toHaveLength(4);
    kitLinks.forEach((link, i) => {
      expect(link).toContain(`href="${KITS[i].href}"`);
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noopener noreferrer"');
      expect(link).toContain('class="igd-figma-kits__sr-only"');
      expect(text(link)).toBe(`${KITS[i].label} Figma UI kit (opens in a new tab)`);
    });
    expect(html).toContain('<span class="igd-figma-kits__description">Explore our UI kits</span>');
  });

  it('renders the logo and link icons from the shared assets, hidden from screen readers', async () => {
    const html = await render({ kits: KITS });

    expect(html).toMatch(/<span class="igd-figma-kits__logo" aria-hidden="true"><svg/);
    expect(html.match(/<span class="igd-figma-kits__icon" aria-hidden="true"><svg/g)).toHaveLength(
      4,
    );
  });

  it.each([
    ['jp', 'Figma でデザイン:', 'デザイン:', 'Material Figma UI キット (新しいタブで開きます)'],
    ['JP', 'Figma でデザイン:', 'デザイン:', 'Material Figma UI キット (新しいタブで開きます)'],
    ['kr', 'Figma에서 디자인:', '디자인:', 'Material Figma UI 키트 (새 탭에서 열림)'],
    ['KR', 'Figma에서 디자인:', '디자인:', 'Material Figma UI 키트 (새 탭에서 열림)'],
  ])('localizes the copy for navLang %s', async (lang, title, compactTitle, linkName) => {
    siteMeta.navLang = lang;
    const html = await render({ kits: KITS });

    expect(html).toContain(`<span class="igd-figma-kits__title-full">${title}</span>`);
    expect(html).toContain(`<span class="igd-figma-kits__title-compact">${compactTitle}</span>`);
    expect(text(links(html)[0])).toBe(linkName);
  });

  it('falls back to English for an unknown language', async () => {
    siteMeta.navLang = 'de';
    const html = await render();

    expect(html).toContain('Design in Figma:');
    expect(html).toContain('(opens in a new tab)');
  });

  it('uses a custom title for both layouts', async () => {
    const html = await render({ title: 'Figma kits:' });

    expect(html).not.toContain('igd-figma-kits__title-full');
    expect(html).not.toContain('igd-figma-kits__title-compact');
    expect(html).toMatch(/<strong class="igd-figma-kits__title">Figma kits:<\/strong>/);
  });

  it('renders both titles when only compactTitle is set', async () => {
    const html = await render({ compactTitle: 'Figma:' });

    expect(html).toContain('<span class="igd-figma-kits__title-full">Design in Figma:</span>');
    expect(html).toContain('<span class="igd-figma-kits__title-compact">Figma:</span>');
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
    const html = await render({ variant });

    expect(html).toContain(`data-variant="${variant}"`);
  });

  it('defaults data-variant to auto', async () => {
    expect(await render()).toContain('data-variant="auto"');
  });
});
