# Adopting ig-design-system in igniteui-astro-components

Status: adopted on this branch. The package loads the design system as its base and components read semantic tokens. The sections below are the inventory and the trial that led here; their numbers describe `master` before the change.

## What the branch does now

- `DocsLayout` loads `src/styles/design-system/` (a copy of `ig-design-system` at `db4cee5`: `fonts.css`, `tokens.css`, `theme.css`) before `theme.scss` and sets `data-igd-type="docs"`.
- The hand-made palette, the type scale and the Material elevations are gone. The engine variables come from the design system.
- No stylesheet reads a raw palette step. Colours are semantic `--igd-color-*`, feedback and badge tokens. `light-dark()` calls went from 158 to 5, none of them a palette colour.
- 142 padding, margin, gap and radius values read `--igd-space-*` and `--igd-radius-*` tokens.
- `--igd-accent`, `--igd-on-accent`, `--igd-link-color`, `--igd-link-hover-color`, `--igd-app-bg`, `--igd-on-app-bg`, `--igd-app-outline-color`, `--igd-font-sans`, `--igd-padding-sm/md/lg` and the status badge names keep their names and point at design system tokens.

## Still to do

- Widths, heights and offsets stay as typed: they are not part of the design system.
- 18 spacing and radius values are off the scale (6, 3, 18, 10, 9, 100px spacing; 2, 5, 11px radius) and stay as typed.
- The code block colours are typed hex values from the Shiki theme.
- `GlobalNavBar` still names `aktiv-grotesk`, so `DocsLayout` keeps the Typekit link.
- The dark theme has not been reviewed. Nobody is working on it and the sites have no switch for it yet.
- The copy in `src/styles/design-system/` becomes a dependency once the package is published.

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

## Decisions taken

- **Secondary:** docs move to violet. The orange palette here goes away.
- **Typeface:** Blog, Docs and API docs move to DM Sans and Plus Jakarta Sans. A site that needs another face changes it in its own repository, not here.

## Step 2: the trial in the playground

### How to use it

```sh
npm run playground          # http://localhost:4567
```

- A button in the bottom left corner reads "Design system: off". Click it to load the design system on top of the page, and again to remove it.
- `?ds=on` and `?ds=off` in the URL do the same. The choice is remembered.
- The switch loads `tokens.css` and `theme.css` after every other stylesheet, so they win where both set the same thing. Nothing in `src/` changes.
- The two files and the fonts are a copy in `playground/public/design-system/`, taken from `ig-design-system` at the commit in its `VERSION` file. `node playground/scripts/sync-design-system.mjs` refreshes the copy from a sibling checkout.

### What changes when it is on

Measured in Chromium at 1440px on the home page, `/components/docs-aside/` and `/components/badge/`, in the light and the dark theme. No page threw a script error and none scrolls sideways.

| What                    | Off              | On                                  | Verdict                                                        |
| ----------------------- | ---------------- | ----------------------------------- | -------------------------------------------------------------- |
| Body and UI face        | aktiv-grotesk    | DM Sans                             | Wanted                                                         |
| Heading face            | aktiv-grotesk    | Plus Jakarta Sans                   | Wanted                                                         |
| Page `h1`               | 36px, weight 700 | 70px, weight 900                    | **Wrong for docs**                                             |
| Page `h2`               | 24px             | 43px                                | **Wrong for docs**                                             |
| Paragraph               | 16px / 28px      | 19px / 30.8px                       | **Wrong for docs**                                             |
| Space under `h1`        | 24px             | 0                                   | **Broken**: headings touch the text below                      |
| Links in prose          | Underlined       | Not underlined                      | **Broken**: a link is no longer told apart by more than colour |
| Link colour, dark theme | A light blue     | `#155dfc` on `#0f172a`, about 3.4:1 | **Below AA**; a design system bug, see below                   |
| Accent (`--igd-accent`) | `#155dfc`        | `#2462ea`                           | Shifts: it reads `--ig-primary-600`, now an engine step        |
| Secondary               | Orange `#f95924` | Violet `#a452f8`                    | Wanted                                                         |
| Page background, dark   | `#0a0b10`        | `#0f172a`                           | To review                                                      |
| `igc-input` height      | 40px             | 48px                                | Side effect: the design system sets `--ig-size: 3` (large)     |
| Sidebar tree text       | 14px             | 15px                                | Side effect of the body size                                   |

### What the trial shows

1. **The palette swap works.** Light and dark both hold together, and the Ignite UI components (search field, selects, tree) follow the design system's palette with no mapping. That confirms decision 1 of the design system on a real page.
2. **The type cannot be taken as it is.** The engine's slots carry the marketing sizes, so every docs heading and paragraph grows. Docs needs its own sizes on the same roles.
3. **`theme.css` carries page-level rules that are not tokens**: `h1`–`h6 { margin: 0 }`, `a { text-decoration: none }`, `body { font-size }`, `* { box-sizing }`. They suit the marketing site and override this repo's own rules. A consumer should be able to load the tokens without them.
4. **`--ig-size` is global.** Setting it to large for the design system's spacing also makes every Ignite UI control larger.

### Found in ig-design-system by the trial

- The base rule `a { color: var(--igd-color-action-default) }` uses the fill colour for text. In the dark theme that is about 3.4:1 on the page. It should read `--igd-color-action-text`.
- The token layer and the base element styles ship in one file. They need to be loadable apart.
- The type sizes need a way to be set per site.

## Step 3: the trial again, after three changes in ig-design-system

The owner decided: the design system ships one type set per kind of site, and each site sets the size dial for itself. Three changes followed there:

1. The element styles moved to an optional `base.css`. This repo does not load it.
2. The package no longer sets `--ig-size`, `--ig-spacing` or `--ig-elevation-factor`.
3. A `docs` type set, selected with `data-igd-type="docs"`. Its values are the type scale this repo has today.

The copy in `playground/public/design-system/` is from a local build that has all three (`VERSION` names the commit). The switch now also sets `data-igd-type="docs"` on the page.

Measured in Chromium at 1440px on the home page:

| What                    | Off              | On, before the changes | On, now                            |
| ----------------------- | ---------------- | ---------------------- | ---------------------------------- |
| Page `h1`               | 36px / 40px, 700 | 70px, 900              | 36px / 40px, 700                   |
| Page `h2`               | 24px / 32px      | 43px                   | 24px / 32px                        |
| Paragraph               | 16px / 28px      | 19px / 30.8px          | 16px / 28px                        |
| Space under `h1`        | 24px             | 0                      | 24px                               |
| Links in prose          | Underlined       | Not underlined         | Underlined                         |
| Link colour, dark theme | A light blue     | About 3.4:1            | A light blue, `rgb(203, 214, 255)` |
| `igc-input` height      | 40px             | 48px                   | 40px                               |
| Sidebar tree text       | 14px             | 15px                   | 14px                               |
| Heading face            | aktiv-grotesk    | Plus Jakarta Sans      | Plus Jakarta Sans                  |
| Body face               | aktiv-grotesk    | DM Sans                | DM Sans                            |

With the switch on, the page now differs from today's in three ways only, all of them wanted or to be reviewed:

- **The faces**: DM Sans and Plus Jakarta Sans.
- **The palette**: the engine-solved ramps. The accent this repo reads, `--ig-primary-600`, is `#2462ea` where it was `#155dfc`; secondary is violet.
- **The dark page background**: `#0f172a` where it was `#0a0b10`.

Still to do in this repo, none of it started:

- Components read `--igd-font-sans`, this repo's own token, in some places. It has to point at the design system's `--igd-font-body`.
- `--igd-accent` reads `--ig-primary-600`. To keep the exact brand blue it should read `--igd-color-action-default`.
- The 289 raw gray references and the 158 `light-dark()` calls are untouched.

## Proposed next steps

1. Done: the trial above.
2. Done: the three changes in ig-design-system, and the trial again (step 3).
3. **One component end to end.** Move `DocsAside` (25 tokens, colours and spacing) to semantic tokens and run the design system's checks on it.
4. **Decide the eight gaps** with what the steps above show.

## Questions for the owner

None open. Both earlier questions are answered: one type set per kind of site, shipped by the design system; each site sets the size dial for itself.
