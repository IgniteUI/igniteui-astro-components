import { LitElement } from 'lit';
import type {
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcTreeItemComponent,
} from 'igniteui-webcomponents';

// sessionStorage keys
const FILTER_KEY = 'sidebar-filter-value'; // current filter input value
const DETAILS_KEY = 'sidebar-filter-details'; // newline-joined expanded group keys
const SCROLL_KEY = 'sidebar-filter-scroll'; // scrollTop of the scroll container

const SCROLL_SELECTOR = '[data-sidebar-scroll]';
const ITEM_SELECTOR = 'igc-tree-item[data-path]';
const GROUP_SELECTOR = 'igc-tree-item[data-group-key]';
const ACTIVE_LINK_SELECTOR = 'a[aria-current="page"]';

//#region Helpers

const safeGet = (key: string): string => {
  try {
    return sessionStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage is full or unavailable.
  }
};

const safeRemove = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Storage is unavailable.
  }
};

const parseKeys = (raw: string): Set<string> => new Set(raw.split('\n').filter(Boolean));
const serializeKeys = (keys: Set<string>): string => [...keys].join('\n');

const tokenize = (query: string): string[] => query.toLowerCase().split(/\s+/).filter(Boolean);
const itemPath = (item: HTMLElement): string =>
  (item.dataset.path ?? item.dataset.label ?? '').toLowerCase();

/**
 * Keys of the expanded groups, read from the `expanded` attribute so it also
 * works on tree items that aren't upgraded yet.
 */
function collectExpandedKeys(root: ParentNode): Set<string> {
  const keys = new Set<string>();
  for (const group of root.querySelectorAll<HTMLElement>(GROUP_SELECTOR)) {
    if (group.hasAttribute('expanded') && group.dataset.groupKey) {
      keys.add(group.dataset.groupKey);
    }
  }
  return keys;
}

/**
 * Sets the `expanded` attribute on the incoming page's groups. Used only in
 * `astro:before-swap`, before the elements are upgraded. Groups that hold the
 * current page always stay open; with `onlyActiveBranch` the saved keys are ignored.
 */
function applyExpandedAttr(
  root: ParentNode,
  openKeys: Set<string>,
  onlyActiveBranch: boolean,
): void {
  for (const group of root.querySelectorAll<HTMLElement>(GROUP_SELECTOR)) {
    const key = group.dataset.groupKey;
    const isOpen =
      !!group.querySelector(ACTIVE_LINK_SELECTOR) ||
      (!onlyActiveBranch && !!key && openKeys.has(key));
    group.toggleAttribute('expanded', isOpen);
  }
}

//#endregion

//#region Page lifecycle hooks

// Module-level because `astro:before-swap` fires before the new page's
// element is connected. Registered once, however many instances connect.
let pageHooksRegistered = false;
let isClientSideNav = false;

function registerPageHooks(): void {
  if (pageHooksRegistered) return;
  pageHooksRegistered = true;

  document.addEventListener('astro:before-preparation', () => {
    isClientSideNav = true;

    const scrollContainer = document.querySelector<HTMLElement>(SCROLL_SELECTOR);
    if (scrollContainer) safeSet(SCROLL_KEY, String(scrollContainer.scrollTop));

    // While filtering, save the user-intent snapshot (it includes manual collapses).
    // Otherwise DETAILS_KEY is already kept up to date by the toggle handler.
    const host = document.querySelector<HTMLElement>('sidebar-filter[data-filtering]');
    const snapshot = host?.dataset.openSnapshot;
    if (snapshot !== undefined) safeSet(DETAILS_KEY, snapshot);
  });

  document.addEventListener('astro:before-swap', ({ newDocument }) => {
    const scrollContainer = newDocument.querySelector<HTMLElement>(SCROLL_SELECTOR);
    if (scrollContainer) scrollContainer.style.visibility = 'hidden';

    // Single-branch: the new page's branch replaces the saved one, unless the
    // filter carries over and keeps every group it opened.
    const onlyActiveBranch =
      !!newDocument.querySelector('sidebar-filter[data-single-branch-expand]') &&
      !!newDocument.querySelector(`${GROUP_SELECTOR} ${ACTIVE_LINK_SELECTOR}`) &&
      !safeGet(FILTER_KEY);

    applyExpandedAttr(newDocument, parseKeys(safeGet(DETAILS_KEY)), onlyActiveBranch);
  });
}

//#endregion

/**
 * Behavior-only wrapper around the server-rendered docs sidebar.
 *
 * - Filters the tree as the user types. Visibility is CSS-driven: `data-filtering`
 *   on the host and `data-filter-match` on each matching item.
 * - Keeps the filter value, the expanded groups and the scroll position across
 *   client-side navigation.
 * - With `data-single-branch-expand`, keeps one branch of the tree open at a time.
 *
 * Renders into the light DOM and never overrides `render()`, so the default
 * `noChange` render leaves Astro's markup untouched.
 *
 * @element sidebar-filter
 */
class SidebarFilter extends LitElement {
  //#region Internal state

  /** Expanded group keys the user intends while a filter is active. */
  private _openSnapshot: Set<string> | null = null;
  /** Expanded group keys from before filtering; restored on clear when single-branch is off. */
  private _preFilterSnapshot: Set<string> | null = null;
  /** Set while the expand state is changed programmatically, so it isn't persisted. */
  private _suppressPersist = false;
  private _pinFrames = 0;
  private _abortController?: AbortController;

  private get _input() {
    return this.querySelector<IgcInputComponent>('[data-sidebar-filter-input]');
  }

  private get _clearButton() {
    return this.querySelector<IgcIconButtonComponent>('[data-sidebar-filter-clear]');
  }

  private get _status() {
    return this.querySelector<HTMLElement>('[data-sidebar-filter-status]');
  }

  private get _scrollContainer() {
    return this.querySelector<HTMLElement>(SCROLL_SELECTOR);
  }

  private get _items() {
    return this.querySelectorAll<HTMLElement>(ITEM_SELECTOR);
  }

  private get _groups() {
    return this.querySelectorAll<IgcTreeItemComponent>(GROUP_SELECTOR);
  }

  private get _singleBranch(): boolean {
    return this.hasAttribute('data-single-branch-expand');
  }

  //#endregion

  //#region Life-cycle hooks

  protected override createRenderRoot(): HTMLElement {
    // Keep Astro's server-rendered children in the light DOM.
    return this;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    registerPageHooks();

    // On a hard load DETAILS_KEY may be stale or empty. Prime it from the
    // server-rendered state so the toggle handler can update it incrementally.
    if (!isClientSideNav) {
      safeSet(DETAILS_KEY, serializeKeys(collectExpandedKeys(this)));
    }

    // Listeners are replaced on reconnect rather than removed on disconnect:
    // igc-tree emits igcItemCollapsed when its collapse animation ends, often
    // after the client-side swap, and that change still has to be saved.
    this._abortController?.abort();
    this._abortController = new AbortController();
    const options: AddEventListenerOptions = { signal: this._abortController.signal };
    const input = this._input;
    const clearButton = this._clearButton;

    if (input && clearButton) {
      input.addEventListener('igcInput', ({ detail }) => this._handleFilterInput(detail), options);
      input.addEventListener('keydown', (event) => this._handleFilterKeydown(event), options);
      clearButton.addEventListener('click', () => this._handleClearClick(), options);
    }

    // The igcItem* events are dispatched on <igc-tree> with the item in `detail`.
    this.addEventListener('igcItemExpanding', (event) => this._handleItemExpanding(event), options);
    this.addEventListener('igcItemExpanded', (event) => this._handleItemToggle(event), options);
    this.addEventListener('igcItemCollapsed', (event) => this._handleItemToggle(event), options);

    this._restoreOnConnect();
  }

  private _restoreOnConnect(): void {
    const isClientNav = isClientSideNav;
    isClientSideNav = false;

    const input = this._input;
    if (input) {
      // The filter carries over client-side navigation only.
      const saved = isClientNav ? safeGet(FILTER_KEY) : '';
      if (!isClientNav) safeRemove(FILTER_KEY);

      if (saved) {
        input.value = saved;
        this._applyFilter(saved, 'restore');
      } else {
        this._syncClearButton('');
      }
    }

    this._restoreScroll(isClientNav);
  }

  //#endregion

  //#region Event handlers

  private _handleFilterInput(value: string): void {
    this._pinScrollY();
    safeSet(FILTER_KEY, value);
    this._applyFilter(value, 'user');
  }

  private _handleFilterKeydown(event: KeyboardEvent): void {
    this._pinScrollY();
    if (event.key === 'Escape' && this._input?.value) this._resetFilter();
  }

  private _handleClearClick(): void {
    this._resetFilter();
    this._input?.focus();
  }

  private _handleItemToggle(event: Event): void {
    if (this._suppressPersist) return;

    const { type, detail: item } = event as CustomEvent<IgcTreeItemComponent>;
    const key = item.dataset.groupKey;
    if (!key) return;

    // While filtering, update the user-intent snapshot rather than the live
    // state; otherwise update the saved keys in place.
    const keys = this._openSnapshot ?? parseKeys(safeGet(DETAILS_KEY));
    if (type === 'igcItemExpanded') keys.add(key);
    else keys.delete(key);

    this._syncSnapshotAttr();
    safeSet(DETAILS_KEY, serializeKeys(keys));
  }

  /**
   * Single-branch: expanding a group collapses every open group outside its branch.
   * igc-tree's own `singleBranchExpand` isn't used: turning it on collapses every
   * group, the current page's included, and while filtering the next expand would
   * collapse the groups the filter opened.
   */
  private _handleItemExpanding(event: Event): void {
    // While filtering, every group with a match stays open.
    if (!this._singleBranch || this._openSnapshot) return;

    const item = (event as CustomEvent<IgcTreeItemComponent>).detail;
    for (const group of this._groups) {
      if (group.expanded && !group.contains(item)) void group.collapseWithEvent();
    }
  }

  //#endregion

  //#region Filtering

  private _applyFilter(rawQuery: string, source: 'user' | 'restore'): void {
    const query = rawQuery.trim();
    this._syncClearButton(query);

    if (!query) {
      this._exitFilterMode();
      return;
    }

    if (!this._openSnapshot) {
      const expanded = collectExpandedKeys(this);
      this._openSnapshot = new Set(expanded);
      this._preFilterSnapshot = source === 'user' ? expanded : null;
    }

    const matches = this._computeMatches(tokenize(query));
    // CSS-driven visibility: the stylesheet hides items without data-filter-match.
    this._markMatches(matches);
    this.dataset.filtering = 'true';

    if (source === 'user') {
      // Auto-expand the groups that contain a match.
      for (const group of this._groups) {
        const key = group.dataset.groupKey;
        if (key && matches.has(group)) this._openSnapshot.add(key);
      }
      safeSet(DETAILS_KEY, serializeKeys(this._openSnapshot));
    }

    this._syncSnapshotAttr();
    this._setExpandedState(this._openSnapshot);
    this._updateStatus(matches.size === 0);
  }

  private _exitFilterMode(): void {
    delete this.dataset.filtering;
    for (const item of this._items) delete item.dataset.filterMatch;

    // Single-branch: return to the current page's branch, not to the groups that
    // were open before filtering, which may be a second branch.
    const restore = this._singleBranch
      ? this._activeBranchKeys()
      : (this._preFilterSnapshot ?? this._openSnapshot);

    if (restore) {
      this._setExpandedState(restore);
      safeSet(DETAILS_KEY, serializeKeys(restore));
    }

    this._openSnapshot = null;
    this._preFilterSnapshot = null;
    this._syncSnapshotAttr();
    this._ensureActiveAncestorsExpanded();
    this._updateStatus(false);
  }

  private _resetFilter(): void {
    this._pinScrollY();
    this._input!.value = '';
    this._syncClearButton('');
    safeRemove(FILTER_KEY);
    this._exitFilterMode();
  }

  /**
   * Matching items, plus their ancestors and, for a matching group, its descendants.
   * Walks the DOM instead of using the tree item API (`path`, `getChildren()`):
   * after client-side navigation this runs from connectedCallback, before the
   * tree items are upgraded.
   */
  private _computeMatches(tokens: string[]): Set<HTMLElement> {
    const matches = new Set<HTMLElement>();
    for (const item of this._items) {
      const path = itemPath(item);
      if (!tokens.every((token) => path.includes(token))) continue;
      matches.add(item);
      this._collectAncestors(item, matches);
      this._collectGroupDescendants(item, matches);
    }
    return matches;
  }

  private _collectAncestors(item: HTMLElement, out: Set<HTMLElement>): void {
    for (let node = item.parentElement; node && node !== this; node = node.parentElement) {
      if (node.matches(ITEM_SELECTOR)) out.add(node);
    }
  }

  private _collectGroupDescendants(item: HTMLElement, out: Set<HTMLElement>): void {
    if (!item.dataset.groupKey) return;
    for (const child of item.querySelectorAll<HTMLElement>(ITEM_SELECTOR)) out.add(child);
  }

  private _markMatches(matches: Set<HTMLElement>): void {
    for (const item of this._items) {
      if (matches.has(item)) item.dataset.filterMatch = 'true';
      else delete item.dataset.filterMatch;
    }
  }

  private _updateStatus(noMatches: boolean): void {
    const status = this._status;
    if (!status) return;
    status.textContent = noMatches ? (this.dataset.noResults ?? 'No topics match') : '';
  }

  private _syncClearButton(query: string): void {
    const clearButton = this._clearButton;
    if (clearButton) clearButton.hidden = !query;
  }

  //#endregion

  //#region Expand state

  /** Expands the groups in `openKeys` and collapses the rest. The current page's groups stay open. */
  private _setExpandedState(openKeys: Set<string>): void {
    this._withSuppressed(() => {
      for (const group of this._groups) {
        const key = group.dataset.groupKey;
        group.expanded =
          !!group.querySelector(ACTIVE_LINK_SELECTOR) || (!!key && openKeys.has(key));
      }
    });
  }

  /** Runs `fn` with event-driven persistence suppressed. */
  private _withSuppressed(fn: () => void): void {
    this._suppressPersist = true;
    try {
      fn();
    } finally {
      // The igcItem* events may fire after a render cycle; release on the next task.
      setTimeout(() => {
        this._suppressPersist = false;
      });
    }
  }

  private _syncSnapshotAttr(): void {
    if (this._openSnapshot) this.dataset.openSnapshot = serializeKeys(this._openSnapshot);
    else delete this.dataset.openSnapshot;
  }

  /** Keys of the groups that contain the current page. */
  private _activeBranchKeys(): Set<string> {
    const keys = new Set<string>();
    for (const group of this._groups) {
      const key = group.dataset.groupKey;
      if (key && group.querySelector(ACTIVE_LINK_SELECTOR)) keys.add(key);
    }
    return keys;
  }

  private _ensureActiveAncestorsExpanded(): void {
    const link = this.querySelector(ACTIVE_LINK_SELECTOR);
    for (let node = link?.parentElement; node && node !== this; node = node.parentElement) {
      if (node.matches(GROUP_SELECTOR)) (node as IgcTreeItemComponent).expanded = true;
    }
  }

  //#endregion

  //#region Scroll

  /**
   * Chrome scrolls the page when the filter changes the tree. Pin `scrollY` for
   * ~10 frames with `scroll-behavior: auto`, so each correction is an instant
   * jump, then restore the previous inline value.
   */
  private _pinScrollY(): void {
    const wasPinning = this._pinFrames > 0;
    this._pinFrames = 10;
    if (wasPinning) return;

    const y = window.scrollY;
    const { style } = document.documentElement;
    const previous = style.getPropertyValue('scroll-behavior');
    style.setProperty('scroll-behavior', 'auto', 'important');

    const tick = (): void => {
      if (window.scrollY !== y) window.scrollTo({ top: y, behavior: 'instant' });
      if (--this._pinFrames > 0) requestAnimationFrame(tick);
      else if (previous) style.setProperty('scroll-behavior', previous);
      else style.removeProperty('scroll-behavior');
    };
    tick();
  }

  private _restoreScroll(isClientNav: boolean): void {
    const container = this._scrollContainer;
    if (!container) return;

    if (isClientNav) {
      requestAnimationFrame(() => {
        if (!this.isConnected) return;
        container.scrollTo({ top: Number(safeGet(SCROLL_KEY)) || 0, behavior: 'instant' });
        container.style.visibility = '';
        // The new page's expand state may have moved the active item out of view.
        requestAnimationFrame(() => this._centerActiveIfHidden(container));
      });

      // Without a hash, DocsLayout scrolls the page to the top on astro:page-load, and
      // the returning header can push the active item below the viewport. Check again
      // then, unless the user has used the sidebar by now.
      let userInteracted = false;
      for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        this.addEventListener(
          type,
          () => {
            userInteracted = true;
          },
          { once: true, passive: true, signal: this._abortController?.signal },
        );
      }
      this._afterPageLoad(() => {
        if (userInteracted) return;
        // With a hash the page stays where it is, and DocsLayout has already sized
        // the sidebar for that position, footer included.
        if (!location.hash) this._fitToViewport();
        this._centerActiveIfHidden(container);
      });
      return;
    }

    // Hard load: wait for astro:page-load, which scrolls the page to the top
    // and sizes the sidebar, before centering the active item.
    this._afterPageLoad(() => {
      this._fitToViewport();
      container.style.visibility = '';
      const active = this.querySelector<HTMLElement>(ACTIVE_LINK_SELECTOR);
      if (active) this._scrollToCenter(active, container);
    });
  }

  private _centerActiveIfHidden(container: HTMLElement): void {
    const active = this.querySelector<HTMLElement>(ACTIVE_LINK_SELECTOR);
    if (active && !this._isElementVisible(active, container)) {
      this._scrollToCenter(active, container);
    }
  }

  /**
   * Sets the sidebar's max-height to the rest of the viewport now. After DocsLayout
   * scrolls the page to the top, it updates the height only on the next scroll
   * event, after the active item would be measured.
   */
  private _fitToViewport(): void {
    const sidebar = this.closest<HTMLElement>('.docs-sidebar');
    if (!sidebar) return;
    const top = sidebar.getBoundingClientRect().top;
    sidebar.style.maxHeight = `${Math.max(0, window.innerHeight - top)}px`;
  }

  /** Runs `fn` in the frame after the next `astro:page-load`, if still connected. */
  private _afterPageLoad(fn: () => void): void {
    document.addEventListener(
      'astro:page-load',
      () =>
        requestAnimationFrame(() => {
          if (this.isConnected) fn();
        }),
      { once: true, signal: this._abortController?.signal },
    );
  }

  /** Scrolls `container` so that `el` is vertically centered in it. */
  private _scrollToCenter(el: HTMLElement, container: HTMLElement): void {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    container.scrollTop +=
      elRect.top + elRect.height / 2 - (containerRect.top + containerRect.height / 2);
  }

  private _isElementVisible(el: HTMLElement, container: HTMLElement): boolean {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom;
  }

  //#endregion
}

if (!customElements.get('sidebar-filter')) {
  customElements.define('sidebar-filter', SidebarFilter);
}
