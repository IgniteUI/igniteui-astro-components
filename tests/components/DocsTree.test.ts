import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DocsTree from '../../src/components/DocsTree/DocsTree.astro';
import type { TreeNode } from '../../src/components/DocsTree/types.ts';

const LEAF_NODE: TreeNode = {
  id: 'getting-started',
  label: 'Getting Started',
  href: '/docs/getting-started/',
};

const GROUP_NODE: TreeNode = {
  id: 'components',
  label: 'Components',
  children: [
    { id: 'button', label: 'Button', href: '/docs/button/' },
    { id: 'input', label: 'Input', href: '/docs/input/' },
  ],
};

describe('DocsTree', () => {
  it('renders igc-tree with the correct data-variant for sidebar', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTree, {
      props: { nodes: [LEAF_NODE], variant: 'sidebar' },
    });

    expect(html).toContain('data-variant="sidebar"');
  });

  it('renders igc-tree with the correct data-variant for toc', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTree, {
      props: { nodes: [LEAF_NODE], variant: 'toc' },
    });

    expect(html).toContain('data-variant="toc"');
  });

  it('renders leaf node label and href', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTree, {
      props: { nodes: [LEAF_NODE], variant: 'sidebar' },
    });

    expect(html).toContain('Getting Started');
    expect(html).toContain('href="/docs/getting-started/"');
  });

  it('renders group node with children', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTree, {
      props: { nodes: [GROUP_NODE], variant: 'sidebar' },
    });

    expect(html).toContain('Components');
    expect(html).toContain('Button');
    expect(html).toContain('Input');
  });

  it('sets aria-label on igc-tree when ariaLabel is provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTree, {
      props: {
        nodes: [LEAF_NODE],
        variant: 'sidebar',
        ariaLabel: 'Sidebar navigation',
      },
    });

    expect(html).toContain('aria-label="Sidebar navigation"');
  });

  it('marks active node with aria-current="page"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(DocsTree, {
      props: {
        nodes: [LEAF_NODE],
        variant: 'sidebar',
        activeId: 'getting-started',
      },
    });

    expect(html).toContain('aria-current="page"');
  });
});
