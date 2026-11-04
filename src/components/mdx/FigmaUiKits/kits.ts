export interface FigmaUiKit {
  /** Visible link text: the theme name, e.g. `Material`. */
  label: string;
  /** Absolute URL of that kit's Figma Community file. */
  href: string;
}

/** The Infragistics Figma Community profile that lists every UI kit. */
export const FIGMA_UI_KITS_URL = 'https://www.figma.com/@infragistics';
