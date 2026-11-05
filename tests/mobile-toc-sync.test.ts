import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsToc from '../src/components/DocsToc/DocsToc.astro';
import MobileTocToggle from '../src/components/MobileTocToggle/MobileTocToggle.astro';
import {
  observeActiveHeading,
  syncActiveHeading,
} from '../src/components/MobileTocToggle/sync-active';

const HEADINGS = [
  { depth: 2, slug: 'intro', text: 'Introduction' },
  { depth: 2, slug: 'usage', text: 'Usage' },
  { depth: 3, slug: 'usage-props', text: 'Props' },
];

/** The real DocsToc and MobileTocToggle markup side by side, as DocsLayout lays them out. */
async function renderedPage(withDesktopToc = true) {
  const container = await AstroContainer.create();
  const toc = withDesktopToc
    ? await container.renderToString(DocsToc, { props: { headings: HEADINGS } })
    : '';
  const mobile = await container.renderToString(MobileTocToggle, { props: { headings: HEADINGS } });
  const { window } = new JSDOM(toc + mobile);
  const { document } = window;
  globalThis.MutationObserver = window.MutationObserver;
  return {
    source: document.querySelector('docs-toc'),
    dropdown: document.getElementById('mobile-toc-dropdown')!,
    label: document.getElementById('mobile-toc-active')!,
  };
}

const current = (root: Element) =>
  [...root.querySelectorAll('a[aria-current="true"]')].map((a) => a.getAttribute('href'));

const expanded = (root: Element) =>
  [...root.querySelectorAll('igc-tree-item')]
    .filter((item) => (item as HTMLElement & { expanded?: boolean }).expanded === true)
    .map((item) => item.querySelector('a')?.getAttribute('href'));

describe('syncActiveHeading', () => {
  it('shows the text of the heading the desktop TOC marks active, read from the tree label', async () => {
    const { source, dropdown, label } = await renderedPage();
    expect(source!.querySelector('a[href="#usage"]')!.textContent).toBe('');
    source!.querySelector('a[href="#usage"]')!.setAttribute('aria-current', 'true');
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('Usage');
    expect(current(dropdown)).toEqual(['#usage']);
  });

  it('expands the dropdown branch of a nested active heading', async () => {
    const { source, dropdown, label } = await renderedPage();
    source!.querySelector('a[href="#usage-props"]')!.setAttribute('aria-current', 'true');
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('Props');
    expect(current(dropdown)).toEqual(['#usage-props']);
    expect(expanded(dropdown)).toEqual(['#usage', '#usage-props']);
  });

  it('moves the marker when the desktop TOC moves it', async () => {
    const { source, dropdown, label } = await renderedPage();
    const intro = source!.querySelector('a[href="#intro"]')!;
    const usage = source!.querySelector('a[href="#usage"]')!;
    intro.setAttribute('aria-current', 'true');
    syncActiveHeading(source, dropdown, label);
    intro.removeAttribute('aria-current');
    usage.setAttribute('aria-current', 'true');
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('Usage');
    expect(current(dropdown)).toEqual(['#usage']);
  });

  it('clears the label and markers when nothing is active', async () => {
    const { source, dropdown, label } = await renderedPage();
    dropdown.querySelector('a')!.setAttribute('aria-current', 'true');
    label.textContent = 'stale';
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('');
    expect(current(dropdown)).toEqual([]);
  });

  it('stays empty without a desktop TOC on the page', async () => {
    const { source, dropdown, label } = await renderedPage(false);
    expect(source).toBeNull();
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('');
    expect(current(dropdown)).toEqual([]);
  });
});

describe('observeActiveHeading', () => {
  it('follows aria-current changes inside the desktop TOC', async () => {
    const { source, dropdown, label } = await renderedPage();
    const observer = observeActiveHeading(source, dropdown, label);
    expect(observer).toBeInstanceOf(MutationObserver);
    source!.querySelector('a[href="#intro"]')!.setAttribute('aria-current', 'true');
    await new Promise((r) => setTimeout(r, 0));
    expect(label.textContent).toBe('Introduction');
    expect(current(dropdown)).toEqual(['#intro']);
    observer!.disconnect();
  });

  it('returns no observer without a desktop TOC', async () => {
    const { source, dropdown, label } = await renderedPage(false);
    expect(observeActiveHeading(source, dropdown, label)).toBeUndefined();
  });
});
