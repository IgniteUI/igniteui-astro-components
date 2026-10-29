# PlatformBlock

Conditionally renders its slotted content only when the current build platform matches one of the specified platform names. Replaces the legacy comment-block pattern (`<!-- Angular, React -->…<!-- end: Angular, React -->`).

## Import

```astro
import PlatformBlock from 'igniteui-astro-components/components/mdx/PlatformBlock.astro';
```

## Props

| Prop  | Type     | Description                                                 |
| ----- | -------- | ----------------------------------------------------------- |
| `for` | `string` | Comma-separated list of platform names to show content for. |

Valid platform names: `Angular`, `React`, `WebComponents`, `Blazor`

## Examples

```mdx
{/* Single platform */}

<PlatformBlock for="Angular">This paragraph only appears in Angular docs.</PlatformBlock>

{/* Multiple platforms */}

<PlatformBlock for="Angular, React">Visible in Angular and React docs only.</PlatformBlock>

{/* All platforms (just write the content without PlatformBlock) */}
```

## Platform context

The active platform is `Astro.locals.platformContext.name`, set by the host site's middleware (see [playground/src/middleware.ts](../../../../playground/src/middleware.ts)). Names in `for` must match `platformContext.name` exactly (`Angular`, `React`, `WebComponents`, `Blazor`). Without the middleware the render throws, because the component destructures the context.

The xplat docs build additionally inlines and strips `<PlatformBlock>` at build time (a Vite plugin in that repo), so the component never reaches the browser there.

## Registering in MDX

Nothing is registered automatically. Import the component at the top of each
MDX file, or pass it through the `components` map of a `<Content />` render.
