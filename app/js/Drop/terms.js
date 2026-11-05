(function () {
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initTerms() {
    var root = document.querySelector(".drop-terms");

    if (!root) {
      return;
    }

    var items = Array.prototype.slice.call(root.querySelectorAll("[data-drop-terms-item]"));

    items.forEach(function (item) {
      var toggle = item.querySelector("[data-drop-terms-toggle]");
      var panel = item.querySelector("[data-drop-terms-panel]");

      if (!toggle || !panel) {
        return;
      }

      syncItem(item, toggle, panel, item.classList.contains("is-open"));

      toggle.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");

        if (willOpen) {
          items.forEach(function (other) {
            if (other !== item && other.classList.contains("is-open")) {
              setItemOpen(other, false);
            }
          });
        }

        setItemOpen(item, willOpen);
      });
    });
  }

  function syncItem(item, toggle, panel, isOpen) {
    item.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    panel.hidden = !isOpen;
    panel.style.height = "";
  }

  function setItemOpen(item, isOpen) {
    var toggle = item.querySelector("[data-drop-terms-toggle]");
    var panel = item.querySelector("[data-drop-terms-panel]");

    if (!toggle || !panel || item.classList.contains("is-open") === isOpen) {
      return;
    }

    var token = {};

    panel._animToken = token;
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    if (prefersReducedMotion()) {
      syncItem(item, toggle, panel, isOpen);
      return;
    }

    panel.hidden = false;
    panel.style.height = panel.getBoundingClientRect().height + "px";
    panel.offsetHeight;
    item.classList.toggle("is-open", isOpen);
    panel.style.height = isOpen ? panel.scrollHeight + "px" : "0px";

    panel.addEventListener("transitionend", function onEnd(event) {
      if (event.target !== panel || event.propertyName !== "height" || panel._animToken !== token) {
        return;
      }

      panel.removeEventListener("transitionend", onEnd);

      if (isOpen) {
        panel.style.height = "auto";
        return;
      }

      panel.hidden = true;
      panel.style.height = "";
    });
  }

  function start() {
    if (document.querySelector("[data-partial]")) {
      document.addEventListener("partials:loaded", initTerms);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initTerms);
      return;
    }

    initTerms();
  }

  start();
})();
