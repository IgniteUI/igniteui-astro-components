# Sample

Renders a live demo widget with an embedded iframe, source code tabs, and live-edit buttons (StackBlitz / CodeSandbox). The HTML shell is rendered server-side; client interactivity is handled by the `sample-widget` script loaded once per page.

## Import

```astro
import Sample from 'igniteui-astro-components/components/mdx/Sample.astro';
```

## Props

| Prop              | Type                             | Default                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | -------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`             | `string`                         | _(required)_                         | Sample path relative to the demos base URL, e.g. `"/charts/data-chart/axis-crossing"`.                                                                                                                                                                                                                                                                                                                                                         |
| `height`          | `number`                         | `150` (`50` if `fitContent`)         | iframe height in pixels. With `fitContent` it is only the loading placeholder / cross-origin fallback.                                                                                                                                                                                                                                                                                                                                         |
| `alt`             | `string`                         | `''`                                 | `title` attribute for the iframe (accessibility).                                                                                                                                                                                                                                                                                                                                                                                              |
| `lob`             | `boolean`                        | `false`                              | Use `lobDemosBaseUrl` instead of `demosBaseUrl` (LOB/grid-dynamic demos).                                                                                                                                                                                                                                                                                                                                                                      |
| `dv`              | `boolean`                        | `false`                              | Force use of `dvDemosBaseUrl` (data-viz demos). Auto-detected for paths starting with `charts/`, `gauges/`, `maps/`, `excel/`.                                                                                                                                                                                                                                                                                                                 |
| `crm`             | `boolean`                        | `false`                              | Use `crmDemoBaseUrl` (CRM demo samples).                                                                                                                                                                                                                                                                                                                                                                                                       |
| `wc`              | `boolean`                        | `false`                              | Load the sample from the Web Components samples browser (`wcDemosBaseUrl`) on every platform's docs, for demos the platforms share. Falls back to `demosBaseUrl`. Code tabs and live editing follow it.                                                                                                                                                                                                                                        |
| `chrome`          | `'widget' \| 'demo' \| 'bare'`   | `'widget'`                           | What the widget draws around the demo. `widget`: the EXAMPLE and code tabs, and a footer with the live-edit and full-screen buttons. `demo`: the widget's frame without the tabs and the code viewer; the footer carries only the theme picker, and without one there is no footer. For demos whose code is not a usage example, e.g. ones that fake interaction states. `bare`: only the iframe, in a plain container. See [Chrome](#chrome). |
| `showThemePicker` | `boolean`                        | `false`                              | Add the in-sample theme picker to the footer. Its initial theme comes from the site, not from the usage. `widget` and `demo` only: `bare` has no footer to put it in.                                                                                                                                                                                                                                                                          |
| `fullscreenBtn`   | `boolean`                        | `false`                              | Render a "View in full screen" button below the iframe. `bare` only: the `widget` footer already has one, and `demo` leaves full screen out on purpose.                                                                                                                                                                                                                                                                                        |
| `fitContent`      | `boolean`                        | `false`                              | Size the iframe to fit its content — the embedded page dictates the size. Same-origin demos are measured directly; cross-origin demos must report via `postMessage`. Demos with ink overflow (shadows, glows, focus rings) must reserve room for it in their own layout, since an iframe clips at its edge.                                                                                                                                    |
| `spacing`         | `'none' \| 'sm' \| 'md' \| 'lg'` | `'none'`                             | Padding around the iframe inside the container: `none` = 0, `sm` = 8px, `md` = 16px, `lg` = 32px. Applied by the host container, never inside the embedded page.                                                                                                                                                                                                                                                                               |
| `position`        | `string`                         | —                                    | Where the iframe sits inside the container when it doesn't fill it. Accepts a horizontal token (`start`, `center`, `end`) and/or a vertical token (`top`, `center`, `bottom`), space-separated in any order — e.g. `"center"`, `"start top"`, `"end bottom"`.                                                                                                                                                                                  |
| `resizable`       | `boolean`                        | `false`                              | Show a drag handle on the right edge that resizes the iframe's width so responsive demos can be previewed at different widths. Left/right arrow keys resize it when focused. Combines with `fitContent`: the drag owns the width, the content keeps dictating the height.                                                                                                                                                                      |
| `noBorder`        | `boolean`                        | `true`                               | Drop the 1px border drawn around the iframe/container. Pass `noBorder={false}` to draw it — recommended whenever the tabs, the footer or the `fullscreenBtn` bar render.                                                                                                                                                                                                                                                                       |
| `noBackground`    | `boolean`                        | `true` (`false` with a theme picker) | Hide the grid-pattern backdrop drawn behind the iframe, keeping the container fully transparent. Pass `noBackground={false}` to show it. Defaults to `false` when a theme picker renders (`showThemePicker` with `widget` or `demo`), so a demo whose theme and mode the reader can switch has a surface of its own. An explicit value always wins.                                                                                            |
| `whiteBackground` | `boolean`                        | `false`                              | Paint the backdrop behind the iframe pure white (`#fff`) instead of the default light gray. Only the light side changes — dark mode (the site's, or the in-sample theming widget's) is left as is. Implies a painted background, so it also overrides the transparency `noBackground` leaves behind in light mode.                                                                                                                             |
| `iframeOnly`      | `boolean`                        | `false`                              | **Deprecated**, removed in 2.0.0. Use `chrome="bare"`. See [Deprecated props](#deprecated-props).                                                                                                                                                                                                                                                                                                                                              |
| `hideCode`        | `boolean`                        | `false`                              | **Deprecated**, removed in 2.0.0. Use `chrome="demo"`. See [Deprecated props](#deprecated-props).                                                                                                                                                                                                                                                                                                                                              |

## Chrome

`chrome` picks what surrounds the demo, and `showThemePicker` and `fullscreenBtn` add to it where they apply:

| `chrome`             | Tabs and code | Footer                                 | `showThemePicker` | `fullscreenBtn` |
| -------------------- | ------------- | -------------------------------------- | ----------------- | --------------- |
| `widget` _(default)_ | Yes           | Live-edit and full-screen buttons      | Yes               | No              |
| `demo`               | No            | Only the theme picker, if there is one | Yes               | No              |
| `bare`               | No            | None                                   | No                | Yes             |

A modifier the chrome ignores, or a `chrome` value that is not one of the three, logs a build warning, and the types reject both.

### Deprecated props

`iframeOnly` and `hideCode`, the 1.x spellings of `chrome="bare"` and `chrome="demo"`, still work, but they are deprecated and 2.0.0 removes them. Editors strike them through, and each sample that uses one logs a build warning, once per build, that names the replacement:

| Deprecated                 | Use instead                   |
| -------------------------- | ----------------------------- |
| `iframeOnly`               | `chrome="bare"`               |
| `iframeOnly fullscreenBtn` | `chrome="bare" fullscreenBtn` |
| `hideCode`                 | `chrome="demo"`               |

As in 1.x, `iframeOnly` wins over `hideCode`. An explicit `chrome` wins over both, and the warning says the deprecated prop is ignored.

## Examples

```mdx
{/* Standard widget */}

<Sample src="/charts/data-chart/axis-crossing" height={500} alt="Angular Data Chart Example" />

{/* DV sample (auto-detected) */}

<Sample src="/gauges/radial-gauge/needle" height={350} />

{/* LOB demo */}

<Sample src="/grid/grid/filtering" lob />

{/* Web Components sample shared by every platform's docs */}

<Sample src="/themes/palettes/scales" wc fitContent chrome="bare" />

{/* Bare iframe for embedding */}

<Sample src="/charts/bar-chart/overview" chrome="bare" height={300} />

{/* Bare iframe + fullscreen link */}

<Sample src="/charts/bar-chart/overview" chrome="bare" fullscreenBtn height={300} />

{/* Demo only, with the theme picker: no code tabs or live-edit buttons */}

<Sample src="/inputs/radio/interaction-state" chrome="demo" showThemePicker height={400} />
```

## Environment configuration

The base URLs are read from `Astro.locals.envVars`, a plain `Record<string, string>` that the host site's middleware must set (the docs sites load it from their `environment.json`; the root README's Quick start step 3 shows a minimal version). The platform (`Astro.locals.platformContext`) comes from the same middleware:

| Key                  | Used by                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `demosBaseUrl`       | Default demos                                                                        |
| `dvDemosBaseUrl`     | Charts / gauges / maps / excel                                                       |
| `lobDemosBaseUrl`    | LOB / grids                                                                          |
| `crmDemoBaseUrl`     | CRM demos                                                                            |
| `wcDemosBaseUrl`     | `wc` samples, on any platform                                                        |
| `defaultSampleTheme` | Starting theme of the code tabs and theme picker; falls back to the platform default |

Outside the Web Components site, a `wc` sample needs `wcDemosBaseUrl`: without it the sample falls back to `demosBaseUrl`, the page's own platform browser, and the build logs a warning. Leave unused keys out rather than setting them to `""`: an empty string doesn't fall back, it produces a relative URL.

## Code highlighting

Code tabs are syntax-highlighted client-side using [Shiki](https://shiki.style/) (lazy-loaded via dynamic import and pre-warmed at widget init). Supported languages: `typescript`, `tsx`, `javascript`, `html`, `css`, `scss`, `csharp`, `razor`.

The tabs use the package's brand code theme (`igCodeTheme`, the same one `createDocsSite()` applies to fenced blocks), so a code tab and a fenced block look identical. See [`src/code-theme/README.md`](../../../code-theme/README.md).

## Registering in MDX

Nothing is registered automatically. Either import the component at the top of
each MDX file (the convention in the docs repos):

```mdx
import Sample from 'igniteui-astro-components/components/mdx/Sample.astro';
```

or pass it through the `components` map of a `<Content />` render when the MDX
is authored without imports (CMS content, for example).
