(function () {
  var DESKTOP_QUERY = "(min-width: 1200px)";
  var PRICE_MIN = 0;
  var PRICE_MAX = 5000.5;

  function initCatalog() {
    var catalog = document.querySelector("[data-drop-catalog]");

    if (!catalog) {
      return;
    }

    initFilters(catalog);
    initToolbar(catalog);
    initTags(catalog);
    initSizes(catalog);
    initFavorites(catalog);
    initRange(catalog);
    initCards();
  }

  function initFilters(catalog) {
    var filters = catalog.querySelector("[data-drop-filter]");
    var openButton = catalog.querySelector("[data-drop-filter-open]");
    var backdrop = catalog.querySelector("[data-drop-filter-backdrop]");
    var desktop = window.matchMedia(DESKTOP_QUERY);

    if (!filters || !openButton) {
      return;
    }

    function setOpen(isOpen) {
      if (desktop.matches) {
        isOpen = false;
      }

      filters.classList.toggle("is-open", isOpen);
      openButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.documentElement.classList.toggle("drop-filters-open", isOpen);

      if (backdrop) {
        backdrop.hidden = !isOpen;
      }
    }

    openButton.addEventListener("click", function () {
      setOpen(!filters.classList.contains("is-open"));
    });

    catalog.querySelectorAll("[data-drop-filter-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        setOpen(false);
      });
    });

    catalog.querySelector("[data-drop-clear]").addEventListener("click", function () {
      catalog.querySelectorAll("[data-drop-option]").forEach(function (input) {
        input.checked = false;
      });

      catalog.querySelectorAll("[data-drop-tag]").forEach(function (tag) {
        tag.remove();
      });

      catalog.querySelectorAll("[data-drop-size]").forEach(function (size) {
        size.classList.remove("is-active");
        size.setAttribute("aria-pressed", "false");
      });

      catalog.dispatchEvent(new CustomEvent("drop:range-reset"));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    desktop.addEventListener("change", function () {
      setOpen(false);
    });
  }

  function initToolbar(catalog) {
    catalog.querySelectorAll("[data-drop-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        setActiveSort(catalog, button.getAttribute("data-drop-sort"), button.textContent.trim());
      });
    });

    catalog.querySelectorAll("[data-drop-dropdown]").forEach(function (dropdown) {
      var toggle = dropdown.querySelector("[data-drop-dropdown-toggle]");
      var menu = dropdown.querySelector("[data-drop-dropdown-menu]");

      if (!toggle || !menu) {
        return;
      }

      toggle.addEventListener("click", function () {
        var willOpen = !dropdown.classList.contains("is-open");

        closeDropdowns(catalog);

        if (willOpen) {
          DropAccordion.setOpen(dropdown, true);
        }
      });

      menu.querySelectorAll("button").forEach(function (option) {
        option.addEventListener("click", function () {
          menu.querySelectorAll("button").forEach(function (item) {
            item.classList.toggle("is-active", item === option);
          });

          if (option.hasAttribute("data-drop-sort")) {
            setActiveSort(catalog, option.getAttribute("data-drop-sort"), option.textContent.trim());
          }

          if (option.hasAttribute("data-drop-per-page")) {
            var value = dropdown.querySelector("[data-drop-per-page-value]");

            if (value) {
              value.textContent = option.getAttribute("data-drop-per-page");
            }
          }

          DropAccordion.setOpen(dropdown, false);
        });
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-drop-dropdown]")) {
        closeDropdowns(catalog);
      }
    });
  }

  function setActiveSort(catalog, value, label) {
    catalog.querySelectorAll("[data-drop-sort]").forEach(function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-drop-sort") === value);
    });
    setSortLabel(catalog, label);
  }

  function setSortLabel(catalog, label) {
    var current = catalog.querySelector("[data-drop-sort-label]");

    if (current) {
      current.textContent = label;
    }
  }

  function closeDropdowns(catalog) {
    catalog.querySelectorAll("[data-drop-dropdown]").forEach(function (dropdown) {
      DropAccordion.setOpen(dropdown, false);
    });
  }

  function initTags(catalog) {
    var list = catalog.querySelector("[data-drop-tags]");

    if (!list) {
      return;
    }

    list.addEventListener("click", function (event) {
      var tag = event.target.closest("[data-drop-tag]");

      if (!tag) {
        return;
      }

      removeOption(catalog, tag.getAttribute("data-drop-tag"));
      tag.remove();
    });

    catalog.querySelectorAll("[data-drop-option]").forEach(function (input) {
      input.addEventListener("change", function () {
        var name = input.getAttribute("data-drop-option");

        if (input.checked) {
          addTag(list, name);
        } else {
          removeTag(list, name);
        }
      });
    });
  }

  function addTag(list, name) {
    if (list.querySelector('[data-drop-tag="' + cssEscape(name) + '"]')) {
      return;
    }

    var button = document.createElement("button");
    var text = document.createElement("span");
    var icon = document.createElement("img");

    button.className = "drop-tag";
    button.type = "button";
    button.setAttribute("data-drop-tag", name);
    text.textContent = name;
    icon.src = "images/Drop/catalog/icon-cancel.svg";
    icon.alt = "";
    icon.width = 18;
    icon.height = 18;
    button.appendChild(text);
    button.appendChild(icon);
    list.appendChild(button);
  }

  function removeTag(list, name) {
    var tag = list.querySelector('[data-drop-tag="' + cssEscape(name) + '"]');

    if (tag) {
      tag.remove();
    }
  }

  function removeOption(catalog, name) {
    catalog.querySelectorAll("[data-drop-option]").forEach(function (input) {
      if (input.getAttribute("data-drop-option") === name) {
        input.checked = false;
      }
    });
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) {
      return CSS.escape(value);
    }

    return value.replace(/"/g, '\\"');
  }

  function initSizes(catalog) {
    catalog.querySelectorAll("[data-drop-size]").forEach(function (button) {
      button.addEventListener("click", function () {
        var isActive = button.classList.toggle("is-active");
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    });
  }

  function initFavorites(catalog) {
    catalog.addEventListener("click", function (event) {
      var button = event.target.closest("[data-drop-favorite]");

      if (!button) {
        return;
      }

      var isActive = button.classList.toggle("is-active");
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute("aria-label", isActive ? "Прибрати з вподобань" : "Додати в вподобання");
    });
  }

  function initRange(catalog) {
    var range = catalog.querySelector("[data-drop-range]");

    if (!range) {
      return;
    }

    var minInput = range.querySelector("[data-drop-range-min]");
    var maxInput = range.querySelector("[data-drop-range-max]");
    var fromField = range.querySelector("[data-drop-range-from]");
    var toField = range.querySelector("[data-drop-range-to]");
    var fill = range.querySelector("[data-drop-range-fill]");
    var apply = range.querySelector("[data-drop-range-apply]");

    function clamp(value) {
      return Math.min(PRICE_MAX, Math.max(PRICE_MIN, value));
    }

    function parseValue(value) {
      var number = parseFloat(String(value).replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(number) ? number : PRICE_MIN;
    }

    function formatValue(value) {
      var rounded = Math.round(value * 100) / 100;
      var parts = rounded.toFixed(2).split(".");

      if (parts[1] === "00") {
        return parts[0];
      }

      return parts[0] + "," + parts[1];
    }

    function paint() {
      var min = parseFloat(minInput.value);
      var max = parseFloat(maxInput.value);
      var start = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
      var end = ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

      fill.style.left = start + "%";
      fill.style.width = Math.max(0, end - start) + "%";
      minInput.style.zIndex = min > PRICE_MAX - 1 ? "2" : "1";
      maxInput.style.zIndex = "2";
    }

    function syncFields() {
      fromField.value = formatValue(parseFloat(minInput.value));
      toField.value = formatValue(parseFloat(maxInput.value));
      paint();
    }

    function applyFields() {
      var from = clamp(parseValue(fromField.value));
      var to = clamp(parseValue(toField.value));

      if (from > to) {
        var swap = from;
        from = to;
        to = swap;
      }

      minInput.value = from;
      maxInput.value = to;
      syncFields();
    }

    minInput.addEventListener("input", function () {
      if (parseFloat(minInput.value) > parseFloat(maxInput.value)) {
        minInput.value = maxInput.value;
      }

      syncFields();
    });

    maxInput.addEventListener("input", function () {
      if (parseFloat(maxInput.value) < parseFloat(minInput.value)) {
        maxInput.value = minInput.value;
      }

      syncFields();
    });

    apply.addEventListener("click", applyFields);
    fromField.addEventListener("change", applyFields);
    toField.addEventListener("change", applyFields);

    catalog.addEventListener("drop:range-reset", function () {
      minInput.value = PRICE_MIN;
      maxInput.value = 500.5;
      syncFields();
    });

    syncFields();
  }

  function initCards() {
    if (typeof Swiper !== "function") {
      return;
    }

    document.querySelectorAll("[data-drop-card]").forEach(function (card) {
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
      document.addEventListener("partials:loaded", initCatalog);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initCatalog);
      return;
    }

    initCatalog();
  }

  start();
})();
