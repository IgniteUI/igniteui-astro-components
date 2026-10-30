import type { RawThemeSetting, ThemeRegistration, ThemeRegistrationRaw } from 'shiki';

/**
 * Options for {@link remapTheme}.
 */
export interface RemapThemeOptions {
  /** Theme id used by Shiki (`themes: { dark: '<name>' }`), e.g. `ig-dark`. */
  name: string;
  /** Human-readable name shown by tooling. Defaults to `name`. */
  displayName?: string;
  /**
   * Colour substitutions applied to every token rule of the base theme:
   * `{ '<base hex>': '<new hex>' }`. Matching is case-insensitive and an
   * alpha suffix on the base colour (`#e0def4e6`) is preserved.
   */
  colors: Record<string, string>;
  /**
   * Editor-level colours merged over the base theme's `colors` map. At the
   * very least set `editor.background` and `editor.foreground`: Shiki uses
   * them for the `<pre>` background / default text colour.
   */
  editorColors?: Record<string, string>;
  /**
   * Token rules appended after the remapped base rules. TextMate resolves
   * rules last-wins, so this is how a scope that has no colour slot in the
   * base theme (e.g. object-literal keys) gets one.
   */
  extraTokenColors?: RawThemeSetting[];
}

const HEX_RE = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

/**
 * Derive a new Shiki theme from a bundled one by swapping its colours.
 *
 * Pure: the base theme is deep-cloned (bundled themes are frozen) and never
 * mutated. Token *scopes* and font styles are inherited from the base, so the
 * derived theme keeps the base theme's highlighting decisions and only its
 * palette changes — a 9-entry colour table is enough to re-skin Rosé Pine.
 */
export function remapTheme(
  base: ThemeRegistration | ThemeRegistrationRaw,
  options: RemapThemeOptions,
): ThemeRegistrationRaw {
  const { name, displayName = name, colors, editorColors = {}, extraTokenColors = [] } = options;

  const lookup = new Map<string, string>();
  for (const [from, to] of Object.entries(colors)) lookup.set(from.toLowerCase(), to);

  const swap = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    const match = HEX_RE.exec(value);
    if (!match) return value;
    const replacement = lookup.get(`#${match[1]}`.toLowerCase());
    return replacement ? `${replacement}${match[2] ?? ''}` : value;
  };

  const theme = structuredClone(base) as ThemeRegistrationRaw & { tokenColors?: RawThemeSetting[] };

  const remapRules = (rules: RawThemeSetting[] | undefined): RawThemeSetting[] | undefined =>
    rules?.map((rule) => ({
      ...rule,
      settings: {
        ...rule.settings,
        ...(rule.settings?.foreground
          ? { foreground: swap(rule.settings.foreground) as string }
          : {}),
        ...(rule.settings?.background
          ? { background: swap(rule.settings.background) as string }
          : {}),
      },
    }));

  // VS Code themes use `tokenColors`; Shiki's own format uses `settings`.
  // Rosé Pine ships `tokenColors` but handle both so any bundled theme works.
  const tokenColors = remapRules(theme.tokenColors);
  const settings = remapRules(theme.settings);

  const editor: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors ?? {}))
    editor[key] = swap(value) as string;
  Object.assign(editor, editorColors);

  return {
    ...theme,
    name,
    displayName,
    colors: editor,
    ...(tokenColors ? { tokenColors: [...tokenColors, ...extraTokenColors] } : {}),
    ...(settings ? { settings: [...settings, ...(tokenColors ? [] : extraTokenColors)] } : {}),
  };
}
