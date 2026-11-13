import { describe, it, expect, vi, afterEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsLayout from '../../src/layouts/DocsLayout/DocsLayout.astro';

// DocsLayout reads navLang from the site-meta virtual module to set <html lang>.
const siteMeta = vi.hoisted(() => ({ navLang: 'en' }));
vi.mock('virtual:docs-template/site-meta', () => ({
  title: 'Test Site',
  sidebar: [],
  productLinks: [],
  headEntries: [],
  trailingSlash: 'ignore',
  packages: [],
  selectedPackage: '',
  get navLang() {
    return siteMeta.navLang;
  },
}));

const render = async (props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  return container.renderToString(DocsLayout, {
    props: { title: 'Grid', ...props },
    slots: { default: '<p>Body</p>' },
  });
};

const htmlLang = (html: string) => html.match(/<html[^>]*\slang="([^"]*)"/)?.[1];

describe('DocsLayout', () => {
  afterEach(() => {
    siteMeta.navLang = 'en';
  });

  it.each([
    ['en', 'en'],
    ['jp', 'ja'],
    ['kr', 'ko'],
  ])('sets <html lang> for navLang "%s" to "%s"', async (navLang, expected) => {
    siteMeta.navLang = navLang;
    expect(htmlLang(await render())).toBe(expected);
  });

  it('lets the lang prop override navLang', async () => {
    siteMeta.navLang = 'jp';
    expect(htmlLang(await render({ lang: 'en' }))).toBe('en');
  });
});
