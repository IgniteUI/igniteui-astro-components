/**
 * Shared types for the Faq / FaqItem pair.
 *
 * Kept in a plain module (instead of exported from Faq.astro) so FaqItem can
 * import them without creating a circular component import.
 */

/** Mirrors `ExpansionPanelIndicatorPosition` from igniteui-webcomponents. */
export type FaqIndicatorPosition = 'start' | 'end' | 'none';

/** A single question / answer pair in the data-driven `items` API. */
export interface FaqEntry {
  /** Header text — the question. */
  question: string;
  /** Answer body as an HTML string. Use slot mode for rich content. */
  answer?: string;
  /** Secondary header line rendered under the question. */
  subtitle?: string;
  /** Renders the panel expanded. @default false */
  open?: boolean;
  /** Non-interactive panel. @default false */
  disabled?: boolean;
  /** Overrides the list-level `indicatorPosition` for this entry. */
  indicatorPosition?: FaqIndicatorPosition;
  /** Forwarded to the `<igc-expansion-panel>` element. */
  id?: string;
}
