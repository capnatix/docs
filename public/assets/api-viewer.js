/* Runs inside api-viewer.astro's own iframe document -- reads which spec
 * and theme to render from its own query string, set by the parent page
 * (public/assets/api-docs.js) each time the visitor picks a version or the
 * site's theme changes. See api-viewer.astro's header comment for why this
 * lives in its own document instead of the parent Starlight page directly.
 */
(function () {
  "use strict";

  // Redoc's own defaults (14px body text, Roboto/Montserrat) don't match
  // Starlight's Docs pages (16px, the system font stack) -- shared between
  // both themes below so the two tabs read as one site, not two.
  var TYPOGRAPHY = {
    fontSize: "16px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    headings: {
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
  };

  // Redoc's own default active-item styling derives the highlighted
  // group/leaf background from a darkened/lightened tint of the sidebar's
  // OWN background color -- a plain gray/near-black block, not the site's
  // teal accent Starlight's own sidebar uses for its active item. Colors
  // below are copied from the live computed styles of a Docs page's own
  // [aria-current="page"] sidebar link, in each theme, so "which item is
  // selected" reads the same way in both tabs.
  var DARK_ACTIVE = { background: "#2bd4bd", text: "#1c403b" };
  var LIGHT_ACTIVE = { background: "#11736b", text: "#f8fbfb" };

  function sidebarTheme(backgroundColor, textColor, active) {
    return {
      backgroundColor: backgroundColor,
      textColor: textColor,
      groupItems: { activeBackgroundColor: active.background, activeTextColor: active.text },
      level1Items: { activeBackgroundColor: active.background, activeTextColor: active.text },
    };
  }

  var LIGHT_THEME = {
    typography: TYPOGRAPHY,
    sidebar: sidebarTheme("#fafafa", "#333333", LIGHT_ACTIVE),
  };
  var DARK_THEME = {
    typography: TYPOGRAPHY,
    colors: {
      primary: { main: "#4fd1c5" },
      text: { primary: "#e4e6e6", secondary: "#b7bfc3" },
      http: {
        get: "#4caf50",
        post: "#3ece90",
        put: "#fb8c00",
        options: "#0d5aa7",
        patch: "#e1a100",
        delete: "#f93e3e",
        basic: "#999",
        link: "#31bbb6",
        head: "#c167e4",
      },
      responses: {
        success: { color: "#4caf50" },
        error: { color: "#f93e3e" },
      },
      border: { dark: "#333", light: "#333" },
    },
    sidebar: sidebarTheme("#0e161b", "#e4e6e6", DARK_ACTIVE),
    rightPanel: {
      backgroundColor: "#1b2b34",
      textColor: "#e4e6e6",
    },
  };

  // Redoc has no init option for either of these -- both are post-render
  // DOM edits, applied once per render via a MutationObserver (Redoc's
  // init() is async: spec fetch + parse + React render, with no public
  // "onComplete" in the standalone bundle to hook instead).
  function enhanceInfoSection(container) {
    var infoDiv = container.querySelector(".api-info");
    if (!infoDiv) return;

    // The version dropdown in the parent page's own navbar is the one
    // source of truth for which version is showing -- Redoc's own h1
    // (built from the spec's info.title + info.version) restated both,
    // redundantly, right below it.
    var h1 = infoDiv.querySelector("h1");
    if (h1) h1.textContent = "Capnatix API Doc";

    // Collapses the long info.description markdown (everything Redoc
    // renders after the "Download OpenAPI specification" line) into a
    // closed <details> panel -- useful reference, not something a visitor
    // should have to scroll past by default to reach the actual
    // endpoints. Grabbed as "every sibling after the download <p>" rather
    // than by class name: Redoc's own classes here are generated,
    // per-build hashes, not a stable public API to select against.
    var downloadP = infoDiv.querySelector("p");
    if (!downloadP || downloadP.dataset.enhanced) return;
    downloadP.dataset.enhanced = "true";
    var rest = [];
    var node = downloadP.nextElementSibling;
    while (node) {
      var next = node.nextElementSibling;
      rest.push(node);
      node = next;
    }
    if (rest.length === 0) return;

    var details = infoDiv.ownerDocument.createElement("details");
    details.className = "api-info-details";
    var summary = infoDiv.ownerDocument.createElement("summary");
    summary.textContent = "About this API";
    details.appendChild(summary);
    rest.forEach(function (el) {
      details.appendChild(el);
    });
    downloadP.insertAdjacentElement("afterend", details);
  }

  function watchAndEnhance(container) {
    var applied = false;
    function tryApply() {
      if (applied) return;
      if (!container.querySelector(".api-info h1")) return;
      applied = true;
      enhanceInfoSection(container);
      observer.disconnect();
    }
    var observer = new MutationObserver(tryApply);
    observer.observe(container, { childList: true, subtree: true });
    tryApply();
  }

  var params = new URLSearchParams(location.search);
  var specUrl = params.get("spec");
  var isDark = params.get("theme") !== "light";
  var theme = isDark ? DARK_THEME : LIGHT_THEME;
  if (isDark) {
    document.documentElement.style.background = "#0e161b";
    document.documentElement.classList.add("theme-dark");
  }

  if (specUrl && window.Redoc) {
    var container = document.getElementById("redoc-container");
    watchAndEnhance(container);
    window.Redoc.init(specUrl, { theme: theme, hideDownloadButton: false }, container);
  }
})();
