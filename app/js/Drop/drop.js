(function () {
  var DESKTOP_QUERY = "(min-width: 1200px)";
  var REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

  function prefersReducedMotion() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  }

  function initDropMenu() {
    var menu = document.querySelector("[data-drop-menu]");
    var openButton = document.querySelector("[data-drop-menu-open]");

    if (!menu || !openButton) {
      return;
    }

    var desktop = window.matchMedia(DESKTOP_QUERY);

    function finishClose() {
      if (menu.classList.contains("is-open")) {
        return;
      }

      menu.inert = true;
      menu.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("drop-menu-open");
    }

    function setMenuOpen(isOpen) {
      if (isOpen) {
        document.documentElement.classList.add("drop-menu-open");
        menu.inert = false;
        menu.setAttribute("aria-hidden", "false");
        menu.classList.add("is-open");
      } else {
        menu.classList.remove("is-open");

        if (prefersReducedMotion()) {
          finishClose();
        }
      }

      openButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      openButton.setAttribute("aria-label", isOpen ? "Закрити меню" : "Меню");
    }

    function setCategoryOpen(item, isOpen) {
      var toggle = item.querySelector("[data-drop-menu-toggle]");
      var sub = item.querySelector("[data-drop-menu-sub]");

      if (!toggle || !sub || item.classList.contains("is-open") === isOpen) {
        return;
      }

      var currentHeight = sub.getBoundingClientRect().height;

      sub.style.height = currentHeight + "px";
      sub.offsetHeight;
      item.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      sub.style.height = isOpen ? sub.scrollHeight + "px" : "0px";
    }

    openButton.addEventListener("click", function () {
      setMenuOpen(!menu.classList.contains("is-open"));
    });

    menu.addEventListener("transitionend", function (event) {
      if (event.target !== menu || event.propertyName !== "transform") {
        return;
      }

      finishClose();
    });

    menu.querySelectorAll("[data-drop-menu-item]").forEach(function (item) {
      var toggle = item.querySelector("[data-drop-menu-toggle]");
      var sub = item.querySelector("[data-drop-menu-sub]");

      if (!toggle || !sub) {
        return;
      }

      toggle.addEventListener("click", function () {
        setCategoryOpen(item, !item.classList.contains("is-open"));
      });

      sub.addEventListener("transitionend", function (event) {
        if (event.target !== sub || event.propertyName !== "height") {
          return;
        }

        if (item.classList.contains("is-open")) {
          sub.style.height = "auto";
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenuOpen(false);
      }
    });

    desktop.addEventListener("change", function (event) {
      if (event.matches) {
        setMenuOpen(false);
      }
    });
  }

  function initDropPage() {
    var upButton = document.querySelector("[data-drop-up]");
    var cookie = document.querySelector("[data-drop-cookie]");
    var accept = document.querySelector("[data-drop-cookie-accept]");

    if (upButton) {
      upButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (cookie && accept) {
      accept.addEventListener("click", function () {
        cookie.hidden = true;
      });
    }

    initDropMenu();
  }

  if (document.querySelector("[data-partial]")) {
    document.addEventListener("partials:loaded", initDropPage);
    return;
  }

  initDropPage();
})();
