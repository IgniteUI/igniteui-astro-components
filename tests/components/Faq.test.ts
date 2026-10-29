import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Faq from '../../src/components/mdx/Faq/Faq.astro';

const ITEMS = [
  { question: 'Is it free?', answer: '<p>Yes.</p>' },
  { question: 'Does it support SSR?', answer: '<p>It does.</p>', subtitle: 'Rendering' },
];

const panels = (html: string) => html.match(/<igc-expansion-panel[^>]*>/g) ?? [];

describe('Faq', () => {
  it('renders an igc-accordion', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, { props: {} });

    expect(html).toContain('<igc-accordion');
    expect(html).toContain('class="igd-faq"');
  });

  it('renders one panel per item in data mode', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, { props: { items: ITEMS } });

    expect(panels(html)).toHaveLength(2);
    expect(html).toContain('Is it free?');
    expect(html).toContain('<p>Yes.</p>');
    expect(html).toContain('Does it support SSR?');
    expect(html).toContain('Rendering');
  });

  it('forwards per-item open, disabled and id', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, {
      props: { items: [{ question: 'Q', open: true, disabled: true, id: 'q1' }] },
    });

    const [panel] = panels(html);
    expect(panel).toMatch(/\sopen/);
    expect(panel).toMatch(/\sdisabled/);
    expect(panel).toContain('id="q1"');
  });

  it('applies the list-level indicatorPosition to items', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, {
      props: { items: ITEMS, indicatorPosition: 'start' },
    });

    for (const panel of panels(html)) {
      expect(panel).toContain('indicator-position="start"');
    }
  });

  it('lets an item override the list-level indicatorPosition', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, {
      props: {
        items: [{ question: 'A' }, { question: 'B', indicatorPosition: 'none' }],
        indicatorPosition: 'start',
      },
    });

    const [first, second] = panels(html);
    expect(first).toContain('indicator-position="start"');
    expect(second).toContain('indicator-position="none"');
  });

  it('renders slotted children', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, {
      props: {},
      slots: { default: '<igc-expansion-panel>Slotted</igc-expansion-panel>' },
    });

    expect(html).toContain('<igc-expansion-panel>Slotted</igc-expansion-panel>');
  });

  it('renders items before slotted children when both are used', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, {
      props: { items: [{ question: 'From items' }] },
      slots: { default: '<p>From slot</p>' },
    });

    expect(html.indexOf('From items')).toBeLessThan(html.indexOf('From slot'));
  });

  it('sets single-expand only when singleExpand is true', async () => {
    const container = await AstroContainer.create();
    const single = await container.renderToString(Faq, { props: { singleExpand: true } });
    const multi = await container.renderToString(Faq, { props: {} });

    expect(single).toMatch(/<igc-accordion[^>]*\ssingle-expand/);
    expect(multi).not.toContain('single-expand');
  });

  it('forwards class, id and pass-through attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, {
      props: {
        class: 'compact',
        id: 'faq',
        'aria-label': 'Frequently asked questions',
        'data-section': 'pricing',
      },
    });

    expect(html).toContain('class="igd-faq compact"');
    expect(html).toContain('id="faq"');
    expect(html).toContain('aria-label="Frequently asked questions"');
    expect(html).toContain('data-section="pricing"');
  });
});
