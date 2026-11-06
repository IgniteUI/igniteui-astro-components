/**
 * Mirrors the active TOC link of `source` (the page's `<docs-toc>`, whose scroll-spy
 * sets `aria-current="true"`) onto the matching link in `dropdown` and into `label`.
 */
type ExpandableEl = HTMLElement & { expanded: boolean };

// DocsTree renders the anchor as an empty overlay; the text is the sibling `.docs-tree-label`.
function headingText(link: Element): string {
  const treeLabel = link.parentElement?.querySelector('.docs-tree-label');
  return (treeLabel ?? link).textContent?.trim() ?? '';
}

// Opens every `igc-tree-item` from the link up to `root`, so a nested heading is visible.
function expandPath(link: Element, root: Element): void {
  let item: Element | null = link.closest('igc-tree-item');
  while (item && root.contains(item)) {
    (item as ExpandableEl).expanded = true;
    item = item.parentElement?.closest('igc-tree-item') ?? null;
  }
}

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
  if (match) expandPath(match, dropdown);
  if (label) label.textContent = match ? headingText(match) : '';
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
