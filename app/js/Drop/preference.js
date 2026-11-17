(function () {
  function initPreference() {
    var root = document.querySelector(".drop-preference");

    if (!root) {
      return;
    }

    initTabs(root);
    initFavorites(root);
    initCards();

    root.addEventListener("drop-accordion:done", function (event) {
      if (event.detail && event.detail.isOpen) {
        initCards();
      }
    });
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
