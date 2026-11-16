// Adoption trial: loads the ig-design-system tokens after every other stylesheet when the switch is on,
// and selects its docs type set. base.css, the package's element styles, is not loaded: this repo has its own.
// Turn it on with the button in the bottom left corner, or with ?ds=on / ?ds=off in the URL.
(function () {
  var KEY = 'igd-trial';
  var SHEETS = ['/design-system/tokens.css', '/design-system/theme.css'];

  var param = new URLSearchParams(location.search).get('ds');
  if (param === 'on' || param === 'off') localStorage.setItem(KEY, param);

  function isOn() {
    return localStorage.getItem(KEY) === 'on';
  }

  function apply() {
    document.querySelectorAll('link[data-igd-trial]').forEach(function (link) {
      link.remove();
    });
    if (isOn()) {
      SHEETS.forEach(function (href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-igd-trial', '');
        document.head.appendChild(link);
      });
    }
    document.documentElement.toggleAttribute('data-igd-trial', isOn());
    if (isOn()) document.documentElement.setAttribute('data-igd-type', 'docs');
    else document.documentElement.removeAttribute('data-igd-type');

    var button = document.getElementById('igd-trial-toggle');
    if (!button) {
      button = document.createElement('button');
      button.id = 'igd-trial-toggle';
      button.type = 'button';
      button.style.cssText =
        'position:fixed;left:12px;bottom:12px;z-index:2147483647;padding:8px 12px;border:1px solid #000;border-radius:999px;background:#fff;color:#000;font:600 13px/1 system-ui,sans-serif;cursor:pointer';
      button.addEventListener('click', function () {
        localStorage.setItem(KEY, isOn() ? 'off' : 'on');
        apply();
      });
      document.body.appendChild(button);
    }
    button.textContent = 'Design system: ' + (isOn() ? 'on' : 'off');
    button.setAttribute('aria-pressed', String(isOn()));
  }

  // Fires on the first load and after every view transition.
  document.addEventListener('astro:page-load', apply);
})();
