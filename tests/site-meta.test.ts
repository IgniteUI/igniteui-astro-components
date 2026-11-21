import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildSiteMetaModule, SITE_META_EXPORTS } from '../src/site-meta';

// integration.ts imports both at module level and neither is installed (#157).
vi.mock('pagefind', () => ({ createIndex: vi.fn() }));
vi.mock('gray-matter', () => ({ default: vi.fn() }));
import { siteMetaIntegration } from '../src/integration';

const base = {
  title: 'Site',
  sidebar: [],
  productLinks: [],
  headEntries: [],
  trailingSlash: 'ignore' as const,
  navLang: 'en' as const,
};

/** Names declared for the module in virtual-modules.d.ts, which the components import against. */
function declaredExports(): string[] {
  const dts = readFileSync(new URL('../src/virtual-modules.d.ts', import.meta.url), 'utf8');
  const start = dts.indexOf("declare module 'virtual:docs-template/site-meta'");
  const end = dts.indexOf("declare module 'virtual:docs-template/nav-html'");
  return [...dts.slice(start, end).matchAll(/export const (\w+)/g)].map((m) => m[1]);
}

function emittedExports(code: string): string[] {
  return [...code.matchAll(/^export const (\w+) = /gm)].map((m) => m[1]);
}

/** Evaluates the generated module as real ESM. */
async function load(code: string): Promise<Record<string, unknown>> {
  return import(/* @vite-ignore */ `data:text/javascript,${encodeURIComponent(code)}`);
}

describe('buildSiteMetaModule', () => {
  it('exports every name virtual-modules.d.ts declares, and nothing else', () => {
    const declared = declaredExports();
    expect(declared).toHaveLength(8);
    expect(emittedExports(buildSiteMetaModule(base)).sort()).toEqual([...declared].sort());
    expect([...SITE_META_EXPORTS].sort()).toEqual([...declared].sort());
  });

  it('exports packages and selectedPackage as given', async () => {
    const mod = await load(
      buildSiteMetaModule({
        ...base,
        packages: ['igniteui-angular', { label: 'React', value: 'react', base: '/react/' }],
        selectedPackage: 'react',
      }),
    );
    expect(mod.packages).toEqual([
      'igniteui-angular',
      { label: 'React', value: 'react', base: '/react/' },
    ]);
    expect(mod.selectedPackage).toBe('react');
  });

  it('exports undefined for packages and selectedPackage when they are omitted', async () => {
    const mod = await load(buildSiteMetaModule(base));
    expect('packages' in mod).toBe(true);
    expect(mod.packages).toBeUndefined();
    expect(mod.selectedPackage).toBeUndefined();
  });

  it('serialises the other values as JSON', async () => {
    const mod = await load(
      buildSiteMetaModule({
        ...base,
        title: 'My "Docs"',
        trailingSlash: 'always',
        productLinks: [{ label: 'Angular', href: '/angular/' }],
      }),
    );
    expect(mod.title).toBe('My "Docs"');
    expect(mod.trailingSlash).toBe('always');
    expect(mod.productLinks).toEqual([{ label: 'Angular', href: '/angular/' }]);
  });
});

type Plugin = { name: string; load(id: string): string | undefined };

/** Runs the two config hooks and returns the generated site-meta module source. */
function siteMetaSource(options: Parameters<typeof siteMetaIntegration>[0]): string {
  const integration = siteMetaIntegration(options);
  let plugin: Plugin | undefined;
  const hooks = integration.hooks as Record<string, (ctx: unknown) => void>;
  hooks['astro:config:done']({ config: { site: 'https://example.com', trailingSlash: 'never' } });
  hooks['astro:config:setup']({
    injectRoute: () => {},
    updateConfig: (cfg: { vite?: { plugins?: Plugin[] } }) => {
      plugin =
        cfg.vite?.plugins?.find((p) => p.name === 'vite-plugin-docs-template-site-meta') ?? plugin;
    },
  });
  return plugin!.load('\0virtual:docs-template/site-meta')!;
}

describe('siteMetaIntegration', () => {
  it('provides every name virtual-modules.d.ts declares', () => {
    expect(emittedExports(siteMetaSource({ title: 'T' })).sort()).toEqual(declaredExports().sort());
  });

  it('emits packages and selectedPackage from its options', async () => {
    const mod = await load(
      siteMetaSource({ title: 'T', packages: ['a', 'b'], selectedPackage: 'b' }),
    );
    expect(mod.packages).toEqual(['a', 'b']);
    expect(mod.selectedPackage).toBe('b');
    expect(mod.trailingSlash).toBe('never');
  });
});
