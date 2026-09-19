/* Arrow-key navigation for the site search results.
 *
 * @pagefind/default-ui (the widget Starlight's own Search.astro wires up
 * unmodified -- see node_modules/@astrojs/starlight/components/
 * Search.astro) renders results as plain <a> links with no built-in
 * keyboard navigation at all: confirmed by reading its own ui-core.js,
 * which has zero ArrowDown/ArrowUp/keydown handling anywhere. A visitor
 * can Tab or click a result, but arrow-key-then-Enter (the interaction
 * every other search box on the web supports) silently does nothing.
 *
 * This is a small, separate global script rather than a fork of
 * Search.astro on purpose: it only touches Starlight's own stable,
 * documented Pagefind container id/classes (#starlight__search,
 * .pagefind-ui__result-link, .pagefind-ui__search-input) -- the public
 * contract of the widget, not an internal implementation detail -- so it
 * survives a Starlight/Pagefind upgrade without needing to be kept in
 * sync with the rest of Search.astro's own markup and dialog logic.
 *
 * No custom Enter handling is needed: results are real <a href> links,
 * so moving native focus onto one and letting the browser's own
 * Enter-activates-the-focused-link behavior do the rest is both simpler
 * and more correct than reimplementing navigation in JS.
 */
(function () {
  "use strict";

  function resultLinks() {
    var root = document.getElementById("starlight__search");
    return root ? Array.prototype.slice.call(root.querySelectorAll("a.pagefind-ui__result-link")) : [];
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    var root = document.getElementById("starlight__search");
    if (!root || !root.contains(document.activeElement)) return;

    var links = resultLinks();
    if (links.length === 0) return;

    var active = document.activeElement;
    var isInput = active && active.classList && active.classList.contains("pagefind-ui__search-input");
    var index = links.indexOf(active);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (isInput || index === -1) {
        links[0].focus();
      } else if (index < links.length - 1) {
        links[index + 1].focus();
      }
      return;
    }

    // ArrowUp
    event.preventDefault();
    if (index > 0) {
      links[index - 1].focus();
    } else if (index === 0) {
      var input = root.querySelector(".pagefind-ui__search-input");
      if (input) input.focus();
    }
  });
})();
