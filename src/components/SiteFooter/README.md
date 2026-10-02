# SiteFooter

The Infragistics global footer - the single source of the footer for every site built on this package. Nothing is fetched: `DocsLayout` renders it on every page. (Temporary exception: a `navLang: 'jp'` build still renders the legacy Japanese footer fetched by [`GlobalFooter`](../GlobalFooter/README.md), until the Japanese version of this design ships.)

Pairs with [`SiteNav`](../SiteNav/README.md).

## Import

```astro
import SiteFooter from 'igniteui-astro-components/components/SiteFooter.astro';
```

## Props

| Prop             | Type                      | Default     | Purpose                                                                                       |
| ---------------- | ------------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| `newsletter`     | `NewsletterOptions`       | _omitted_   | Renders the newsletter card. **Omit it and no card is rendered** — see below.                 |
| `cookieSettings` | `boolean`                 | `false`     | Renders "Cookie Settings" in the legal bar. Only where a consent banner binds it — see below. |
| `columns`        | `FooterGroup[][]`         | shipped set | The five link columns. A link with `children` nests; one without `href` is a sub-heading.     |
| `moreProducts`   | `FooterLink[]`            | shipped set | The "More Infragistics Products" strip.                                                       |
| `legal`          | `FooterLegalLink[]`       | shipped set | The legal row.                                                                                |
| `social`         | `readonly FooterSocial[]` | shipped set | The social icons.                                                                             |
| `year`           | `number`                  | build year  | Copyright year.                                                                               |

```ts
interface NewsletterOptions {
  /** JSON-serialisable config, written onto the [data-lead-form] wrapper. */
  config: unknown;
  /** false → fields disabled with a "not connected" notice. Default true. */
  ready?: boolean;
}
```

One environment variable, read at build time:

| Variable                | Default                            | Purpose                                                                                                      |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_ACCOUNT_ORIGIN` | `https://account.infragistics.com` | Origin for "Renewals & Subscriptions" and for the support chatbot at `{origin}/chatbot` ("Contact Support"). |

## The newsletter is opt-in, and you wire it

On the marketing site the footer reaches into that repo for three things: the lead-form config builder, two environment flags, and the form client. A package cannot — the newsletter posts to the IS Cloud API, which answers only to origins on an allow-list. A consumer on another hostname must not be handed a form that silently fails.

So **omitting `newsletter` renders no panel at all**, and the rest of the footer is unaffected. That is the right default for a docs site.

If you do pass it, you own two things:

1. **The config.** On the marketing site this is `buildLeadFormConfig({ leadSourceNumber: '9100010', eventDetail: 'newsletter signup', prohibitDisposableMail: true })`. Lead source 9100010 is the newsletter row; disposable addresses are refused while free ones are not, because a newsletter is the one signup where a personal address is a real reader.
2. **A client.** This component ships none. Mount your own against the `[data-lead-form]` wrapper and read the config off `data-lead-config` — the marketing site's `components/forms/leadForm.ts` does exactly that.

**Your origin must also be on the IS Cloud API's CORS allow-list.** Ask before shipping the card on a new hostname.

The field names are the client's contract, not cosmetic: `Email`, `acceptGDPRFormSubmission`, the `lf_hp` honeypot, `[data-form-error]`, `[data-thankyou]`. Rename one and the form silently stops working.

## Cookie Settings is opt-in too

GDPR wants withdrawing consent to be as easy as giving it, so the marketing site puts a "Cookie Settings" button in every footer. It is a `<button data-consent-open>`, and it does nothing by itself: the marketing site's `consentBanner.ts` binds that attribute and re-opens its panel. Pass `cookieSettings` only when your page runs a banner that does the same, or the button is a dead control.

## Behaviour

- **No network at build.** Markup, styling, the logo and the three compliance badges are compiled in.
- The link groups are an accordion **on phones only** (≤640px): each title gets a toggle button, the groups start open so the footer is whole without JavaScript, and the script closes them once. Wider, every group is shown and `aria-expanded` is reset to match.
- **Renders the same as www on a page that is not www.** The design tokens, fonts and element defaults the footer inherits from the marketing site's page come from [`../chrome/chrome.css`](../chrome/chrome.css), shared with `SiteNav` and scoped to the chrome. Among them is the `box-sizing: border-box` reset, without which the newsletter input measures 34px wider than its column and pushes a horizontal scrollbar onto the whole page.

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

Ported from the Marketing-Infragistics repo — the approved "Site Footer v5" design:

| Here                | There                                                            |
| ------------------- | ---------------------------------------------------------------- |
| `SiteFooter.astro`  | `src/components/chrome/SiteFooter.astro` (styles verbatim)       |
| `FooterLinks.astro` | `src/components/chrome/FooterLinks.astro`                        |
| `footer-config.ts`  | `src/config/footer.ts`                                           |
| `assets/`           | `public/assets/logos/ig-logo-dark.svg`, `src/assets/img/` badges |

The markup differs from the source only where a constant became a prop, where the newsletter card and Cookie Settings became opt-in, and in the form client the package does not ship.

Until the marketing site consumes this package, **changes must be made in both places.**
