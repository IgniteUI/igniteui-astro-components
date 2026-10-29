/**
 * Icon Registry
 *
 * All .svg files in /assets/icons are registered automatically.
 * The icon name is derived from the filename: strip the .svg extension
 * and apply a small set of legacy aliases for names already used in markup.
 *
 * Usage in markup:
 *   <igc-icon name="link" collection="docs"></igc-icon>
 *
 * To add a new icon: drop the .svg file into src/assets/icons/ — that's it.
 */

import { registerIconFromText } from 'igniteui-webcomponents';
import { ICON_LIST, DOCS_COLLECTION } from './icon-manifest';

export { DOCS_COLLECTION };

export function registerIcons(): void {
  for (const { name, svg } of ICON_LIST) {
    registerIconFromText(name, svg, DOCS_COLLECTION);
  }
}

// Auto-register on import.
registerIcons();
