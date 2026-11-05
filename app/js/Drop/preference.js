(function () {
  function initPreference() {
    var root = document.querySelector(".drop-preference");

    if (!root) {
      return;
    }

    initTabs(root);
    initGroups(root);
    initFavorites(root);
    initCards();
  }

  function initTabs(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-pref-tab]"));

    if (!tabs.length) {
      return;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (item) {
          var isActive = item === tab;

          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", isActive ? "true" : "false");
        });
      });
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initGroups(root) {
    root.querySelectorAll("[data-drop-pref-group]").forEach(function (group) {
      var toggle = group.querySelector("[data-drop-pref-toggle]");
      var panel = group.querySelector("[data-drop-pref-panel]");

      if (!toggle || !panel) {
        return;
      }

      function setGroupOpen(isOpen) {
        if (group.classList.contains("is-open") === isOpen) {
          return;
        }

        var token = {};

        panel._animToken = token;
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

        if (prefersReducedMotion()) {
          group.classList.toggle("is-open", isOpen);
          panel.hidden = !isOpen;
          panel.style.height = "";

          if (isOpen) {
            initCards();
          }

          return;
        }

        panel.hidden = false;
        panel.style.height = panel.getBoundingClientRect().height + "px";
        panel.offsetHeight;
        group.classList.toggle("is-open", isOpen);
        panel.style.height = isOpen ? panel.scrollHeight + "px" : "0px";

        if (isOpen) {
          initCards();
        }

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

      toggle.addEventListener("click", function () {
        setGroupOpen(!group.classList.contains("is-open"));
      });
    });
  }

  function initFavorites(root) {
    root.addEventListener("click", function (event) {
      var button = event.target.closest("[data-drop-favorite]");

      if (!button) {
        return;
      }

      var isActive = button.classList.toggle("is-active");

      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute("aria-label", isActive ? "Прибрати з вподобань" : "Додати в вподобання");
    });
  }

  function initCards() {
    if (typeof Swiper !== "function") {
      return;
    }

    document.querySelectorAll(".drop-preference [data-drop-card]").forEach(function (card) {
      var main = card.querySelector(".drop-card__main");
      var thumbs = card.querySelector(".drop-card__thumbs-swiper");

      if (!main || !thumbs || card.getAttribute("data-drop-card-ready") === "true") {
        return;
      }

      var thumbsSwiper = new Swiper(thumbs, {
        spaceBetween: 8,
        slidesPerView: 3,
        roundLengths: true,
        watchSlidesProgress: true,
        slideToClickedSlide: true,
        navigation: {
          nextEl: card.querySelector(".drop-card__next"),
          prevEl: card.querySelector(".drop-card__prev")
        }
      });

      new Swiper(main, {
        spaceBetween: 0,
        allowTouchMove: false,
        thumbs: {
          swiper: thumbsSwiper
        }
      });

      card.setAttribute("data-drop-card-ready", "true");
    });
  }

  function start() {
    if (document.querySelector("[data-partial]")) {
      document.addEventListener("partials:loaded", initPreference);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initPreference);
      return;
    }

    initPreference();
  }

  start();
})();
