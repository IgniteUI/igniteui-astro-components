# ThemingWidget

A compact theme picker dropdown for sample viewers. An `igc-select` shows the
active theme with its multi-dot swatch. Its menu includes an optional **MODE**
row with Light and Dark icon buttons, followed by selectable theme options.

The widget uses `igniteui-webcomponents`: `igc-select`, `igc-select-item`,
`igc-select-header`, `igc-icon-button`, and `igc-icon`. A small client script
synchronizes widget state and publishes changes to sample iframes.

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

The MODE row exposes **Light** and **Dark** controls. A `system` value remains
accepted as an initial prop for compatibility; it resolves against
`prefers-color-scheme` before it is emitted or reflected onto `target`.

## Panel placement

`igc-select` owns the popup. Its built-in `igc-popover` anchors the menu to the
input, flips it when necessary, and keeps the menu aligned with the select.

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
| `showMode`      | `boolean`                       | `true`                              | Show the MODE (Light / Dark) control row.                                                   |
| `target`        | `string`                        | —                                   | CSS selector to reflect `data-igd-theme` / `data-igd-mode` onto.                            |
| `label`         | `string`                        | `'Select theme'`                    | Accessible label for the select.                                                            |
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
