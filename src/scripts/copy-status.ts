/**
 * Screen-reader announcement for the copy-code buttons.
 *
 * Swapping the button's `aria-label` is not announced reliably while the
 * button keeps focus, so each copy affordance gets a visually hidden polite
 * live region next to it that receives the outcome ("Code copied", "Copy
 * failed"). Shared by CopyCode.astro (fenced blocks) and sample-widget.ts
 * (Sample code tabs).
 */
const REGION_CLASS = 'igd-copy-status';

// Inline so it works on any page, with or without the package stylesheet.
const HIDDEN_STYLE =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap';

function getRegion(host: HTMLElement): HTMLElement {
  let region = host.querySelector<HTMLElement>(`:scope > .${REGION_CLASS}`);
  if (!region) {
    region = document.createElement('span');
    region.className = REGION_CLASS;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.style.cssText = HIDDEN_STYLE;
    host.appendChild(region);
  }
  return region;
}

/** Announce `message` from a live region inside `host`; repeats are re-announced. */
export function announceCopyStatus(host: HTMLElement, message: string): void {
  const region = getRegion(host);
  region.textContent = '';
  // Re-insert on the next frame so an identical message (second copy) is announced again.
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/** Clear the region when the button returns to its idle state. */
export function clearCopyStatus(host: HTMLElement): void {
  const region = host.querySelector<HTMLElement>(`:scope > .${REGION_CLASS}`);
  if (region) region.textContent = '';
}
