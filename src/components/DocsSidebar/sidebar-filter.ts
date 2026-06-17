/**
 * sidebar-filter.ts
 *
 * Behavior-only custom element (`<sidebar-filter>`) that adds live filtering,
 * expand/collapse state persistence, and scroll restoration to the docs sidebar.
 *
 * Extends Lit's `ReactiveElement` for the lifecycle callbacks without a render
 * cycle — the markup is fully server-rendered by Astro and must not be touched.
 */
import { ReactiveElement } from 'lit';
import type {
  IgcInputComponent,
  IgcIconButtonComponent,
  IgcTreeItemComponent,
} from 'igniteui-webcomponents';

// ── Selectors ──────────────────────────────────────────────────────────────
const FILTER_INPUT_SELECTOR = '[data-sidebar-filter-input]';
const FILTER_CLEAR_SELECTOR = '[data-sidebar-filter-clear]';
const FILTER_STATUS_SELECTOR = '[data-sidebar-filter-status]';
const ACTIVE_LINK_SELECTOR = 'a[aria-current="page"]';

const FILTER_KEY = 'sidebar-filter-value';
const DETAILS_KEY = 'sidebar-filter-details';
const SCROLL_KEY = 'sidebar-filter-scroll';

const SCROLL_SELECTOR = '[data-sidebar-scroll]';
const ITEM_SELECTOR = 'igc-tree-item[data-path]';
const GROUP_SELECTOR = 'igc-tree-item[data-group-key]';


// ── Storage helpers ────────────────────────────────────────────────────────
const safeGet = (k: string): string => { try { return sessionStorage.getItem(k) ?? ''; } catch { return ''; } };
const safeSet = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* quota */ } };
const safeRemove = (k: string) => { try { sessionStorage.removeItem(k); } catch { /* */ } };

const parseKeys  = (raw: string): Set<string> => new Set(raw ? raw.split('\n').filter(Boolean) : []);
const serializeKeys = (keys: Set<string>): string => [...keys].join('\n');

// ── Helpers ────────────────────────────────────────────────────────────────

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
    if (el.querySelector(ACTIVE_LINK_SELECTOR)) { el.setAttribute('expanded', ''); return; }
    const key = el.dataset.groupKey;
    if (key && openKeys.has(key)) el.setAttribute('expanded', '');
    else el.removeAttribute('expanded');
  });
};

const tokenize = (q: string): string[] => q.toLowerCase().split(/\s+/).filter(Boolean);
const itemPath = (el: HTMLElement): string => (el.dataset.path ?? el.dataset.label ?? '').toLowerCase();

// ── Page-lifecycle hooks ───────────────────────────────────────────────────
// Registered once at most, regardless of how many sidebar-filter instances connect.
// These must live at module level because astro:before-swap fires before the
// element reconnects on the new page.

let _pageHooksRegistered = false;
let _isClientSideNav = false;

function registerPageHooks(): void {
  if (_pageHooksRegistered) return;
  _pageHooksRegistered = true;

  document.addEventListener('astro:before-preparation', () => {
    _isClientSideNav = true;

    const sc = document.querySelector<HTMLElement>(SCROLL_SELECTOR);
    if (sc) safeSet(SCROLL_KEY, String(sc.scrollTop));

    // When filtering is active, override DETAILS_KEY with the filter's openSnapshot
    // (which tracks user-intent expand state including manual collapses during filter).
    // When NOT filtering, DETAILS_KEY was already kept up-to-date by onItemToggle.
    const host = document.querySelector<HTMLElement>('sidebar-filter[data-filtering]');
    const intended = host?.dataset.openSnapshot;
    if (intended !== undefined) safeSet(DETAILS_KEY, intended);
  });

  document.addEventListener('astro:before-swap', (e) => {
    const newDoc = e.newDocument;
    const newScroll = newDoc.querySelector<HTMLElement>(SCROLL_SELECTOR);
    if (newScroll) newScroll.style.visibility = 'hidden';

    applyExpandedAttr(newDoc, parseKeys(safeGet(DETAILS_KEY)));
  });
}

// ── Custom element ─────────────────────────────────────────────────────────

/**
 * `<sidebar-filter>` — behavior-only wrapper around the Astro-rendered sidebar.
 *
 * Responsibilities:
 *  - Filter sidebar items by text as the user types (CSS-driven via `data-filter-match`).
 *  - Persist the filter value and the tree's expand/collapse state across SPA page transitions
 *    via sessionStorage so the sidebar feels stateful between pages.
 *  - Restore scroll position of the sidebar scroll container after each page transition.
 *  - Sync the tree expand state with the active filter (auto-expand groups with matches,
 *    restore pre-filter state when the filter is cleared).
 *
 * Uses `ReactiveElement` (not `LitElement`) so Lit's lifecycle callbacks are available
 * without a render cycle — Astro's SSR-rendered children remain in the light DOM untouched.
 */
class SidebarFilter extends ReactiveElement {
  private input: IgcInputComponent | null = null;
  private clearBtn: IgcIconButtonComponent | null = null;
  private status: HTMLElement | null = null;
  private scrollEl: HTMLElement | null = null;
  private items: HTMLElement[] = [];
  private groups: HTMLElement[] = [];

  /** User-intent expand state during active filter. */
  private openSnapshot: Set<string> | null = null;
  /** Pre-filter snapshot; restored on Esc / clear. */
  private preFilterSnapshot: Set<string> | null = null;
  /** Suppress event-driven persistence while programmatically changing state. */
  private suppressPersist = false;

  private controller: AbortController | undefined;

  private pinFrames = 0;
  private prevScrollBehavior: string | null = null;

  // Prevent ReactiveElement from attaching a shadow root — this element wraps
  // Astro-server-rendered light DOM children and must not hide them.
  protected override createRenderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    registerPageHooks();

    this.input = this.querySelector<IgcInputComponent>(FILTER_INPUT_SELECTOR);
    this.clearBtn = this.querySelector<IgcIconButtonComponent>(FILTER_CLEAR_SELECTOR);
    this.status = this.querySelector<HTMLElement>(FILTER_STATUS_SELECTOR);
    this.scrollEl = this.querySelector<HTMLElement>(SCROLL_SELECTOR);
    this.items = [...this.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
    this.groups = [...this.querySelectorAll<HTMLElement>(GROUP_SELECTOR)];

    // On a hard load (non-client-nav) DETAILS_KEY may be stale or empty.
    // Prime it now from the SSR DOM attributes so onItemToggle can safely
    // do incremental updates against it.
    if (!_isClientSideNav) {
      safeSet(DETAILS_KEY, serializeKeys(new Set(collectExpandedKeys(this))));
    }

    this.controller = new AbortController();
    const opts: AddEventListenerOptions = { signal: this.controller.signal };

    if (this.input && this.clearBtn) {
      this.input.addEventListener('igcInput', () => this.onFilterInput(), opts);
      this.input.addEventListener('keydown', (e: KeyboardEvent) => this.onFilterKeydown(e), opts);
      this.clearBtn.addEventListener('click', () => this.onClearClick(), opts);
    }

    this.addEventListener('igcItemExpanded', (e) => this.onItemToggle(e), opts);
    this.addEventListener('igcItemCollapsed', (e) => this.onItemToggle(e), opts);

    this.restoreOnConnect();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.controller?.abort();
    this.controller = undefined;
  }

  // ── Events ──────────────────────────────────────────────────────────────

  private onFilterInput(): void {
    this.pinScrollY();
    safeSet(FILTER_KEY, this.input!.value);
    this.applyFilter(this.input!.value, 'user');
  }

  private onFilterKeydown(e: KeyboardEvent): void {
    this.pinScrollY();
    if (e.key === 'Escape' && this.input!.value) this.resetFilter();
  }

  private onClearClick(): void {
    this.resetFilter();
    this.input!.focus();
  }

  private onItemToggle(e: Event): void {
    if (this.suppressPersist) return;

    // The events are dispatched on <igc-tree>; the actual item is in e.detail.
    const item = (e as CustomEvent<HTMLElement>).detail;
    const key = item?.dataset?.groupKey;
    if (!key) return;

    if (this.openSnapshot) {
      // Filter active — update user-intent snapshot, not live state.
      if (e.type === 'igcItemExpanded') this.openSnapshot.add(key);
      else this.openSnapshot.delete(key);
      this.syncSnapshotAttr();
      safeSet(DETAILS_KEY, serializeKeys(this.openSnapshot));
      return;
    }

    // Not filtering — update DETAILS_KEY incrementally.
    // We CANNOT call collectExpandedKeys here because Lit reflects the
    // `expanded` property to the attribute asynchronously; the attribute
    // is still the old value at the time this synchronous event fires.
    const keys = parseKeys(safeGet(DETAILS_KEY));
    if (e.type === 'igcItemExpanded') keys.add(key);
    else keys.delete(key);
    safeSet(DETAILS_KEY, serializeKeys(keys));
  }

  private syncSnapshotAttr(): void {
    if (this.openSnapshot) this.dataset.openSnapshot = serializeKeys(this.openSnapshot);
    else delete this.dataset.openSnapshot;
  }

  // ── pinScrollY ──────────────────────────────────────────────────────────
  // Chrome: filter mutations trigger a browser-internal scroll. Pin scrollY
  // via rAF for ~200ms and force `scroll-behavior: auto` so it's an instant
  // jump. Prior inline value is restored at end.

  private pinScrollY(): void {
    const wasActive = this.pinFrames > 0;
    const y = window.scrollY;
    this.pinFrames = 10;
    if (wasActive) return;
    this.prevScrollBehavior = document.documentElement.style.getPropertyValue('scroll-behavior');
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const tick = (): void => {
      if (window.scrollY !== y) window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
      if (--this.pinFrames > 0) requestAnimationFrame(tick);
      else {
        if (this.prevScrollBehavior) document.documentElement.style.setProperty('scroll-behavior', this.prevScrollBehavior);
        else document.documentElement.style.removeProperty('scroll-behavior');
        this.prevScrollBehavior = null;
      }
    };
    tick();
  }

  // ── Restore on connect ───────────────────────────────────────────────────

  private restoreOnConnect(): void {
    const isClientNav = _isClientSideNav;
    _isClientSideNav = false;

    if (this.input) {
      const saved = isClientNav ? safeGet(FILTER_KEY) : '';
      if (!isClientNav) safeRemove(FILTER_KEY);

      if (saved) {
        this.input.value = saved;
        this.applyFilter(saved, 'restore');
      } else {
        this.syncClearButton('');
      }
    }

    this.restoreScroll(isClientNav);
  }

  private restoreScroll(isClientNav: boolean): void {
    const sc = this.scrollEl;
    if (!sc) return;
    if (isClientNav) {
      requestAnimationFrame(() => {
        if (!this.isConnected) return;
        sc.scrollTo({ top: parseInt(safeGet(SCROLL_KEY) || '0', 10) || 0, behavior: 'instant' });
        sc.style.visibility = '';
        requestAnimationFrame(() => {
          if (!this.isConnected) return;
          const active = this.querySelector<HTMLAnchorElement>(ACTIVE_LINK_SELECTOR);
          if (active && !this.isElementVisible(active, sc)) {
            this.scrollToCenter(active, sc);
          }
        });
      });
    } else {
      // On hard refresh, wait for astro:page-load (which scrolls the page
      // back to top and runs initSidebarHeights) before centering.
      document.addEventListener('astro:page-load', () => {
        requestAnimationFrame(() => {
          if (!this.isConnected) return;
          const sidebar = this.closest<HTMLElement>('.docs-sidebar');
          if (sidebar) {
            sidebar.style.maxHeight = Math.max(0, window.innerHeight - sidebar.getBoundingClientRect().top) + 'px';
          }
          sc.style.visibility = '';
          const active = this.querySelector<HTMLAnchorElement>(ACTIVE_LINK_SELECTOR);
          if (active) this.scrollToCenter(active, sc);
        });
      }, { once: true });
    }
  }

  private scrollToCenter(el: HTMLElement, container: HTMLElement): void {
    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    container.scrollTop += (elRect.top + elRect.height / 2) - (cRect.top + cRect.height / 2);
  }

  private isElementVisible(el: HTMLElement, container: HTMLElement): boolean {
    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    return elRect.top >= cRect.top && elRect.bottom <= cRect.bottom;
  }

  // ── Filter ───────────────────────────────────────────────────────────────

  private applyFilter(rawQuery: string, source: 'user' | 'restore'): void {
    const trimmed = rawQuery.trim();
    this.syncClearButton(trimmed);

    if (!trimmed) { this.exitFilterMode(); return; }

    if (!this.openSnapshot) {
      const current = new Set(collectExpandedKeys(this));
      this.openSnapshot = new Set(current);
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
      safeSet(DETAILS_KEY, serializeKeys(this.openSnapshot));
    }

    this.setExpandedState(this.openSnapshot);
    this.updateStatus(matches.size > 0 ? null : 'no-match');
  }

  private exitFilterMode(): void {
    delete this.dataset.filtering;

    for (const el of this.items) delete el.dataset.filterMatch;

    const restore = this.preFilterSnapshot ?? this.openSnapshot;
    if (restore) {
      this.withSuppressed(() => this.setExpandedState(restore!));
      safeSet(DETAILS_KEY, serializeKeys(restore));
    }

    this.openSnapshot = null;
    this.preFilterSnapshot = null;
    this.syncSnapshotAttr();
    this.ensureActiveAncestorsExpanded();
    this.updateStatus(null);
  }

  private setExpandedState(openKeys: Set<string>): void {
    const toExpand: IgcTreeItemComponent[] = [];
    const toCollapse: IgcTreeItemComponent[] = [];

    for (const el of this.groups) {
      const hasActive = !!el.querySelector(ACTIVE_LINK_SELECTOR);
      const inKeys = !!(el.dataset.groupKey && openKeys.has(el.dataset.groupKey));
      if (hasActive || inKeys) toExpand.push(el as IgcTreeItemComponent);
      else toCollapse.push(el as IgcTreeItemComponent);
    }

    this.withSuppressed(() => {
      toExpand.forEach(el => { el.expanded = true; });
      toCollapse.forEach(el => { el.expanded = false; });
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
    // path = [root, ..., el]; slice off el itself, keep only navigable ancestors
    (el as IgcTreeItemComponent).path.slice(0, -1).forEach((ancestor) => {
      if (ancestor.matches(ITEM_SELECTOR)) out.add(ancestor);
    });
  }

  private collectGroupDescendants(el: HTMLElement, out: Set<HTMLElement>): void {
    if (!el.dataset.groupKey) return;
    (el as IgcTreeItemComponent)
      .getChildren({ flatten: true })
      .forEach((child) => { if (child.matches(ITEM_SELECTOR)) out.add(child); });
  }

  private markMatches(matches: Set<HTMLElement>): void {
    for (const el of this.items) {
      if (matches.has(el)) el.dataset.filterMatch = 'true';
      else delete el.dataset.filterMatch;
    }
  }

  private ensureActiveAncestorsExpanded(): void {
    const active = this.querySelector<HTMLAnchorElement>(ACTIVE_LINK_SELECTOR);
    if (!active) return;
    const treeItem = active.closest<IgcTreeItemComponent>('igc-tree-item');
    if (!treeItem) return;
    // path = [root, ..., treeItem]; expand every group in the ancestry chain
    treeItem.path.forEach((item) => {
      if (item.matches(GROUP_SELECTOR)) item.expanded = true;
    });
  }

  // ── UI sync ──────────────────────────────────────────────────────────────

  private updateStatus(state: 'no-match' | null): void {
    if (!this.status) return;
    this.status.textContent = state === 'no-match' ? (this.dataset.noResults ?? 'No topics match') : '';
  }

  private syncClearButton(value: string): void {
    if (!this.clearBtn) return;
    this.clearBtn.hidden = value.length === 0;
  }

  private resetFilter(): void {
    this.pinScrollY();
    this.input!.value = '';
    this.syncClearButton('');
    safeRemove(FILTER_KEY);
    this.exitFilterMode();
  }
}

if (!customElements.get('sidebar-filter')) {
  customElements.define('sidebar-filter', SidebarFilter);
}
