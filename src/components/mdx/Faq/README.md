# Faq

Question / answer list built on `<igc-accordion>` +
`<igc-expansion-panel>` from `igniteui-webcomponents`.

Two components ship together:

- **`Faq.astro`** — owns the `<igc-accordion>` (grouping + keyboard navigation).
- **`FaqItem.astro`** — one `<igc-expansion-panel>`; the question is the header,
  the default slot is the answer.

Styling is driven entirely by `--igd-faq-*` custom properties declared in
`src/styles/global/_variables.scss`. `Faq.scss` maps each of them onto the
corresponding `--ig-expansion-panel-*` theme property, so consumers never
touch the Ignite UI variables directly.

## Usage — slot mode (preferred)

Rich answers: markdown, links, code blocks, other components.

```astro
---
import Faq from 'igniteui-astro-components/components/mdx/Faq.astro';
import FaqItem from 'igniteui-astro-components/components/mdx/FaqItem.astro';
---

<Faq singleExpand>
  <FaqItem question="How do I install the package?" open>
    Run <code>npm install igniteui-webcomponents</code>.
  </FaqItem>
  <FaqItem question="Is it free?" subtitle="Licensing" indicatorPosition="end">
    The core components are open source; some are part of a paid license.
  </FaqItem>
</Faq>
```

## Usage — data mode

Short, static copy. `answer` is injected as an HTML string.

```astro
---
import Faq from 'igniteui-astro-components/components/mdx/Faq.astro';
import type { FaqEntry } from 'igniteui-astro-components/components/mdx/Faq/types';

const items: FaqEntry[] = [
  { question: 'How do I install the package?', answer: 'Run <code>npm i</code>.' },
  { question: 'Is it free?', answer: 'The core components are open source.' },
];
---

<Faq {items} singleExpand indicatorPosition="end" />
```

Both modes render into the same accordion, so they can be mixed — `items`
entries render first, slotted `<FaqItem>`s after.

## Usage in MDX

Import the components in the MDX body, then use them as JSX. Leave a blank
line around markdown content so it is parsed as markdown rather than raw text.

````mdx
---
title: FAQ
---

import Faq from 'igniteui-astro-components/components/mdx/Faq.astro';
import FaqItem from 'igniteui-astro-components/components/mdx/FaqItem.astro';

## Frequently asked questions

<Faq singleExpand>
  <FaqItem question="How do I install the package?" open>

    Install it from npm:

    ```bash
    npm install igniteui-webcomponents
    ```

  </FaqItem>

  <FaqItem question="Which browsers are supported?">

    The last two versions of every evergreen browser. See the
    [browser support](/getting-started) page.

  </FaqItem>
</Faq>
````

## Props — `Faq`

| Prop                     | Type                         | Default | Notes                                                                                                                              |
| ------------------------ | ---------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `items`                  | `FaqEntry[]`                 | —       | Data-driven entries. Omit for slot mode.                                                                                           |
| `singleExpand`           | `boolean`                    | `false` | → `igc-accordion[single-expand]`. Only one answer open at once.                                                                    |
| `indicatorPosition`      | `'start' \| 'end' \| 'none'` | `start` | Applies to `items` entries only — see the note below.                                                                              |
| `class`                  | `string`                     | —       | Forwarded to `<igc-accordion>`.                                                                                                    |
| `id`, `aria-*`, `data-*` | `string`                     | —       | Spread onto `<igc-accordion>`. Enumerated in `Props` (no open index signature) so typos in the named props above stay type errors. |

## Props — `FaqItem`

| Prop                     | Type                         | Default | Notes                                                                              |
| ------------------------ | ---------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `question`               | `string`                     | —       | Required. Rendered in the panel's `title` slot.                                    |
| `subtitle`               | `string`                     | —       | Optional second header line (`subtitle` slot).                                     |
| `answer`                 | `string`                     | —       | HTML string answer, rendered as the slot's fallback — slotted content always wins. |
| `open`                   | `boolean`                    | `false` | → `igc-expansion-panel[open]`.                                                     |
| `disabled`               | `boolean`                    | `false` | → `igc-expansion-panel[disabled]`. Skipped by keyboard nav.                        |
| `indicatorPosition`      | `'start' \| 'end' \| 'none'` | `start` | → `igc-expansion-panel[indicator-position]`.                                       |
| `class`                  | `string`                     | —       | Forwarded to `<igc-expansion-panel>`.                                              |
| `id`, `aria-*`, `data-*` | `string`                     | —       | Spread onto `<igc-expansion-panel>`. Enumerated in `Props`, same as above.         |

The `indicator` and `indicator-expanded` slots are forwarded, so the default
chevron can be replaced per item:

```astro
<FaqItem question="Custom indicator">
  <igc-icon slot="indicator" name="chevron" collection="docs"></igc-icon>
  Answer body.
</FaqItem>
```

### Why `indicatorPosition` on `Faq` only covers `items`

`indicator-position` is a property of each panel, and Astro cannot pass props
into slotted children at build time. In slot mode set it on each `<FaqItem>`;
in data mode `Faq` forwards its value (an entry's own `indicatorPosition`
wins).

## Runtime API

`Faq` renders a real `<igc-accordion>`, so the library API is available on the
element itself:

```ts
const faq = document.querySelector('igc-accordion.igd-faq')!;
faq.showAll();
faq.hideAll();
faq.singleExpand = true;
faq.panels; // IgcExpansionPanelComponent[]
```

Each panel emits `igcOpening` / `igcOpened` / `igcClosing` / `igcClosed`.

## Theming tokens

| Token                             | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `--igd-faq-gap`                   | Vertical gap between questions.            |
| `--igd-faq-margin-bottom`         | Space below the whole list.                |
| `--igd-faq-spacing`               | Density — see below.                       |
| `--igd-faq-border-*`              | Width / style / colour / radius of a card. |
| `--igd-faq-open-border-color`     | Border colour while a panel is open.       |
| `--igd-faq-header-bg`             | Question row background.                   |
| `--igd-faq-header-focus-bg`       | Question row background on focus.          |
| `--igd-faq-body-bg`               | Answer background.                         |
| `--igd-faq-question-color`        | Question text colour.                      |
| `--igd-faq-subtitle-color`        | Subtitle text colour.                      |
| `--igd-faq-answer-color`          | Answer text colour.                        |
| `--igd-faq-indicator-color`       | Chevron colour.                            |
| `--igd-faq-disabled-color`        | Question / chevron colour when disabled.   |
| `--igd-faq-disabled-bg`           | Card background when disabled.             |
| `--igd-faq-disabled-border-color` | Card border when disabled.                 |

### Never re-state a bridged colour in the light DOM

`Faq.scss` sets colours **only** as `--ig-expansion-panel-*` bridge values. The
panel paints `[part=title]`, `[part=subtitle]`, and `[part~=indicator]` from
those, and swaps them for `--disabled-text-color` under `:host([disabled])`.

Two things silently defeat that disabled state, so both are avoided:

- `color` on the slotted `.igd-faq__question` / `.igd-faq__subtitle` — an
  explicit colour beats the inheritance coming from `[part=title]`.
- `::part(indicator) { color }` — outer-tree `::part()` rules always win over
  the shadow tree's own rules, regardless of specificity.

If a colour looks wrong, change the `--igd-faq-*` token, never add a
declaration to the light-DOM element.

### Density — why there is no padding token

`igc-expansion-panel` derives its header padding, body padding, and indicator
margin from the Ignite UI layout scale (`--ig-size`, `--ig-spacing`), and its
real body padding lives on `[part~=content] > slot` — an element that is not
an exposed CSS part. Overriding `::part(content) { padding }` therefore stacks
on top of the built-in padding instead of replacing it, and any hard-coded
`::part(header) { padding }` freezes the component at one density.

So the FAQ scales density instead of setting padding:

```css
.my-faq {
  --igd-faq-spacing: 0.75; /* 0 = flush, 1 = default, 2 = double */
}
```

`--igd-faq-spacing` feeds `--ig-spacing` on each panel; `--ig-size` on the
panel (or an ancestor) still works as usual. Verified against the
`igniteui-theming` MCP (`theming://docs/spacing-and-sizing`).
