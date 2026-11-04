import type { PlatformContext } from '../src/lib/types.ts';

/**
 * Shared mock `platformContext` for components that read `Astro.locals.platformContext`.
 * Nothing injects it automatically: pass it per render, e.g.
 * `container.renderToString(Component, { locals: { platformContext: MOCK_PLATFORM } })`.
 */
export const MOCK_PLATFORM: PlatformContext = {
  name: 'React',
  lower: 'react',
  prefix: 'Igr',
  productName: 'Ignite UI for React',
  productSpinal: 'ignite-ui-react',
  apiPackages: {
    core: {
      docRoot: 'https://example.com/react/igniteui-react/latest',
      packageId: 'igniteui-react',
      noPackagePrefix: true,
      preserveCase: true,
    },
    charts: {
      docRoot: 'https://example.com/react/igniteui-react-charts/latest',
      packageId: 'igniteui-react-charts',
      noPackagePrefix: true,
      preserveCase: true,
    },
  },
  packages: {
    common: '@igniteui/react',
    charts: '@igniteui/react-charts',
    grids: '@igniteui/react-grids',
    gauges: '@igniteui/react-gauges',
    maps: '@igniteui/react-maps',
  },
  links: {
    github: 'https://github.com/IgniteUI/igniteui-react',
    forums: 'https://www.infragistics.com/community/forums',
    repoSamples: 'https://github.com/IgniteUI/igniteui-react-examples',
  },
};

export const MOCK_ENV: Record<string, string> = {
  demosBaseUrl: 'https://demo.example.com',
  dvDemosBaseUrl: 'https://dv-demo.example.com',
};
