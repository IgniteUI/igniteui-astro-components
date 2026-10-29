import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FaqItem from '../../src/components/mdx/Faq/FaqItem.astro';

describe('FaqItem', () => {
  it('renders an igc-expansion-panel with the question in the title slot', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Is it free?' },
    });

    expect(html).toContain('<igc-expansion-panel');
    expect(html).toContain('class="igd-faq__item"');
    expect(html).toMatch(/<span slot="title" class="igd-faq__question"[^>]*>Is it free\?<\/span>/);
  });

  it('renders the subtitle slot only when a subtitle is given', async () => {
    const container = await AstroContainer.create();
    const withSubtitle = await container.renderToString(FaqItem, {
      props: { question: 'Q', subtitle: 'Licensing' },
    });
    const withoutSubtitle = await container.renderToString(FaqItem, {
      props: { question: 'Q' },
    });

    expect(withSubtitle).toMatch(/slot="subtitle"[^>]*>\s*Licensing\s*<\/span>/);
    expect(withoutSubtitle).not.toContain('slot="subtitle"');
  });

  it('renders the answer HTML when no slot content is given', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q', answer: '<p>Yes, <strong>MIT</strong>.</p>' },
    });

    expect(html).toContain('<p>Yes, <strong>MIT</strong>.</p>');
  });

  it('prefers slot content over the answer prop', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q', answer: '<p>From prop</p>' },
      slots: { default: '<p>From slot</p>' },
    });

    expect(html).toContain('From slot');
    expect(html).not.toContain('From prop');
  });

  it('is collapsed and enabled by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q' },
    });

    expect(html).not.toMatch(/<igc-expansion-panel[^>]*\sopen/);
    expect(html).not.toMatch(/<igc-expansion-panel[^>]*\sdisabled/);
  });

  it('sets open and disabled as boolean attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q', open: true, disabled: true },
    });

    expect(html).toMatch(/<igc-expansion-panel[^>]*\sopen/);
    expect(html).toMatch(/<igc-expansion-panel[^>]*\sdisabled/);
  });

  it('defaults indicator-position to end', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q' },
    });

    expect(html).toContain('indicator-position="end"');
  });

  it('forwards indicatorPosition', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q', indicatorPosition: 'start' },
    });

    expect(html).toContain('indicator-position="start"');
  });

  it('forwards the indicator slots inside wrappers', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q' },
      slots: { indicator: '<b>+</b>', 'indicator-expanded': '<b>-</b>' },
    });

    expect(html).toMatch(/<div slot="indicator" class="igd-faq__indicator"[^>]*><b>\+<\/b><\/div>/);
    expect(html).toMatch(
      /<div slot="indicator-expanded" class="igd-faq__indicator"[^>]*><b>-<\/b><\/div>/,
    );
  });

  it('omits indicator wrappers when no indicator slots are given', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: { question: 'Q' },
    });

    // An empty wrapper would suppress the panel's default chevron.
    expect(html).not.toContain('igd-faq__indicator');
  });

  it('forwards class, id and pass-through attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqItem, {
      props: {
        question: 'Q',
        class: 'highlight',
        id: 'licensing',
        'aria-label': 'Licensing question',
        'data-track': 'faq',
      },
    });

    expect(html).toContain('class="igd-faq__item highlight"');
    expect(html).toContain('id="licensing"');
    expect(html).toContain('aria-label="Licensing question"');
    expect(html).toContain('data-track="faq"');
  });
});
