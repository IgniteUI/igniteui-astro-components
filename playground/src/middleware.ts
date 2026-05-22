import { defineMiddleware } from 'astro:middleware';
import type { PlatformContext } from '../../src/lib/types.ts';

const MOCK_PLATFORM: PlatformContext = {
    name: 'React',
    lower: 'react',
    prefix: 'Igr',
    productName: 'Ignite UI for React',
    productSpinal: 'ignite-ui-react',
    sassApiUrl: 'https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/sass',
    apiPackages: {
        core:        { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react/latest',            packageId: 'igniteui-react',            noPackagePrefix: true, preserveCase: true },
        charts:      { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-charts/latest',    packageId: 'igniteui-react-charts',     noPackagePrefix: true, preserveCase: true },
        grids:       { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-grids/latest',     packageId: 'igniteui-react-grids',      noPackagePrefix: true, preserveCase: true },
        gauges:      { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-gauges/latest',    packageId: 'igniteui-react-gauges',     noPackagePrefix: true, preserveCase: true },
        maps:        { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-maps/latest',      packageId: 'igniteui-react-maps',       noPackagePrefix: true, preserveCase: true },
        inputs:      { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-inputs/latest',    packageId: 'igniteui-react-inputs',     noPackagePrefix: true, preserveCase: true },
        layouts:     { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-layouts/latest',   packageId: 'igniteui-react-layouts',    noPackagePrefix: true, preserveCase: true },
        excel:       { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-excel/latest',     packageId: 'igniteui-react-excel',      noPackagePrefix: true, preserveCase: true },
        spreadsheet: { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-spreadsheet/latest', packageId: 'igniteui-react-spreadsheet', noPackagePrefix: true, preserveCase: true },
        datasources: { docRoot: 'https://www.infragistics.com/react-apis-new/react/igniteui-react-datasources/latest', packageId: 'igniteui-react-datasources', noPackagePrefix: true, preserveCase: true },
    },
    packages: {
        common: '@infragistics/igniteui-react',
        charts: '@infragistics/igniteui-react-charts',
        grids:  '@infragistics/igniteui-react-grids',
        gauges: '@infragistics/igniteui-react-gauges',
        maps:   '@infragistics/igniteui-react-maps',
    },
    links: {
        github:      'https://github.com/IgniteUI/igniteui-react',
        forums:      'https://www.infragistics.com/community/forums/f/ignite-ui-for-react',
        repoSamples: 'https://github.com/IgniteUI/igniteui-react-examples/tree/master/samples',
    },
};

const MOCK_ENV: Record<string, string> = {
    demosBaseUrl:   '',
    dvDemosBaseUrl: '',
};

export const onRequest = defineMiddleware((context, next) => {
    context.locals.platformContext = MOCK_PLATFORM;
    context.locals.envVars         = MOCK_ENV;
    return next();
});
