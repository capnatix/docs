/* Capnatix docs — Releases & downloads page (INVOS-640).
 *
 * Renders this repository's published releases, fetched client-side and
 * unauthenticated from the public REST API. No build step, no framework.
 *
 * Security note: release tag names and asset names are attacker-influenced
 * in principle (anyone with write access to capnatix/docs controls them),
 * so every API-derived string is inserted with textContent/createElement —
 * never innerHTML.
 */
(function () {
  "use strict";

  var API_URL = "https://api.github.com/repos/capnatix/docs/releases?per_page=30";
  var CACHE_KEY = "invos640-releases-cache-v1";
  var CACHE_TTL_MS = 10 * 60 * 1000; // ~10 minutes

  var statusEl = document.getElementById("releases-status");
  var listEl = document.getElementById("releases-list");

  function setStatus(text) {
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.savedAt !== "number" || !Array.isArray(parsed.releases)) {
        return null;
      }
      if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
        return null;
      }
      return parsed.releases;
    } catch (e) {
      return null;
    }
  }

  function writeCache(releases) {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), releases: releases })
      );
    } catch (e) {
      // private-mode / storage-disabled browsers throw — caching is best-effort
    }
  }

  function assetLabel(name) {
    if (typeof name !== "string") return null;
    if (name.endsWith(".zip")) return "Chrome extension";
    if (name.endsWith("docker-compose.prod.yaml")) return "docker-compose.prod.yaml";
    if (name.endsWith("env.prod.example")) return "env.prod.example";
    return null;
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    try {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return d.toISOString().slice(0, 10);
    }
  }

  function renderEmptyOrError(message) {
    listEl.textContent = "";
    setStatus(message + " ");
    var retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "retry-button";
    retryButton.textContent = "Retry";
    retryButton.addEventListener("click", function () {
      loadReleases(true);
    });
    statusEl.appendChild(retryButton);
  }

  function renderReleases(releases) {
    listEl.textContent = "";

    if (!Array.isArray(releases) || releases.length === 0) {
      renderEmptyOrError("No releases found here yet.");
      return;
    }

    releases.forEach(function (release) {
      var li = document.createElement("li");
      li.className = "card";

      var heading = document.createElement("h2");
      var tagText = document.createTextNode(
        typeof release.tag_name === "string" ? release.tag_name : "(untitled release)"
      );
      heading.appendChild(tagText);

      if (release.prerelease === true) {
        var badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "Pre-release";
        heading.appendChild(badge);
      }
      li.appendChild(heading);

      var meta = document.createElement("p");
      meta.className = "meta";
      var dateStr = formatDate(release.published_at || release.created_at);
      meta.textContent = dateStr ? "Published " + dateStr : "";
      li.appendChild(meta);

      var assets = Array.isArray(release.assets) ? release.assets : [];
      var tagForAria = typeof release.tag_name === "string" ? release.tag_name : "this release";

      // Recognized assets are grouped into two labeled sections —
      // "Application" (docker-compose.prod.yaml, env.prod.example) and
      // "Chrome Extension" (the .zip) — instead of one flat list, so each
      // group's links wrap independently rather than mixing on one row.
      var applicationAssets = [];
      var extensionAssets = [];

      var shown = 0;
      for (var i = 0; i < assets.length && shown < 3; i++) {
        var asset = assets[i];
        var label = asset && assetLabel(asset.name);
        var url = asset && asset.browser_download_url;
        if (!label || !url) continue;

        if (label === "Chrome extension") {
          extensionAssets.push({ label: label, url: url });
        } else {
          applicationAssets.push({ label: label, url: url });
        }
        shown++;
      }

      function appendAssetGroup(groupTitle, groupAssets) {
        if (groupAssets.length === 0) return;

        var groupLabel = document.createElement("p");
        groupLabel.className = "asset-group-label";
        groupLabel.textContent = groupTitle;
        li.appendChild(groupLabel);

        var assetList = document.createElement("ul");
        assetList.className = "asset-list";
        groupAssets.forEach(function (item) {
          var assetLi = document.createElement("li");
          var a = document.createElement("a");
          a.href = item.url; // asset.browser_download_url used verbatim — never constructed
          a.textContent = item.label;
          a.setAttribute("aria-label", item.label + " for " + tagForAria);
          assetLi.appendChild(a);
          assetList.appendChild(assetLi);
        });
        li.appendChild(assetList);
      }

      if (shown > 0) {
        appendAssetGroup("Application", applicationAssets);
        appendAssetGroup("Chrome Extension", extensionAssets);
      } else {
        var noAssets = document.createElement("p");
        noAssets.className = "meta";
        noAssets.textContent = "No downloadable assets on this release.";
        li.appendChild(noAssets);
      }

      listEl.appendChild(li);
    });

    setStatus(
      releases.length +
        (releases.length === 1 ? " release shown." : " releases shown.")
    );
  }

  // forceRefresh (used by the Retry button) skips the cache read entirely
  // so a stale cached empty/error result can never make Retry a no-op —
  // a fresh request is always sent, and its result (even an empty list)
  // overwrites the cache same as the normal path.
  function loadReleases(forceRefresh) {
    if (!forceRefresh) {
      var cached = readCache();
      if (cached) {
        renderReleases(cached);
        return;
      }
    }

    listEl.textContent = "";
    setStatus("Loading releases…");

    fetch(API_URL, {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Releases request failed with status " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response shape");
        }
        writeCache(data);
        renderReleases(data);
      })
      .catch(function () {
        renderEmptyOrError("Couldn't load releases right now.");
      });
  }

  loadReleases();
})();
