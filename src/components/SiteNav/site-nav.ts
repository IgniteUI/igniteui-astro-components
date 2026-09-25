/**
 * siteHeader.ts — behaviour for the v7 global header.
 *
 *   1. panels — open on CLICK, one at a time;
 *   2. the drawer — below the breakpoint, an accordion of the same sections;
 *   3. shared dismissal — Escape, outside clicks, focus leaving, and a reset
 *      when the viewport crosses the breakpoint.
 *
 * Open state is `aria-expanded` on the trigger + `hidden` on the panel, and
 * `data-panel-open` on `.nv`, which the page scrim keys off in CSS.
 */

/**
 * THE breakpoint, and the one value here that must stay in step with
 * `nav.css` — its `@media (max-width: 1040px)` block hides the bar items and
 * shows the burger. A media query rather than a pixel comparison, so it
 * resolves the viewport exactly the way the CSS does.
 */
const MOBILE_QUERY = '(max-width: 1040px)';

export function initSiteHeader(): void {
  const header = document.querySelector<HTMLElement>('.nv');
  if (!header) return;

  const mq = window.matchMedia(MOBILE_QUERY);
  const triggers = Array.from(header.querySelectorAll<HTMLButtonElement>('[data-nav-trigger]'));
  const panelFor = (key: string) => document.getElementById(`nav-panel-${key}`);
  const triggerFor = (key: string) =>
    header.querySelector<HTMLButtonElement>(`[data-nav-trigger="${key}"]`);

  let openKey: string | null = null;

  /* --- panels ------------------------------------------------------------ */

  const closePanel = () => {
    if (!openKey) return;
    panelFor(openKey)?.setAttribute('hidden', '');
    triggerFor(openKey)?.setAttribute('aria-expanded', 'false');
    openKey = null;
    header.removeAttribute('data-panel-open');
  };

  const openPanel = (key: string, fromKeyboard: boolean) => {
    /* Below the breakpoint the drawer owns every section except search, which
     * still opens under the bar — and takes the drawer's place. */
    if (mq.matches && key !== 'search') return;
    if (mq.matches) setSheet(false);
    if (openKey) closePanel();
    const panel = panelFor(key);
    if (!panel) return;
    panel.removeAttribute('hidden');
    triggerFor(key)?.setAttribute('aria-expanded', 'true');
    openKey = key;
    header.setAttribute('data-panel-open', '');

    if (key === 'search') {
      panel.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
    } else if (fromKeyboard) {
      /* Opened with Enter/Space: move into the panel, as the canvas does. A
       * pointer open leaves focus on the trigger, so the panel can be read
       * without the page jumping. */
      panel.querySelector<HTMLElement>('a[href], button')?.focus();
    }
  };

  /**
   * Panels open on click, never on hover.
   *
   * The canvas offers both and defaults to Click. Hover-opening a panel this
   * large drops it over the page whenever a pointer crosses the bar, and on
   * touch the synthesised `mouseenter` makes the first tap ambiguous. Clicking
   * the open trigger again closes it.
   *
   * `detail === 0` is a click the keyboard produced (Enter/Space on a button).
   */
  for (const t of triggers) {
    const key = t.dataset.navTrigger!;
    t.addEventListener('click', (e) => {
      if (openKey === key) closePanel();
      else openPanel(key, e.detail === 0);
    });
  }

  /* --- the drawer -------------------------------------------------------- */

  const sheet = document.querySelector<HTMLElement>('[data-mobile-sheet]');
  const burger = header.querySelector<HTMLButtonElement>('[data-nav-burger]');
  const sheetTriggers = Array.from(
    sheet?.querySelectorAll<HTMLButtonElement>('[data-sheet-trigger]') ?? [],
  );

  function setSheet(open: boolean) {
    if (!sheet) return;
    if (open) closePanel();
    sheet.hidden = !open;
    header!.toggleAttribute('data-sheet-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    /* The drawer covers the page; stop the page behind it scrolling too. */
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  burger?.addEventListener('click', () => setSheet(Boolean(sheet?.hidden ?? true)));

  /* One section at a time, so the drawer does not become one long scroll. */
  for (const t of sheetTriggers) {
    t.addEventListener('click', () => {
      const open = t.getAttribute('aria-expanded') !== 'true';
      for (const other of sheetTriggers) {
        other.setAttribute('aria-expanded', 'false');
        document.getElementById(other.getAttribute('aria-controls')!)?.setAttribute('hidden', '');
      }
      if (open) {
        t.setAttribute('aria-expanded', 'true');
        document.getElementById(t.getAttribute('aria-controls')!)?.removeAttribute('hidden');
      }
    });
  }

  /* --- shared dismissal -------------------------------------------------- */

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    /* Innermost thing first: an open panel, then the drawer. */
    if (openKey) {
      const trigger = triggerFor(openKey);
      closePanel();
      trigger?.focus();
    } else if (sheet && !sheet.hidden) {
      setSheet(false);
      burger?.focus();
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    if (!target) return;

    /* A link navigates away, so close behind it — invisible on a real
     * navigation, and it stops a panel hanging over a same-page anchor. */
    if (target.closest('a[href]')) {
      if (header.contains(target)) closePanel();
      if (sheet?.contains(target)) setSheet(false);
      return;
    }

    /* The scrim sits outside the header, so a click on it lands here too. */
    if (openKey && !header.contains(target)) closePanel();
  });

  /**
   * Focus leaving the open item — its trigger and its panel — closes it, so a
   * panel does not hang over the page (or the next trigger) once the user has
   * tabbed past it.
   */
  document.addEventListener('focusin', (e) => {
    if (!openKey) return;
    const el = e.target as Element | null;
    if (!el || el === document.body) return;
    const item = triggerFor(openKey)?.closest('.nv__item');
    if (item && !item.contains(el)) closePanel();
  });

  /**
   * Crossing the breakpoint resets everything. Rotating a tablet can cross
   * it, and a drawer left open would leave a stale `aria-expanded` on a button
   * that is no longer shown.
   */
  mq.addEventListener('change', () => {
    closePanel();
    setSheet(false);
  });
}
