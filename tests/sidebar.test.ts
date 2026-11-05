import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSidebarFromToc } from '../src/sidebar';
import { SIDEBAR_BADGE_VARIANTS, type SidebarLink } from '../src/lib/sidebar/types';

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'sidebar-'));
  mkdirSync(path.join(dir, 'grids'));
  for (const name of ['new', 'preview', 'updated', 'premium', 'both', 'plain']) {
    writeFileSync(path.join(dir, 'grids', `${name}.md`), '# x\n');
  }
  writeFileSync(
    path.join(dir, 'toc.json'),
    JSON.stringify([
      { name: 'New', href: 'grids/new.md', new: true },
      { name: 'Preview', href: 'grids/preview.md', preview: true },
      { name: 'Updated', href: 'grids/updated.md', updated: true },
      { name: 'Premium', href: 'grids/premium.md', premium: true },
      { name: 'Both', href: 'grids/both.md', new: true, premium: true },
      { name: 'Plain', href: 'grids/plain.md' },
    ]),
  );
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

const links = () =>
  buildSidebarFromToc({ tocPath: path.join(dir, 'toc.json'), docsDir: dir }) as SidebarLink[];

describe('buildSidebarFromToc badges', () => {
  it('puts the status flag in `badges` with the variant the sidebar renders', () => {
    const byLabel = Object.fromEntries(links().map((l) => [l.label, l]));
    expect(byLabel.New.badges).toEqual([{ text: 'New', variant: 'new' }]);
    expect(byLabel.Preview.badges).toEqual([{ text: 'Preview', variant: 'preview' }]);
    expect(byLabel.Updated.badges).toEqual([{ text: 'Updated', variant: 'updated' }]);
    expect(byLabel.Plain.badges).toBeUndefined();
  });

  it('shows Premium as a badge only when no status badge is present, and always as an attribute', () => {
    const byLabel = Object.fromEntries(links().map((l) => [l.label, l]));
    expect(byLabel.Premium.badges).toEqual([{ text: 'Premium', variant: 'premium' }]);
    expect(byLabel.Premium.attrs).toEqual({ 'data-premium': 'true' });
    expect(byLabel.Both.badges).toEqual([{ text: 'New', variant: 'new' }]);
    expect(byLabel.Both.attrs).toEqual({ 'data-premium': 'true' });
  });

  it('uses only variants SidebarLabel knows', () => {
    for (const link of links()) {
      for (const badge of link.badges ?? []) {
        expect(SIDEBAR_BADGE_VARIANTS).toContain(badge.variant);
      }
    }
  });
});
