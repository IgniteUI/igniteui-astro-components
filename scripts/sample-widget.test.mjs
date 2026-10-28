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
        if (name === '../lib/ultimate-ui-platforms') return platformsModule.exports;
        // The brand dual theme (src/code-theme): the widget only needs the theme
        // objects to register and the two ids to pass to codeToHtml.
        if (name === '../code-theme')
          return {
            igShikiThemes: { light: { name: 'ig-light' }, dark: { name: 'ig-dark' } },
            IG_CODE_THEME_LIGHT: 'ig-light',
            IG_CODE_THEME_DARK: 'ig-dark',
          };
        if (name === 'shiki')
          return {
            createHighlighter: async ({ langs }) => {
              eagerLangs.push(...langs);
              return {
                getLoadedLanguages: () => [...langs, ...lazyLoads],
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
