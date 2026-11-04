export interface FigmaUiKit {
  /** Visible link text: the theme name, e.g. `Material`. */
  label: string;
  /** Absolute URL of that kit's Figma Community file. */
  href: string;
}

/** The Indigo.Design UI kits in the Figma Community, one per theme. */
export const DEFAULT_FIGMA_UI_KITS: FigmaUiKit[] = [
  {
    label: 'Material',
    href: 'https://www.figma.com/community/file/1185626590778033159/indigo-design-ui-kit-for-material-1-6',
  },
  {
    label: 'Fluent',
    href: 'https://www.figma.com/community/file/1462017953809232530/indigo-design-ui-kit-for-fluent-1-6',
  },
  {
    label: 'Bootstrap',
    href: 'https://www.figma.com/community/file/1462018085772322451/indigo-design-ui-kit-for-bootstrap-1-6',
  },
  {
    label: 'Indigo',
    href: 'https://www.figma.com/community/file/1462018383079963285/indigo-design-ui-kit-for-indigo-1-6',
  },
];
