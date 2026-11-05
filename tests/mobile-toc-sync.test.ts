// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  observeActiveHeading,
  syncActiveHeading,
} from '../src/components/MobileTocToggle/sync-active';

function page(withDesktopToc = true) {
  document.body.innerHTML = `
    ${withDesktopToc ? '<docs-toc><a href="#intro">Intro</a><a href="#usage">Usage</a></docs-toc>' : ''}
    <button><span id="mobile-toc-active"></span></button>
    <div id="mobile-toc-dropdown"><a href="#intro">Intro</a><a href="#usage">Usage</a></div>`;
  return {
    source: document.querySelector('docs-toc'),
    dropdown: document.getElementById('mobile-toc-dropdown')!,
    label: document.getElementById('mobile-toc-active')!,
  };
}

const current = (root: Element) =>
  [...root.querySelectorAll('a[aria-current="true"]')].map((a) => a.getAttribute('href'));

describe('syncActiveHeading', () => {
  it('shows the heading the desktop TOC marks active and marks the same dropdown link', () => {
    const { source, dropdown, label } = page();
    source!.querySelector('a[href="#usage"]')!.setAttribute('aria-current', 'true');
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('Usage');
    expect(current(dropdown)).toEqual(['#usage']);
  });

  it('moves the current marker when the desktop TOC moves it', () => {
    const { source, dropdown, label } = page();
    const [intro, usage] = source!.querySelectorAll('a');
    intro.setAttribute('aria-current', 'true');
    syncActiveHeading(source, dropdown, label);
    intro.removeAttribute('aria-current');
    usage.setAttribute('aria-current', 'true');
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('Usage');
    expect(current(dropdown)).toEqual(['#usage']);
  });

  it('clears the label and markers when nothing is active', () => {
    const { source, dropdown, label } = page();
    dropdown.querySelector('a')!.setAttribute('aria-current', 'true');
    label.textContent = 'stale';
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('');
    expect(current(dropdown)).toEqual([]);
  });

  it('stays empty without a desktop TOC on the page', () => {
    const { source, dropdown, label } = page(false);
    expect(source).toBeNull();
    syncActiveHeading(source, dropdown, label);
    expect(label.textContent).toBe('');
    expect(current(dropdown)).toEqual([]);
  });
});

describe('observeActiveHeading', () => {
  it('follows aria-current changes inside the desktop TOC', async () => {
    const { source, dropdown, label } = page();
    const observer = observeActiveHeading(source, dropdown, label);
    expect(observer).toBeInstanceOf(MutationObserver);
    source!.querySelector('a[href="#intro"]')!.setAttribute('aria-current', 'true');
    await new Promise((r) => setTimeout(r, 0));
    expect(label.textContent).toBe('Intro');
    expect(current(dropdown)).toEqual(['#intro']);
    observer!.disconnect();
  });

  it('returns no observer without a desktop TOC', () => {
    const { source, dropdown, label } = page(false);
    expect(observeActiveHeading(source, dropdown, label)).toBeUndefined();
  });
});
