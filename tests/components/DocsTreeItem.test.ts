import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsTreeItem from '../../src/components/DocsTree/DocsTreeItem.astro';
import type { TreeNode } from '../../src/components/DocsTree/types.ts';

const LEAF_NODE: TreeNode = {
  id: 'leaf-1',
  label: 'Leaf Item',
  href: '/docs/leaf/',
};

const GROUP_NODE: TreeNode = {
  id: 'group-1',
  label: 'Group Item',
  children: [
    { id: 'child-1', label: 'Child One', href: '/docs/child-one/' },
  ],
};

describe('DocsTreeItem', () => {
  it('renders a leaf node with an anchor', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTreeItem, {
      props: { node: LEAF_NODE, depth: 0, variant: 'sidebar' },
    });

    expect(html).toContain('href="/docs/leaf/"');
    expect(html).toContain('Leaf Item');
  });

  it('sets data-tree-id on the tree item', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTreeItem, {
      props: { node: LEAF_NODE, depth: 0, variant: 'sidebar' },
    });

    expect(html).toContain('data-tree-id="leaf-1"');
  });

  it('sets data-depth on the tree item', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTreeItem, {
      props: { node: LEAF_NODE, depth: 2, variant: 'sidebar' },
    });

    expect(html).toContain('data-depth="2"');
  });

  it('renders group node without an anchor for the label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTreeItem, {
      props: { node: GROUP_NODE, depth: 0, variant: 'sidebar' },
    });

    expect(html).toContain('Group Item');
    expect(html).toContain('docs-tree-group');
  });

  it('renders group node with children', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTreeItem, {
      props: { node: GROUP_NODE, depth: 0, variant: 'sidebar' },
    });

    expect(html).toContain('Child One');
    expect(html).toContain('href="/docs/child-one/"');
  });

  it('sets aria-current="page" on the active leaf', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTreeItem, {
      props: {
        node: LEAF_NODE,
        depth: 0,
        variant: 'sidebar',
        activeId: 'leaf-1',
      },
    });

    expect(html).toContain('aria-current="page"');
  });

  it('does not set aria-current when the node is not active', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTreeItem, {
      props: {
        node: LEAF_NODE,
        depth: 0,
        variant: 'sidebar',
        activeId: 'other-node',
      },
    });

    expect(html).not.toContain('aria-current');
  });

  it('spreads itemData as data-* attributes', async () => {
    const container = await AstroContainer.create();
    const nodeWithData: TreeNode = {
      ...LEAF_NODE,
      itemData: { path: '/docs/leaf/', groupKey: 'section-a' },
    };
    const html = await container.renderToString(DocsTreeItem, {
      props: { node: nodeWithData, depth: 0, variant: 'sidebar' },
    });

    expect(html).toContain('data-path="/docs/leaf/"');
    expect(html).toContain('data-group-key="section-a"');
  });
});
