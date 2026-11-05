/**
 * Mirrors the active TOC link of `source` (the page's `<docs-toc>`, whose scroll-spy
 * sets `aria-current="true"`) onto the matching link in `dropdown` and into `label`.
 */
export function syncActiveHeading(
  source: Element | null,
  dropdown: Element,
  label: Element | null,
): void {
  const href = source?.querySelector('a[aria-current="true"]')?.getAttribute('href') ?? null;
  let match: Element | null = null;
  for (const link of dropdown.querySelectorAll('a[href]')) {
    if (href !== null && match === null && link.getAttribute('href') === href) {
      match = link;
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  }
  if (label) label.textContent = match?.textContent?.trim() ?? '';
}

/** Runs `syncActiveHeading` now and on every `aria-current` change inside `source`. */
export function observeActiveHeading(
  source: Element | null,
  dropdown: Element,
  label: Element | null,
): MutationObserver | undefined {
  syncActiveHeading(source, dropdown, label);
  if (!source) return undefined;
  const observer = new MutationObserver(() => syncActiveHeading(source, dropdown, label));
  observer.observe(source, { subtree: true, attributeFilter: ['aria-current'] });
  return observer;
}
