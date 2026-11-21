import { describe, it, expect } from 'vitest';
import { codeToHtml } from 'shiki';
import rosePineMoon from '@shikijs/themes/rose-pine-moon';
import { igCodeTheme } from '../../src/code-theme';

const rules = igCodeTheme.tokenColors ?? [];
const baseRules = rosePineMoon.tokenColors ?? [];
const fontStyles = (list: typeof rules) => list.map((rule) => rule.settings.fontStyle);

describe('igCodeTheme', () => {
  it('carries no italic in any token rule', () => {
    const italic = rules.filter((rule) => /\bitalic\b/.test(rule.settings.fontStyle ?? ''));

    expect(italic).toEqual([]);
  });

  it('removes italic from rules the base theme italicises', () => {
    // Guards the test above: it proves nothing if the base theme has no italic rules.
    expect(fontStyles(baseRules)).toContain('italic');
  });

  it('keeps the bold rules of the base theme', () => {
    const bold = (list: typeof rules) =>
      list.filter((rule) => rule.settings.fontStyle === 'bold').map((rule) => rule.scope);

    expect(bold(baseRules).length).toBeGreaterThan(0);
    expect(bold(rules)).toEqual(bold(baseRules));
  });

  it('keeps the scope and colour of every base rule', () => {
    const shape = (list: typeof rules) =>
      list.map((rule) => ({ scope: rule.scope, foreground: rule.settings.foreground }));

    expect(shape(rules.slice(0, baseRules.length))).toEqual(shape(baseRules));
  });

  it.each([
    ['ts', '// note\nconst total = parseInt(input, 10);\nclass A extends B {}'],
    ['html', '<!-- note -->\n<igc-button variant="flat">Go</igc-button>'],
    ['scss', '// note\n$gap: 4px;\n.a { margin: $gap; }'],
    ['vue', '<template><p v-if="ok">Hi</p></template>'],
    ['md', 'Some *emphasis* and **strong** text.'],
  ])('renders a %s snippet without font-style:italic', async (lang, code) => {
    const html = await codeToHtml(code, { lang, theme: igCodeTheme });

    expect(html).not.toMatch(/font-style:\s*italic/);
  });

  it('renders the same snippets with italic in the base theme', async () => {
    const html = await codeToHtml('// note\nconst total = 1;', { lang: 'ts', theme: rosePineMoon });

    expect(html).toMatch(/font-style:\s*italic/);
  });
});
