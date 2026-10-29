/**
 * Playground-only lab for issue #136: one open branch at a time in the sidebar.
 *
 * Adds a switcher to every page that compares three modes:
 *   • off    — today's sidebar: any number of groups can stay open.
 *   • native — igc-tree's own `singleBranchExpand`, which the issue proposes.
 *              Setting it after load has the same effect as rendering
 *              `<igc-tree single-branch-expand>`: the tree has no active item,
 *              so it collapses every group.
 *   • custom — single-branch kept by the sidebar instead: only the current
 *              page's branch is open, a user expand collapses the other
 *              groups, and the rule is off while the filter is active.
 *
 * The mode is kept in localStorage, and switching reloads the page.
 */
import type { IgcTreeComponent, IgcTreeItemComponent } from 'igniteui-webcomponents';

type Mode = 'off' | 'native' | 'custom';

const MODE_KEY = 'playground-single-branch-mode';
const DETAILS_KEY = 'sidebar-filter-details';
const GROUP_SELECTOR = 'igc-tree-item[data-group-key]';

const MODES: { mode: Mode; label: string; hint: string }[] = [
  {
    mode: 'off',
    label: 'Off',
    hint: 'Today’s sidebar: any number of groups can stay open.',
  },
  {
    mode: 'native',
    label: 'igc-tree property',
    hint: 'The issue’s proposal. Every group collapses on load, even the current page’s. Filter for “e”, then expand a group: the other matches collapse.',
  },
  {
    mode: 'custom',
    label: 'Sidebar-managed',
    hint: 'Only the current page’s branch is open. Expanding a group collapses the others, except while the filter is active. Clearing the filter returns to the current page’s branch.',
  },
];

const readMode = (): Mode => {
  try {
    const mode = localStorage.getItem(MODE_KEY);
    return mode === 'native' || mode === 'custom' ? mode : 'off';
  } catch {
    return 'off';
  }
};

const writeMode = (mode: Mode): void => {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* private mode */
  }
};

/** The item and its ancestor groups. */
const branchOf = (item: Element | null): Set<Element> => {
  const branch = new Set<Element>();
  for (let node = item; node; node = node.parentElement?.closest(GROUP_SELECTOR) ?? null) {
    branch.add(node);
  }
  return branch;
};

const groupsOf = (host: Element) => [
  ...host.querySelectorAll<IgcTreeItemComponent>(GROUP_SELECTOR),
];

/** Custom mode: a user expand collapses every open group outside the new branch. */
const onItemExpanding = (event: Event): void => {
  const host = event.currentTarget as HTMLElement;
  // The filter opens every group with a match; don't fight it.
  if (host.dataset.filtering) return;

  const keep = branchOf((event as CustomEvent<IgcTreeItemComponent>).detail);
  for (const group of groupsOf(host)) {
    if (group.expanded && !keep.has(group)) void group.collapseWithEvent();
  }
};

/** Custom mode: open only the current page's branch, as the server would render it. */
const keepActiveBranchOnly = (host: HTMLElement): void => {
  if (host.dataset.filtering) return;
  const active = host.querySelector('a[aria-current="page"]')?.closest(GROUP_SELECTOR);
  if (!active) return;

  const keep = branchOf(active);
  for (const group of groupsOf(host)) group.expanded = keep.has(group);
  try {
    sessionStorage.setItem(
      DETAILS_KEY,
      [...keep].map((group) => (group as HTMLElement).dataset.groupKey).join('\n'),
    );
  } catch {
    /* quota */
  }
};

function renderSwitcher(current: Mode): void {
  document.getElementById('single-branch-lab')?.remove();

  const panel = document.createElement('section');
  panel.id = 'single-branch-lab';
  panel.setAttribute('aria-label', 'Single-branch sidebar lab');
  panel.innerHTML = `
    <strong>Issue #136: single-branch sidebar</strong>
    <div class="lab-modes" role="group" aria-label="Mode"></div>
    <p class="lab-hint"></p>
    <style>
      #single-branch-lab {
        position: fixed;
        inset-block-end: 16px;
        inset-inline-end: 16px;
        z-index: 1000;
        display: grid;
        gap: 8px;
        max-inline-size: 340px;
        padding: 12px 14px;
        border: 1px solid var(--ig-gray-300, #ccc);
        border-radius: 8px;
        background: var(--ig-surface-500, #fff);
        color: var(--ig-gray-900, #222);
        box-shadow: 0 4px 16px rgb(0 0 0 / 0.15);
        font: 13px/1.4 system-ui, sans-serif;
      }
      #single-branch-lab .lab-modes { display: flex; flex-wrap: wrap; gap: 4px; }
      #single-branch-lab button {
        padding: 4px 10px;
        border: 1px solid var(--ig-gray-400, #aaa);
        border-radius: 4px;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      #single-branch-lab button[aria-pressed='true'] {
        border-color: var(--ig-primary-500, #0d6efd);
        background: var(--ig-primary-500, #0d6efd);
        color: var(--ig-primary-500-contrast, #fff);
      }
      #single-branch-lab .lab-hint { margin: 0; color: var(--ig-gray-700, #555); }
    </style>`;

  const buttons = panel.querySelector('.lab-modes')!;
  for (const { mode, label } of MODES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(mode === current));
    button.addEventListener('click', () => {
      if (mode === current) return;
      writeMode(mode);
      location.reload();
    });
    buttons.append(button);
  }
  panel.querySelector('.lab-hint')!.textContent = MODES.find((m) => m.mode === current)!.hint;

  document.body.append(panel);
}

async function applyMode(): Promise<void> {
  const mode = readMode();
  renderSwitcher(mode);

  const host = document.querySelector<HTMLElement>('sidebar-filter');
  const tree = host?.querySelector<IgcTreeComponent>('igc-tree[data-variant="sidebar"]');
  if (!host || !tree) return;

  await customElements.whenDefined('igc-tree-item');

  if (mode === 'native') {
    tree.singleBranchExpand = true;
  } else if (mode === 'custom') {
    host.addEventListener('igcItemExpanding', onItemExpanding);
    keepActiveBranchOnly(host);
    // Clearing the filter restores the groups open before it, and the sidebar
    // also forces the current page's group open, which can make two branches.
    new MutationObserver(() => {
      if (!host.dataset.filtering) keepActiveBranchOnly(host);
    }).observe(host, { attributeFilter: ['data-filtering'] });
  }
}

// The router swaps the sidebar on every navigation, so this runs per page.
document.addEventListener('astro:page-load', () => void applyMode());
