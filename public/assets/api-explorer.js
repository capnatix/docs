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
 */
(function () {
  "use strict";

  var INSTANCE_URL_KEY = "capnatix-api-explorer-instance-url";

  var versionSelect = document.getElementById("api-explorer-version");
  var instanceInput = document.getElementById("api-explorer-instance-url");
  var statusEl = document.getElementById("api-explorer-status");

  var currentInstanceUrl = "";

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function normalizeInstanceUrl(raw) {
    var trimmed = (raw || "").trim().replace(/\/+$/, "");
    if (!trimmed) return "";
    try {
      // Throws on anything that isn't a real absolute URL.
      var parsed = new URL(trimmed);
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

  function initSwaggerUi(specUrl) {
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
    });
  }

  function onVersionChange() {
    var tag = versionSelect.value;
    if (!tag) return;
    setStatus("Loading " + tag + "…");
    initSwaggerUi("/specs/" + encodeURIComponent(tag) + "/openapi.yaml");
    setStatus("Showing " + tag + ".");
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
      })
      .catch(function () {
        setStatus("Couldn't load the list of versions right now.");
      });
  }

  init();
})();
