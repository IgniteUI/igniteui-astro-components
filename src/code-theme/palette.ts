/**
 * Brand code-snippet palette — the ONLY file to edit when the look of code
 * snippets changes. Everything else (theme building, CSS tokens) derives from it.
 *
 * Source of truth: API Docs Figma design, frame `api-snippet` (`mode=dark`,
 * `mode=light`) — https://www.figma.com/design/IUHHGeS3LIPHL7JWaDYwbt/API-Docs-Design?node-id=2243-2487
 *
 * The themes are Shiki's bundled Rosé Pine Moon (dark) and Rosé Pine Dawn
 * (light) with the nine Rosé Pine colour slots swapped for brand colours.
 * Rosé Pine's scope → slot assignments are inherited, so to recolour e.g.
 * keywords change `pine`, strings change `gold`, and so on:
 *
 *   slot    Rosé Pine role                          typical scopes
 *   ------  --------------------------------------  -------------------------------------------
 *   text    default foreground, braces, variables   variable.other, meta.brace, meta.tag
 *   subtle  punctuation                             punctuation, meta.tag.other.html
 *   muted   comments (italic)                       comment
 *   pine    keywords / storage / import-export      keyword, storage, constant, meta.import
 *   gold    strings                                 string, support.constant, css values
 *   rose    numbers, booleans, declared names       constant.numeric, constant.language, entity.name, variable
 *   foam    tags, types, namespaces, css props      entity.name.tag, entity.name.type, support
 *   iris    attribute names, parameters             entity.other.attribute-name, variable.parameter
 *   love    invalid, built-in functions             invalid, support.function, markup.deleted
 *
 * Roles the Figma design specifies explicitly are marked `Figma`; the rest are
 * brand shades chosen to sit well with them and are free to tune.
 */

export type RosePineSlot =
  'text' | 'subtle' | 'muted' | 'pine' | 'gold' | 'rose' | 'foam' | 'iris' | 'love';

export interface CodePalette {
  /** `<pre>` background (also `editor.background` in the theme). */
  background: string;
  /** Default text colour for unscoped tokens (`editor.foreground`). */
  foreground: string;
  /** Replacement for each Rosé Pine colour slot. */
  slots: Record<RosePineSlot, string>;
  /** Object-literal / JSON / YAML keys — not a Rosé Pine slot, added as an extra rule. */
  propertyKey: string;
}

/** Rosé Pine Moon slot values as shipped by Shiki (`@shikijs/themes/rose-pine-moon`). */
export const ROSE_PINE_MOON_SLOTS: Record<RosePineSlot, string> = {
  text: '#e0def4',
  subtle: '#908caa',
  muted: '#6e6a86',
  pine: '#3e8fb0',
  gold: '#f6c177',
  rose: '#ea9a97',
  foam: '#9ccfd8',
  iris: '#c4a7e7',
  love: '#eb6f92',
};

/** Rosé Pine Dawn slot values as shipped by Shiki (`@shikijs/themes/rose-pine-dawn`). */
export const ROSE_PINE_DAWN_SLOTS: Record<RosePineSlot, string> = {
  text: '#575279',
  subtle: '#797593',
  muted: '#9893a5',
  pine: '#286983',
  gold: '#ea9d34',
  rose: '#d7827e',
  foam: '#56949f',
  iris: '#907aa9',
  love: '#b4637a',
};

/** Dark snippet — Figma `api-snippet / mode=dark`. */
export const IG_CODE_DARK: CodePalette = {
  background: '#00142b', // Figma
  foreground: '#d2dbe8', // Figma — base text
  slots: {
    text: '#a9b8cc', // Figma — identifiers (ApplicationConfig, appConfig, …)
    subtle: '#d2dbe8', // Figma — punctuation reads as base text
    muted: '#7d91ab', // comments
    pine: '#0176ff', // Figma — keywords (import, from, export const)
    gold: '#f95924', // Figma — strings
    rose: '#ffa685', // numbers / booleans / declared names (secondary-300)
    foam: '#66adff', // Figma — property-key blue, also tags/types
    iris: '#99c9ff', // attribute names / parameters
    love: '#ff4d25', // invalid / built-in functions (secondary A700)
  },
  propertyKey: '#66adff', // Figma — `providers:`, `apiKey:`
};

/**
 * Light snippet — Figma `api-snippet / mode=light`.
 *
 * ⚠ Contrast: the Figma values for `text`/`subtle` (#7d91ab ≈ 3.3:1) and
 * `foam`/`propertyKey` (#66adff ≈ 2.4:1) on #f3f6fa are below WCAG AA (4.5:1)
 * for 14px text. They are kept as designed on purpose; retune here once the
 * design team signs off on darker shades (e.g. text #536781, foam #0a5bc4).
 */
export const IG_CODE_LIGHT: CodePalette = {
  background: '#f3f6fa', // Figma
  foreground: '#7d91ab', // Figma — base text
  slots: {
    text: '#7d91ab', // Figma — identifiers
    subtle: '#7d91ab', // Figma — punctuation
    muted: '#a9b8cc', // comments
    pine: '#0176ff', // Figma — keywords
    gold: '#f95924', // Figma — strings
    rose: '#e04f1f', // numbers / booleans / declared names (secondary-600)
    foam: '#66adff', // Figma — property-key blue, also tags/types
    iris: '#3392ff', // attribute names / parameters
    love: '#c6451b', // invalid / built-in functions (secondary-700)
  },
  propertyKey: '#66adff', // Figma
};
