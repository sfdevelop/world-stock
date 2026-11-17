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

    openButton.addEventListener("click", function () {
      setMenuOpen(!menu.classList.contains("is-open"));
    });

    menu.addEventListener("transitionend", function (event) {
      if (event.target !== menu || event.propertyName !== "transform") {
        return;
      }

      finishClose();
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
    window.DropAccordion.bindAll();
  }

  if (document.querySelector("[data-partial]")) {
    document.addEventListener("partials:loaded", initDropPage);
    return;
  }

  initDropPage();
})();
