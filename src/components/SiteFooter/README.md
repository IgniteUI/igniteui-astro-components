# SiteFooter

The Infragistics global footer, compiled into the package rather than fetched from `/navigation`.

Pairs with [`SiteNav`](../SiteNav/README.md); the same trade-off applies — see [Choosing between SiteNav and GlobalNavBar](../SiteNav/README.md#choosing-between-sitenav-and-globalnavbar).

## Import

```astro
import SiteFooter from 'igniteui-astro-components/components/SiteFooter.astro';
```

## Props

| Prop         | Type                | Default     | Purpose                                                                         |
| ------------ | ------------------- | ----------- | ------------------------------------------------------------------------------- |
| `newsletter` | `NewsletterOptions` | _omitted_   | Renders the newsletter panel. **Omit it and no panel is rendered** — see below. |
| `columns`    | `FooterGroup[][]`   | shipped set | The four link columns.                                                          |
| `legal`      | `FooterLink[]`      | shipped set | The legal row.                                                                  |
| `social`     | `FooterSocial[]`    | shipped set | The social icons.                                                               |
| `year`       | `number`            | build year  | Copyright year.                                                                 |

```ts
interface NewsletterOptions {
  /** JSON-serialisable config, written onto the [data-lead-form] wrapper. */
  config: unknown;
  /** false → fields disabled with a "not connected" notice. Default true. */
  ready?: boolean;
}
```

One environment variable, read at build time:

| Variable                | Default                            | Purpose                                                                                                                          |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_ACCOUNT_ORIGIN` | `https://account.infragistics.com` | Origin for the four customer-portal links (Technical Support Chat, Submit a Request, Manage My Subscriptions, Support Requests). |

## The newsletter is opt-in, and you wire it

On the marketing site the footer reaches into that repo for three things: the lead-form config builder, two environment flags, and the form client. A package cannot — the newsletter posts to the IS Cloud API, which answers only to origins on an allow-list. A consumer on another hostname must not be handed a form that silently fails.

So **omitting `newsletter` renders no panel at all**, and the rest of the footer is unaffected. That is the right default for a docs site.

If you do pass it, you own two things:

1. **The config.** On the marketing site this is `buildLeadFormConfig({ leadSourceNumber: '9100010', eventDetail: 'newsletter signup', prohibitDisposableMail: true })`. Lead source 9100010 is the newsletter row; disposable addresses are refused while free ones are not, because a newsletter is the one signup where a personal address is a real reader.
2. **A client.** This component ships none. Mount your own against the `[data-lead-form]` wrapper and read the config off `data-lead-config` — the marketing site's `components/forms/leadForm.ts` does exactly that.

**Your origin must also be on the IS Cloud API's CORS allow-list.** Ask before shipping the panel on a new hostname.

The field names are the client's contract, not cosmetic: `Email`, `acceptGDPRFormSubmission`, the `lf_hp` honeypot, `[data-form-error]`, `[data-thankyou]`. Rename one and the form silently stops working.

## Behaviour

- **No network at build.** Markup, styling and the three compliance badges are compiled in.
- The four link columns are a `<details>` accordion **on phones only** (≤699px); wider, they render open and the summary is not a tab stop.
- Ships a scoped `box-sizing: border-box` reset. The marketing site sets that globally; a package cannot assume a host page does, and without it the newsletter input measures 34px wider than its column and pushes a horizontal scrollbar onto the whole page.

## Examples

Docs site — no newsletter:

```astro
---
import SiteFooter from 'igniteui-astro-components/components/SiteFooter.astro';
---

<SiteFooter />
```

With the newsletter, and your own client:

```astro
---
import SiteFooter from 'igniteui-astro-components/components/SiteFooter.astro';
const config = { leadSourceNumber: '9100010', eventDetail: 'newsletter signup' };
---

<SiteFooter newsletter={{ config }} />
<script>
  import { initLeadForms } from '../lib/your-lead-form-client';
  initLeadForms();
</script>
```

Different links:

```astro
---
import SiteFooter from 'igniteui-astro-components/components/SiteFooter.astro';
import { FOOTER_LEGAL } from 'igniteui-astro-components/components/SiteFooter/footer-config';
---

<SiteFooter columns={myColumns} legal={FOOTER_LEGAL} />
```

## Source

Ported from `src/components/chrome/SiteFooter.astro` and `src/config/footer.ts` in the Marketing-Infragistics repo, with the three badge images copied into `./assets/`.

Until the marketing site consumes this package, **changes must be made in both places.**
