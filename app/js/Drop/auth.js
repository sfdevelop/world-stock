(function () {
  var TITLES = {
    login: "Вхід — WORLD STOCK DROP",
    register: "Реєстрація — WORLD STOCK DROP"
  };

  var PATHS = {
    login: "drop-login.html",
    register: "drop-registration.html"
  };

  function initAuth() {
    var root = document.querySelector("[data-drop-auth]");

    if (!root) {
      return;
    }

    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-drop-auth-tab]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-drop-auth-panel]"));

    function currentView() {
      return root.getAttribute("data-drop-auth") === "register" ? "register" : "login";
    }

    function setView(view, push) {
      var next = view === "register" ? "register" : "login";

      root.setAttribute("data-drop-auth", next);
      root.classList.toggle("drop-auth--login", next === "login");
      root.classList.toggle("drop-auth--register", next === "register");

      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-drop-auth-tab") === next;

        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      panels.forEach(function (panel) {
        var isActive = panel.getAttribute("data-drop-auth-panel") === next;

        panel.hidden = !isActive;
      });

      document.title = TITLES[next];

      if (push && window.history && window.history.pushState) {
        window.history.pushState({ dropAuth: next }, "", PATHS[next]);
      }
    }

    setView(currentView(), false);

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (event) {
        var view = tab.getAttribute("data-drop-auth-tab");

        if (!view || view === currentView()) {
          return;
        }

        event.preventDefault();
        setView(view, true);
      });
    });

    window.addEventListener("popstate", function () {
      var path = window.location.pathname || "";
      var view = path.indexOf("drop-registration") !== -1 ? "register" : "login";

      setView(view, false);
    });
  }

  function start() {
    if (document.querySelector("[data-partial]")) {
      document.addEventListener("partials:loaded", initAuth);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAuth);
      return;
    }

    initAuth();
  }

  start();
})();
