import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ApiLink from '../../src/components/mdx/ApiLink/ApiLink.astro';
import type { PlatformContext } from '../../src/lib/types.ts';

/**
 * The jQuery platform: class names carry no prefix (`igGrid`), member keys carry their kind
 * (`options:autoCommit`, `methods:state`), and one registry holds the JavaScript API and the
 * .NET API of several assemblies, whose type names collide, so links name the package.
 */
const pkg = (packageId: string) => ({
  docRoot: `https://docs.example.com/api/jquery/${packageId}/latest`,
  packageId,
  noPackagePrefix: true,
  preserveCase: true,
});

const jquery: PlatformContext = {
  name: 'jQuery',
  lower: 'jquery',
  prefix: '',
  productName: 'Ignite UI for jQuery',
  productSpinal: 'ignite-ui-jquery',
  apiPackages: {
    core: pkg('ignite-ui'),
    mvc: pkg('Infragistics.Web.Mvc'),
    aspnetcore: pkg('Infragistics.Web.AspNetCore'),
    'documents-excel': pkg('Infragistics.Web.Documents.Excel'),
  },
  packages: {
    common: 'ignite-ui',
    charts: 'ignite-ui',
    grids: 'ignite-ui',
    gauges: 'ignite-ui',
    maps: 'ignite-ui',
  },
  links: { github: '', forums: '', repoSamples: '' },
  apiLinkIndex: {
    symbols: {
      igGridUpdating: {
        p: 'ignite-ui',
        u: '/api/jquery/ignite-ui/latest/classes/igGridUpdating',
        k: 'class',
        m: {
          'options:columnSettings.columnKey': 'options:columnSettings.columnKey',
          'options:autoCommit': 'options:autoCommit',
          'events:dataDirty': 'events:dataDirty',
        },
      },
      igDialog: {
        p: 'ignite-ui',
        u: '/api/jquery/ignite-ui/latest/classes/igDialog',
        k: 'class',
        m: { 'options:state': 'options:state', 'methods:state': 'methods:state' },
      },
      GridModel: [
        {
          p: 'Infragistics.Web.AspNetCore',
          u: '/api/jquery-aspnet/Infragistics.Web.AspNetCore/latest/classes/GridModel',
          k: 'class',
          m: { 'LoadTransactions<T>': 'LoadTransactions<T>(string)' },
        },
        {
          p: 'Infragistics.Web.Mvc',
          u: '/api/jquery-aspnet/Infragistics.Web.Mvc/latest/classes/GridModel',
          k: 'class',
          m: { 'LoadTransactions<T>': 'LoadTransactions<T>(string)' },
        },
      ],
      Workbook: [
        { p: 'ignite-ui', u: '/api/jquery/ignite-ui/latest/classes/Workbook', k: 'class', m: {} },
        {
          p: 'Infragistics.Web.Documents.Excel',
          u: '/api/jquery-aspnet/Infragistics.Web.Documents.Excel/latest/classes/Workbook',
          k: 'class',
          m: {},
        },
      ],
    },
  },
};

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(ApiLink, {
    props: props as never,
    locals: { platformContext: jquery },
  });
}

describe('ApiLink on the jQuery platform', () => {
  it('resolves an unprefixed class and a kind-qualified nested option', async () => {
    const html = await render({
      type: 'igGridUpdating',
      member: 'options:columnSettings.columnKey',
      pkg: 'core',
      label: 'columnKey',
    });
    expect(html).toContain(
      'href="https://docs.example.com/api/jquery/ignite-ui/latest/classes/igGridUpdating#options:columnSettings.columnKey"',
    );
    expect(html).toContain('>columnKey<');
  });

  it('tells an option from a method of the same name', async () => {
    const option = await render({ type: 'igDialog', member: 'options:state', pkg: 'core' });
    const method = await render({ type: 'igDialog', member: 'methods:state', pkg: 'core' });
    expect(option).toContain('classes/igDialog#options:state"');
    expect(method).toContain('classes/igDialog#methods:state"');
  });

  it('matches a kind-qualified member case-insensitively and links the registry anchor', async () => {
    const html = await render({
      type: 'igGridUpdating',
      member: 'options:autocommit',
      pkg: 'core',
    });
    expect(html).toContain('#options:autoCommit"');
  });

  it('picks the assembly by pkg when a .NET type exists in two packages', async () => {
    const mvc = await render({ type: 'GridModel', member: 'LoadTransactions<T>', pkg: 'mvc' });
    const core = await render({
      type: 'GridModel',
      member: 'LoadTransactions<T>',
      pkg: 'aspnetcore',
    });
    expect(mvc).toContain(
      '/api/jquery-aspnet/Infragistics.Web.Mvc/latest/classes/GridModel#LoadTransactions<T>(string)"',
    );
    expect(core).toContain(
      '/api/jquery-aspnet/Infragistics.Web.AspNetCore/latest/classes/GridModel#LoadTransactions<T>(string)"',
    );
  });

  it('picks the JavaScript or the .NET Workbook by pkg', async () => {
    const js = await render({ type: 'Workbook', pkg: 'core' });
    const net = await render({ type: 'Workbook', pkg: 'documents-excel' });
    expect(js).toContain('/api/jquery/ignite-ui/latest/classes/Workbook"');
    expect(net).toContain(
      '/api/jquery-aspnet/Infragistics.Web.Documents.Excel/latest/classes/Workbook"',
    );
  });

  it('refuses to guess between packages when pkg is missing', async () => {
    await expect(render({ type: 'GridModel' })).rejects.toThrow(/Ambiguous API symbol "GridModel"/);
  });

  it('renders code text for a member the registry does not have', async () => {
    const html = await render({
      type: 'igGridUpdating',
      member: 'options:noSuchOption',
      pkg: 'core',
    });
    expect(html).not.toContain('<a ');
    expect(html).toContain('<code');
  });
});
