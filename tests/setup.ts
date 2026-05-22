import type { PlatformContext } from '../src/lib/types.ts';

/**
 * Shared mock `platformContext` injected via `AstroContainer` locals
 * for every component that reads `Astro.locals.platformContext`.
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
