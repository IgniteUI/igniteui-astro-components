/** Visually hidden live region that announces the copy-code result to screen readers. */
const REGION_CLASS = 'igd-copy-status';

// Visually hidden styles, set inline.
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

/** Announces `message` from the live region inside `host`. */
export function announceCopyStatus(host: HTMLElement, message: string): void {
  const region = getRegion(host);
  region.textContent = '';
  // Sets the text on the next frame so a repeated message is announced again.
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/** Clears the live region inside `host`. */
export function clearCopyStatus(host: HTMLElement): void {
  const region = host.querySelector<HTMLElement>(`:scope > .${REGION_CLASS}`);
  if (region) region.textContent = '';
}
