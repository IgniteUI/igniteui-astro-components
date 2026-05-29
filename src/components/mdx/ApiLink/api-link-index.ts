import type { ApiPackageConfig, PlatformContext } from '../../../lib/types';

export type ApiKind = 'class' | 'interface' | 'enum' | 'type' | 'variable' | 'function' | 'sass';
export type TypeDocKind = Exclude<ApiKind, 'sass'>;

export const KIND_SEGMENT: Record<TypeDocKind, string> = {
    class:     'classes',
    interface: 'interfaces',
    enum:      'enums',
    type:      'types',
    variable:  'variables',
    function:  'functions',
};

type ApiLinkIndexSymbol = {
    /** Package id. */
    p?: string;
    /** URL. */
    u: string;
    /** Kind. */
    k?: TypeDocKind;
    /** URL segment. */
    s?: string;
    /** Member name to anchor map. */
    m?: Record<string, string>;
};

type ApiLinkIndexFile = {
    symbols?: Record<string, ApiLinkIndexSymbol | ApiLinkIndexSymbol[]>;
};

export type ApiLinkIndexResolution =
    | { status: 'resolved'; url: string; symbolName: string; memberAnchor: string }
    | { status: 'missing' }
    | { status: 'unavailable' };

const indexCache = new Map<string, Promise<ApiLinkIndexFile | null>>();

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const upperFirst = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

function addUnique(values: string[], value?: string): void {
    if (value && !values.includes(value)) values.push(value);
}

function getVersionFromDocRoot(docRoot: string, packageId: string): string | undefined {
    const root = trimTrailingSlash(docRoot);
    const marker = `/${packageId}/`;
    const markerIndex = root.lastIndexOf(marker);
    if (markerIndex === -1) return undefined;

    return root.slice(markerIndex + marker.length).split('/').filter(Boolean)[0];
}

function getApiLinkIndexRoot(ctx: PlatformContext, pkgConfig: ApiPackageConfig): string | undefined {
    if (ctx.apiLinkIndexRoot) return trimTrailingSlash(ctx.apiLinkIndexRoot);

    const root = trimTrailingSlash(pkgConfig.docRoot);
    const marker = `/${pkgConfig.packageId}/`;
    const markerIndex = root.lastIndexOf(marker);
    if (markerIndex === -1) return undefined;

    return `${root.slice(0, markerIndex)}/api-link-index`;
}

async function resolveIndexUrl(options: {
    ctx: PlatformContext;
    pkgConfig: ApiPackageConfig;
    packageScoped: boolean;
}): Promise<string | undefined> {
    const { ctx, pkgConfig, packageScoped } = options;
    if (packageScoped && pkgConfig.apiLinkIndexUrl) return pkgConfig.apiLinkIndexUrl;

    const version = getVersionFromDocRoot(pkgConfig.docRoot, pkgConfig.packageId);
    const root = getApiLinkIndexRoot(ctx, pkgConfig);
    if (!version || !root) return undefined;

    return packageScoped
        ? `${root}/${pkgConfig.packageId}/${version}.json`
        : `${root}/${version}.json`;
}

async function loadApiLinkIndex(url?: string): Promise<ApiLinkIndexFile | null> {
    if (!url) return null;

    if (!indexCache.has(url)) {
        indexCache.set(url, fetch(url)
            .then(response => response.ok ? response.json() : null)
            .catch(() => null));
    }

    return indexCache.get(url)!;
}

function buildCandidateNames(options: {
    type: string;
    explicitKind?: TypeDocKind;
    prefix: string;
    prefixed: boolean;
    suffix: boolean;
    classSuffix?: string;
}): string[] {
    const candidates: string[] = [];
    const baseNames: string[] = [];

    if (options.prefixed) addUnique(baseNames, `${options.prefix}${options.type}`);
    addUnique(baseNames, options.type);

    for (const baseName of baseNames) {
        if ((!options.explicitKind || options.explicitKind === 'class') && options.suffix && options.classSuffix) {
            addUnique(candidates, `${baseName}${options.classSuffix}`);
        }
        addUnique(candidates, baseName);
    }

    return candidates;
}

function resolveIndexedMember(symbol: ApiLinkIndexSymbol, member: string | undefined, pkgConfig: ApiPackageConfig): string | null {
    if (!member) return '';

    const members = symbol.m ?? {};
    const candidates: string[] = [];
    addUnique(candidates, member);
    if (pkgConfig.pascalCaseMembers) addUnique(candidates, upperFirst(member));
    addUnique(candidates, upperFirst(member));
    addUnique(candidates, member.toLowerCase());

    for (const candidate of candidates) {
        if (members[candidate]) return members[candidate];
    }

    return null;
}

function findIndexedSymbol(options: {
    index: ApiLinkIndexFile;
    candidates: string[];
    explicitKind?: TypeDocKind;
    member?: string;
    pkgConfig: ApiPackageConfig;
}) {
    const symbols = options.index.symbols ?? {};

    for (const name of options.candidates) {
        const value = symbols[name];
        if (!value) continue;

        const symbolList = Array.isArray(value) ? value : [value];
        for (const symbol of symbolList) {
            if (options.explicitKind && symbol.k && symbol.k !== options.explicitKind) continue;
            const memberAnchor = resolveIndexedMember(symbol, options.member, options.pkgConfig);
            if (memberAnchor === null) continue;
            return { name, symbol, memberAnchor };
        }
    }

    return null;
}

function absolutizeIndexUrl(indexedPath: string, docRoot: string): string {
    if (!indexedPath.startsWith('/')) return indexedPath;

    try {
        return `${new URL(docRoot).origin}${indexedPath}`;
    } catch {
        return indexedPath;
    }
}

export async function resolveApiLinkFromIndex(options: {
    ctx: PlatformContext;
    pkgConfig: ApiPackageConfig;
    explicitPkg: boolean;
    type: string;
    member?: string;
    explicitKind?: TypeDocKind;
    prefix: string;
    prefixed: boolean;
    suffix: boolean;
}): Promise<ApiLinkIndexResolution> {
    const indexUrl = await resolveIndexUrl({
        ctx: options.ctx,
        pkgConfig: options.pkgConfig,
        packageScoped: options.explicitPkg,
    });
    const index = await loadApiLinkIndex(indexUrl);
    if (!index?.symbols) {
        return { status: 'unavailable' };
    }

    if (Object.keys(index.symbols).length === 0) {
        return { status: 'missing' };
    }

    const candidates = buildCandidateNames({
        type: options.type,
        explicitKind: options.explicitKind,
        prefix: options.prefix,
        prefixed: options.prefixed,
        suffix: options.suffix,
        classSuffix: options.pkgConfig.classSuffix,
    });
    const indexed = findIndexedSymbol({
        index,
        candidates,
        explicitKind: options.explicitKind,
        member: options.member,
        pkgConfig: options.pkgConfig,
    });

    if (!indexed) return { status: 'missing' };

    const path = `${indexed.symbol.u}${indexed.memberAnchor ? `#${indexed.memberAnchor}` : ''}`;
    return {
        status: 'resolved',
        url: absolutizeIndexUrl(path, options.pkgConfig.docRoot),
        symbolName: indexed.name,
        memberAnchor: indexed.memberAnchor,
    };
}
