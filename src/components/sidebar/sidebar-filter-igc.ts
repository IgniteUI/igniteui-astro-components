/**
 * <sidebar-filter-igc> custom element.
 *
 * Same responsibilities as <sidebar-filter> but for an igc-tree host.
 *
 * Design:
 *   • Filter visibility is CSS-driven:
 *       [data-filtering] on the host + [data-filter-match] on each item.
 *   • Expand/collapse uses the igc-tree-item *property* API (`el.expanded = bool`)
 *     for upgraded elements. The sole exception is `astro:before-swap`, which
 *     operates on raw not-yet-upgraded DOM and therefore uses setAttribute.
 *   • igcItemExpanded / igcItemCollapsed are dispatched on <igc-tree> with the
 *     item in `event.detail` (not e.target, which is the tree itself).
 *   • DETAILS_KEY is maintained incrementally:
 *       – primed from DOM attributes on the first hard load (connectedCallback)
 *       – updated in onItemToggle WITHOUT re-reading the DOM, because Lit
 *         reflects the `expanded` property to the attribute asynchronously; the
 *         attribute is stale at the time the event fires.
 *
 * sessionStorage keys:
 *   sidebar-igc-filter-value   → current filter input value
 *   sidebar-igc-details-states → newline-joined list of expanded group keys
 *   sidebar-igc-scroll-top     → scrollTop of the scroll container
 */

const FILTER_KEY  = 'sidebar-igc-filter-value';
const DETAILS_KEY = 'sidebar-igc-details-states';
const SCROLL_KEY  = 'sidebar-igc-scroll-top';

const SCROLL_SELECTOR = '[data-sidebar-scroll]';
const ITEM_SELECTOR   = 'igc-tree-item[data-path]';
const GROUP_SELECTOR  = 'igc-tree-item[data-group-key]';

let _isClientSideNav = false;

// ── Storage helpers ──────────────────────────────────────────────────────────

const safeGet    = (k: string): string    => { try { return sessionStorage.getItem(k) ?? ''; } catch { return ''; } };
const safeSet    = (k: string, v: string) => { try { sessionStorage.setItem(k, v);            } catch { /* quota */ } };
const safeRemove = (k: string)            => { try { sessionStorage.removeItem(k);            } catch { /* */ } };

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Read expanded keys by checking the `expanded` ATTRIBUTE.
 * Works on both upgraded custom elements and raw DOM nodes (astro:before-swap).
 * Note: only call this when Lit has had time to reflect properties → attributes
 * (i.e. not synchronously inside event handlers).
 */
const collectExpandedKeys = (root: ParentNode): string[] => {
  const keys: string[] = [];
  root.querySelectorAll<HTMLElement>(GROUP_SELECTOR).forEach((el) => {
    if (el.hasAttribute('expanded') && el.dataset.groupKey) keys.push(el.dataset.groupKey);
  });
  return keys;
};

/**
 * Apply expanded state using setAttribute / removeAttribute.
 * Used ONLY in astro:before-swap on not-yet-upgraded DOM nodes.
 */
const applyExpandedAttr = (root: ParentNode, openKeys: Set<string>): void => {
  root.querySelectorAll<HTMLElement>(GROUP_SELECTOR).forEach((el) => {
    // Always keep ancestors of the active page open.
    if (el.querySelector('a[aria-current="page"]')) { el.setAttribute('expanded', ''); return; }
    const key = el.dataset.groupKey;
    if (key && openKeys.has(key)) el.setAttribute('expanded', '');
    else                          el.removeAttribute('expanded');
  });
};

const tokenize = (q: string): string[]   => q.toLowerCase().split(/\s+/).filter(Boolean);
const itemPath = (el: HTMLElement): string => (el.dataset.path ?? el.dataset.label ?? '').toLowerCase();

// ── Cross-navigation hooks ───────────────────────────────────────────────────

document.addEventListener('astro:before-preparation', () => {
  _isClientSideNav = true;

  const sc = document.querySelector<HTMLElement>(SCROLL_SELECTOR);
  if (sc) safeSet(SCROLL_KEY, String(sc.scrollTop));

  // When filtering is active, override DETAILS_KEY with the filter's openSnapshot
  // (which tracks user-intent expand state including manual collapses during filter).
  // When NOT filtering, DETAILS_KEY was already kept up-to-date by onItemToggle,
  // so we leave it as-is.
  const host     = document.querySelector<HTMLElement>('sidebar-filter-igc[data-filtering]');
  const intended = host?.dataset.openSnapshot;
  if (intended !== undefined) safeSet(DETAILS_KEY, intended);
});

document.addEventListener('astro:before-swap', (e) => {
  const newDoc    = (e as unknown as { newDocument: Document }).newDocument;
  const newScroll = newDoc.querySelector<HTMLElement>(SCROLL_SELECTOR);
  if (newScroll) newScroll.style.visibility = 'hidden';

  const raw = safeGet(DETAILS_KEY);
  applyExpandedAttr(newDoc, new Set(raw ? raw.split('\n').filter(Boolean) : []));
});

// ── Custom element ───────────────────────────────────────────────────────────

type ExpandableEl = HTMLElement & { expanded: boolean };
type FilterInputEl = HTMLElement & { value: string; focus(): void };
type FilterClearEl = HTMLElement & { hidden: boolean };

class SidebarFilterIgc extends HTMLElement {
  private input!:    FilterInputEl;
  private clearBtn!: FilterClearEl;
  private status!:   HTMLElement;
  private scrollEl:  HTMLElement | null = null;
  private items:     HTMLElement[] = [];
  private groups:    HTMLElement[] = [];

  /** User-intent expand state during active filter. */
  private openSnapshot:      Set<string> | null = null;
  /** Pre-filter snapshot; restored on Esc / clear. */
  private preFilterSnapshot: Set<string> | null = null;
  /** Suppress event-driven persistence while programmatically changing state. */
  private suppressPersist = false;

  connectedCallback(): void {
    const input    = this.querySelector<FilterInputEl>('[data-sidebar-filter-input]');
    const clearBtn = this.querySelector<FilterClearEl>('[data-sidebar-filter-clear]');
    const status   = this.querySelector<HTMLElement>('[data-sidebar-filter-status]');
    if (!input || !clearBtn || !status) return;

    this.input    = input;
    this.clearBtn = clearBtn;
    this.status   = status;
    this.scrollEl = this.querySelector<HTMLElement>(SCROLL_SELECTOR);
    this.items    = [...this.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
    this.groups   = [...this.querySelectorAll<HTMLElement>(GROUP_SELECTOR)];

    // On a hard load (non-client-nav) DETAILS_KEY may be stale or empty.
    // Prime it now from the SSR DOM attributes so onItemToggle can safely
    // do incremental updates against it.
    if (!_isClientSideNav) {
      safeSet(DETAILS_KEY, collectExpandedKeys(this).join('\n'));
    }

    this.bindEvents();
    this.restoreOnConnect();
  }

  // ── Events ───────────────────────────────────────────────────────────────

  private bindEvents(): void {
    // igc-input fires 'igcInput' instead of the native 'input' event.
    this.input.addEventListener('igcInput',  this.onFilterInput as EventListener);
    this.input.addEventListener('keydown',  this.onFilterKeydown);
    this.clearBtn.addEventListener('click', this.onClearClick);

    // igcItemExpanded / igcItemCollapsed are dispatched on <igc-tree> with
    // the igc-tree-item instance in event.detail — NOT in e.target.
    this.addEventListener('igcItemExpanded',  this.onItemToggle as EventListener);
    this.addEventListener('igcItemCollapsed', this.onItemToggle as EventListener);
  }

  private onFilterInput = (): void => {
    safeSet(FILTER_KEY, this.input.value);
    this.applyFilter(this.input.value, 'user');
  };

  private onFilterKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.input.value) this.resetFilter();
  };

  private onClearClick = (): void => {
    this.resetFilter();
    this.input.focus();
  };

  private onItemToggle = (e: Event): void => {
    if (this.suppressPersist) return;

    // The events are dispatched on <igc-tree>; the actual item is in e.detail.
    const item = (e as CustomEvent<HTMLElement>).detail;
    const key  = item?.dataset?.groupKey;
    if (!key) return;

    if (this.openSnapshot) {
      // Filter active — update user-intent snapshot, not live state.
      if (e.type === 'igcItemExpanded') this.openSnapshot.add(key);
      else                              this.openSnapshot.delete(key);
      this.syncSnapshotAttr();
      safeSet(DETAILS_KEY, [...this.openSnapshot].join('\n'));
      return;
    }

    // Not filtering — update DETAILS_KEY incrementally.
    // We CANNOT call collectExpandedKeys here because Lit reflects the
    // `expanded` property to the attribute asynchronously; the attribute
    // is still the old value at the time this synchronous event fires.
    const saved = safeGet(DETAILS_KEY);
    const keys  = new Set(saved ? saved.split('\n').filter(Boolean) : []);
    if (e.type === 'igcItemExpanded') keys.add(key);
    else                              keys.delete(key);
    safeSet(DETAILS_KEY, [...keys].join('\n'));
  };

  private syncSnapshotAttr(): void {
    if (this.openSnapshot) this.dataset.openSnapshot = [...this.openSnapshot].join('\n');
    else                   delete this.dataset.openSnapshot;
  }

  // ── Restore on connect ───────────────────────────────────────────────────

  private restoreOnConnect(): void {
    const isClientNav = _isClientSideNav;
    _isClientSideNav  = false;

    const saved = isClientNav ? safeGet(FILTER_KEY) : '';
    if (!isClientNav) safeRemove(FILTER_KEY);

    if (saved) {
      this.input.value = saved;
      this.applyFilter(saved, 'restore');
    } else {
      this.syncClearButton('');
    }

    this.restoreScroll(isClientNav);
  }

  private restoreScroll(isClientNav: boolean): void {
    const sc = this.scrollEl;
    if (!sc) return;
    requestAnimationFrame(() => {
      sc.scrollTop = isClientNav
        ? (parseInt(safeGet(SCROLL_KEY) || '0', 10) || 0)
        : this.activeScrollOffset(sc);
      sc.style.visibility = '';
    });
  }

  private activeScrollOffset(sc: HTMLElement): number {
    const active   = this.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
    if (!active) return 0;
    const linkRect = active.getBoundingClientRect();
    const cRect    = sc.getBoundingClientRect();
    if (linkRect.top < cRect.top)       return sc.scrollTop + (linkRect.top  - cRect.top);
    if (linkRect.bottom > cRect.bottom) return sc.scrollTop + (linkRect.bottom - cRect.bottom);
    return sc.scrollTop;
  }

  // ── Filter ───────────────────────────────────────────────────────────────

  private applyFilter(rawQuery: string, source: 'user' | 'restore'): void {
    const trimmed = rawQuery.trim();
    this.syncClearButton(trimmed);

    if (!trimmed) { this.exitFilterMode(); return; }

    if (!this.openSnapshot) {
      const current          = new Set(collectExpandedKeys(this));
      this.openSnapshot      = new Set(current);
      this.preFilterSnapshot = source === 'user' ? new Set(current) : null;
      this.syncSnapshotAttr();
    }

    const matches = this.computeMatches(tokenize(trimmed));

    // CSS-driven visibility: stamp data-filter-match; stylesheet hides the rest.
    this.markMatches(matches);
    this.dataset.filtering = 'true';

    if (source === 'user') {
      // Auto-expand groups that contain matching items.
      for (const el of this.groups) {
        const key = el.dataset.groupKey;
        if (key && matches.has(el)) this.openSnapshot.add(key);
      }
      this.syncSnapshotAttr();
      safeSet(DETAILS_KEY, [...this.openSnapshot].join('\n'));
    }

    // Drive expand state via the igc-tree-item property (WC API).
    this.setExpandedState(this.openSnapshot);
    this.updateStatus(matches.size > 0 ? null : 'no-match');
  }

  private exitFilterMode(): void {
    delete this.dataset.filtering;

    // Clear match marks — CSS restores visibility automatically.
    for (const el of this.items) delete el.dataset.filterMatch;

    const restore = this.preFilterSnapshot ?? this.openSnapshot;
    if (restore) {
      this.withSuppressed(() => this.setExpandedState(restore!));
      safeSet(DETAILS_KEY, [...restore].join('\n'));
    }

    this.openSnapshot      = null;
    this.preFilterSnapshot = null;
    this.syncSnapshotAttr();
    this.ensureActiveAncestorsExpanded();
    this.updateStatus(null);
  }

  /**
   * Set `el.expanded` on each group via the igc-tree-item property.
   * Ancestors of the active page are always forced open.
   */
  private setExpandedState(openKeys: Set<string>): void {
    this.withSuppressed(() => {
      for (const el of this.groups) {
        if (el.querySelector('a[aria-current="page"]')) {
          (el as ExpandableEl).expanded = true;
          continue;
        }
        const key = el.dataset.groupKey;
        (el as ExpandableEl).expanded = !!key && openKeys.has(key);
      }
    });
  }

  /** Run fn with event-driven persistence suppressed. */
  private withSuppressed(fn: () => void): void {
    this.suppressPersist = true;
    try { fn(); } finally {
      // igcItem* events may fire after a render cycle; release the suppress
      // flag after the next task to be safe.
      setTimeout(() => { this.suppressPersist = false; }, 0);
    }
  }

  // ── Match computation ────────────────────────────────────────────────────

  private computeMatches(tokens: string[]): Set<HTMLElement> {
    const visible = new Set<HTMLElement>();
    for (const el of this.items) {
      if (!tokens.every((t) => itemPath(el).includes(t))) continue;
      visible.add(el);
      this.collectAncestors(el, visible);
      this.collectGroupDescendants(el, visible);
    }
    return visible;
  }

  private collectAncestors(el: HTMLElement, out: Set<HTMLElement>): void {
    let node: Element | null = el.parentElement;
    while (node && node !== this) {
      if (node instanceof HTMLElement && node.matches(ITEM_SELECTOR)) out.add(node);
      node = node.parentElement;
    }
  }

  private collectGroupDescendants(el: HTMLElement, out: Set<HTMLElement>): void {
    if (!el.dataset.groupKey) return;
    el.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach((d) => out.add(d));
  }

  /** Stamp data-filter-match on matching items; CSS hides everything else. */
  private markMatches(matches: Set<HTMLElement>): void {
    for (const el of this.items) {
      if (matches.has(el)) el.dataset.filterMatch = 'true';
      else                 delete el.dataset.filterMatch;
    }
  }

  private ensureActiveAncestorsExpanded(): void {
    const active = this.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
    if (!active) return;
    let node: Element | null = active.parentElement;
    while (node && node !== this) {
      if (node instanceof HTMLElement && node.matches(GROUP_SELECTOR))
        (node as ExpandableEl).expanded = true;
      node = node.parentElement;
    }
  }

  // ── UI sync ──────────────────────────────────────────────────────────────

  private updateStatus(state: 'no-match' | null): void {
    this.status.textContent = state === 'no-match' ? (this.dataset.noResults ?? 'No topics match') : '';
  }

  private syncClearButton(value: string): void {
    this.clearBtn.hidden = value.length === 0;
  }

  private resetFilter(): void {
    this.input.value = '';
    this.syncClearButton('');
    safeRemove(FILTER_KEY);
    this.exitFilterMode();
  }
}

if (!customElements.get('sidebar-filter-igc')) {
  customElements.define('sidebar-filter-igc', SidebarFilterIgc);
}
