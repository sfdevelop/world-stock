(function () {
  var DESKTOP_QUERY = "(min-width: 1200px)";
  var UNIT_PRICE = 590;
  var WAREHOUSE_ORDER = ["bucha", "kyiv", "lviv"];
  var WAREHOUSE_NAMES = {
    bucha: "БУЧА",
    kyiv: "КИЇВ",
    lviv: "ЛЬВІВ"
  };

  function initProduct() {
    var root = document.querySelector("[data-drop-product]");

    if (!root) {
      return;
    }

    var gallery = initGallery(root);

    initZoom(root, gallery);
    initFavorite(root);
    initDownload(root);
    initSizes(root);
  }

  function initGallery(root) {
    if (typeof Swiper !== "function") {
      return;
    }

    var mainEl = root.querySelector(".drop-product__slider");
    var thumbsEl = root.querySelector(".drop-product__thumbs");
    var counter = root.querySelector("[data-drop-counter]");
    var desktop = window.matchMedia(DESKTOP_QUERY);
    var gallery = { main: null };
    var main = null;
    var thumbs = null;

    if (!mainEl) {
      return;
    }

    function updateCounter(swiper) {
      if (!counter || !swiper.slides) {
        return;
      }

      counter.textContent = (swiper.realIndex + 1) + "/" + swiper.slides.length;
    }

    function mount() {
      if (main) {
        main.destroy(true, true);
        main = null;
      }

      if (thumbs) {
        thumbs.destroy(true, true);
        thumbs = null;
      }

      if (desktop.matches && thumbsEl) {
        thumbs = new Swiper(thumbsEl, {
          direction: "vertical",
          spaceBetween: 12,
          slidesPerView: 5,
          freeMode: true,
          watchSlidesProgress: true,
          slideToClickedSlide: true
        });
      }

      var options = {
        spaceBetween: 0,
        navigation: {
          nextEl: root.querySelector(".drop-product__arrow--next"),
          prevEl: root.querySelector(".drop-product__arrow--prev")
        },
        a11y: {
          prevSlideMessage: "Попереднє фото",
          nextSlideMessage: "Наступне фото"
        },
        on: {
          init: updateCounter,
          slideChange: updateCounter
        }
      };

      if (thumbs) {
        options.thumbs = { swiper: thumbs };
      }

      main = new Swiper(mainEl, options);
      gallery.main = main;
    }

    mount();
    desktop.addEventListener("change", mount);

    return gallery;
  }

  function initZoom(root, gallery) {
    if (!gallery || typeof Fancybox === "undefined") {
      return;
    }

    var links = root.querySelectorAll("[data-drop-zoom]");

    links.forEach(function (link, index) {
      link.addEventListener("click", function (event) {
        if (gallery.main && gallery.main.allowClick === false) {
          event.preventDefault();
          return;
        }

        event.preventDefault();

        Fancybox.show(Array.prototype.map.call(links, function (item) {
          return {
            src: item.getAttribute("href"),
            type: "image"
          };
        }), {
          startIndex: index,
          Thumbs: {
            autoStart: false
          }
        });
      });
    });
  }

  function initFavorite(root) {
    var button = root.querySelector("[data-drop-favorite]");

    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      var isActive = button.classList.toggle("is-active");

      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute("aria-label", isActive ? "Прибрати з вподобань" : "Додати в вподобання");
    });
  }

  function initDownload(root) {
    var button = root.querySelector("[data-drop-download]");

    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      root.querySelectorAll(".drop-product__slider .swiper-slide img").forEach(function (img, index) {
        var link = document.createElement("a");

        link.href = img.getAttribute("src");
        link.download = "mizuno-" + (index + 1) + ".jpg";
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
    });
  }

  function initSizes(root) {
    var summary = root.querySelector("[data-drop-summary]");

    root.querySelectorAll("[data-drop-size]").forEach(function (button) {
      button.addEventListener("click", function () {
        var isActive = button.getAttribute("aria-pressed") === "true";

        if (isActive) {
          clearSize(button);
        } else {
          button.setAttribute("aria-pressed", "true");
          button.classList.add("is-active");
          button.setAttribute("data-qty", "1");
        }

        renderSummary(root, summary);
      });
    });

    renderSummary(root, summary);
  }

  function clearSize(button) {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
    button.removeAttribute("data-qty");
  }

  function renderSummary(root, summary) {
    var picks = summary.querySelector("[data-drop-picks]");
    var totalCount = summary.querySelector("[data-drop-total-count]");
    var totalPrice = summary.querySelector("[data-drop-total-price]");
    var groups = {};
    var count = 0;
    var html = "";

    root.querySelectorAll("[data-drop-size].is-active").forEach(function (button) {
      var key = button.getAttribute("data-warehouse");

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(button);
    });

    WAREHOUSE_ORDER.forEach(function (key) {
      var items = groups[key];
      var qty = 0;
      var lines = "";

      if (!items) {
        return;
      }

      items.forEach(function (button) {
        var itemQty = Number(button.getAttribute("data-qty") || 1);

        qty += itemQty;
        lines += "<p>" + button.getAttribute("data-label") + " — " + itemQty + " шт;</p>";
      });

      count += qty;
      html += '<article class="drop-product__pick"><p>Склад ' + WAREHOUSE_NAMES[key] + " — " + qty + ' шт</p><div class="drop-product__pick-list">' + lines + "</div></article>";
    });

    picks.innerHTML = html;
    summary.hidden = count === 0;
    totalCount.textContent = String(count);
    totalPrice.textContent = formatMoney(count * UNIT_PRICE);
  }

  function formatMoney(amount) {
    var parts = amount.toFixed(2).split(".");
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return whole + "," + parts[1] + " ₴";
  }

  function start() {
    if (document.querySelector("[data-partial]")) {
      document.addEventListener("partials:loaded", initProduct);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initProduct);
      return;
    }

    initProduct();
  }

  start();
})();
