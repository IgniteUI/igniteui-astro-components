# Anatomy

Framed, padded container for a component anatomy diagram. Use it in MDX pages
where a labelled screenshot explains the parts of a component.

## Import

```astro
import Anatomy from 'igniteui-astro-components/components/mdx/Anatomy.astro';
```

## Props

| Prop    | Type     | Default      | Description                                                                                            |
| ------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `src`   | `string` | _(required)_ | Image URL.                                                                                             |
| `alt`   | `string` | _(required)_ | Accessible description, forwarded to the `<img>`. Describe the parts the diagram labels, not the name. |
| `class` | `string` | —            | Extra class(es) on the frame.                                                                          |

## Example

```mdx
import Anatomy from 'igniteui-astro-components/components/mdx/Anatomy.astro';

<Anatomy
  src="/images/button-anatomy.png"
  alt="Button anatomy: label text, optional prefix icon, optional suffix icon"
/>
```

## Styling

Tokens are declared on `.igd-anatomy` and can be retuned from any ancestor:

```
--igd-anatomy-padding        (60px 24px)
--igd-anatomy-bg             light-dark() surface
--igd-anatomy-border-color   light-dark(gray-300, surface-700)
--igd-anatomy-radius         (4px)
```
