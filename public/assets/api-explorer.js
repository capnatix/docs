/* Capnatix docs — API Explorer.
 *
 * Lets a visitor pick a released version of the external API contract and
 * try it out against their own self-hosted instance. Specs are fetched
 * same-origin from /specs/<tag>/openapi.yaml — baked in at build time by
 * scripts/fetch-specs.mjs, since GitHub's release-asset download URLs send
 * no CORS headers and can't be fetched directly from this page's own JS.
 *
 * The spec's own `servers[0].url` is a relative path (/external/api/v1),
 * which Swagger UI resolves against THIS page's origin by default. A
 * requestInterceptor rewrites that origin to the visitor's own instance URL
 * at request time — no need to edit or re-fetch the spec per instance.
 *
 * Dark mode: swagger-ui.css ships its own complete light/dark theme, keyed
 * off an `html.dark-mode` class rather than our site's `data-theme`
 * attribute, and its bundle auto-arms that class from the visitor's OS
 * color scheme on mount -- independently of whatever theme our own site is
 * showing. syncDarkMode() below keeps the two in sync instead; the
 * lightbulb toggle Swagger UI would otherwise render for this is hidden in
 * api.astro's CSS so there's only one theme control on the page.
 */
(function () {
  "use strict";

  var INSTANCE_URL_KEY = "capnatix-api-explorer-instance-url";

  var versionSelect = document.getElementById("api-explorer-version");
  var instanceInput = document.getElementById("api-explorer-instance-url");
  var statusEl = document.getElementById("api-explorer-status");

  var currentInstanceUrl = "";
  var versionGeneration = 0;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function syncDarkMode() {
    var dark = document.documentElement.dataset.theme !== "light";
    document.documentElement.classList.toggle("dark-mode", dark);
  }

  function normalizeInstanceUrl(raw) {
    var trimmed = (raw || "").trim().replace(/\/+$/, "");
    if (!trimmed) return "";
    try {
      // Throws on anything that isn't a real absolute URL -- but doesn't
      // throw on a bare "host:port" like "localhost:3001" (a very plausible
      // thing to type here): WHATWG parses "localhost" as the scheme and
      // returns origin "null", which would otherwise sail through as if it
      // were valid. Requiring http(s) rejects that case explicitly instead.
      var parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
      return parsed.origin;
    } catch (e) {
      return "";
    }
  }

  function loadStoredInstanceUrl() {
    try {
      return localStorage.getItem(INSTANCE_URL_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function storeInstanceUrl(url) {
    try {
      localStorage.setItem(INSTANCE_URL_KEY, url);
    } catch (e) {
      // private-mode / storage-disabled browsers throw — persistence is best-effort
    }
  }

  function initSwaggerUi(specUrl, generation) {
    if (!window.SwaggerUIBundle) {
      setStatus("Couldn't load the API explorer's UI bundle.");
      return;
    }
    window.ui = window.SwaggerUIBundle({
      url: specUrl,
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIStandalonePreset],
      plugins: [window.SwaggerUIBundle.plugins.DownloadUrl],
      layout: "StandaloneLayout",
      requestInterceptor: function (req) {
        if (!currentInstanceUrl) return req;
        try {
          var parsed = new URL(req.url);
          req.url = currentInstanceUrl + parsed.pathname + parsed.search;
        } catch (e) {
          // Not a well-formed absolute URL — leave it alone rather than guess.
        }
        return req;
      },
      onComplete: function () {
        // Two versions picked in quick succession each fetch/render
        // independently, so the SLOWER one can finish and overwrite the
        // DOM after the version the dropdown now actually shows. If a
        // newer selection was made while this one was still loading,
        // re-render the current selection on top rather than leave a
        // stale spec visible.
        if (generation !== versionGeneration) onVersionChange();
      },
    });
  }

  function onVersionChange() {
    var tag = versionSelect.value;
    if (!tag) return;
    versionGeneration++;
    initSwaggerUi("/specs/" + encodeURIComponent(tag) + "/openapi.yaml", versionGeneration);
    // Swagger UI's own mount can re-arm its dark-mode class from the
    // visitor's OS color scheme regardless of our own site theme -- correct
    // it right after mounting, not just on our own theme-change listener.
    syncDarkMode();
  }

  function onInstanceUrlInput() {
    var normalized = normalizeInstanceUrl(instanceInput.value);
    currentInstanceUrl = normalized;
    storeInstanceUrl(instanceInput.value.trim());
    if (instanceInput.value.trim() && !normalized) {
      setStatus("That doesn't look like a full URL (e.g. https://your-instance.example.com).");
    } else if (!normalized) {
      setStatus("Enter your instance's URL above before using “Try it out”.");
    } else {
      setStatus("Requests will be sent to " + normalized + ".");
    }
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
    syncDarkMode();
    // Starlight's theme select updates `data-theme` synchronously on
    // change (and system-preference changes, when the visitor is on
    // "auto") -- mirror every change onto Swagger UI's own class straight
    // away rather than polling.
    new MutationObserver(syncDarkMode).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    var storedUrl = loadStoredInstanceUrl();
    if (storedUrl) {
      instanceInput.value = storedUrl;
      onInstanceUrlInput();
    }
    instanceInput.addEventListener("input", onInstanceUrlInput);
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
        populateVersions(manifest);
        onVersionChange();
        // The dropdown already shows which version is selected -- clear the
        // "Loading…" text rather than replace it with a redundant "Showing
        // vX." Reuses onInstanceUrlInput's own logic so a stored/entered
        // instance URL's status (or the prompt to enter one) shows instead.
        onInstanceUrlInput();
      })
      .catch(function () {
        setStatus("Couldn't load the list of versions right now.");
      });
  }

  init();
})();
