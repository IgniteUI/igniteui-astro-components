import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import rosePineMoon from '@shikijs/themes/rose-pine-moon';
import * as shiki from 'shiki';
import ts from 'typescript';

// Exercise the real widget in a DOM, replacing only browser component registration
// and, where a test does not need real colors, the asynchronous syntax highlighter.
// No sample iframe or CDN is loaded.
const transpile = (file) =>
  ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const script = transpile('../src/scripts/sample-widget.ts');
// The widget's source imports that matter here, loaded for real: the platform list has only
// a type import of its own, and the brand code theme one runtime import.
const platformsModule = { exports: {} };
new Function('module', 'exports', transpile('../src/lib/ultimate-ui-platforms.ts'))(
  platformsModule,
  platformsModule.exports,
);
const codeThemeModule = { exports: {} };
new Function('module', 'exports', 'require', transpile('../src/code-theme/index.ts'))(
  codeThemeModule,
  codeThemeModule.exports,
  () => ({ __esModule: true, default: rosePineMoon }),
);

/** Runs the widget on one sample whose source JSON holds `files`, highlighting with `shikiModule`. */
async function runWidget({ platform, base, route, url, files, shikiModule }) {
  const dom = new JSDOM(
    `<div id="sample" class="igd-code-view" data-platform="${platform}"
    data-demos-base-url="${base}" data-iframe-src="${base}/${route}"
    data-github-src="samples/${route}"><igc-tabs></igc-tabs></div>`,
    { url, runScripts: 'outside-only', pretendToBeVisual: true },
  );
  const requests = [];
  const context = dom.getInternalVMContext();
  context.exports = {};
  context.require = (name) => {
    if (name === 'igniteui-webcomponents') return new Proxy({}, { get: () => () => {} });
    if (name === './icon-registry' || name.endsWith('?raw')) return {};
    if (name === './copy-status') return { announceCopyStatus() {}, clearCopyStatus() {} };
    if (name === '../lib/ultimate-ui-platforms') return platformsModule.exports;
    if (name === '../code-theme') return codeThemeModule.exports;
    if (name === 'shiki') return shikiModule;
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
  return { dom, requests };
}

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
    const eagerLangs = [];
    const lazyLoads = [];
    const shikiModule = {
      createHighlighter: async ({ langs }) => {
        eagerLangs.push(...langs);
        return {
          getLoadedLanguages: () => [...langs, ...lazyLoads],
          getLoadedThemes: () => ['ig-dark'],
          loadLanguage: async (lang) => {
            lazyLoads.push(lang);
          },
          codeToHtml: (text) => {
            const pre = JSDOM.fragment('<pre><code></code></pre>').firstChild;
            pre.firstChild.textContent = text;
            return pre.outerHTML;
          },
        };
      },
    };
    const { dom, requests } = await runWidget({
      platform,
      base,
      route,
      url: 'https://jp.staging.infragistics.com/products/uno-platform/',
      files,
      shikiModule,
    });
    try {
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

// Without the widget's razor injection, the HTML grammar marks every Blazor component tag
// as an unrecognized tag, which the brand theme styles as an error (#ff4d25).
// The middle lines put `<` + capital where the injection must not match. If it does, the
// attribute string or expression is left open and the closing `<h1>` loses its tag color,
// and in the `@if` body the label turns into a C# comment.
test('blazor razor tabs style component tags as classes, not as errors', async () => {
  const base = 'https://staging.infragistics.com/blazor-client';
  const route = 'grids/grid/overview';
  const files = [
    {
      fileName: 'App.razor',
      fileExtension: 'razor',
      fileHeader: 'razor',
      isMain: true,
      content: [
        '<IgbGrid Data="@data"></IgbGrid>',
        '<IgbInput Placeholder="<Value " />',
        '<p>@(value <Max ? value : Max)</p>',
        '@if (show) { <IgbButton>// reset</IgbButton> }',
        '<h1>Title</h1>',
      ].join('\n'),
    },
  ];
  let ready;
  const { dom } = await runWidget({
    platform: 'blazor',
    base,
    route,
    url: 'https://staging.infragistics.com/products/ignite-ui-blazor/',
    files,
    shikiModule: { createHighlighter: (options) => (ready = shiki.createHighlighter(options)) },
  });
  try {
    const code = dom.window.document.querySelector('igc-tab code');
    assert.ok(code, `no code tab was rendered: ${dom.window.document.body.innerHTML}`);
    assert.ok(ready, 'the widget never created a highlighter');
    await ready;
    for (let tries = 0; !code.querySelector('span') && tries < 100; tries++) {
      await sleep(10);
    }
    assert.ok(code.querySelector('span'), `razor tab was never highlighted: ${code.innerHTML}`);
    const style = (text) =>
      [...code.querySelectorAll('span')]
        .find((span) => span.textContent === text)
        ?.getAttribute('style');
    // The brand theme colors a class #ffa685, an HTML tag #66adff and a comment #7d91ab italic
    // (tag punctuation shares the color, not the italic).
    assert.equal(style('IgbGrid'), 'color:#ffa685', code.innerHTML);
    assert.equal(style('h1'), 'color:#66adff', code.innerHTML);
    assert.ok(!code.innerHTML.includes('color:#7d91ab;font-style:italic'), code.innerHTML);
  } finally {
    (await ready)?.dispose();
    dom.window.close();
  }
});
