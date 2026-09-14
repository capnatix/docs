/* Capnatix docs — API Docs (read-only reference).
 *
 * Lets a visitor pick a released version of the external API contract and
 * read it via Redoc, rendered inside its own <iframe> (api-viewer.astro) --
 * not directly on this page. Redoc expects to fully own its document's
 * window/scroll for its sidebar and scroll-spy to work reliably; embedded
 * directly into this Starlight-framed page instead, its sidebar's active-
 * item tracking (which item highlights, whether a click's target scrolls
 * into view) became unreliable in a way no CSS/config fix resolved cleanly
 * -- Starlight's own fixed header sits in the same document and offsets
 * Redoc's assumptions about where the viewport's top edge actually is, and
 * there's no reaching in to guarantee Redoc's own `scroll` listener is on
 * the right element. A real, separate iframe document sidesteps the whole
 * class of problem instead of chasing it further: inside it, Redoc's
 * document IS the whole page, exactly what it's designed for.
 *
 * Specs are fetched same-origin from /specs/<tag>/openapi.yaml — baked in
 * at build time by scripts/fetch-specs.mjs, since GitHub's release-asset
 * download URLs send no CORS headers and can't be fetched directly from
 * this page's own JS.
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
  var frame = document.getElementById("redoc-frame");

  var lastRenderedKey = null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
    // The status paragraph showing/hiding changes how much vertical space
    // it takes above the iframe -- sizeFrame() only ever ran once, at
    // init(), before this function's own first call could show "Loading
    // available versions…" and push the iframe down without a re-measure.
    // With html { overflow: hidden } on this page (api.astro), that gap
    // wasn't a visible scrollbar, it was silently clipped content at the
    // iframe's own bottom edge.
    sizeFrame();
  }

  function currentTheme() {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
  }

  function renderFrame() {
    var tag = versionSelect.value;
    if (!tag) return;
    var theme = currentTheme();
    var key = tag + ":" + theme;
    if (key === lastRenderedKey) return;
    lastRenderedKey = key;
    var spec = "/specs/" + encodeURIComponent(tag) + "/openapi.yaml";
    frame.src = "/api-viewer/?spec=" + encodeURIComponent(spec) + "&theme=" + theme;
  }

  // The iframe's height was a static CSS calc() guess at how much chrome
  // sits above it (Starlight's fixed header, page title, toolbar) -- close
  // enough on some viewports, too short on others, letting the outer page
  // grow past 100vh and pick up its own scrollbar alongside the iframe's
  // own. Sizing it to exactly the real remaining space removes the outer
  // scrollbar entirely; only the iframe's own content should ever scroll.
  function sizeFrame() {
    var top = frame.getBoundingClientRect().top;
    var height = window.innerHeight - top; // edge-to-edge, no bottom gap
    frame.style.height = Math.max(height, 320) + "px";
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
    sizeFrame();
    window.addEventListener("resize", sizeFrame);

    // Starlight's theme <select> updates `data-theme` synchronously on a
    // real change (and on system-preference changes, when set to "auto")
    // -- reload the iframe with the matching theme. renderFrame's own key
    // check absorbs the extra, same-value writes Starlight also makes
    // during a normal page load (an early FOUC-prevention script, then
    // again when the theme <select>'s custom element upgrades).
    new MutationObserver(function () {
      if (versionSelect.value) renderFrame();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    versionSelect.addEventListener("change", renderFrame);

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
        renderFrame();
      })
      .catch(function () {
        setStatus("Couldn't load the list of versions right now.");
      });
  }

  init();
})();
