/**
 * Full-text tooltip for truncated sidebar labels.
 *
 * Leaf labels (`.docs-tree-label`) are clamped to two lines in
 * DocsTree/docs-tree.scss. When a label overflows that clamp, hovering or
 * focusing its row shows the complete text in a single shared <igc-tooltip>
 * so the user can read it before navigating. Rows whose label fits never
 * trigger the tooltip.
 *
 * Design:
 *   • One tooltip per sidebar, re-anchored to the hovered/focused row with
 *     `tooltip.show(row)`. Hundreds of per-item tooltips would be wasteful.
 *   • The tooltip's own triggers are disabled (`show-triggers=""`,
 *     `hide-triggers=""`); this module owns show/hide so the truncation
 *     check runs on every interaction and stays correct after resizes.
 *   • Truncation is measured, not guessed: `scrollHeight > clientHeight` on
 *     the clamped label. Works for -webkit-line-clamp and plain overflow.
 *   • Hides on pointer leave, focus leave, click (navigation), sidebar scroll
 *     and `astro:before-swap`.
 *   • Mobile/tablet (< 1280px): docs-tree.scss removes the clamp so labels
 *     show in full; nothing measures as truncated and the tooltip never opens.
 */

import type { IgcTooltipComponent } from 'igniteui-webcomponents';

const TOOLTIP_SELECTOR = 'igc-tooltip[data-sidebar-tooltip]';
const SCROLL_SELECTOR = '[data-sidebar-scroll]';
const ITEM_SELECTOR = 'igc-tree-item';
const LABEL_SELECTOR = ':scope > [slot="label"] .docs-tree-label';

/** Delay before showing, mirrors igc-tooltip's default `show-delay`. */
const SHOW_DELAY = 200;

/** 1px tolerance for sub-pixel rounding between scrollHeight and clientHeight. */
const OVERFLOW_TOLERANCE = 1;

const isTruncated = (el: HTMLElement): boolean =>
  el.scrollHeight - el.clientHeight > OVERFLOW_TOLERANCE;

/** The row's own label (not a descendant row's), or null for group rows. */
const getRowLabel = (row: Element): HTMLElement | null =>
  row.querySelector<HTMLElement>(LABEL_SELECTOR);

export class SidebarTooltip {
  private readonly host: HTMLElement;
  private readonly tooltip: IgcTooltipComponent;
  private readonly abort = new AbortController();
  private pendingTimer: ReturnType<typeof setTimeout> | undefined;
  private currentRow: Element | null = null;
  /**
   * Row the user just clicked. Clicking focuses the row (see DocsTree.astro),
   * and that focusin must not re-open the tooltip over a page that is about
   * to navigate. Cleared once the pointer leaves the row.
   */
  private suppressedRow: Element | null = null;

  constructor(host: HTMLElement, tooltip: IgcTooltipComponent) {
    this.host = host;
    this.tooltip = tooltip;

    const { signal } = this.abort;
    const opts: AddEventListenerOptions = { passive: true, signal };

    host.addEventListener('pointerover', this.onPointerOver, opts);
    host.addEventListener('pointerout', this.onPointerOut, opts);
    // igc-tree-item delegates focus to the slotted <a> and calls
    // stopPropagation() on focusin/focusout inside its shadow root, so the
    // host only ever sees these events in the capture phase.
    host.addEventListener('focusin', this.onFocusIn, { capture: true, ...opts });
    host.addEventListener('focusout', this.onFocusOut, { capture: true, ...opts });
    host.addEventListener('click', this.onClick, { capture: true, ...opts });
    host.querySelector(SCROLL_SELECTOR)?.addEventListener('scroll', this.hide, opts);
    // The host is replaced on client-side navigation; drop everything then.
    document.addEventListener('astro:before-swap', () => this.destroy(), { signal });
  }

  destroy(): void {
    this.hide();
    this.abort.abort();
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private onPointerOver = (e: PointerEvent): void => {
    const row = (e.target as Element | null)?.closest(ITEM_SELECTOR);
    if (!row || row === this.currentRow) return;
    if (row !== this.suppressedRow) this.suppressedRow = null;
    this.scheduleShow(row);
  };

  private onPointerOut = (e: PointerEvent): void => {
    const row = (e.target as Element | null)?.closest(ITEM_SELECTOR);
    if (!row) return;
    // Still inside the same row (moved between its child elements)?
    const to = e.relatedTarget as Element | null;
    if (to && row.contains(to) && to.closest(ITEM_SELECTOR) === row) return;
    if (row === this.suppressedRow) this.suppressedRow = null;
    if (row === this.currentRow) this.hide();
  };

  private onClick = (e: MouseEvent): void => {
    this.suppressedRow = (e.target as Element | null)?.closest(ITEM_SELECTOR) ?? null;
    this.hide();
  };

  private onFocusIn = (e: FocusEvent): void => {
    const row = (e.target as Element | null)?.closest(ITEM_SELECTOR);
    if (!row) return;
    this.scheduleShow(row);
  };

  private onFocusOut = (e: FocusEvent): void => {
    const to = e.relatedTarget as Element | null;
    if (to && to.closest(ITEM_SELECTOR) === this.currentRow) return;
    this.hide();
  };

  // ── Show / hide ───────────────────────────────────────────────────────────

  private scheduleShow(row: Element): void {
    this.cancelPending();
    if (row === this.suppressedRow) return;
    const label = getRowLabel(row);
    if (!label || !isTruncated(label)) {
      // Moving from a truncated row to a non-truncated one: drop the old tooltip.
      if (this.currentRow && this.currentRow !== row) this.hide();
      return;
    }

    const text = label.textContent?.trim() ?? '';
    if (!text) return;

    this.currentRow = row;
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = undefined;
      if (this.currentRow !== row) return;
      this.tooltip.message = text;
      void this.tooltip.show(row);
    }, SHOW_DELAY);
  }

  private hide = (): void => {
    this.cancelPending();
    this.currentRow = null;
    if (this.tooltip.open) void this.tooltip.hide();
  };

  private cancelPending(): void {
    if (this.pendingTimer !== undefined) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = undefined;
    }
  }
}

// ── Bootstrap ───────────────────────────────────────────────────────────────

const instances = new WeakMap<HTMLElement, SidebarTooltip>();

/** Attach a SidebarTooltip to every sidebar on the page that has one declared. */
export function initSidebarTooltips(root: ParentNode = document): void {
  root.querySelectorAll<IgcTooltipComponent>(TOOLTIP_SELECTOR).forEach((tooltip) => {
    const host = tooltip.closest<HTMLElement>('sidebar-filter');
    if (!host || instances.has(host)) return;
    instances.set(host, new SidebarTooltip(host, tooltip));
  });
}

const bootstrap = () => {
  customElements.whenDefined('igc-tooltip').then(() => initSidebarTooltips());
};

bootstrap();
document.addEventListener('astro:page-load', bootstrap);
