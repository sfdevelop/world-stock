(function () {
  var DESKTOP_QUERY = "(min-width: 1200px)";
  var REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  var QTY_MAX = 99;

  function prefersReducedMotion() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  }

  function formatMoney(amount) {
    var parts = amount.toFixed(2).split(".");
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return whole + "," + parts[1] + " ₴";
  }

  function initCart() {
    var root = document.querySelector("[data-drop-cart]");
    var opener = document.querySelector("[data-drop-cart-open]");

    if (!root || !opener) {
      return;
    }

    var panel = root.querySelector("[data-drop-cart-panel]");

    if (!panel) {
      return;
    }
    var closeButton = root.querySelector("[data-drop-cart-close]");
    var articles = root.querySelector("[data-drop-cart-articles]");
    var pieces = root.querySelector("[data-drop-cart-pieces]");
    var total = root.querySelector("[data-drop-cart-total]");
    var desktop = window.matchMedia(DESKTOP_QUERY);
    var dirty = false;
    var lastFocus = null;

    function hasProducts() {
      return Boolean(root.querySelector(".drop-cart__product"));
    }

    function finishClose() {
      if (root.classList.contains("is-open")) {
        return;
      }

      root.inert = true;
      root.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("drop-cart-open");
    }

    function setOpen(isOpen) {
      if (isOpen && !hasProducts()) {
        return;
      }

      root.classList.toggle("is-open", isOpen);
      opener.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (isOpen) {
        lastFocus = document.activeElement;
        root.inert = false;
        root.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("drop-cart-open");

        if (closeButton) {
          closeButton.focus();
        }
      } else if (prefersReducedMotion()) {
        finishClose();
      }

      if (!isOpen && lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function isPriceVisible(price) {
      var mobileOnly = price.classList.contains("drop-cart__price--mobile");
      var desktopOnly = price.classList.contains("drop-cart__price--desktop");

      if (mobileOnly && desktop.matches) {
        return false;
      }

      if (desktopOnly && !desktop.matches) {
        return false;
      }

      return true;
    }

    function renderSummary() {
      var qty = 0;
      var sum = 0;

      root.querySelectorAll("[data-drop-cart-line]").forEach(function (line) {
        qty += Number(line.getAttribute("data-qty") || 0);
      });

      root.querySelectorAll("[data-drop-cart-price]").forEach(function (price) {
        var line = price.closest("[data-drop-cart-line]");

        if (!line || !isPriceVisible(price)) {
          return;
        }

        sum += Number(price.getAttribute("data-unit") || 0) * Number(line.getAttribute("data-qty") || 0);
      });

      if (articles) {
        articles.textContent = "Замовленно артикулів: " + root.querySelectorAll(".drop-cart__group").length;
      }

      if (pieces) {
        pieces.textContent = "Закальна кількість: " + qty;
      }

      if (total) {
        total.textContent = "загальна сума:  " + formatMoney(sum);
      }
    }

    function updateLine(line) {
      var qty = Number(line.getAttribute("data-qty") || 1);
      var value = line.querySelector(".drop-cart__stepper span");

      if (value) {
        value.textContent = String(qty);
      }

      line.querySelectorAll("[data-drop-cart-price]").forEach(function (price) {
        var amount = Number(price.getAttribute("data-unit") || 0) * qty;
        var label = price.querySelector("p");

        if (label) {
          label.textContent = formatMoney(amount);
        }
      });
    }

    function setQty(line, nextQty) {
      var qty = Math.min(QTY_MAX, Math.max(1, nextQty));

      line.setAttribute("data-qty", String(qty));
      updateLine(line);
      dirty = true;
      renderSummary();
    }

    function cleanupDividers(container) {
      if (!container) {
        return;
      }

      Array.prototype.slice.call(container.querySelectorAll(".drop-cart__divider")).forEach(function (divider) {
        var previous = divider.previousElementSibling;
        var next = divider.nextElementSibling;
        var betweenProducts = previous && next && previous.classList.contains("drop-cart__product") && next.classList.contains("drop-cart__product");
        var trailingLine = !next && previous && previous.classList.contains("drop-cart__product") && divider.classList.contains("drop-cart__divider--tail");

        if (!betweenProducts && !trailingLine) {
          divider.remove();
        }
      });
    }

    function removeEmpty(node) {
      var products = node.closest(".drop-cart__products");
      var group = node.closest(".drop-cart__group");
      var product = node.classList.contains("drop-cart__product") ? node : node.closest(".drop-cart__product");

      node.remove();

      if (product && product !== node && product.isConnected && !product.querySelector("[data-drop-cart-line]")) {
        removeEmpty(product);
        return;
      }

      cleanupDividers(products);

      if (products && !products.querySelector(".drop-cart__product") && group) {
        group.remove();
      }

      dirty = true;
      renderSummary();

      if (!hasProducts()) {
        setOpen(false);
      }
    }

    opener.addEventListener("click", function (event) {
      event.preventDefault();

      if (!hasProducts()) {
        return;
      }

      setOpen(!root.classList.contains("is-open"));
    });

    root.addEventListener("click", function (event) {
      if (event.target === root) {
        setOpen(false);
      }
    });

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        setOpen(false);
      });
    }

    panel.addEventListener("click", function (event) {
      var line = event.target.closest("[data-drop-cart-line]");
      var product = event.target.closest(".drop-cart__product");

      if (event.target.closest("[data-drop-cart-dec]") && line) {
        setQty(line, Number(line.getAttribute("data-qty") || 1) - 1);
        return;
      }

      if (event.target.closest("[data-drop-cart-inc]") && line) {
        setQty(line, Number(line.getAttribute("data-qty") || 1) + 1);
        return;
      }

      if (event.target.closest("[data-drop-cart-cancel]") && line) {
        removeEmpty(line);
        return;
      }

      if (event.target.closest("[data-drop-cart-delete]") && product) {
        removeEmpty(product);
      }
    });

    var checkout = root.querySelector("[data-drop-cart-checkout]");

    if (checkout) {
      checkout.addEventListener("click", function (event) {
        event.preventDefault();
      });
    }

    panel.addEventListener("transitionend", function (event) {
      if (event.target !== panel || event.propertyName !== "transform") {
        return;
      }

      finishClose();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && root.classList.contains("is-open")) {
        setOpen(false);
      }
    });

    desktop.addEventListener("change", function () {
      if (dirty) {
        renderSummary();
      }
    });
  }

  function start() {
    if (document.querySelector("[data-partial]")) {
      document.addEventListener("partials:loaded", initCart);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initCart);
      return;
    }

    initCart();
  }

  start();
})();
