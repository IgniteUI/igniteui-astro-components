import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SidebarLabel from '../../src/components/DocsSidebar/SidebarLabel.astro';
import type { TreeNode } from '../../src/components/DocsTree/types.ts';

const LEAF_NODE: TreeNode = {
  id: 'button',
  label: 'Button',
  href: '/components/button/',
};

const GROUP_NODE: TreeNode = {
  id: 'components',
  label: 'Components',
  children: [
    { id: 'button', label: 'Button', href: '/components/button/' },
    { id: 'input', label: 'Input', href: '/components/input/' },
  ],
};

describe('SidebarLabel', () => {
  it('renders the leaf label text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarLabel, {
      props: { node: LEAF_NODE, depth: 0, isLeaf: true, isActive: false },
    });

    expect(html).toContain('Button');
    expect(html).toContain('docs-tree-label');
  });

  it('renders the group label text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarLabel, {
      props: { node: GROUP_NODE, depth: 0, isLeaf: false, isActive: false },
    });

    expect(html).toContain('Components');
    expect(html).toContain('group-label-text');
  });

  it('renders child count for group nodes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarLabel, {
      props: { node: GROUP_NODE, depth: 0, isLeaf: false, isActive: false },
    });

    expect(html).toContain('/2/');
  });

  it('renders badges for leaf nodes', async () => {
    const container = await AstroContainer.create();
    const nodeWithBadge: TreeNode = {
      ...LEAF_NODE,
      meta: { badges: [{ text: 'New', variant: 'new' }] },
    };
    const html = await container.renderToString(SidebarLabel, {
      props: { node: nodeWithBadge, depth: 0, isLeaf: true, isActive: false },
    });

    expect(html).toContain('New');
    expect(html).toContain('sidebar-badge new');
  });

  it('renders premium icon for premium badge', async () => {
    const container = await AstroContainer.create();
    const nodeWithPremium: TreeNode = {
      ...LEAF_NODE,
      meta: { badges: [{ text: 'Premium', variant: 'premium' }] },
    };
    const html = await container.renderToString(SidebarLabel, {
      props: { node: nodeWithPremium, depth: 0, isLeaf: true, isActive: false },
    });

    expect(html).toContain('name="premium"');
    expect(html).toContain('sidebar-premium-icon');
  });

  it('does not render badges for group nodes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SidebarLabel, {
      props: { node: GROUP_NODE, depth: 0, isLeaf: false, isActive: false },
    });

    expect(html).not.toContain('sidebar-badge');
  });
});
