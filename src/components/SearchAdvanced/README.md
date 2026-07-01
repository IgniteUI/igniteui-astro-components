# SearchAdvanced

Client-side API search dialog that loads a JSON search index and performs all matching against symbol and member names. Supports configurable result tabs and optional package-scope filtering.

## Import

```astro
import SearchAdvanced from 'igniteui-astro-components/components/SearchAdvanced.astro';
```

## Props

| Prop          | Type          | Default                            | Description                                           |
| ------------- | ------------- | ---------------------------------- | ----------------------------------------------------- |
| `class`       | `string`      | —                                  | CSS class for the outer element                       |
| `indexUrl`    | `string`      | `${BASE_URL}api-search-index.json` | URL to the JSON search index                          |
| `placeholder` | `string`      | `"Search"`                         | Search input placeholder text                         |
| `showScope`   | `boolean`     | `false`                            | Show scope selector (current package / all packages)  |
| `tabs`        | `SearchTab[]` | `[]`                               | Tab categories (besides the always-present "All" tab) |
| `allTabLimit` | `number`      | `10`                               | Max results per category in the "All" tab             |

### `SearchTab`

```ts
interface SearchTab {
  /** Unique identifier for this tab/category */
  id: string;
  /** Display label for the tab */
  label: string;
  /**
   * Kind codes from the index that map to this category.
   * Use '__name__' for the page-names category.
   * Member kind codes: 'p' = property, 'a' = accessor, 'm' = method, 'e' = event, 'c' = constructor.
   */
  kindCodes: string[];
}
```

## Examples

### Minimal (single "All" tab, no scope)

```astro
---
import SearchAdvanced from 'igniteui-astro-components/components/SearchAdvanced.astro';
---

<SearchAdvanced indexUrl="/api-search-index.json" />
```

### With scope and full tab set (like api-docs)

```astro
---
import SearchAdvanced from 'igniteui-astro-components/components/SearchAdvanced.astro';

const tabs = [
  { id: 'names', label: 'Names', kindCodes: ['__name__'] },
  { id: 'properties', label: 'Properties', kindCodes: ['p'] },
  { id: 'accessors', label: 'Accessors', kindCodes: ['a'] },
  { id: 'methods', label: 'Methods', kindCodes: ['m'] },
  { id: 'events', label: 'Events', kindCodes: ['e'] },
  { id: 'constructors', label: 'Constructors', kindCodes: ['c'] },
];
---

<SearchAdvanced showScope tabs={tabs} />
```

### Custom subset of tabs

```astro
---
import SearchAdvanced from 'igniteui-astro-components/components/SearchAdvanced.astro';

const tabs = [
  { id: 'names', label: 'Types', kindCodes: ['__name__'] },
  { id: 'members', label: 'Members', kindCodes: ['p', 'a', 'm', 'e', 'c'] },
];
---

<SearchAdvanced tabs={tabs} indexUrl="/my-index.json" />
```

## Index Format

The component expects a JSON file with the following structure:

```json
{
  "pages": [
    {
      "u": "/path/to/page",
      "n": "ClassName",
      "k": "class",
      "v": "1.0.0",
      "p": "angular",
      "g": "package-name",
      "m": [
        ["memberName", "p"],
        ["onClick", "e"]
      ]
    }
  ]
}
```

## Keyboard Shortcuts

- `Ctrl+K` / `⌘K` — open/close the search dialog
- `Escape` — close the dialog
