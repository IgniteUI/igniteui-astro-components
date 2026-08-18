# Sample

Renders a live demo widget with an embedded iframe, source code tabs, and live-edit buttons (StackBlitz / CodeSandbox). The HTML shell is rendered server-side; client interactivity is handled by the `sample-widget` script loaded once per page.

## Import

```astro
import Sample from 'igniteui-astro-components/components/mdx/Sample.astro';
```

## Props

| Prop            | Type                             | Default                      | Description                                                                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`           | `string`                         | _(required)_                 | Sample path relative to the demos base URL, e.g. `"/charts/data-chart/axis-crossing"`.                                                                                                                                                                                                                      |
| `height`        | `number`                         | `150` (`50` if `fitContent`) | iframe height in pixels. With `fitContent` it is only the loading placeholder / cross-origin fallback.                                                                                                                                                                                                      |
| `alt`           | `string`                         | `''`                         | `title` attribute for the iframe (accessibility).                                                                                                                                                                                                                                                           |
| `lob`           | `boolean`                        | `false`                      | Use `lobDemosBaseUrl` instead of `demosBaseUrl` (LOB/grid-dynamic demos).                                                                                                                                                                                                                                   |
| `dv`            | `boolean`                        | `false`                      | Force use of `dvDemosBaseUrl` (data-viz demos). Auto-detected for paths starting with `charts/`, `gauges/`, `maps/`, `excel/`.                                                                                                                                                                              |
| `crm`           | `boolean`                        | `false`                      | Use `crmDemoBaseUrl` (CRM demo samples).                                                                                                                                                                                                                                                                    |
| `iframeOnly`    | `boolean`                        | `false`                      | Render only the iframe — no navbar, no code tabs, no live-edit footer.                                                                                                                                                                                                                                      |
| `fullscreenBtn` | `boolean`                        | `false`                      | When `iframeOnly={true}`, also renders a "View in full screen" button below the iframe.                                                                                                                                                                                                                     |
| `fitContent`    | `boolean`                        | `false`                      | Size the iframe to fit its content — the embedded page dictates the size. Same-origin demos are measured directly; cross-origin demos must report via `postMessage`. Demos with ink overflow (shadows, glows, focus rings) must reserve room for it in their own layout, since an iframe clips at its edge. |
| `spacing`       | `'none' \| 'sm' \| 'md' \| 'lg'` | `'none'`                     | Padding around the iframe inside the container: `none` = 0, `sm` = 8px, `md` = 16px, `lg` = 32px. Applied by the host container, never inside the embedded page.                                                                                                                                            |
| `position`      | `string`                         | —                            | Where the iframe sits inside the container when it doesn't fill it. Accepts a horizontal token (`start`, `center`, `end`) and/or a vertical token (`top`, `center`, `bottom`), space-separated in any order — e.g. `"center"`, `"start top"`, `"end bottom"`.                                               |
| `resizable`     | `boolean`                        | `false`                      | Show a drag handle on the right edge that resizes the iframe's width so responsive demos can be previewed at different widths. Left/right arrow keys resize it when focused. Combines with `fitContent`: the drag owns the width, the content keeps dictating the height.                                   |
| `noBorder`      | `boolean`                        | `true`                       | Drop the 1px border drawn around the iframe/container. Pass `noBorder={false}` to draw it — recommended whenever chrome (code tabs or `fullscreenBtn`) is visible.                                                                                                                                          |
| `noBackground`  | `boolean`                        | `true`                       | Hide the grid-pattern backdrop drawn behind the iframe, keeping the container fully transparent. Pass `noBackground={false}` to show it.                                                                                                                                                                    |

## Examples

```mdx
{/* Standard widget */}

<Sample src="/charts/data-chart/axis-crossing" height={500} alt="Angular Data Chart Example" />

{/* DV sample (auto-detected) */}

<Sample src="/gauges/radial-gauge/needle" height={350} />

{/* LOB demo */}

<Sample src="/grid/grid/filtering" lob />

{/* Bare iframe for embedding */}

<Sample src="/charts/bar-chart/overview" iframeOnly height={300} />

{/* Bare iframe + fullscreen link */}

<Sample src="/charts/bar-chart/overview" iframeOnly fullscreenBtn height={300} />
```

## Environment configuration

The base URLs are resolved from `environment.json` at build time via `siteMetaIntegration` and exposed through `getPlatformContext().getEnvVars()`:

| Key               | Used by                        |
| ----------------- | ------------------------------ |
| `demosBaseUrl`    | Default demos                  |
| `dvDemosBaseUrl`  | Charts / gauges / maps / excel |
| `lobDemosBaseUrl` | LOB / grids                    |
| `crmDemoBaseUrl`  | CRM demos                      |

## Code highlighting

Code tabs are syntax-highlighted client-side using [Shiki](https://shiki.style/) (lazy-loaded via dynamic import and pre-warmed at widget init). Supported languages: `typescript`, `tsx`, `javascript`, `html`, `css`, `scss`, `csharp`, `razor`.

The theme defaults to `dark-plus` and can be overridden per project via a Vite define in `astro.config.mjs`:

```js
// astro.config.mjs
export default defineConfig({
  vite: {
    define: {
      __IGD_SAMPLE_CODE_THEME__: JSON.stringify('github-dark'),
    },
  },
});
```

Any [Shiki bundled theme](https://shiki.style/themes) name is accepted. If the define is absent the default `dark-plus` is used.

> **Note:** highlight.js is no longer required. Remove any hljs `<script>` / `<link>` head entries from your integration config if they were added solely for code tabs.

## MDX global registration

```ts
// src/mdx-components.ts
export { default as Sample } from 'igniteui-astro-components/components/mdx/Sample.astro';
```
