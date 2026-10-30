export interface FigmaUiKit {
  /** Visible link text — the theme name, e.g. `Material`. */
  label: string;
  /** Absolute URL of the kit in the Figma Community. */
  href: string;
}

/**
 * The Ignite UI kits in the Figma Community, one per theme. Topics normally
 * take these defaults so every page links to the same files; update the URLs
 * here when a kit is republished.
 */
export const DEFAULT_FIGMA_UI_KITS: FigmaUiKit[] = [
  { label: 'Material', href: 'https://www.figma.com/@infragistics' },
  { label: 'Fluent', href: 'https://www.figma.com/@infragistics' },
  { label: 'Bootstrap', href: 'https://www.figma.com/@infragistics' },
  { label: 'Indigo', href: 'https://www.figma.com/@infragistics' },
];
