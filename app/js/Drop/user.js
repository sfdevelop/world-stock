(function () {
  var DESKTOP_QUERY = "(min-width: 1200px)";
  var REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  var ORDERS_PAGES = ["drop-orders.html", "drop-orders-search.html"];

  function prefersReducedMotion() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  }

  function currentPage() {
    var path = window.location.pathname || "";
    var file = path.split("/").pop();

    return file || "drop-index.html";
  }

  function isActiveHref(href) {
    var page = currentPage();

    if (href === page) {
      return true;
    }

    return href === "drop-orders.html" && ORDERS_PAGES.indexOf(page) !== -1;
  }

  function markActive(root) {
    root.querySelectorAll(".drop-user__link[href]").forEach(function (link) {
      var active = isActiveHref(link.getAttribute("href"));

      link.classList.toggle("drop-user__link--active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function closeOverlay(selector, buttonSelector) {
    var overlay = document.querySelector(selector);
    var button = document.querySelector(buttonSelector);

    if (overlay && overlay.classList.contains("is-open") && button) {
      button.click();
    }
  }

  function initDropUser() {
    var root = document.querySelector("[data-drop-user]");
    var openButton = document.querySelector("[data-drop-user-open]");

    if (!root || !openButton) {
      return;
    }

    var panel = root.querySelector("[data-drop-user-panel]");

    if (!panel) {
      return;
    }

    var desktop = window.matchMedia(DESKTOP_QUERY);
    var lastFocus = null;

    function finishClose() {
      if (root.classList.contains("is-open")) {
        return;
      }

      root.inert = true;
      root.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("drop-user-open");
    }

    function setOpen(isOpen) {
      if (root.classList.contains("is-open") === isOpen) {
        return;
      }

      if (isOpen) {
        closeOverlay("[data-drop-menu]", "[data-drop-menu-open]");
        closeOverlay("[data-drop-cart]", "[data-drop-cart-open]");
        lastFocus = document.activeElement;
        root.inert = false;
        root.setAttribute("aria-hidden", "false");
        panel.setAttribute("aria-modal", desktop.matches ? "false" : "true");

        if (desktop.matches) {
          DropAccordion.setOpen(root, panel, true);
        } else {
          root.classList.add("is-open");
          document.documentElement.classList.add("drop-user-open");
        }
      } else if (desktop.matches) {
        DropAccordion.setOpen(root, panel, false, finishClose);
      } else {
        root.classList.remove("is-open");

        if (prefersReducedMotion()) {
          finishClose();
        }
      }

      if (!isOpen && lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }

      openButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      openButton.setAttribute("aria-label", isOpen ? "Закрити кабінет" : "Кабінет");
    }

    markActive(root);

    openButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!root.classList.contains("is-open"));
    });

    root.addEventListener("click", function (event) {
      if (event.target === root) {
        setOpen(false);
      }
    });

    panel.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    panel.addEventListener("transitionend", function (event) {
      if (event.target !== panel || event.propertyName !== "transform") {
        return;
      }

      finishClose();
    });

    document.addEventListener("click", function (event) {
      if (!desktop.matches || !root.classList.contains("is-open")) {
        return;
      }

      if (openButton.contains(event.target) || root.contains(event.target)) {
        return;
      }

      setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && root.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    desktop.addEventListener("change", function () {
      setOpen(false);
    });
  }

  if (document.querySelector("[data-partial]")) {
    document.addEventListener("partials:loaded", initDropUser);
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDropUser);
    return;
  }

  initDropUser();
})();
