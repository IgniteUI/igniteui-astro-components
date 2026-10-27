import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

// Exercise the real widget in a DOM, replacing only browser component registration
// and the asynchronous syntax highlighter. No sample iframe or CDN is loaded.
const script = ts.transpileModule(
  readFileSync(new URL('../src/scripts/sample-widget.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

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
      const context = dom.getInternalVMContext();
      context.exports = {};
      context.require = (name) => {
        if (name === 'igniteui-webcomponents') return new Proxy({}, { get: () => () => {} });
        if (name === './icon-registry' || name.endsWith('?raw')) return {};
        if (name === 'shiki')
          return {
            createHighlighter: async () => ({
              codeToHtml: (text) => {
                const pre = dom.window.document.createElement('pre');
                const code = dom.window.document.createElement('code');
                code.textContent = text;
                pre.append(code);
                return pre.outerHTML;
              },
            }),
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
    } finally {
      dom.window.close();
    }
  });
}
