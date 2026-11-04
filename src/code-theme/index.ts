/**
 * Brand Shiki theme for code snippets: Rosé Pine Moon recoloured with the
 * API Docs Figma palette (`api-snippet`, mode=dark).
 *
 * `createDocsSite()` applies `igShikiConfig` by default. See README.md in this
 * folder for manual usage (`<Code>`, `codeToHtml`).
 */
import type { ShikiConfig } from 'astro';
import type { ThemeRegistration } from 'shiki';
import rosePineMoon from '@shikijs/themes/rose-pine-moon';

/** Object-literal, JSON and YAML keys and `obj.prop` access: Rosé Pine leaves them on the default text colour. */
const PROPERTY_KEY_SCOPES = [
  'meta.object-literal.key',
  'support.type.property-name.json',
  'entity.name.tag.yaml',
  'variable.other.property',
  'variable.other.object.property',
];

/** Dark brand theme. Rosé Pine colour → brand colour, scopes and font styles unchanged. */
export const igCodeTheme: ThemeRegistration = {
  ...rosePineMoon,
  name: 'ig-dark',
  displayName: 'Ignite UI Dark',
  colors: {
    ...rosePineMoon.colors,
    'editor.background': '#00142b',
    'editor.foreground': '#d2dbe8',
  },
  colorReplacements: {
    '#e0def4': '#a9b8cc', // text: identifiers
    '#908caa': '#d2dbe8', // subtle: punctuation
    '#6e6a86': '#7d91ab', // muted: comments
    '#3e8fb0': '#0a7aff', // pine: keywords (Figma #0176ff, lightened to pass AA)
    '#f6c177': '#f95924', // gold: strings
    '#ea9a97': '#ffa685', // rose: numbers, booleans, declared names
    '#9ccfd8': '#66adff', // foam: tags, types
    '#c4a7e7': '#99c9ff', // iris: attributes, parameters
    '#eb6f92': '#ff4d25', // love: invalid, built-in functions
  },
  tokenColors: [
    ...(rosePineMoon.tokenColors ?? []),
    { scope: PROPERTY_KEY_SCOPES, settings: { foreground: '#66adff' } },
    // Keep a comment's `//` / `/* */` as muted as its text.
    {
      scope: ['punctuation.definition.comment'],
      settings: { foreground: '#7d91ab', fontStyle: 'italic' },
    },
  ],
};

/** Drop-in `markdown.shikiConfig` for Astro. */
export const igShikiConfig: ShikiConfig = {
  theme: igCodeTheme,
  wrap: true,
};
