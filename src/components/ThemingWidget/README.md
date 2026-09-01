# ThemingWidget

A compact theme picker dropdown for sample viewers. The trigger shows the active
theme (a multi-dot color swatch + theme name + muted mode label). Opening it
reveals an optional **MODE** toggle (Light / Dark / System) and the list of
selectable themes, with the active one checked.

Self-contained: icons are inlined SVGs and behavior is wired by a small client
script — no `igniteui-webcomponents` registration required.

## Usage

```astro
---
import ThemingWidget from 'igniteui-astro-components/components/ThemingWidget.astro';
---

<ThemingWidget target="#sample-preview" />
```

On change the widget:

- dispatches a bubbling `igd-theme-change` `CustomEvent` with
  `{ theme, mode, modePreference }`, and
- reflects `data-igd-theme` / `data-igd-mode` on every element matching `target`.

The selection is not persisted — the widget resets to its initial props on every
page load.

## Color mode

The MODE row offers **Light**, **Dark** and **System**. `system` is not passed
on as-is: it is resolved against the OS `prefers-color-scheme` before it leaves
the widget, so `mode` in the event — and the `data-igd-mode` written onto
`target` — is always a concrete `light` or `dark` and consumers need no
media-query handling of their own. The raw selection stays available as
`modePreference` (and as `data-mode` on the widget root, with the resolved value
mirrored on `data-resolved-mode`) for anything that mirrors the UI state.

The trigger's muted mode label names the resolved mode, so a `system` selection
reads as "Light" or "Dark" there — which mode is actually selected stays visible
through the pressed state of the MODE buttons.

While `system` is selected the widget follows the OS live: flipping the system
appearance re-reflects `data-igd-mode`, updates that label and re-emits
`igd-theme-change` without any interaction.

## Panel placement

The panel is promoted to a native [popover](https://developer.mozilla.org/docs/Web/API/Popover_API)
when the browser supports it, so it renders in the top layer and is never
clipped by a scrolling or `overflow: hidden` ancestor (the sample container is
one). It is placed below the trigger, flips above it when the space below is too
small, and gets a `max-height` (with a scrolling list) when neither side fits —
so it always stays inside the viewport. The position is recomputed while the
panel is open on scroll and resize. Browsers without the Popover API keep the
absolutely positioned panel, which still flips.

```js
document.addEventListener('igd-theme-change', (e) => {
  // e.g. { theme: 'fluent', mode: 'dark', modePreference: 'system' }
  const { theme, mode, modePreference } = e.detail;
});
```

## Props

| Prop            | Type                            | Default                             | Description                                                                                 |
| --------------- | ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `themes`        | `ThemeOption[]`                 | Material, Fluent, Bootstrap, Indigo | Selectable themes. Each has `name`, optional `label`, and a `swatch` array.                 |
| `selectedTheme` | `string`                        | env, then first theme               | Active theme `name`. See [Ambient defaults](#ambient-defaults).                             |
| `mode`          | `'light' \| 'dark' \| 'system'` | env, then `'light'`                 | Active color mode. See [Color mode](#color-mode) and [Ambient defaults](#ambient-defaults). |
| `showMode`      | `boolean`                       | `true`                              | Show the MODE (Light / Dark / System) toggle row.                                           |
| `target`        | `string`                        | —                                   | CSS selector to reflect `data-igd-theme` / `data-igd-mode` onto.                            |
| `label`         | `string`                        | `'Select theme'`                    | Accessible label for the trigger.                                                           |
| `id`            | `string`                        | auto                                | Root element id.                                                                            |
| `class`         | `string`                        | —                                   | Extra class(es) forwarded to the root.                                                      |

### `ThemeOption`

```ts
interface ThemeOption {
  name: string; // stable id, used as the event/storage value
  label?: string; // display label (defaults to a title-cased `name`)
  swatch: string[]; // dot colors, left → right (the design uses three)
}
```

### Ambient defaults

`selectedTheme` and `mode` fall back to the host site's configuration before
they fall back to the built-in defaults, so a docs site picks its starting theme
once instead of at every call site. The host publishes it on
`Astro.locals.envVars` from its middleware — the same channel `Sample.astro`
already reads its demo URLs from:

```ts
// docs host middleware
ctx.locals.envVars = { defaultSampleTheme: 'bootstrap', defaultSampleMode: 'light' };
```

| Key                  | Falls back to            |
| -------------------- | ------------------------ |
| `defaultSampleTheme` | the first `themes` entry |
| `defaultSampleMode`  | `'light'`                |

An explicit prop always wins. An unrecognized `defaultSampleMode` is ignored, and
a `defaultSampleTheme` matching no entry in `themes` falls through to the first
one. Consumers without middleware get an empty `Astro.locals` and the built-in
defaults.

`Sample.astro` adds one step on top: when it renders the widget it derives the
theme from the current platform — Angular → Material, React / Web Components /
Blazor → Bootstrap — unless `defaultSampleTheme` is set. That default is
functional, not cosmetic: the picker's selection is posted into the sample
iframe on every load, so it decides how the demo actually renders.

## Styling

The widget exposes CSS custom properties for retuning per context — override
them from an ancestor or via `class`:

| Variable                 | Default                      |
| ------------------------ | ---------------------------- |
| `--igd-theming-radius`   | `5px`                        |
| `--igd-theming-border`   | `var(--ig-gray-300)`         |
| `--igd-theming-bg`       | `light-dark(#fff, gray-100)` |
| `--igd-theming-fg`       | `var(--ig-gray-900)`         |
| `--igd-theming-muted`    | `var(--ig-gray-500)`         |
| `--igd-theming-hover-bg` | `var(--ig-gray-100)`         |
| `--igd-theming-accent`   | `var(--igd-accent)`          |
