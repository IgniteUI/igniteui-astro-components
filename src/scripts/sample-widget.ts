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
 */

import {
  defineComponents,
  IgcTabsComponent,
  IgcTabComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcCircularProgressComponent,
} from 'igniteui-webcomponents';
defineComponents(
  IgcTabsComponent,
  IgcTabComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcCircularProgressComponent,
);

import './icon-registry';
import type { Highlighter } from 'shiki';
import stackblitzSvg from '../assets/logos/stackblitz.svg?raw';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLES_ORDER = ['modules', 'ts', 'html', 'scss', 'css'];

const XPLAT_SAMPLES_ORDER: Record<string, string[]> = {
  react: ['tsx', 'ts', 'html', 'css'],
  wc: ['tsx', 'ts', 'html', 'css'],
  blazor: ['razor', 'cs', 'js', 'css'],
  // XAML platforms: markup first, then code-behind. Samples are authored as
  // Sample.xaml / Sample.xaml.cs plus optional data-model .cs files.
  winui: ['xaml', 'cs'],
  uno: ['xaml', 'cs'],
};

const XPLAT_CODE_BASE: Record<string, string> = {
  wc: '/assets/code-viewer/',
  react: '/code-viewer/',
  blazor: '/code-viewer/',
  winui: '/code-viewer/',
  uno: '/code-viewer/',
};

/**
 * Platforms whose samples cannot be handed off to StackBlitz / CodeSandbox —
 * they are compiled .NET apps, and their sources are not published in an
 * `igniteui-<platform>-examples` repo. Gates the "open in" footer only.
 */
const SANDBOX_UNSUPPORTED_PLATFORMS = new Set(['blazor', 'winui', 'uno']);

const DV_PATHS = ['gauges/', 'maps/', 'excel/', 'charts/'];
const ASSETS_RE = /([.]{0,2}\/)*assets\//g;
const DEFAULT_CODE_THEME = 'dark-plus';

declare const __IGD_SAMPLE_CODE_THEME__: string | undefined;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SampleFile {
  fileExtension: string;
  fileHeader: string;
  content: string;
  isMain: boolean;
  path?: string;
}

interface WidgetContext {
  widget: HTMLElement;
  iframeSrc: string;
  demosBaseUrl: string;
  widgetIndex: number;
  igcTabs: HTMLElement;
  githubSrc: string;
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
  return (
    platform === 'react' ||
    platform === 'wc' ||
    platform === 'blazor' ||
    platform === 'winui' ||
    platform === 'uno'
  );
}

function getSamplePath(iframeSrc: string, demosBaseUrl: string): string {
  return iframeSrc
    .replace(demosBaseUrl + '/', '')
    .replace(/\?.*/, '')
    .replace(/\/$/, '');
}

function isDvSample(samplePath: string): boolean {
  return DV_PATHS.some((p) => samplePath.startsWith(p));
}

function getRepoBranch(demosBaseUrl: string, isDv: boolean): string {
  const host = new URL(demosBaseUrl).host;
  const isNonProd =
    host.includes('staging') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  if (isDv) return 'vnext';
  return isNonProd ? 'vNext' : 'master';
}

function getXplatBranch(demosBaseUrl: string): string {
  const host = new URL(demosBaseUrl).host;
  const isNonProd =
    host.includes('staging') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  return isNonProd ? 'vnext' : 'master';
}

function replaceRelativeAssetUrls(files: SampleFile[], demosBaseUrl: string): void {
  const assetsBase = demosBaseUrl.replace(/\/$/, '') + '/assets/';
  files.forEach((f) => {
    if (f.content && ASSETS_RE.test(f.content)) {
      f.content = f.content.replace(ASSETS_RE, assetsBase);
    }
    ASSETS_RE.lastIndex = 0;
  });
}

// ─── Code Highlighting ────────────────────────────────────────────────────────

const LANG_MAP: Record<string, string> = { js: 'javascript', ts: 'typescript', cs: 'csharp' };

const SHIKI_LANGS = [
  'text',
  'typescript',
  'tsx',
  'javascript',
  'html',
  'css',
  'scss',
  'csharp',
  'razor',
] as const;

let _highlighterPromise: Promise<Highlighter> | null = null;

function getCodeTheme(): string {
  return typeof __IGD_SAMPLE_CODE_THEME__ === 'string' && __IGD_SAMPLE_CODE_THEME__.trim()
    ? __IGD_SAMPLE_CODE_THEME__
    : DEFAULT_CODE_THEME;
}

function getHighlighter(): Promise<Highlighter> {
  if (!_highlighterPromise) {
    _highlighterPromise = import('shiki')
      .then(({ createHighlighter }) =>
        createHighlighter({ themes: [getCodeTheme()], langs: [...SHIKI_LANGS] }),
      )
      .catch((err) => {
        _highlighterPromise = null;
        throw err;
      });
  }
  return _highlighterPromise;
}

function highlightCode(codeEl: HTMLElement, lang: string): void {
  const safeLang = (SHIKI_LANGS as readonly string[]).includes(lang) ? lang : 'text';
  getHighlighter()
    .then((h) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = h.codeToHtml(codeEl.textContent ?? '', {
        lang: safeLang,
        theme: getCodeTheme(),
      });
      const shikiPre = tmp.firstElementChild as HTMLElement | null;
      const shikiCode = shikiPre?.querySelector('code');
      if (!shikiPre || !shikiCode) return;
      const parentPre = codeEl.parentElement;
      if (parentPre) parentPre.style.cssText = shikiPre.style.cssText;
      codeEl.innerHTML = shikiCode.innerHTML;
    })
    .catch(console.warn);
}

function normalizeCodeLang(lang: string | undefined): string {
  return LANG_MAP[lang ?? ''] ?? lang ?? 'text';
}

// ─── Code Tab Rendering ───────────────────────────────────────────────────────

function addCodeTab(igcTabs: HTMLElement, file: SampleFile): void {
  const lang = normalizeCodeLang(file.fileExtension);

  const tab = document.createElement('igc-tab');
  tab.setAttribute('label', file.fileHeader.toUpperCase());

  const wrapper = document.createElement('div');
  wrapper.className = 'code-wrapper';

  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.className = `language-${lang}`;
  code.textContent = file.content;
  pre.appendChild(code);

  // Same flat variant as the page-level CopyCode button so both copy
  // affordances look identical.
  const copyBtn = document.createElement('igc-icon-button') as HTMLElement;
  copyBtn.setAttribute('variant', 'flat');
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

  highlightCode(code, lang);
}

// ─── Footer / Live Edit Buttons ───────────────────────────────────────────────

function addFooter(
  widget: HTMLElement,
  iframeSrc: string,
  explicitEditor: string | null,
  onStackblitz: (() => void) | null,
  _onCodeSandbox: (() => void) | null,
): void {
  // A footer may already be server-rendered (e.g. the playground's MockSample);
  // don't append a second one.
  if (widget.querySelector('.igd-code-view__footer-actions')) return;

  const footer = document.createElement('div');
  footer.className = 'igd-code-view__footer-actions';

  if ((!explicitEditor || explicitEditor === 'stackblitz') && onStackblitz) {
    const btn = document.createElement('igc-button') as HTMLElement;
    btn.setAttribute('variant', 'outlined');
    btn.setAttribute('aria-label', 'Edit in StackBlitz');
    btn.className = 'stackblitz-btn igd-edit-in-btn';
    btn.innerHTML = stackblitzSvg;
    btn.addEventListener('click', onStackblitz);
    footer.appendChild(btn);
  }

  // CodeSandbox hidden, re-enable when https://github.com/codesandbox/codesandbox-client/issues/8884 is fixed.
  // https://github.com/codesandbox/codesandbox-client/issues/8883
  // https://github.com/codesandbox/codesandbox-client/issues/8074
  // if ((!explicitEditor || explicitEditor === 'csb') && onCodeSandbox) {
  //     const btn = document.createElement('igc-button') as HTMLElement;
  //     btn.setAttribute('variant', 'outlined');
  //     btn.setAttribute('aria-label', 'Edit in CodeSandbox');
  //     btn.className = 'codesandbox-btn igd-edit-in-btn';
  //     btn.innerHTML = codeSandboxSvg;
  //     btn.addEventListener('click', onCodeSandbox);
  //     footer.appendChild(btn);
  // }

  const fsBtn = document.createElement('igc-icon-button') as HTMLElement;
  fsBtn.setAttribute('name', 'open-link-blank');
  fsBtn.setAttribute('collection', 'docs');
  fsBtn.setAttribute('variant', 'outlined');
  fsBtn.setAttribute('aria-label', 'Open in full screen');
  fsBtn.className = 'igd-full-screen-btn igd-edit-in-btn';
  if (iframeSrc) {
    const fullscreenSrc = iframeSrc + (iframeSrc.includes('?') ? '&' : '?') + 'nav=0';
    fsBtn.setAttribute('href', fullscreenSrc);
    fsBtn.setAttribute('target', '_blank');
  }
  footer.appendChild(fsBtn);

  widget.appendChild(footer);
}

// ─── Angular Code Service ─────────────────────────────────────────────────────

class AngularCodeService {
  async init(ctx: WidgetContext): Promise<void> {
    const { widget, iframeSrc, demosBaseUrl, igcTabs } = ctx;
    const samplePath = getSamplePath(iframeSrc, demosBaseUrl);
    const isDv = isDvSample(samplePath);
    const assetDir = isDv ? 'code-viewer' : 'samples';
    const fallbackStackblitz = () => this._openStackBlitzUrl(samplePath, demosBaseUrl);
    const fallbackCodeSandbox = () => this._openCodeSandboxUrl(samplePath, demosBaseUrl);

    try {
      const metaRes = await fetch(`${demosBaseUrl}/assets/samples/meta.json?t=${Date.now()}`, {
        credentials: 'omit',
      });
      if (!metaRes.ok) throw new Error(`meta.json ${metaRes.status}`);
      const { generationTimeStamp } = await metaRes.json();

      const sampleJsonPath = isDv
        ? `${demosBaseUrl}/assets/${assetDir}/${samplePath}.json`
        : `${demosBaseUrl}/assets/${assetDir}/${samplePath.replace('/', '--')}.json`;

      const [sampleRes, sharedRes] = await Promise.all([
        fetch(`${sampleJsonPath}?t=${generationTimeStamp}`, { credentials: 'omit' }),
        fetch(`${demosBaseUrl}/assets/samples/shared.json?t=${generationTimeStamp}`, {
          credentials: 'omit',
        }),
      ]);
      if (!sampleRes.ok) throw new Error(`sample JSON ${sampleRes.status}`);

      const [sampleData, sharedData] = await Promise.all([
        sampleRes.json(),
        sharedRes.ok ? sharedRes.json() : Promise.resolve(null),
      ]);

      replaceRelativeAssetUrls(sampleData.sampleFiles || [], demosBaseUrl);
      if (sharedData) replaceRelativeAssetUrls(sharedData.files || [], demosBaseUrl);

      (sampleData.sampleFiles || ([] as SampleFile[]))
        .filter((f: SampleFile) => f.isMain)
        .sort(
          (a: SampleFile, b: SampleFile) =>
            SAMPLES_ORDER.indexOf(a.fileHeader) - SAMPLES_ORDER.indexOf(b.fileHeader),
        )
        .forEach((file: SampleFile) => addCodeTab(igcTabs, file));

      // DV samples include all boilerplate in their own JSON, sharedData is for non DV only.
      const onStackblitz = isDv
        ? () => this._openInStackBlitz(sampleData, null)
        : () => this._openInStackBlitz(sampleData, sharedData);
      addFooter(widget, iframeSrc, null, onStackblitz, fallbackCodeSandbox);
    } catch (err: any) {
      console.warn('[sample-widget] Could not fetch Angular sample files:', err.message);
      addFooter(widget, iframeSrc, null, fallbackStackblitz, fallbackCodeSandbox);
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
    const addFile = (f: any) => {
      if (!f.path || f.path.startsWith('..')) return;
      files[f.path.replace(/^\.\//, '')] = f.content || '';
    };
    (sharedData?.files || []).forEach(addFile); // shared boilerplate for non-DV samples
    (sampleData.sampleFiles || []).forEach(addFile);
    sdk.openProject(
      {
        title: 'Infragistics Angular Components',
        description: 'Auto-generated from Infragistics Angular Docs',
        template: 'node',
        files,
        tags: ['angular', 'material', 'cdk', 'web', 'example'],
      },
      { openFile: 'src/app/app.component.ts' },
    );
  }

  private _loadStackBlitzSdk(): Promise<any> {
    if ((window as any).StackBlitzSDK) return Promise.resolve((window as any).StackBlitzSDK);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@stackblitz/sdk/bundles/sdk.umd.js';
      s.onload = () => resolve((window as any).StackBlitzSDK);
      s.onerror = () => reject(new Error('Failed to load StackBlitz SDK'));
      document.head.appendChild(s);
    });
  }

  private _openCodeSandboxUrl(samplePath: string, demosBaseUrl: string): void {
    const isDv = isDvSample(samplePath);
    const branch = getRepoBranch(demosBaseUrl, isDv);
    const repo = isDv ? 'igniteui-angular-examples' : 'igniteui-live-editing-samples';
    const segs = new URL(demosBaseUrl).pathname.replace(/\/$/, '').split('/').filter(Boolean);
    const prefix = isDv ? 'samples/' : (segs.pop() || 'angular-demos') + '/';
    window.open(
      `https://codesandbox.io/p/sandbox/github/IgniteUI/${repo}/tree/${branch}/${prefix}${samplePath}`,
      '_blank',
    );
  }

  private _openStackBlitzUrl(samplePath: string, demosBaseUrl: string): void {
    const isDv = isDvSample(samplePath);
    const branch = getRepoBranch(demosBaseUrl, isDv);
    const repo = isDv ? 'igniteui-angular-examples' : 'igniteui-live-editing-samples';
    const segs = new URL(demosBaseUrl).pathname.replace(/\/$/, '').split('/').filter(Boolean);
    const prefix = isDv ? 'samples/' : (segs.pop() || 'angular-demos') + '/';
    const params = isDv ? '?startScript=start' : '';
    window.open(
      `https://stackblitz.com/github/IgniteUI/${repo}/tree/${branch}/${prefix}${samplePath}${params}`,
      '_blank',
    );
  }
}

// ─── Xplat Code Service ───────────────────────────────────────────────────────

class XplatCodeService {
  private platform: string;
  private samplesOrder: string[];
  private codeBase: string;
  private enableLiveEditing: boolean;

  constructor(platform: string) {
    this.platform = platform;
    this.samplesOrder = XPLAT_SAMPLES_ORDER[platform] || ['ts', 'html', 'css'];
    this.codeBase = XPLAT_CODE_BASE[platform] || '/code-viewer/';
    // Gates the StackBlitz / CodeSandbox footer, not editing of the embedded sample.
    this.enableLiveEditing = !SANDBOX_UNSUPPORTED_PLATFORMS.has(platform);
  }

  async init(ctx: WidgetContext): Promise<void> {
    const { widget, iframeSrc, demosBaseUrl, igcTabs, githubSrc } = ctx;
    const samplePath = getSamplePath(iframeSrc, demosBaseUrl);
    const fallbackStackblitz = () => this._openStackBlitzUrl(githubSrc, demosBaseUrl);
    const fallbackCodeSandbox = () => this._openCodeSandbox(githubSrc, demosBaseUrl);

    try {
      // Blazor's local dev server uses a self-signed cert on a non-4200 port,
      // causing CORS errors. Use a relative URL so Vite's proxy handles it.
      // On staging/production, use the full demosBaseUrl like other xplat platforms.
      const isLocalDev =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const jsonUrl =
        this.platform === 'blazor' && isLocalDev
          ? `${this.codeBase}${samplePath}.json`
          : `${demosBaseUrl}${this.codeBase}${samplePath}.json`;

      const res = await fetch(jsonUrl, { credentials: 'omit' });
      if (!res.ok) throw new Error(`xplat sample JSON ${res.status}`);
      const data = await res.json();

      (data.sampleFiles || ([] as SampleFile[]))
        .filter((f: SampleFile) => f.isMain)
        .sort(
          (a: SampleFile, b: SampleFile) =>
            this.samplesOrder.indexOf(a.fileHeader) - this.samplesOrder.indexOf(b.fileHeader),
        )
        .forEach((file: SampleFile) => addCodeTab(igcTabs, file));

      if (this.enableLiveEditing && githubSrc) {
        // Use sdk.openProject() to avoid the StackBlitz GitHub clone freeze bug.
        addFooter(widget, iframeSrc, null, () => this._openInStackBlitz(data), fallbackCodeSandbox);
      }
    } catch (err: any) {
      console.warn('[sample-widget] Could not fetch xplat sample files:', err.message);
      if (this.enableLiveEditing && githubSrc) {
        addFooter(widget, iframeSrc, null, fallbackStackblitz, fallbackCodeSandbox);
      }
    }
  }

  private async _openInStackBlitz(sampleData: any): Promise<void> {
    let sdk: any;
    try {
      sdk = await this._loadStackBlitzSdk();
    } catch (e: any) {
      console.warn('[sample-widget] StackBlitz SDK failed to load:', e.message);
      return;
    }
    const files: Record<string, string> = {};
    const addFile = (f: any) => {
      // Skip paths that still have the old full repo prefix (pre-fix JSONs).
      if (!f.path || f.path.startsWith('..') || f.path.startsWith('./samples/')) return;
      files[f.path.replace(/^\.\//, '')] = f.content || '';
    };
    (sampleData.sampleFiles || []).forEach(addFile);

    // webpack-dev-server binds to localhost by default; StackBlitz WebContainers need 0.0.0.0.
    if (this.platform === 'wc' && files['package.json']) {
      try {
        const pkg = JSON.parse(files['package.json']);
        if (pkg.scripts) {
          pkg.scripts['serve:dev'] =
            'node node_modules/webpack-dev-server/bin/webpack-dev-server.js' +
            ' --mode development --config ./webpack.config.js --hot --host 0.0.0.0 --allowed-hosts all';
          pkg.scripts['start'] = 'npm run serve:dev';
          files['package.json'] = JSON.stringify(pkg, null, 2);
        }
      } catch {
        /* malformed package.json — leave as-is */
      }
    }

    // @babel/preset-env with useBuiltIns:"usage" auto-injects core-js polyfill imports,
    // but core-js is absent from some samples' package.json, breaking the webpack build.
    // StackBlitz runs in modern Chrome so polyfills are unnecessary — disable the injection.
    if (this.platform === 'wc' && files['webpack.config.js']) {
      files['webpack.config.js'] = files['webpack.config.js']
        .replace('"useBuiltIns": "usage"', '"useBuiltIns": false')
        .replace(/,?\s*"corejs":\s*3/, '');
    }

    const platformLabel = this.platform === 'react' ? 'React' : 'Web Components';
    const mainFile =
      Object.keys(files).find((f) => f.endsWith('index.tsx') || f.endsWith('index.ts')) || '';
    sdk.openProject(
      {
        title: `Infragistics ${platformLabel} Components`,
        description: `Auto-generated from Infragistics ${platformLabel} Docs`,
        template: 'node',
        files,
        tags: [this.platform, 'igniteui', 'web', 'example'],
      },
      { openFile: mainFile },
    );
  }

  private _loadStackBlitzSdk(): Promise<any> {
    if ((window as any).StackBlitzSDK) return Promise.resolve((window as any).StackBlitzSDK);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@stackblitz/sdk/bundles/sdk.umd.js';
      s.onload = () => resolve((window as any).StackBlitzSDK);
      s.onerror = () => reject(new Error('Failed to load StackBlitz SDK'));
      document.head.appendChild(s);
    });
  }

  private _openStackBlitzUrl(githubSrc: string, demosBaseUrl: string): void {
    const branch = getXplatBranch(demosBaseUrl);
    window.open(
      `https://stackblitz.com/github/IgniteUI/igniteui-${this.platform}-examples/tree/${branch}/samples/${githubSrc}`,
      '_blank',
    );
  }

  private _openCodeSandbox(githubSrc: string, demosBaseUrl: string): void {
    const branch = getXplatBranch(demosBaseUrl);
    window.open(
      `https://codesandbox.io/p/sandbox/github/IgniteUI/igniteui-${this.platform}-examples/tree/${branch}/samples/${githubSrc}`,
      '_blank',
    );
  }
}

// ─── Fit-to-content sizing ──────────────────────────────────────────────────────

/**
 * Message a demo can post to resize its host `<Sample fitContent>` iframe:
 *   parent.postMessage({ type: 'igd-sample-height', height: <px>, width: <px?> }, '*')
 * This is the path for cross-origin demos, where the host page can't read the
 * iframe's contentDocument to measure it directly. `width` is optional — post
 * it when the sample is horizontally aligned via `position`.
 */
const FIT_CONTENT_MESSAGE = 'igd-sample-height';

/**
 * Posted INTO the iframe once it loads, telling the embedded demo that its
 * host sizes itself to the content. The demo's reporter script reacts by
 * neutralizing viewport-bound sizing (`html, body { height: 100% }` — which
 * would otherwise just echo the iframe height back) and starts posting
 * FIT_CONTENT_MESSAGE sizes. Demos in fixed-height samples never receive this
 * and keep their percentage-height layouts.
 */
const FIT_CONTENT_ENABLE_MESSAGE = 'igd-sample-fit';

let _fitContentMessageBound = false;

/**
 * Apply a measured content size to a fit-content iframe. The size goes on the
 * iframe itself; the container has `height: auto` in fit-content mode, so it
 * grows around the iframe (including any `spacing` padding). Width is only
 * applied when reported/measured — see measureContentWidth().
 */
function setFitSize(iframe: HTMLIFrameElement, size: { height?: number; width?: number }): void {
  if (size.height && size.height > 0) {
    iframe.style.height = `${Math.ceil(size.height)}px`;
    // Distinguish a real measured/reported size from the server-rendered
    // `height` fallback the iframe starts with.
    iframe.dataset.fitSized = 'true';
  }
  if (size.width && size.width > 0) {
    iframe.style.width = `${Math.ceil(size.width)}px`;
    // The frame defaults to full width (see Sample.scss); once the iframe
    // has a definite px width, let the frame shrink-wrap it so the host's
    // flex alignment (position) can move the content-sized box around.
    const frame = iframe.closest<HTMLElement>('.igd-sample-frame');
    if (frame) frame.style.width = 'auto';
  }
}

/**
 * Measure the intrinsic width of a same-origin demo's content. Only used when
 * the host container aligns the iframe horizontally (`position` → data-justify):
 * block-level demo content stretches to the viewport width, so instead we take
 * the right-most element box. Demos with intrinsically sized content (a lone
 * avatar, a button…) shrink the iframe to that content, letting the host's
 * flex alignment actually center/end-align it. Full-width demos measure the
 * viewport width and are left as-is.
 *
 * Resizable containers are excluded entirely: there the user's drag owns the
 * width, and applying a measured width would clobber it on every observer tick.
 */
function measureContentWidth(iframe: HTMLIFrameElement, body: HTMLElement): number | undefined {
  const container = iframe.closest<HTMLElement>('.igd-sample-container');
  if (!container?.dataset.justify || container.dataset.resizable) return undefined;
  const left = body.getBoundingClientRect().left;
  let right = left;
  body.querySelectorAll('*').forEach((el) => {
    right = Math.max(right, el.getBoundingClientRect().right);
  });
  if (right <= left) return undefined;
  // The right-most element edge includes the body's leading padding but not
  // its trailing padding. Demos use body padding to reserve room for ink
  // overflow (shadows, glows) — keep that room on the trailing side too.
  const cs = iframe.contentWindow?.getComputedStyle(body);
  const trailing = cs
    ? parseFloat(cs.paddingRight || '0') + parseFloat(cs.borderRightWidth || '0')
    : 0;
  return right - left + trailing;
}

function bindFitContentMessages(): void {
  if (_fitContentMessageBound) return;
  _fitContentMessageBound = true;
  window.addEventListener('message', (e: MessageEvent) => {
    const data = e.data;
    if (
      !data ||
      data.type !== FIT_CONTENT_MESSAGE ||
      typeof data.height !== 'number' ||
      !Number.isFinite(data.height) ||
      data.height <= 0
    )
      return;
    document
      .querySelectorAll<HTMLIFrameElement>('.igd-sample-container[data-fit-content] iframe')
      .forEach((iframe) => {
        if (iframe.contentWindow !== e.source) return;
        // Width only matters when the host aligns the iframe
        // horizontally (position → data-justify); otherwise the iframe
        // stays full-width and a reported width is ignored. Resizable
        // containers ignore it too — the user's drag owns the width.
        const container = iframe.closest<HTMLElement>('.igd-sample-container');
        const useWidth = Boolean(container?.dataset.justify) && !container?.dataset.resizable;
        setFitSize(iframe, {
          height: data.height,
          width: useWidth && typeof data.width === 'number' ? data.width : undefined,
        });
      });
  });
}

/**
 * Wire an iframe whose container opted into fit-content sizing.
 *
 * Same-origin demos (e.g. the playground mock) are measured directly and kept
 * in sync with a ResizeObserver on their <body>. Cross-origin demos can't be
 * read, so they must post their height (see FIT_CONTENT_MESSAGE).
 *
 * The `height` prop is only the placeholder/fallback in fit-content mode —
 * once a size is measured/reported, the content dictates it. Measurement uses
 * the html/body offset heights (not the document scrollHeight, which is
 * clamped to the viewport) so the iframe can shrink below its current height
 * as well as grow.
 */
function wireFitContent(iframe: HTMLIFrameElement): void {
  if (iframe.dataset.fitContentWired) return;
  iframe.dataset.fitContentWired = 'true';
  bindFitContentMessages();

  let bodyObserver: ResizeObserver | null = null;

  const measure = () => {
    try {
      const doc = iframe.contentDocument;
      const body = doc?.body;
      if (!body) return; // cross-origin — rely on postMessage instead
      setFitSize(iframe, {
        height: Math.max(doc!.documentElement.offsetHeight, body.offsetHeight, body.scrollHeight),
        width: measureContentWidth(iframe, body),
      });
    } catch {
      /* cross-origin — rely on postMessage instead */
    }
  };

  const onLoad = () => {
    // Tell the demo this is a fit-content embed (see the constant's doc).
    // `width: true` additionally asks it to shrink-wrap and report its
    // intrinsic width, so the host's `position` can center/align it.
    // Not on resizable containers — there the user's drag owns the width
    // and the demo should keep filling whatever width it is given.
    const container = iframe.closest<HTMLElement>('.igd-sample-container');
    iframe.contentWindow?.postMessage(
      {
        type: FIT_CONTENT_ENABLE_MESSAGE,
        width: Boolean(container?.dataset.justify) && !container?.dataset.resizable,
      },
      '*',
    );
    measure();
    try {
      const body = iframe.contentDocument?.body;
      if (body && 'ResizeObserver' in window) {
        // onLoad can run more than once (wire time + load event, or an
        // iframe navigation) — replace the observer, never stack them.
        bodyObserver?.disconnect();
        bodyObserver = new ResizeObserver(measure);
        bodyObserver.observe(body);
        return;
      }
    } catch {
      /* cross-origin — nothing to observe */
    }
    // Cross-origin demo: it must post its size (see FIT_CONTENT_MESSAGE) or
    // the iframe stays at the `height` prop fallback. Surface that loudly —
    // a silently non-fitting sample is hard to diagnose from the docs side.
    setTimeout(() => {
      if (!iframe.dataset.fitSized) {
        console.warn(
          `[sample-widget] fitContent: cross-origin demo "${iframe.src}" hasn't reported its size. ` +
            `The demo must run: parent.postMessage({ type: '${FIT_CONTENT_MESSAGE}', height: document.documentElement.scrollHeight }, '*') ` +
            `on load/resize; until then the iframe keeps the \`height\` prop as a fallback.`,
        );
      }
    }, 3000);
  };

  // iframeOnly renders `src` directly, so the iframe may already be loaded —
  // and a cross-origin iframe gives no way to detect that (contentDocument is
  // null whether it's loaded or not). Run the handler once at wire time as
  // well: on a not-yet-loaded iframe the enable message is simply lost and
  // the `load` listener below re-sends it; on an already-loaded one this is
  // the only chance to deliver it. Widget iframes load lazily (data-src, no
  // src yet) and are handled purely by the `load` event.
  if (iframe.src) onLoad();
  iframe.addEventListener('load', onLoad);
}

function initFitContentIframes(): void {
  document
    .querySelectorAll<HTMLIFrameElement>('.igd-sample-container[data-fit-content] iframe')
    .forEach(wireFitContent);
}

// ─── Resizable samples ──────────────────────────────────────────────────────────

const RESIZE_MIN_WIDTH = 200; // px — narrowest the iframe can be dragged.
const RESIZE_KEY_STEP = 24; // px — width change per arrow-key press.

/**
 * Wire a `<Sample resizable>` container: a right-edge drag handle plus left/right
 * arrow keys resize the iframe's width (only the iframe, horizontally) so
 * responsive demos can be previewed at different widths. The container's own
 * footprint never changes.
 */
function wireResizable(container: HTMLElement): void {
  if (container.dataset.resizableWired) return;
  container.dataset.resizableWired = 'true';

  const frame = container.querySelector<HTMLElement>('.igd-sample-frame');
  const handle = container.querySelector<HTMLElement>('.igd-sample-resize-handle');
  if (!frame) return;

  // Widest the frame can be: the container's content box (minus padding).
  const maxWidth = (): number => {
    const cs = getComputedStyle(container);
    const pad = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
    return Math.max(RESIZE_MIN_WIDTH, container.clientWidth - pad);
  };

  const setWidth = (px: number): void => {
    const clamped = Math.round(Math.min(maxWidth(), Math.max(RESIZE_MIN_WIDTH, px)));
    frame.style.width = `${clamped}px`;
  };

  // ─ Pointer drag ─
  if (handle) {
    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      container.classList.add('resizing');
      handle.setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startW = frame.getBoundingClientRect().width;
      // A centered frame grows from both sides, so the handle covers half
      // the width change per pixel moved.
      const factor = getComputedStyle(container).justifyContent === 'center' ? 2 : 1;

      const onMove = (ev: PointerEvent) => setWidth(startW + (ev.clientX - startX) * factor);
      const onUp = (ev: PointerEvent) => {
        container.classList.remove('resizing');
        handle.releasePointerCapture?.(ev.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
      };
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  }

  // ─ Keyboard (container is focusable via tabindex) ─
  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const current = frame.getBoundingClientRect().width;
    setWidth(current + (e.key === 'ArrowRight' ? RESIZE_KEY_STEP : -RESIZE_KEY_STEP));
  });
}

function initResizableSamples(): void {
  document
    .querySelectorAll<HTMLElement>('.igd-sample-container[data-resizable]')
    .forEach(wireResizable);
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
  // Wire fit-content iframes (both full widgets and iframeOnly samples) up front
  // so they start measuring as soon as their content loads.
  initFitContentIframes();

  // Wire resizable samples so their drag handle / arrow keys work immediately.
  initResizableSamples();

  // Kick off the Shiki download immediately so it is ready before the user
  // opens a code tab (tabs appear only after an IntersectionObserver fires
  // + a JSON fetch completes, giving Shiki time to load in parallel).
  getHighlighter().catch(() => {});

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

    iframe.addEventListener(
      'load',
      () => {
        samplePane.classList.remove('loading');
        samplePane.removeAttribute('aria-busy');
        iframe.removeAttribute('aria-hidden');
        iframeLoading = false;
        processIframeQueue();
      },
      { once: true },
    );

    iframe.src = iframe.dataset.src!;
  }

  document
    .querySelectorAll<HTMLElement>('.igd-code-view[data-platform]')
    .forEach((widget, index) => {
      // Skip widgets already initialized (e.g. Astro client router restoring a cached page).
      if (widget.dataset.widgetInitialized) return;
      widget.dataset.widgetInitialized = 'true';

      const iframeSrc = widget.dataset.iframeSrc || '';
      const demosBaseUrl = widget.dataset.demosBaseUrl || '';
      const githubSrc = widget.dataset.githubSrc || '';
      const platform = normalizePlatform(widget.dataset.platform || 'angular');

      if (!iframeSrc) return;

      const igcTabs = widget.querySelector<HTMLElement>('igc-tabs');
      const samplePane = widget.querySelector<HTMLElement>('.igd-sample-container');
      const iframe = widget.querySelector<HTMLIFrameElement>('iframe');

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
      widget.querySelectorAll<HTMLElement>('.code-wrapper').forEach((pre) => {
        const btn = pre.querySelector<HTMLElement>('.cv-hljs-code-copy');
        const icon = btn?.querySelector<HTMLElement>('igc-icon');
        const code = pre.querySelector<HTMLElement>('code');
        if (!btn || !code) return;
        const codeLang = (code.className.match(/language-(\S+)/) ?? [])[1] ?? 'text';
        highlightCode(code, normalizeCodeLang(codeLang));
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(code.textContent ?? '').then(() => {
            icon?.setAttribute('name', 'check');
            setTimeout(() => {
              icon?.setAttribute('name', 'copy');
            }, 1500);
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
          const visObs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              visObs.disconnect();
              enqueue();
            }
          });
          visObs.observe(samplePane);
        }
      }

      if (!demosBaseUrl && !isXplatPlatform(platform)) return;

      const service = isXplatPlatform(platform)
        ? new XplatCodeService(platform)
        : new AngularCodeService();

      const ctx: WidgetContext = {
        widget,
        iframeSrc,
        demosBaseUrl,
        widgetIndex: index,
        igcTabs,
        githubSrc,
      };

      // Fetch code-tab data only when the widget becomes visible.
      const startFetch = () => service.init(ctx);
      if (index === 0) {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(startFetch);
        } else {
          requestAnimationFrame(startFetch);
        }
      } else {
        const fetchObs = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            fetchObs.disconnect();
            startFetch();
          }
        });
        fetchObs.observe(samplePane ?? widget);
      }
    });
}
