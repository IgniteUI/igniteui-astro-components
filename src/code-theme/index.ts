/**
 * Brand Shiki themes for code snippets.
 *
 * Two themes — `ig-dark` (from Rosé Pine Moon) and `ig-light` (from Rosé Pine
 * Dawn) — recoloured with the palette in ./palette.ts, plus the ready-made
 * Astro `shikiConfig` that renders both at once so the page's `color-scheme`
 * picks the right one with no reload (see src/styles/global/_code-blocks.scss).
 *
 * `createDocsSite()` applies `igShikiConfig` by default. See README.md in this
 * folder for manual usage (`<Code>`, `createHighlighter`, overriding).
 */
import type { ShikiConfig } from 'astro';
import type { RawThemeSetting, ThemeRegistrationRaw } from 'shiki';
import rosePineMoon from '@shikijs/themes/rose-pine-moon';
import rosePineDawn from '@shikijs/themes/rose-pine-dawn';
import { remapTheme } from './remap-theme';
import {
  IG_CODE_DARK,
  IG_CODE_LIGHT,
  ROSE_PINE_DAWN_SLOTS,
  ROSE_PINE_MOON_SLOTS,
  type CodePalette,
  type RosePineSlot,
} from './palette';

export { remapTheme, type RemapThemeOptions } from './remap-theme';
export {
  IG_CODE_DARK,
  IG_CODE_LIGHT,
  ROSE_PINE_DAWN_SLOTS,
  ROSE_PINE_MOON_SLOTS,
  type CodePalette,
  type RosePineSlot,
} from './palette';

/** Theme ids — what `codeToHtml({ themes })` and `<Code themes>` refer to. */
export const IG_CODE_THEME_DARK = 'ig-dark';
export const IG_CODE_THEME_LIGHT = 'ig-light';

/**
 * Scopes that Rosé Pine leaves on the default foreground but the design
 * colours as "property keys": object-literal keys in TS/JS, JSON keys, YAML
 * keys and `obj.prop` member access.
 */
const PROPERTY_KEY_SCOPES = [
  'meta.object-literal.key',
  'support.type.property-name.json',
  'entity.name.tag.yaml',
  'variable.other.property',
  'variable.other.object.property',
];

function slotMap(base: Record<RosePineSlot, string>, palette: CodePalette): Record<string, string> {
  const map: Record<string, string> = {};
  for (const slot of Object.keys(base) as RosePineSlot[]) map[base[slot]] = palette.slots[slot];
  return map;
}

function buildTheme(
  base: typeof rosePineMoon,
  baseSlots: Record<RosePineSlot, string>,
  palette: CodePalette,
  name: string,
  displayName: string,
): ThemeRegistrationRaw {
  const extraTokenColors: RawThemeSetting[] = [
    { scope: PROPERTY_KEY_SCOPES, settings: { foreground: palette.propertyKey } },
    // Rosé Pine colours the `//` / `/* */` of a comment as punctuation
    // (`subtle`), brighter than the comment text; keep the whole comment muted.
    {
      scope: ['punctuation.definition.comment'],
      settings: { foreground: palette.slots.muted, fontStyle: 'italic' },
    },
  ];
  return remapTheme(base, {
    name,
    displayName,
    colors: slotMap(baseSlots, palette),
    editorColors: {
      'editor.background': palette.background,
      'editor.foreground': palette.foreground,
    },
    extraTokenColors,
  });
}

/** Dark brand theme (Rosé Pine Moon recoloured). */
export const igCodeThemeDark: ThemeRegistrationRaw = buildTheme(
  rosePineMoon,
  ROSE_PINE_MOON_SLOTS,
  IG_CODE_DARK,
  IG_CODE_THEME_DARK,
  'Ignite UI Dark',
);

/** Light brand theme (Rosé Pine Dawn recoloured). */
export const igCodeThemeLight: ThemeRegistrationRaw = buildTheme(
  rosePineDawn,
  ROSE_PINE_DAWN_SLOTS,
  IG_CODE_LIGHT,
  IG_CODE_THEME_LIGHT,
  'Ignite UI Light',
);

/**
 * Dual-theme map for Astro's `<Code themes={…}>` and Shiki's
 * `codeToHtml({ themes })` / `createHighlighter({ themes: Object.values(…) })`.
 */
export const igShikiThemes = { light: igCodeThemeLight, dark: igCodeThemeDark } as const;

/**
 * Drop-in `markdown.shikiConfig` for Astro. `defaultColor: false` makes Shiki
 * emit only `--shiki-light` / `--shiki-dark` custom properties (no inline
 * colours), and the package CSS resolves them with `light-dark()`.
 */
export const igShikiConfig: ShikiConfig = {
  themes: igShikiThemes,
  defaultColor: false,
  wrap: true,
};
