// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

// CopyCode renders no markup — it is a client <script> that decorates code blocks.
// Stub the web components so the script's DOM logic can run under jsdom. The stubs
// are hoisted so every resolution of the package shares the same instances.
const webComponents = vi.hoisted(() => ({
  defineComponents: vi.fn(),
  IgcIconButtonComponent: class {},
  IgcIconComponent: class {},
}));
vi.mock('igniteui-webcomponents', () => webComponents);
vi.mock('../../src/scripts/icon-registry', () => ({}));

const pageLoad = () => document.dispatchEvent(new Event('astro:page-load'));

const render = (html: string) => {
  document.body.innerHTML = html;
  pageLoad();
};

const button = () => document.querySelector<HTMLElement>('.copy-btn')!;
const icon = () => button().querySelector('igc-icon')!;

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: spy }, configurable: true });
  return spy;
};

describe('CopyCode', () => {
  let registered: unknown[][] = [];

  beforeAll(async () => {
    // Astro serves a component's <script> as this virtual module.
    await import('../../src/components/CopyCode/CopyCode.astro?astro&type=script&index=0&lang.ts');
    // Mock call history is cleared before each test, so capture the import-time calls now.
    registered = [...webComponents.defineComponents.mock.calls];
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'clipboard');
    Reflect.deleteProperty(document, 'execCommand');
    document.body.innerHTML = '';
  });

  it('registers the icon button and icon components', () => {
    const { IgcIconButtonComponent, IgcIconComponent } = webComponents;
    expect(registered).toEqual([[IgcIconButtonComponent, IgcIconComponent]]);
  });

  it.each(['astro-code', 'shiki'])('wraps pre.%s in a copy wrapper with a button', (cls) => {
    render(`<pre class="${cls}"><code>npm i</code></pre>`);

    const wrapper = document.querySelector('.copy-code-wrapper')!;
    expect(wrapper).not.toBeNull();
    expect(wrapper.firstElementChild!.matches(`pre.${cls}`)).toBe(true);
    expect(button().tagName).toBe('IGC-ICON-BUTTON');
    expect(button().parentElement).toBe(wrapper);
    expect(button().getAttribute('variant')).toBe('flat');
    expect(button().getAttribute('aria-label')).toBe('Copy code');
    expect(icon().getAttribute('name')).toBe('copy');
    expect(icon().getAttribute('collection')).toBe('docs');
  });

  it('ignores pre elements that are not highlighted code blocks', () => {
    render('<pre>plain</pre>');

    expect(document.querySelector('.copy-code-wrapper')).toBeNull();
  });

  it('decorates every code block on the page', () => {
    render('<pre class="astro-code"><code>a</code></pre><pre class="shiki"><code>b</code></pre>');

    expect(document.querySelectorAll('.copy-btn')).toHaveLength(2);
  });

  it('does not wrap a block twice on repeated page loads', () => {
    render('<pre class="astro-code"><code>npm i</code></pre>');
    pageLoad();

    expect(document.querySelectorAll('.copy-code-wrapper')).toHaveLength(1);
    expect(document.querySelectorAll('.copy-btn')).toHaveLength(1);
  });

  it('copies the code text and shows a confirmation that resets', async () => {
    const writeText = stubClipboard(() => Promise.resolve());
    render('<pre class="astro-code"><code>npm i igniteui</code></pre>');

    button().click();
    await vi.advanceTimersByTimeAsync(0);

    expect(writeText).toHaveBeenCalledWith('npm i igniteui');
    expect(icon().getAttribute('name')).toBe('check');
    expect(button().getAttribute('aria-label')).toBe('Copied!');

    await vi.advanceTimersByTimeAsync(1500);

    expect(icon().getAttribute('name')).toBe('copy');
    expect(button().getAttribute('aria-label')).toBe('Copy code');
  });

  it('copies the pre text when there is no code element', async () => {
    const writeText = stubClipboard(() => Promise.resolve());
    render('<pre class="shiki">raw text</pre>');

    button().click();
    await vi.advanceTimersByTimeAsync(0);

    expect(writeText).toHaveBeenCalledWith('raw text');
  });

  it('falls back to execCommand when the Clipboard API is unavailable', async () => {
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
    render('<pre class="astro-code"><code>npm i</code></pre>');

    button().click();
    await vi.advanceTimersByTimeAsync(0);

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(button().getAttribute('aria-label')).toBe('Copied!');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back to execCommand when the Clipboard API rejects', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')));
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
    render('<pre class="astro-code"><code>npm i</code></pre>');

    button().click();
    await vi.advanceTimersByTimeAsync(0);

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(button().getAttribute('aria-label')).toBe('Copied!');
  });

  it('reports a failure when every copy method fails, then resets', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')));
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn(() => false),
      configurable: true,
    });
    render('<pre class="astro-code"><code>npm i</code></pre>');

    button().click();
    await vi.advanceTimersByTimeAsync(0);

    expect(button().getAttribute('aria-label')).toBe('Copy failed');
    expect(icon().getAttribute('name')).toBe('copy');

    await vi.advanceTimersByTimeAsync(1500);

    expect(button().getAttribute('aria-label')).toBe('Copy code');
  });
});
