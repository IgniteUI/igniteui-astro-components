import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

// Exercise the real widget in a DOM, replacing only browser component registration
// and the asynchronous syntax highlighter. No sample iframe or CDN is loaded.
const transpile = (file) =>
  ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const script = transpile('../src/scripts/sample-widget.ts');
// The widget's one source import, which has only a type import of its own.
const platformsModule = { exports: {} };
new Function('module', 'exports', transpile('../src/lib/ultimate-ui-platforms.ts'))(
  platformsModule,
  platformsModule.exports,
);

for (const platform of ['winui', 'uno', 'uno-platform']) {
  test(`${platform} loads Uno source JSON and preserves named supporting tabs`, async () => {
    const base = 'https://staging.infragistics.com/uno-wasm-demos';
    const route = 'charts/data-chart/overview';
    const files = [
      { fileName: 'data.json', fileExtension: 'json', content: '{"data":[]}' },
      {
        fileName: 'Sample.xaml',
        fileExtension: 'xaml',
        content: '<UserControl x:Class="Original.Sample" />',
      },
      {
        fileName: 'Sample.xaml.cs',
        fileExtension: 'cs',
        content: '// </script><script>window.injected=true</script>',
      },
      {
        fileName: 'Data.cs',
        fileExtension: 'cs',
        content: 'namespace Original; public class Data {}',
      },
    ].map((file) => ({ ...file, fileHeader: file.fileExtension, isMain: true }));
    const dom = new JSDOM(
      `<div id="sample" class="igd-code-view" data-platform="${platform}"
      data-demos-base-url="${base}" data-iframe-src="${base}/${route}"
      data-github-src="samples/${route}"><igc-tabs></igc-tabs></div>`,
      {
        url: 'https://jp.staging.infragistics.com/products/uno-platform/',
        runScripts: 'outside-only',
        pretendToBeVisual: true,
      },
    );
    try {
      const requests = [];
      const eagerLangs = [];
      const lazyLoads = [];
      const context = dom.getInternalVMContext();
      context.exports = {};
      context.require = (name) => {
        if (name === 'igniteui-webcomponents') return new Proxy({}, { get: () => () => {} });
        if (name === './icon-registry' || name.endsWith('?raw')) return {};
        if (name === './copy-status') return { announceCopyStatus() {}, clearCopyStatus() {} };
        if (name === '../lib/ultimate-ui-platforms') return platformsModule.exports;
        if (name === '../code-theme') return { igCodeTheme: { name: 'ig-dark' } };
        if (name === 'shiki')
          return {
            createHighlighter: async ({ langs }) => {
              eagerLangs.push(...langs);
              return {
                getLoadedLanguages: () => [...langs, ...lazyLoads],
                getLoadedThemes: () => ['ig-dark'],
                loadLanguage: async (lang) => {
                  lazyLoads.push(lang);
                },
                codeToHtml: (text) => {
                  const pre = dom.window.document.createElement('pre');
                  const code = dom.window.document.createElement('code');
                  code.textContent = text;
                  pre.append(code);
                  return pre.outerHTML;
                },
              };
            },
          };
        throw new Error(`Unexpected dependency: ${name}`);
      };
      context.fetch = async (url, options) => {
        requests.push({ url, options });
        return { ok: true, json: async () => ({ sampleFiles: files }) };
      };
      context.requestIdleCallback = (callback) => callback();
      vm.runInContext(script, context);
      context.exports.initSampleWidgets();
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(requests.length, 1);
      assert.equal(requests[0].url, `${base}/code-viewer/${route}.json`);
      assert.equal(requests[0].options.credentials, 'omit');
      const tabs = [...dom.window.document.querySelectorAll('igc-tab')];
      assert.deepEqual(
        tabs.map((tab) => tab.getAttribute('label')),
        ['Sample.xaml', 'Sample.xaml.cs', 'Data.cs', 'data.json'],
      );
      for (const tab of tabs) {
        assert.equal(
          tab.querySelector('code').textContent,
          files.find((file) => file.fileName === tab.getAttribute('label')).content,
        );
      }
      assert.equal(dom.window.injected, undefined);
      assert.equal(
        dom.window.document.querySelectorAll('script, .stackblitz-btn, .codesandbox-btn').length,
        0,
      );
      assert.equal(
        dom.window.document.querySelector('.igd-full-screen-btn').getAttribute('href'),
        `${base}/${route}`,
      );
      assert.ok(dom.window.document.querySelector('.igd-code-view__footer-actions'));
      // XAML highlights as XML, and both grammars only load once a tab needs them.
      assert.deepEqual(
        eagerLangs.filter((lang) => ['xml', 'json'].includes(lang)),
        [],
      );
      assert.deepEqual([...lazyLoads].sort(), ['json', 'xml']);
    } finally {
      dom.window.close();
    }
  });
}

// What Sample.astro renders for chrome="demo" showThemePicker: no tabs, so the
// widget must still load the iframe and build the footer from `data-chrome`.
test('chrome="demo" loads the iframe and moves only the theme picker into the footer', async () => {
  const base = 'https://demo.example.com';
  const route = 'inputs/radio/interaction-state';
  const dom = new JSDOM(
    `<div id="cw-demo" class="igd-code-view igd-code-view--demo" data-platform="react"
      data-demos-base-url="${base}" data-iframe-src="${base}/${route}"
      data-github-src="${route}" data-chrome="demo">
      <div class="igd-code-view__inner">
        <div class="igd-sample-container loading" aria-busy="true">
          <div class="igd-sample-frame"><iframe data-src="${base}/${route}" aria-hidden="true"></iframe></div>
        </div>
      </div>
      <div class="igd-sample-theming" hidden><div class="igd-theming" data-theme="bootstrap"></div></div>
    </div>`,
    { url: 'https://www.infragistics.com/', runScripts: 'outside-only', pretendToBeVisual: true },
  );
  try {
    const requests = [];
    const context = dom.getInternalVMContext();
    context.exports = {};
    context.require = (name) => {
      if (name === 'igniteui-webcomponents') return new Proxy({}, { get: () => () => {} });
      if (name === './icon-registry' || name.endsWith('?raw')) return {};
      if (name === './copy-status') return { announceCopyStatus() {}, clearCopyStatus() {} };
      if (name === '../lib/ultimate-ui-platforms') return platformsModule.exports;
      if (name === '../code-theme') return { igCodeTheme: { name: 'ig-dark' } };
      if (name === 'shiki') return { createHighlighter: async () => ({}) };
      throw new Error(`Unexpected dependency: ${name}`);
    };
    context.fetch = async (url) => {
      requests.push(url);
      return { ok: true, json: async () => ({}) };
    };
    context.requestIdleCallback = (callback) => callback();
    vm.runInContext(script, context);
    context.exports.initSampleWidgets();
    // The first widget on the page enqueues its iframe on the next animation frame.
    await new Promise((resolve) => dom.window.requestAnimationFrame(() => resolve()));

    const doc = dom.window.document;
    assert.equal(doc.querySelector('iframe').getAttribute('src'), `${base}/${route}`);
    const footer = doc.querySelector('.igd-code-view__footer-actions');
    assert.ok(footer, 'the footer renders');
    assert.equal(footer.querySelector('.igd-sample-theming')?.hidden, false);
    assert.equal(doc.querySelectorAll('igc-tab, .stackblitz-btn, .igd-full-screen-btn').length, 0);
    assert.deepEqual(requests, [], 'no code-viewer fetch');
  } finally {
    dom.window.close();
  }
});

// A same-origin fitContent demo whose page fills the iframe (html, body
// { height: 100% }) and that also posts its own height. Measuring its body
// only echoes the iframe height back, so once the demo reports, a later
// ResizeObserver tick must not overwrite the reported height.
for (const reports of [true, false]) {
  test(`fitContent same-origin demo ${reports ? 'that reports its size keeps the reported height' : 'without reports is measured directly'}`, async () => {
    const dom = new JSDOM(
      `<div class="igd-sample-container igd-sample-container--fit-content" data-fit-content="true">
        <div class="igd-sample-frame"><iframe style="width: 100%; height: 50px;"></iframe></div>
      </div>`,
      {
        url: 'https://staging.example.com/products/docs/',
        runScripts: 'outside-only',
        pretendToBeVisual: true,
      },
    );
    try {
      const observers = [];
      const context = dom.getInternalVMContext();
      context.exports = {};
      context.require = (name) => {
        if (name === 'igniteui-webcomponents') return new Proxy({}, { get: () => () => {} });
        if (name === './icon-registry' || name.endsWith('?raw')) return {};
        if (name === './copy-status') return { announceCopyStatus() {}, clearCopyStatus() {} };
        if (name === '../lib/ultimate-ui-platforms') return platformsModule.exports;
        if (name === '../code-theme') return { igCodeTheme: { name: 'ig-dark' } };
        if (name === 'shiki') return { createHighlighter: async () => ({}) };
        throw new Error(`Unexpected dependency: ${name}`);
      };
      context.ResizeObserver = class {
        constructor(callback) {
          this.callback = callback;
          observers.push(this);
        }
        observe() {}
        disconnect() {}
      };
      context.requestIdleCallback = (callback) => callback();
      vm.runInContext(script, context);
      context.exports.initSampleWidgets();

      const iframe = dom.window.document.querySelector('iframe');
      const inner = iframe.contentDocument;
      // The demo page fills the iframe: every direct measurement is the
      // iframe's current (stale) height, never the demo's.
      const measureAs = (get) => {
        for (const [el, prop] of [
          [inner.documentElement, 'offsetHeight'],
          [inner.body, 'offsetHeight'],
          [inner.body, 'scrollHeight'],
        ])
          Object.defineProperty(el, prop, { get, configurable: true });
      };
      measureAs(() => parseFloat(iframe.style.height));
      iframe.dispatchEvent(new dom.window.Event('load'));
      assert.equal(observers.length, 1, 'the same-origin body is observed');

      if (reports) {
        const stale = iframe.style.height;
        dom.window.dispatchEvent(
          new dom.window.MessageEvent('message', {
            data: { type: 'igd-sample-height', height: 1224 },
            source: iframe.contentWindow,
          }),
        );
        assert.equal(iframe.style.height, '1224px');
        // The ResizeObserver tick that raced the report: the echo it would
        // write is the height before the report.
        measureAs(() => parseFloat(stale));
        observers[0].callback();
        assert.equal(iframe.style.height, '1224px', 'a stale echo does not cut the demo off');
      } else {
        measureAs(() => 421);
        observers[0].callback();
        assert.equal(iframe.style.height, '421px');
      }
    } finally {
      dom.window.close();
    }
  });
}
