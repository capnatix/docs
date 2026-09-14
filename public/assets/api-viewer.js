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

  var LIGHT_THEME = { typography: TYPOGRAPHY };
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
    sidebar: {
      backgroundColor: "#0e161b",
      textColor: "#e4e6e6",
    },
    rightPanel: {
      backgroundColor: "#1b2b34",
      textColor: "#e4e6e6",
    },
  };

  var params = new URLSearchParams(location.search);
  var specUrl = params.get("spec");
  var isDark = params.get("theme") !== "light";
  var theme = isDark ? DARK_THEME : LIGHT_THEME;
  if (isDark) {
    document.documentElement.style.background = "#0e161b";
    document.documentElement.classList.add("theme-dark");
  }

  if (specUrl && window.Redoc) {
    window.Redoc.init(
      specUrl,
      { theme: theme, hideDownloadButton: false },
      document.getElementById("redoc-container")
    );
  }
})();
