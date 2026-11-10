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

// ─── Loading hand-off ───────────────────────────────────────────────────────────

const DEMO_ORIGIN = 'https://demo.example.com';

// `count` chrome="demo" widgets as Sample.astro renders them, so no code-viewer
// fetch is involved. Resolves once the first iframe has started loading and
// the rest wait in the serial queue. Timers are collected, not run.
async function renderLoadingWidgets(count) {
  const widgets = Array.from(
    { length: count },
    (_, i) => `<div id="cw-${i}" class="igd-code-view igd-code-view--demo" data-platform="blazor"
      data-demos-base-url="${DEMO_ORIGIN}" data-iframe-src="${DEMO_ORIGIN}/sample-${i}" data-chrome="demo">
      <div class="igd-code-view__inner">
        <div class="igd-sample-container loading" aria-busy="true">
          <div class="igd-sample-frame"><iframe data-src="${DEMO_ORIGIN}/sample-${i}" aria-hidden="true"></iframe></div>
        </div>
      </div>
    </div>`,
  );
  const dom = new JSDOM(widgets.join(''), {
    url: 'https://www.infragistics.com/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const timers = [];
  const warnings = [];
  const context = dom.getInternalVMContext();
  context.exports = {};
  context.require = (name) => {
    if (name === 'igniteui-webcomponents') return new Proxy({}, { get: () => () => {} });
    if (name === './icon-registry' || name.endsWith('?raw')) return {};
    if (name === './copy-status') return { announceCopyStatus() {}, clearCopyStatus() {} };
    if (name === '../lib/ultimate-ui-platforms') return platformsModule.exports;
    if (name === 'shiki') return { createHighlighter: async () => ({}) };
    if (name === '../code-theme') return {};
    throw new Error(`Unexpected dependency: ${name}`);
  };
  context.setTimeout = (callback, ms) => timers.push({ callback, ms });
  context.console = { ...console, warn: (message) => warnings.push(message) };
  // Widgets after the first enqueue their iframe once they scroll into view;
  // here they all are, on the same animation frame as the first.
  context.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {
      dom.window.requestAnimationFrame(() => this.callback([{ isIntersecting: true }]));
    }
    disconnect() {}
  };
  vm.runInContext(script, context);
  context.exports.initSampleWidgets();
  await new Promise((resolve) => dom.window.requestAnimationFrame(() => resolve()));

  const iframes = [...dom.window.document.querySelectorAll('iframe')];
  // The type of each message the widget posts back into each demo.
  const posted = iframes.map((iframe) => {
    const messages = [];
    iframe.contentWindow.postMessage = (data, targetOrigin) =>
      messages.push({ type: data.type, targetOrigin });
    return messages;
  });
  const postFromDemo = (iframe, data) =>
    dom.window.dispatchEvent(
      new dom.window.MessageEvent('message', {
        data,
        origin: DEMO_ORIGIN,
        source: iframe.contentWindow,
      }),
    );
  const fireLoad = (iframe) => iframe.dispatchEvent(new dom.window.Event('load'));
  return { dom, iframes, posted, postFromDemo, fireLoad, timers, warnings };
}

function assertLoading(iframe, loading) {
  const pane = iframe.closest('.igd-sample-container');
  assert.equal(pane.classList.contains('loading'), loading, 'loading class');
  assert.equal(pane.getAttribute('aria-busy'), loading ? 'true' : null, 'aria-busy');
  assert.equal(iframe.getAttribute('aria-hidden'), loading ? 'true' : null, 'aria-hidden');
}

test('a demo that never posts igd-sample-pending loses the indicator on load, as before', async () => {
  const { dom, iframes, posted, postFromDemo, fireLoad, timers } = await renderLoadingWidgets(1);
  try {
    const [iframe] = iframes;
    assert.equal(iframe.getAttribute('src'), `${DEMO_ORIGIN}/sample-0`);
    fireLoad(iframe);
    assertLoading(iframe, false);
    assert.deepEqual(timers, []);

    // Announced once the indicator is already gone: no answer, so the demo keeps its own.
    postFromDemo(iframe, { type: 'igd-sample-pending' });
    assert.deepEqual(posted[0], []);
    assertLoading(iframe, false);
  } finally {
    dom.window.close();
  }
});

test('a demo that posts igd-sample-pending keeps the indicator past load until igd-sample-ready', async () => {
  const { dom, iframes, posted, postFromDemo, fireLoad } = await renderLoadingWidgets(2);
  try {
    const [first, second] = iframes;
    assert.equal(second.getAttribute('src'), null, 'the second demo waits in the queue');

    postFromDemo(first, { type: 'igd-sample-pending' });
    assert.deepEqual(posted[0], [{ type: 'igd-sample-pending-ack', targetOrigin: DEMO_ORIGIN }]);

    fireLoad(first);
    assertLoading(first, true);
    assert.equal(
      second.getAttribute('src'),
      `${DEMO_ORIGIN}/sample-1`,
      'the queue moves on at load, not at ready',
    );

    // Only the demo in that iframe can end its loading state.
    postFromDemo(second, { type: 'igd-sample-ready' });
    assertLoading(first, true);

    postFromDemo(first, { type: 'igd-sample-ready' });
    assertLoading(first, false);
  } finally {
    dom.window.close();
  }
});

test('the indicator goes anyway when a pending demo never posts igd-sample-ready', async () => {
  const { dom, iframes, postFromDemo, fireLoad, timers, warnings } = await renderLoadingWidgets(1);
  try {
    const [iframe] = iframes;
    postFromDemo(iframe, { type: 'igd-sample-pending' });
    fireLoad(iframe);
    assertLoading(iframe, true);

    assert.equal(timers.length, 1);
    assert.ok(timers[0].ms >= 10_000 && timers[0].ms <= 15_000, `fallback after ${timers[0].ms}ms`);
    timers[0].callback();
    assertLoading(iframe, false);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /igd-sample-ready/);
  } finally {
    dom.window.close();
  }
});
