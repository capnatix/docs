/* Capnatix docs — API Docs (read-only reference).
 *
 * Lets a visitor pick a released version of the external API contract and
 * read it via Redoc. Specs are fetched same-origin from
 * /specs/<tag>/openapi.yaml — baked in at build time by
 * scripts/fetch-specs.mjs, since GitHub's release-asset download URLs send
 * no CORS headers and can't be fetched directly from this page's own JS.
 *
 * Deliberately read-only, no "Try it out": that lives on a customer's own
 * instance instead, at /docs (Swagger UI, same-origin, gated behind the
 * EXTERNAL_API_DOCS_ENABLED env var) — always running the exact version
 * that instance actually serves, with no cross-origin request involved.
 */
(function () {
  "use strict";

  var versionSelect = document.getElementById("api-explorer-version");
  var statusEl = document.getElementById("api-explorer-status");
  var container = document.getElementById("redoc-container");

  var LIGHT_THEME = {};
  var DARK_THEME = {
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

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function currentTheme() {
    return document.documentElement.dataset.theme === "light" ? LIGHT_THEME : DARK_THEME;
  }

  function renderRedoc(specUrl) {
    if (!window.Redoc) {
      setStatus("Couldn't load the API reference's viewer.");
      return;
    }
    container.textContent = "";
    window.Redoc.init(
      specUrl,
      {
        theme: currentTheme(),
        hideDownloadButton: false,
        expandResponses: "200,201",
      },
      container
    );
  }

  function onVersionChange() {
    var tag = versionSelect.value;
    if (!tag) return;
    renderRedoc("/specs/" + encodeURIComponent(tag) + "/openapi.yaml");
  }

  function populateVersions(manifest) {
    versionSelect.textContent = "";
    manifest.forEach(function (entry) {
      var option = document.createElement("option");
      option.value = entry.tag;
      option.textContent = entry.tag + (entry.prerelease ? " (pre-release)" : "");
      versionSelect.appendChild(option);
    });
  }

  function init() {
    // Redoc's theme is applied once at init, not reactively via CSS, so a
    // site theme change re-renders it rather than just flipping a class.
    new MutationObserver(function () {
      if (versionSelect.value) onVersionChange();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    versionSelect.addEventListener("change", onVersionChange);

    setStatus("Loading available versions…");
    fetch("/specs/index.json")
      .then(function (res) {
        if (!res.ok) throw new Error("index.json request failed with status " + res.status);
        return res.json();
      })
      .then(function (manifest) {
        if (!Array.isArray(manifest) || manifest.length === 0) {
          setStatus("No published version has an API contract yet.");
          return;
        }
        setStatus("");
        populateVersions(manifest);
        onVersionChange();
      })
      .catch(function () {
        setStatus("Couldn't load the list of versions right now.");
      });
  }

  init();
})();
