# Sample

Renders a live demo widget with an embedded iframe, source code tabs, and live-edit buttons (StackBlitz / CodeSandbox). The HTML shell is rendered server-side; client interactivity is handled by the `sample-widget` script loaded once per page.

## Import

```astro
import Sample from 'igniteui-astro-components/components/mdx/Sample.astro';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | *(required)* | Sample path relative to the demos base URL, e.g. `"/charts/data-chart/axis-crossing"`. |
| `height` | `number` | `400` | iframe height in pixels. |
| `alt` | `string` | `''` | `title` attribute for the iframe (accessibility). |
| `lob` | `boolean` | `false` | Use `lobDemosBaseUrl` instead of `demosBaseUrl` (LOB/grid-dynamic demos). |
| `dv` | `boolean` | `false` | Force use of `dvDemosBaseUrl` (data-viz demos). Auto-detected for paths starting with `charts/`, `gauges/`, `maps/`, `excel/`. |
| `crm` | `boolean` | `false` | Use `crmDemoBaseUrl` (CRM demo samples). |
| `iframeOnly` | `boolean` | `false` | Render only the iframe — no navbar, no code tabs, no live-edit footer. |
| `fullscreenBtn` | `boolean` | `false` | When `iframeOnly={true}`, also renders a "View in full screen" button below the iframe. |

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

| Key | Used by |
|-----|---------|
| `demosBaseUrl` | Default demos |
| `dvDemosBaseUrl` | Charts / gauges / maps / excel |
| `lobDemosBaseUrl` | LOB / grids |
| `crmDemoBaseUrl` | CRM demos |

## MDX global registration

```ts
// src/mdx-components.ts
export { default as Sample } from 'igniteui-astro-components/components/mdx/Sample.astro';
```
