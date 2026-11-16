# Adopting ig-design-system in igniteui-astro-components

Status: step 1 of the spike, a read-only inventory. No component is changed yet.
Branch: `mpopov/adopt-design-system-tokens`. This file is a working report and is not meant to be merged as is.

Measured on `master` at `fca14ed` against `ig-design-system` `main` at `923f9c8`.

## Summary

- **The two systems are closer than expected in one way and further apart in three.**
- Closer: both already build on `igniteui-theming`, both use the `--ig-*` palette names, both switch theme with `data-theme`, and the accent is the same blue, `#155dfc`.
- Further apart:
  1. This repo has **no semantic colour tier**. Components read raw gray steps 289 times.
  2. The **secondary colour is different**: orange here, violet in the design system.
  3. The **type scale is different in kind**: docs sizes here (h1 36px), marketing sizes there (h1 70px).
- The prefix `--igd-` is **already used here** for 165 names. Only one collides.

## What is here today

| Measure                                      | Count                         |
| -------------------------------------------- | ----------------------------- |
| Style files (`.scss`, `.astro`)              | 64                            |
| `--igd-*` names declared or read             | 165                           |
| `--ig-*` names read (engine palette)         | 51 names, 375 references      |
| `light-dark()` calls                         | 158                           |
| Hex colours typed into a stylesheet          | 62 distinct, 165 references   |
| Media queries                                | 19                            |
| Container queries                            | 1                             |
| Ignite UI web components used                | 14 element types (`igc-*`)    |
| `igniteui-theming` version (peer dependency) | `^29.0.0`                     |
| Ignite UI theme on the page                  | Fluent (`--ig-theme: fluent`) |

## Finding 1: `--igd-` is taken, with one collision

This repo's own tokens use the same prefix as the design system.

- 165 names here, 387 in the design system.
- **One name is in both: `--igd-font-mono`.** Here it is `'JetBrains Mono', 'Fira Code', …`; in the design system it is `'JetBrains Mono', ui-monospace, monospace`.
- Almost all of the 165 are component tokens: `--igd-aside-*` (25), `--igd-figma-kits-*` (22), `--igd-faq-*` (18), `--igd-dodont-*` (16), `--igd-code-*` (12). They fit the design system's component tier as they are.
- A few are semantic and have a direct match:

| Here                             | Design system                         | Note                                     |
| -------------------------------- | ------------------------------------- | ---------------------------------------- |
| `--igd-accent`                   | `--igd-color-action-default`          | Same colour, `#155dfc`                   |
| `--igd-on-accent`                | `--igd-color-action-on`               |                                          |
| `--igd-link-color`               | `--igd-color-action-text`             |                                          |
| `--igd-link-hover-color`         | `--igd-color-action-hover`            |                                          |
| `--igd-app-bg`                   | `--igd-color-surface-page`            | Dark value here is a typed `#0a0b10`     |
| `--igd-app-outline-color`        | `--igd-color-border-default`          |                                          |
| `--igd-padding-sm`, `-md`, `-lg` | `--igd-space-inset-md`, `-xl`, `-2xl` | 16, 24, 32px                             |
| `--igd-font-sans`                | `--igd-font-body`                     | Different typeface, see finding 4        |
| `--igd-border-radius`            | none                                  | 4px; the design system's smallest is 6px |

## Finding 2: no semantic colour tier

Components read the engine palette directly. This is the largest piece of work.

| Raw step   | As text | As surface | As border | In a variable | Design system token                               |
| ---------- | ------- | ---------- | --------- | ------------- | ------------------------------------------------- |
| `gray-900` | 29      | 1          | 0         | 36            | `color-text-heading`                              |
| `gray-800` | 12      | 1          | 0         | 6             | `color-text-primary`                              |
| `gray-700` | 14      | 0          | 3         | 4             | `color-text-ui`                                   |
| `gray-600` | 16      | 1          | 1         | 12            | `color-text-secondary`                            |
| `gray-500` | 18      | 1          | 0         | 2             | `color-text-muted`                                |
| `gray-400` | 9       | 2          | 13        | 7             | `color-icon-subtle` for text; **no border token** |
| `gray-300` | 8       | 0          | 14        | 2             | **none**                                          |
| `gray-200` | 2       | 2          | 20        | 0             | `color-border-default`                            |
| `gray-100` | 0       | 13         | 10        | 0             | `color-surface-muted`, `color-border-subtle`      |
| `gray-50`  | 3       | 15         | 1         | 5             | `color-surface-subtle`                            |

- 9 of the 10 gray steps have a semantic match for their main use.
- **Gap: a border between `border-default` (gray 200) and `border-control` (gray 500).** `gray-300` and `gray-400` are used as a border 27 times.
- **Gap: `gray-300` as text**, 8 times. Probably disabled or placeholder text; to be confirmed per use.
- The other families are used far less: primary 38 references, secondary 17, surface 13, success 8, error 3.

## Finding 3: the palettes

Both set the same `--ig-*` names, so on one page the stylesheet loaded last wins.

| Colour                  | Here               | Design system         | Difference                              |
| ----------------------- | ------------------ | --------------------- | --------------------------------------- |
| Accent (`primary-600`)  | `#155dfc`          | `#155dfc` is the seed | The accent matches                      |
| `primary-500`           | `#2b7fff`          | `#4c7dfe`             | Each ramp step differs                  |
| `primary-600` as a step | `#155dfc`          | `#2462ea`             |                                         |
| Light `gray-500`        | `#6a7282`          | `#68717d`             | The light grays are within a few shades |
| Light `gray-900`        | `#101828`          | `#16181b`             |                                         |
| Dark `gray-50`          | `#101828`          | `#1f2124`             | The dark grays differ clearly           |
| Dark `gray-200`         | `#364153`          | `#5c646d`             | Borders get lighter in the dark theme   |
| `secondary-500`         | `#f95924` (orange) | `#a452f8` (violet)    | **A different brand colour**            |

- The palette here is typed in by hand, one `oklch()` per step. It is the Tailwind blue and gray scales. The design system's is solved by the engine from seeds.
- The dark gray here is the light gray reversed. The design system's dark gray is solved against the dark surface and is lighter at the low steps.
- **Secondary is the real conflict.** Docs use the Infragistics orange; marketing uses violet. One system needs both, or a decision.

## Finding 4: typography

| Style                 | Here                    | Design system                      |
| --------------------- | ----------------------- | ---------------------------------- |
| Body face             | `aktiv-grotesk`         | `DM Sans`                          |
| Heading face          | `aktiv-grotesk`         | `Plus Jakarta Sans`                |
| Mono face             | `JetBrains Mono`        | `JetBrains Mono`                   |
| `h1`                  | 36px / 40px, weight 700 | 70px (40px on a phone), weight 900 |
| `h2`                  | 24px / 32px, weight 700 | 43px (30px on a phone), weight 800 |
| `h3`                  | 20px / 28px, weight 700 | 27px (22px on a phone), weight 800 |
| `h4`                  | 18px / 28px, weight 700 | 21px, weight 800                   |
| Line height           | A length                | Unitless                           |
| Top and bottom margin | Set per style           | Not part of a style                |

- A docs page cannot take a 70px `h1`. The design system's sizes are the marketing site's.
- The rule already allows this: "a site may override the values, never the scale or pattern". So docs would keep the 15 roles and set its own sizes. Nothing in the design system makes that override easy or checks it yet.
- This repo uses the engine's margins per style. The design system dropped them.

## Finding 5: spacing, radius and sizes

Pixel values typed into stylesheets (through `rem()` or as `px`):

| Kind    | Distinct values | Uses | On the design system's scale                           |
| ------- | --------------- | ---- | ------------------------------------------------------ |
| Spacing | 23              | 176  | 116 uses (66%)                                         |
| Radius  | 5               | 18   | 2 of 18: only 8px. 4px (10 uses) and 2px (4) have none |
| Type    | 9               | 22   | Not compared; see finding 4                            |
| Size    | 27              | 53   | Not compared                                           |

- Most common spacing: 16px (41), 8px (32), **26px (21)**, 4px (16), 24px (12).
- Off the scale: 26px, 6px, 10px, 18px, 15px, 9px, 3px, and hairlines (1px, 0.25px, 0.33px).
- **26px is used 21 times and has no step.** The nearest are 24 and 32.
- **Radius 4px is the house radius here and the design system has no 4px.** Its smallest role is 6px.
- None of these go through a spacing role today. The design system's spacing gate would report every one.

## Finding 6: dark mode

- Both use `data-theme="dark"`. That part is compatible.
- Here, a colour that differs per theme is written `light-dark(a, b)`, 158 times, and `data-theme` sets `color-scheme`.
- The design system swaps the gray and surface ramps under `[data-theme="dark"]` and also sets `color-scheme: dark`, so `light-dark()` keeps working beside it.
- With semantic tokens most of the 158 `light-dark()` calls are not needed: the token already has the right value in each theme.

## Finding 7: Ignite UI components are on the page

- 14 `igc-*` element types are used: icon, accordion, tree, expansion panel, icon button, tooltip, tabs, select, input, list, button.
- They run the Fluent theme, with overrides in `_component-themes.scss` that read `--ig-gray-*` and `--igd-accent`.
- This is the case the design system's decision 1 was written for: with one palette under `--ig-*`, these components follow it with no mapping.
- It is also the first real test of that decision. Nobody has yet looked at an Ignite UI component with the design system's palette, type slots and elevations loaded.

## Finding 8: other differences

| Topic            | Here                                                                           | Design system                   |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| Breakpoints      | 768, 1100, 1280, 1999px                                                        | 640, 768, 1024, 1280px          |
| Fluid layout     | 19 media queries, 1 container query                                            | Rule: fluid, container queries  |
| Elevations       | Material preset                                                                | Indigo preset                   |
| Engine version   | `igniteui-theming` 29                                                          | 30.2                            |
| Typed-in colours | 62 hex values: the orange secondary palette, 15 status badge pairs, and others | Not allowed by the literal lint |

## Gaps to raise in ig-design-system

Each would be a Token request there. None is logged yet.

1. A border colour between `border-default` and `border-control`.
2. A 4px radius, and whether 2px is needed.
3. A 26px spacing step, or a decision that docs move to 24px.
4. The orange secondary beside the violet one.
5. A way for a site to set its own type sizes on the 15 roles.
6. Status colours for the docs badges: updated, new, preview, premium, open source. They are 15 `light-dark()` pairs of typed-in hex today.
7. Whether the engine's per-style margins come back.
8. Docs breakpoints 1100px and 1999px.

## What also has to exist before this repo can adopt it

- **An installable package.** `ig-design-system` is private and unversioned. For the trial it can be a local file dependency.
- **`igniteui-theming` 30.** This repo is on 29. The design system's palette comes from 30.2.
- **The checks as a command**, so this repo's CI can run them on its own styles.

## Proposed next steps

1. **Trial, visible in the playground.** Load `tokens.css` and `theme.css` into the playground behind a switch, change nothing else, and look at every page in light and dark. This shows what the shared `--ig-*` palette does to the layout and to the Ignite UI components.
2. **One component end to end.** Move `DocsAside` (25 tokens, colours and spacing) to semantic tokens and run the design system's checks on it.
3. **Decide the eight gaps** with what steps 1 and 2 show.

## Questions for the owner

1. Secondary: does the docs orange become a second accent in the design system, or do docs move to violet?
2. Typeface: do Blog, Docs and API docs move to DM Sans and Plus Jakarta Sans, or keep aktiv-grotesk?
3. Type sizes: is "docs sets its own sizes on the same 15 roles" the model you want?
4. Is step 1 of the next steps the right place to start?
