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
    /** Member name to anchor map. */
    m?: Record<string, string>;
};

type ApiLinkIndexFile = {
    symbols?: Record<string, ApiLinkIndexSymbol | ApiLinkIndexSymbol[]>;
};

export type ApiLinkIndexResolution =
    | { status: 'resolved'; url: string; symbolName: string; memberName: string; memberAnchor: string }
    | { status: 'ambiguous'; candidate: string }
    | { status: 'member-missing'; candidate: string }
    | { status: 'missing' }
    | { status: 'unavailable' };

const upperFirst = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

function buildCandidateNames(options: {
    type: string;
    explicitKind?: TypeDocKind;
    prefix: string;
    prefixed: boolean;
    suffix: boolean;
    classSuffix?: string;
}): string[] {
    const candidates = new Set<string>();
    const baseNames = new Set<string>();

    if (options.prefixed) baseNames.add(`${options.prefix}${options.type}`);
    baseNames.add(options.type);

    for (const baseName of baseNames) {
        if ((!options.explicitKind || options.explicitKind === 'class') && options.suffix && options.classSuffix) {
            candidates.add(`${baseName}${options.classSuffix}`);
        }
        candidates.add(baseName);
    }

    return [...candidates];
}

function resolveIndexedMember(symbol: ApiLinkIndexSymbol, member: string | undefined): { memberName: string; memberAnchor: string } | null {
    if (!member) return { memberName: '', memberAnchor: '' };

    const members = symbol.m ?? {};
    const candidates = new Set([member, upperFirst(member), member.toLowerCase()]);

    for (const candidate of candidates) {
        if (Object.hasOwn(members, candidate)) {
            return { memberName: candidate, memberAnchor: members[candidate] };
        }
    }

    const normalized = member.toLowerCase();
    for (const [registryMember, memberAnchor] of Object.entries(members)) {
        if (registryMember.toLowerCase() === normalized) {
            return { memberName: registryMember, memberAnchor };
        }
    }

    return null;
}

function findIndexedSymbol(options: {
    index: ApiLinkIndexFile;
    candidates: string[];
    packageId?: string;
    explicitKind?: TypeDocKind;
    member?: string;
}): { name: string; symbol: ApiLinkIndexSymbol; memberName: string; memberAnchor: string } | { ambiguous: true; candidate: string } | { memberMissing: true; candidate: string } | null {
    const symbols = options.index.symbols ?? {};
    let ambiguity: { ambiguous: true; candidate: string } | null = null;
    let memberMissing: { memberMissing: true; candidate: string } | null = null;

    for (const name of options.candidates) {
        const value = symbols[name];
        if (!value) continue;

        const symbolList = Array.isArray(value) ? value : [value];
        const matches = new Map<string, {
            name: string;
            symbol: ApiLinkIndexSymbol;
            memberName: string;
            memberAnchor: string;
        }>();
        let matchedSymbol = false;

        for (const symbol of symbolList) {
            if (options.packageId && symbol.p !== options.packageId) continue;
            if (options.explicitKind && symbol.k !== options.explicitKind) continue;
            matchedSymbol = true;
            const memberMatch = resolveIndexedMember(symbol, options.member);
            if (memberMatch === null) continue;

            const key = `${symbol.u}#${memberMatch.memberAnchor}`;
            matches.set(key, {
                name,
                symbol,
                memberName: memberMatch.memberName,
                memberAnchor: memberMatch.memberAnchor,
            });
        }

        if (matches.size === 1) {
            return matches.values().next().value!;
        }
        if (matches.size > 1 && !ambiguity) {
            ambiguity = { ambiguous: true, candidate: name };
        }
        if (matches.size === 0 && matchedSymbol && options.member && !memberMissing) {
            memberMissing = { memberMissing: true, candidate: name };
        }
    }

    return ambiguity ?? memberMissing;
}

function absolutizeIndexUrl(indexedPath: string, docRoot: string): string {
    if (!indexedPath.startsWith('/')) return indexedPath;

    try {
        return `${new URL(docRoot).origin}${indexedPath}`;
    } catch {
        return indexedPath;
    }
}

function getCandidateClassSuffixes(options: {
    ctx: PlatformContext;
    explicitPkg: boolean;
    pkgConfig: ApiPackageConfig;
}): Array<string | undefined> {
    if (options.explicitPkg) {
        return [options.pkgConfig.classSuffix];
    }

    const suffixes = new Set<string | undefined>();
    for (const pkg of Object.values(options.ctx.apiPackages)) {
        suffixes.add(pkg.classSuffix);
    }

    // Put undefined (no suffix) last so suffixed names are tried first.
    return [...suffixes].sort((a, b) => (a === undefined ? 1 : b === undefined ? -1 : 0));
}

export function resolveApiLinkFromIndex(options: {
    ctx: PlatformContext;
    pkgConfig: ApiPackageConfig;
    explicitPkg: boolean;
    type: string;
    member?: string;
    explicitKind?: TypeDocKind;
    prefix: string;
    prefixed: boolean;
    suffix: boolean;
}): ApiLinkIndexResolution {
    const index = options.ctx.apiLinkIndex as ApiLinkIndexFile | undefined;
    if (!index?.symbols) {
        return { status: 'unavailable' };
    }

    const candidates = new Set<string>();
    for (const classSuffix of getCandidateClassSuffixes(options)) {
        for (const candidate of buildCandidateNames({
            type: options.type,
            explicitKind: options.explicitKind,
            prefix: options.prefix,
            prefixed: options.prefixed,
            suffix: options.suffix,
            classSuffix,
        })) {
            candidates.add(candidate);
        }
    }

    const indexed = findIndexedSymbol({
        index,
        candidates: [...candidates],
        packageId: options.explicitPkg ? options.pkgConfig.packageId : undefined,
        explicitKind: options.explicitKind,
        member: options.member,
    });

    if (!indexed) return { status: 'missing' };
    if ('ambiguous' in indexed) return { status: 'ambiguous', candidate: indexed.candidate };
    if ('memberMissing' in indexed) return { status: 'member-missing', candidate: indexed.candidate };

    // Use the resolved symbol's package docRoot when available, so cross-package
    // symbols resolve against the correct origin rather than always core.
    const resolvedDocRoot = (indexed.symbol.p
        ? Object.values(options.ctx.apiPackages).find(pkg => pkg.packageId === indexed.symbol.p)?.docRoot
        : undefined) ?? options.pkgConfig.docRoot;

    const path = `${indexed.symbol.u}${indexed.memberAnchor ? `#${indexed.memberAnchor}` : ''}`;
    return {
        status: 'resolved',
        url: absolutizeIndexUrl(path, resolvedDocRoot),
        symbolName: indexed.name,
        memberName: indexed.memberName,
        memberAnchor: indexed.memberAnchor,
    };
}
