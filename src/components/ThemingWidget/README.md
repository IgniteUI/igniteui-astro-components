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

<ThemingWidget target="#sample-preview" storageKey="docs-sample-theme" />
```

On change the widget:

- dispatches a bubbling `igd-theme-change` `CustomEvent` with `{ theme, mode }`,
- persists the selection to `localStorage` when `storageKey` is set, and
- reflects `data-igd-theme` / `data-igd-mode` on every element matching `target`.

```js
document.addEventListener('igd-theme-change', (e) => {
  const { theme, mode } = e.detail; // e.g. { theme: 'fluent', mode: 'dark' }
});
```

## Props

| Prop            | Type                            | Default                             | Description                                                                 |
| --------------- | ------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| `themes`        | `ThemeOption[]`                 | Material, Fluent, Bootstrap, Indigo | Selectable themes. Each has `name`, optional `label`, and a `swatch` array. |
| `selectedTheme` | `string`                        | first theme                         | Active theme `name`.                                                        |
| `mode`          | `'light' \| 'dark' \| 'system'` | `'light'`                           | Active color mode.                                                          |
| `showMode`      | `boolean`                       | `true`                              | Show the MODE (Light / Dark / System) toggle row.                           |
| `target`        | `string`                        | —                                   | CSS selector to reflect `data-igd-theme` / `data-igd-mode` onto.            |
| `storageKey`    | `string`                        | —                                   | `localStorage` key for persisting the selection.                            |
| `label`         | `string`                        | `'Select theme'`                    | Accessible label for the trigger.                                           |
| `id`            | `string`                        | auto                                | Root element id.                                                            |
| `class`         | `string`                        | —                                   | Extra class(es) forwarded to the root.                                      |

### `ThemeOption`

```ts
interface ThemeOption {
  name: string; // stable id, used as the event/storage value
  label?: string; // display label (defaults to a title-cased `name`)
  swatch: string[]; // dot colors, left → right (the design uses three)
}
```

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
