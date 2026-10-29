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

The active platform is read from the `PLATFORM` environment variable via `getPlatformContext()`. Set it in `astro.config.ts`:

```ts
createDocsSite({ platform: 'angular' });
// → only <PlatformBlock for="Angular"> blocks render
```

Or in the environment directly:

```sh
PLATFORM=React astro build
```

## MDX global registration

To avoid importing `PlatformBlock` in every MDX file, register it globally in `mdx-components.ts`:

```ts
// src/mdx-components.ts
export { default as PlatformBlock } from 'igniteui-astro-components/components/mdx/PlatformBlock.astro';
```
