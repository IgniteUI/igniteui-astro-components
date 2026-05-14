/**
 * sample-widget.ts
 *
 * Client-side widget initialization for the <Sample> Astro component.
 *
 * The HTML shell is pre-rendered by Sample.astro (navbar, iframe, loading state).
 * This module handles the dynamic parts:
 *   – Serial iframe loading (one at a time, IntersectionObserver-based)
 *   – Code-tab fetching and rendering (Angular JSON or xplat JSON)
 *   – Tab switching via <igc-tabs> / <igc-tab> web components
 *   – Live-editing footer (StackBlitz / CodeSandbox)
 *
 * Selector: `.igd-code-view[data-platform]`
 *   This distinguishes pre-rendered Sample.astro widgets from `.ig-code-view`
 *   elements that come from the docfx pipeline (handled by code-view.js).
 */

import { defineComponents, IgcTabsComponent, IgcTabComponent, IgcButtonComponent, IgcIconButtonComponent, IgcIconComponent, IgcCircularProgressComponent } from 'igniteui-webcomponents';
defineComponents(IgcTabsComponent, IgcTabComponent, IgcButtonComponent, IgcIconButtonComponent, IgcIconComponent, IgcCircularProgressComponent);

import './icon-registry';
import stackblitzSvg from '../assets/logos/stackblitz.svg?raw';
import codeSandboxSvg from '../assets/logos/code-sandbox.svg?raw';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLES_ORDER = ['modules', 'ts', 'html', 'scss', 'css'];

const XPLAT_SAMPLES_ORDER: Record<string, string[]> = {
    react:  ['tsx', 'ts', 'html', 'css'],
    wc:     ['tsx', 'ts', 'html', 'css'],
    blazor: ['razor', 'cs', 'js', 'css'],
};

const XPLAT_CODE_BASE: Record<string, string> = {
    wc:     '/assets/code-viewer/',
    react:  '/code-viewer/',
    blazor: '/code-viewer/',
};

const DV_PATHS  = ['gauges/', 'maps/', 'excel/', 'charts/'];
const ASSETS_RE = /([.]{0,2}\/)*assets\//g;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SampleFile {
    fileExtension: string;
    fileHeader:    string;
    content:       string;
    isMain:        boolean;
    path?:         string;
}

interface WidgetContext {
    widget:       HTMLElement;
    iframeSrc:    string;
    demosBaseUrl: string;
    widgetIndex:  number;
    igcTabs:      HTMLElement;
    githubSrc:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalizes the platform string so it matches the lookup table keys.
 * platform-context.ts returns 'webcomponents' but XPLAT_* tables use 'wc'.
 */
function normalizePlatform(raw: string): string {
    if (raw === 'webcomponents' || raw === 'web-components') return 'wc';
    return raw;
}

function isXplatPlatform(platform: string): boolean {
    return platform === 'react' || platform === 'wc' || platform === 'blazor';
}

function getSamplePath(iframeSrc: string, demosBaseUrl: string): string {
    return iframeSrc
        .replace(demosBaseUrl + '/', '')
        .replace(/\?.*/, '')
        .replace(/\/$/, '');
}

function isDvSample(samplePath: string): boolean {
    return DV_PATHS.some(p => samplePath.startsWith(p));
}

function getRepoBranch(demosBaseUrl: string, isDv: boolean): string {
    const host      = new URL(demosBaseUrl).host;
    const isNonProd = host.includes('staging')
        || window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1';
    if (isDv) return 'vnext';
    return isNonProd ? 'vNext' : 'master';
}

function getXplatBranch(demosBaseUrl: string): string {
    const host      = new URL(demosBaseUrl).host;
    const isNonProd = host.includes('staging')
        || window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1';
    return isNonProd ? 'vnext' : 'master';
}

function replaceRelativeAssetUrls(files: SampleFile[], demosBaseUrl: string): void {
    const assetsBase = demosBaseUrl.replace(/\/$/, '') + '/assets/';
    files.forEach(f => {
        if (f.content && ASSETS_RE.test(f.content)) {
            f.content = f.content.replace(ASSETS_RE, assetsBase);
        }
        ASSETS_RE.lastIndex = 0;
    });
}

// ─── Code Tab Rendering ───────────────────────────────────────────────────────

function addCodeTab(
    igcTabs: HTMLElement,
    file:    SampleFile,
): void {
    const lang = file.fileExtension === 'js' ? 'javascript' : (file.fileExtension || 'text');

    const tab = document.createElement('igc-tab');
    tab.setAttribute('label', file.fileHeader.toUpperCase());

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';

    const pre  = document.createElement('pre');
    const code = document.createElement('code');
    code.className   = `language-${lang}`;
    code.textContent = file.content;
    pre.appendChild(code);

    const copyBtn = document.createElement('igc-icon-button') as HTMLElement;
    copyBtn.setAttribute('variant', 'outlined');
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.className = 'cv-hljs-code-copy';

    const copyIcon = document.createElement('igc-icon');
    copyIcon.setAttribute('name', 'copy');
    copyIcon.setAttribute('collection', 'docs');
    copyBtn.appendChild(copyIcon);

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(file.content).then(() => {
            copyIcon.setAttribute('name', 'check');
            copyBtn.setAttribute('aria-label', 'Code copied');
            setTimeout(() => {
                copyIcon.setAttribute('name', 'copy');
                copyBtn.setAttribute('aria-label', 'Copy code');
            }, 1500);
        });
    });

    wrapper.appendChild(pre);
    wrapper.appendChild(copyBtn);
    tab.appendChild(wrapper);
    igcTabs.appendChild(tab);

    if (typeof (window as any).hljs !== 'undefined') {
        (window as any).hljs.highlightElement(code);
    }
}

// ─── Footer / Live Edit Buttons ───────────────────────────────────────────────

function addFooter(
    widget:         HTMLElement,
    iframeSrc:      string,
    explicitEditor: string | null,
    onStackblitz:   (() => void) | null,
    onCodeSandbox:  (() => void) | null,
): void {
    const footer     = document.createElement('div');
    footer.className = 'igd-code-view__footer-actions';

    const label       = document.createElement('span');
    label.className   = 'editing-label';
    footer.appendChild(label);

    const fsBtn = document.createElement('igc-button') as HTMLElement;
    fsBtn.setAttribute('variant', 'outlined');
    fsBtn.setAttribute('aria-label', 'Open in full screen');
    fsBtn.className = 'igd-full-screen-btn igd-edit-in-btn';
    fsBtn.innerHTML = `<igc-icon name="open-link-blank" collection="docs" slot="prefix"></igc-icon>Full screen`;
    if (iframeSrc) {
        const fullscreenSrc = iframeSrc + (iframeSrc.includes('?') ? '&' : '?') + 'nav=0';
        fsBtn.setAttribute('href', fullscreenSrc);
        fsBtn.setAttribute('target', '_blank');
    }
    footer.appendChild(fsBtn);

    if ((!explicitEditor || explicitEditor === 'stackblitz') && onStackblitz) {
        const btn = document.createElement('igc-button') as HTMLElement;
        btn.setAttribute('variant', 'outlined');
        btn.setAttribute('aria-label', 'Edit in StackBlitz');
        btn.className = 'stackblitz-btn igd-edit-in-btn';
        btn.innerHTML = stackblitzSvg;
        btn.addEventListener('click', onStackblitz);
        footer.appendChild(btn);
    }

    if ((!explicitEditor || explicitEditor === 'csb') && onCodeSandbox) {
        const btn = document.createElement('igc-button') as HTMLElement;
        btn.setAttribute('variant', 'outlined');
        btn.setAttribute('aria-label', 'Edit in CodeSandbox');
        btn.className = 'codesandbox-btn igd-edit-in-btn';
        btn.innerHTML = codeSandboxSvg;
        btn.addEventListener('click', onCodeSandbox);
        footer.appendChild(btn);
    }

    widget.appendChild(footer);
}

// ─── Angular Code Service ─────────────────────────────────────────────────────

class AngularCodeService {
    async init(ctx: WidgetContext): Promise<void> {
        const { widget, iframeSrc, demosBaseUrl, widgetIndex, igcTabs } = ctx;
        const samplePath     = getSamplePath(iframeSrc, demosBaseUrl);
        const isDv           = isDvSample(samplePath);
        const assetDir       = isDv ? 'code-viewer' : 'samples';
        const explicitEditor = isDv ? 'csb' : null;

        const fallbackStackblitz  = isDv ? null : () => this._openStackBlitzUrl(samplePath, demosBaseUrl);
        const fallbackCodeSandbox = () => this._openCodeSandboxUrl(samplePath, demosBaseUrl);

        try {
            const metaRes = await fetch(
                `${demosBaseUrl}/assets/samples/meta.json?t=${Date.now()}`,
                { credentials: 'omit' },
            );
            if (!metaRes.ok) throw new Error(`meta.json ${metaRes.status}`);
            const { generationTimeStamp } = await metaRes.json();

            const sampleJsonPath = isDv
                ? `${demosBaseUrl}/assets/${assetDir}/${samplePath}.json`
                : `${demosBaseUrl}/assets/${assetDir}/${samplePath.replace('/', '--')}.json`;

            const [sampleRes, sharedRes] = await Promise.all([
                fetch(`${sampleJsonPath}?t=${generationTimeStamp}`, { credentials: 'omit' }),
                fetch(`${demosBaseUrl}/assets/samples/shared.json?t=${generationTimeStamp}`, { credentials: 'omit' }),
            ]);
            if (!sampleRes.ok) throw new Error(`sample JSON ${sampleRes.status}`);

            const [sampleData, sharedData] = await Promise.all([
                sampleRes.json(),
                sharedRes.ok ? sharedRes.json() : Promise.resolve(null),
            ]);

            replaceRelativeAssetUrls(sampleData.sampleFiles || [], demosBaseUrl);
            if (sharedData) replaceRelativeAssetUrls(sharedData.files || [], demosBaseUrl);

            (sampleData.sampleFiles || [] as SampleFile[])
                .filter((f: SampleFile) => f.isMain)
                .sort((a: SampleFile, b: SampleFile) =>
                    SAMPLES_ORDER.indexOf(a.fileHeader) - SAMPLES_ORDER.indexOf(b.fileHeader))
                .forEach((file: SampleFile) =>
                    addCodeTab(igcTabs, file));

            const onStackblitz = isDv ? null : () => this._openInStackBlitz(sampleData, sharedData);
            addFooter(widget, iframeSrc, explicitEditor, onStackblitz, fallbackCodeSandbox);

        } catch (err: any) {
            console.warn('[sample-widget] Could not fetch Angular sample files:', err.message);
            addFooter(widget, iframeSrc, explicitEditor, fallbackStackblitz, fallbackCodeSandbox);
        }
    }

    private async _openInStackBlitz(sampleData: any, sharedData: any): Promise<void> {
        let sdk: any;
        try {
            sdk = await this._loadStackBlitzSdk();
        } catch (e: any) {
            console.warn('[sample-widget] StackBlitz SDK failed to load:', e.message);
            return;
        }
        const files: Record<string, string> = {};
        (sharedData?.files || []).forEach((f: any) => {
            if (f.path) files[f.path.replace(/^\.\//, '')] = f.content || '';
        });
        (sampleData.sampleFiles || []).forEach((f: any) => {
            if (f.path) files[f.path.replace(/^\.\//, '')] = f.content || '';
        });
        sdk.openProject(
            {
                title:       'Infragistics Angular Components',
                description: 'Auto-generated from Infragistics Angular Docs',
                template:    'node',
                files,
                tags:        ['angular', 'material', 'cdk', 'web', 'example'],
            },
            { openFile: 'src/app/app.component.ts' },
        );
    }

    private _loadStackBlitzSdk(): Promise<any> {
        if ((window as any).StackBlitzSDK) return Promise.resolve((window as any).StackBlitzSDK);
        return new Promise((resolve, reject) => {
            const s   = document.createElement('script');
            s.src     = 'https://unpkg.com/@stackblitz/sdk/bundles/sdk.umd.js';
            s.onload  = () => resolve((window as any).StackBlitzSDK);
            s.onerror = () => reject(new Error('Failed to load StackBlitz SDK'));
            document.head.appendChild(s);
        });
    }

    private _openCodeSandboxUrl(samplePath: string, demosBaseUrl: string): void {
        const isDv   = isDvSample(samplePath);
        const branch = getRepoBranch(demosBaseUrl, isDv);
        const repo   = isDv ? 'igniteui-angular-examples' : 'igniteui-live-editing-samples';
        const segs   = new URL(demosBaseUrl).pathname.replace(/\/$/, '').split('/').filter(Boolean);
        const prefix = isDv ? 'samples/' : (segs.pop() || 'angular-demos') + '/';
        window.open(
            `https://codesandbox.io/p/sandbox/github/IgniteUI/${repo}/tree/${branch}/${prefix}${samplePath}`,
            '_blank',
        );
    }

    private _openStackBlitzUrl(samplePath: string, demosBaseUrl: string): void {
        const isDv   = isDvSample(samplePath);
        const branch = getRepoBranch(demosBaseUrl, isDv);
        const repo   = isDv ? 'igniteui-angular-examples' : 'igniteui-live-editing-samples';
        const segs   = new URL(demosBaseUrl).pathname.replace(/\/$/, '').split('/').filter(Boolean);
        const prefix = isDv ? 'samples/' : (segs.pop() || 'angular-demos') + '/';
        window.open(
            `https://stackblitz.com/github/IgniteUI/${repo}/tree/${branch}/${prefix}${samplePath}`,
            '_blank',
        );
    }
}

// ─── Xplat Code Service ───────────────────────────────────────────────────────

class XplatCodeService {
    private platform:          string;
    private samplesOrder:      string[];
    private codeBase:          string;
    private enableLiveEditing: boolean;

    constructor(platform: string) {
        this.platform          = platform;
        this.samplesOrder      = XPLAT_SAMPLES_ORDER[platform] || ['ts', 'html', 'css'];
        this.codeBase          = XPLAT_CODE_BASE[platform]     || '/code-viewer/';
        this.enableLiveEditing = platform !== 'blazor';
    }

    async init(ctx: WidgetContext): Promise<void> {
        const { widget, iframeSrc, demosBaseUrl, igcTabs, githubSrc } = ctx;
        const samplePath     = getSamplePath(iframeSrc, demosBaseUrl);
        const addXplatFooter = () => {
            if (!this.enableLiveEditing || !githubSrc) return;
            addFooter(widget, iframeSrc, 'csb', null, () => this._openCodeSandbox(githubSrc, demosBaseUrl));
        };

        try {
            // Blazor's local dev server uses a self-signed cert on a non-4200 port,
            // causing CORS errors. Use a relative URL so Vite's proxy handles it.
            const jsonUrl = this.platform === 'blazor'
                ? `${this.codeBase}${samplePath}.json`
                : `${demosBaseUrl}${this.codeBase}${samplePath}.json`;

            const res = await fetch(jsonUrl, { credentials: 'omit' });
            if (!res.ok) throw new Error(`xplat sample JSON ${res.status}`);
            const data = await res.json();

            (data.sampleFiles || [] as SampleFile[])
                .filter((f: SampleFile) => f.isMain)
                .sort((a: SampleFile, b: SampleFile) =>
                    this.samplesOrder.indexOf(a.fileHeader) - this.samplesOrder.indexOf(b.fileHeader))
                .forEach((file: SampleFile) =>
                    addCodeTab(igcTabs, file));

            addXplatFooter();
        } catch (err: any) {
            console.warn('[sample-widget] Could not fetch xplat sample files:', err.message);
            addXplatFooter();
        }
    }

    private _openCodeSandbox(githubSrc: string, demosBaseUrl: string): void {
        const branch = getXplatBranch(demosBaseUrl);
        window.open(
            `https://codesandbox.io/p/sandbox/github/IgniteUI/igniteui-${this.platform}-examples/tree/${branch}/samples/${githubSrc}`,
            '_blank',
        );
    }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

/**
 * Initialize all Sample.astro widgets on the page.
 *
 * Called once per page by the deduplicated <script> in Sample.astro.
 * Processes every `.code-view[data-platform]` element — the `data-platform`
 * attribute is what distinguishes pre-rendered Sample.astro widgets from
 * `.ig-code-view` elements managed by code-view.js.
 */
export function initSampleWidgets(): void {
    // Serial iframe-load queue. Loading all iframes simultaneously causes the
    // browser to parse and execute many JS bundles at once, freezing the main
    // thread. Instead we load one iframe at a time: next starts only after the
    // current fires its `load` event.
    const iframeQueue: Array<{ iframe: HTMLIFrameElement; samplePane: HTMLElement }> = [];
    let iframeLoading = false;

    function processIframeQueue() {
        if (iframeLoading || iframeQueue.length === 0) return;
        iframeLoading = true;
        const { iframe, samplePane } = iframeQueue.shift()!;

        iframe.addEventListener('load', () => {
            samplePane.classList.remove('loading');
            samplePane.removeAttribute('aria-busy');
            iframe.removeAttribute('aria-hidden');
            iframeLoading = false;
            processIframeQueue();
        }, { once: true });

        iframe.src = iframe.dataset.src!;
    }

    document.querySelectorAll<HTMLElement>('.igd-code-view[data-platform]').forEach((widget, index) => {
        // Skip widgets already initialized (e.g. Astro client router restoring a cached page).
        if (widget.dataset.widgetInitialized) return;
        widget.dataset.widgetInitialized = 'true';

        const iframeSrc    = widget.dataset.iframeSrc    || '';
        const demosBaseUrl = widget.dataset.demosBaseUrl || '';
        const githubSrc    = widget.dataset.githubSrc    || '';
        const platform     = normalizePlatform(widget.dataset.platform || 'angular');

        if (!iframeSrc) return;

        const igcTabs    = widget.querySelector<HTMLElement>('igc-tabs');
        const samplePane = widget.querySelector<HTMLElement>('.igd-sample-container');
        const iframe     = widget.querySelector<HTMLIFrameElement>('iframe');

        if (!igcTabs) return;

        const exampleTabId = `${widget.id}-example`;

        // Toggle fullscreen button visibility based on active tab.
        igcTabs.addEventListener('igcChange', (e: Event) => {
            const detail = (e as CustomEvent<HTMLElement>).detail;
            const btn = widget.querySelector<HTMLElement>('.igd-full-screen-btn');
            if (btn) {
                btn.style.display = detail?.id === exampleTabId ? '' : 'none';
            }
        });

        // Wire copy buttons for pre-rendered code tabs (e.g. MockSample in playground).
        widget.querySelectorAll<HTMLElement>('.code-wrapper').forEach(pre => {
            const btn  = pre.querySelector<HTMLElement>('.cv-hljs-code-copy');
            const icon = btn?.querySelector<HTMLElement>('igc-icon');
            const code = pre.querySelector<HTMLElement>('code');
            if (!btn || !code) return;
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(code.textContent ?? '').then(() => {
                    icon?.setAttribute('name', 'check');
                    setTimeout(() => { icon?.setAttribute('name', 'copy'); }, 1500);
                });
            });
        });

        // Enqueue iframe loading.
        if (iframe && samplePane) {
            const enqueue = () => {
                iframeQueue.push({ iframe, samplePane });
                processIframeQueue();
            };
            if (index === 0) {
                requestAnimationFrame(enqueue);
            } else {
                const visObs = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting) { visObs.disconnect(); enqueue(); }
                });
                visObs.observe(samplePane);
            }
        }

        if (!demosBaseUrl) return;

        const service = isXplatPlatform(platform)
            ? new XplatCodeService(platform)
            : new AngularCodeService();

        const ctx: WidgetContext = {
            widget, iframeSrc, demosBaseUrl, widgetIndex: index, igcTabs, githubSrc,
        };

        // Fetch code-tab data only when the widget becomes visible.
        const startFetch = () => service.init(ctx);
        if (index === 0) {
            typeof requestIdleCallback !== 'undefined'
                ? requestIdleCallback(startFetch)
                : requestAnimationFrame(startFetch);
        } else {
            const fetchObs = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) { fetchObs.disconnect(); startFetch(); }
            });
            fetchObs.observe(samplePane ?? widget);
        }
    });
}
