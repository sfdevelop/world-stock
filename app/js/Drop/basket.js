(function () {
  function closestField(node) {
    return node ? node.closest(".drop-basket__field") : null;
  }

  function setFieldValid(field, isValid) {
    if (!field) {
      return;
    }

    field.classList.toggle("drop-basket__field--valid", isValid);

    if (isValid) {
      field.classList.remove("drop-basket__field--error");
    }
  }

  function syncTtnNumber(input) {
    if (!input || !input.matches('input[type="text"][name^="ttn-"]')) {
      return;
    }

    setFieldValid(closestField(input), Boolean(input.value.trim()));
  }

  function syncTtnFile(input) {
    var upload = input.closest(".drop-basket__upload");
    var file = upload ? upload.querySelector(".drop-basket__file") : null;
    var label = file ? file.querySelector("p") : null;
    var selected = input.files && input.files[0];

    if (!file || !label) {
      return;
    }

    file.classList.toggle("is-filled", Boolean(selected));
    label.textContent = selected ? selected.name : "Додати ТТН";
    setFieldValid(closestField(input), Boolean(selected));
  }

  function warehouseKey(order) {
    var input = order.querySelector('input[type="text"][name^="ttn-"]');

    if (!input) {
      return "";
    }

    return input.name.replace(/^ttn-/, "");
  }

  function hasTtnNumber(order) {
    var input = order.querySelector('input[type="text"][name^="ttn-"]');

    return Boolean(input && input.value.trim());
  }

  function hasTtnFile(order) {
    var input = order.querySelector("[data-drop-basket-file]");
    var field = closestField(input);
    var file = field ? field.querySelector(".drop-basket__file") : null;

    if (!input) {
      return false;
    }

    return Boolean(
      (input.files && input.files.length) ||
      (field && field.classList.contains("drop-basket__field--valid")) ||
      (file && file.classList.contains("is-filled"))
    );
  }

  function isLaterChecked(order) {
    var input = order.querySelector('input[type="checkbox"][name^="ttn-later-"]');

    return Boolean(input && input.checked);
  }

  function isOrderReady(order) {
    return isLaterChecked(order) || (hasTtnNumber(order) && hasTtnFile(order));
  }

  function syncWarehouseStatus(root, order) {
    var key = order ? warehouseKey(order) : "";
    var warehouse = key ? root.querySelector('[data-drop-basket-warehouse="' + key + '"]') : null;
    var status = warehouse ? warehouse.querySelector(".drop-basket__status") : null;
    var label = status ? status.querySelector("p") : null;
    var ready;

    if (!status || !label) {
      return;
    }

    ready = isOrderReady(order);
    status.classList.toggle("drop-basket__status--ok", ready);
    status.classList.toggle("drop-basket__status--error", !ready);
    label.textContent = ready ? "Готове до оформлення" : "Відсутнє ТТН або відмітка";
  }

  function syncWarehouseStatuses(root) {
    var orders = root.querySelectorAll("[data-drop-basket-order]");
    var index;

    for (index = 0; index < orders.length; index += 1) {
      syncWarehouseStatus(root, orders[index]);
    }
  }

  function isPdfFile(file) {
    var type = file && file.type ? file.type.toLowerCase() : "";
    var name = file && file.name ? file.name : "";

    return type === "application/pdf" || /\.pdf$/i.test(name);
  }

  function fileExtension(name) {
    var parts = (name || "").split(".");

    if (parts.length < 2) {
      return "";
    }

    return parts.pop().toUpperCase();
  }

  function orderHeading(order) {
    var heading = order ? order.querySelector("h3") : null;

    return heading ? heading.textContent.replace(/\s+/g, " ").trim() : "ТТН";
  }

  function initModals(root) {
    var reject = document.querySelector('[data-drop-modal="reject"]');
    var success = document.querySelector('[data-drop-modal="success"]');
    var lastFocus = null;
    var lastFileInput = null;

    function openModal(modal) {
      var nodes = document.querySelectorAll("[data-drop-modal]");
      var index;
      var node;
      var closeButton;
      var anyOpen = false;

      if (!modal) {
        return;
      }

      lastFocus = document.activeElement;

      for (index = 0; index < nodes.length; index += 1) {
        node = nodes[index];
        node.classList.toggle("is-open", node === modal);
        node.inert = node !== modal;
        node.setAttribute("aria-hidden", node === modal ? "false" : "true");

        if (node === modal) {
          anyOpen = true;
        }
      }

      document.documentElement.classList.toggle("drop-modal-open", anyOpen);
      closeButton = modal.querySelector("[data-drop-modal-close]");

      if (closeButton) {
        closeButton.focus();
      }
    }

    function closeModals() {
      var nodes = document.querySelectorAll("[data-drop-modal]");
      var index;
      var node;

      for (index = 0; index < nodes.length; index += 1) {
        node = nodes[index];
        node.classList.remove("is-open");
        node.inert = true;
        node.setAttribute("aria-hidden", "true");
      }

      document.documentElement.classList.remove("drop-modal-open");

      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function openRejectModal(input, file) {
      var order = input.closest("[data-drop-basket-order]");
      var title = reject ? reject.querySelector("#drop-modal-reject-title") : null;
      var name = reject ? reject.querySelector(".drop-modal__name p") : null;
      var copy = reject ? reject.querySelector(".drop-modal__copy p") : null;
      var extension = fileExtension(file.name);

      lastFileInput = input;

      if (title) {
        title.textContent = orderHeading(order);
      }

      if (name) {
        name.textContent = file.name;
      }

      if (copy) {
        copy.textContent =
          "Файл " +
          (extension || "невідомого формату") +
          " відхилено. Оберіть ТТН у форматі PDF або позначте, що додасте її пізніше.";
      }

      openModal(reject);
    }

    function handleFileChange(input) {
      var file = input.files && input.files[0];

      if (file && !isPdfFile(file)) {
        openRejectModal(input, file);
        input.value = "";
      }

      syncTtnFile(input);
    }

    if (reject) {
      reject.addEventListener("click", function (event) {
        if (event.target.closest("[data-drop-modal-retry]")) {
          closeModals();

          if (lastFileInput) {
            lastFileInput.click();
          }

          return;
        }

        if (event.target === reject || event.target.closest("[data-drop-modal-close]")) {
          closeModals();
        }
      });
    }

    if (success) {
      success.addEventListener("click", function (event) {
        if (event.target === success || event.target.closest("[data-drop-modal-close]")) {
          event.preventDefault();
          closeModals();
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.querySelector("[data-drop-modal].is-open")) {
        closeModals();
      }
    });

    root.addEventListener("click", function (event) {
      if (event.target.closest("[data-drop-basket-submit]")) {
        openModal(success);
      }
    });

    return handleFileChange;
  }

  function initBasket() {
    var root = document.querySelector("[data-drop-basket]");
    var handleFileChange;

    if (!root) {
      return;
    }

    handleFileChange = initModals(root);

    root.addEventListener("click", function (event) {
      var product = event.target.closest("[data-drop-basket-product]");
      var order = event.target.closest("[data-drop-basket-order]");

      if (!event.target.closest("[data-drop-basket-delete]") || !product) {
        return;
      }

      product.remove();

      if (order && !order.querySelector("[data-drop-basket-product]")) {
        order.remove();
      }
    });

    root.addEventListener("input", function (event) {
      syncTtnNumber(event.target);
      syncWarehouseStatus(root, event.target.closest("[data-drop-basket-order]"));
    });

    root.addEventListener("change", function (event) {
      var input = event.target.closest("[data-drop-basket-file]");

      if (input) {
        handleFileChange(input);
      }

      syncWarehouseStatus(root, event.target.closest("[data-drop-basket-order]"));
    });

    syncWarehouseStatuses(root);
  }

  function start() {
    if (document.querySelector("[data-partial]")) {
      document.addEventListener("partials:loaded", initBasket);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initBasket);
      return;
    }

    initBasket();
  }

  start();
})();
