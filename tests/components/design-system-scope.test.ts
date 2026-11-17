import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve('src/components');

// Components with no root element to mark, and why.
const UNMARKED: Record<string, string> = {
  'CopyCode/CopyCode.astro': 'renders a script only',
  'DocsSidebar/SidebarLabel.astro': 'renders inside a tree item, which has no scope of its own',
  'DocsTree/DocsTree.astro':
    'sets --ig-size: 1 for the tree; its design system spacing stays at the page size',
  'DocsTree/DocsTreeItem.astro': 'same as DocsTree',
  'LicenseIndicator/LicenseIndicator.astro': 'its root is Badge, which marks itself',
  'mdx/ApiLink/ApiLink.astro': 'renders a link or text inside a sentence',
  'mdx/PlatformBlock/PlatformBlock.astro': 'renders its slot only',
};

const components = fs
  .readdirSync(ROOT, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.astro'))
  .map((f) => f.split(path.sep).join('/'))
  .sort();

describe('data-ig-scope', () => {
  it.each(components.filter((f) => !(f in UNMARKED)))('%s marks its root element', (file) => {
    expect(fs.readFileSync(path.join(ROOT, file), 'utf8')).toContain('data-ig-scope');
  });

  it.each(Object.keys(UNMARKED))('%s is a listed exception and carries no mark', (file) => {
    expect(fs.readFileSync(path.join(ROOT, file), 'utf8')).not.toContain('data-ig-scope');
  });

  it('lists only exceptions that exist', () => {
    expect(Object.keys(UNMARKED).filter((f) => !components.includes(f))).toEqual([]);
  });
});
