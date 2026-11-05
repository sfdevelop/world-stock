(function () {
  var root = document.querySelector(".drop-orders");

  if (!root) {
    return;
  }

  var orders = Array.prototype.slice.call(root.querySelectorAll(".drop-order"));
  var exportModal = document.querySelector('[data-drop-modal="export"]');
  var searchModal = document.querySelector('[data-drop-modal="search"]');
  var returnModal = document.querySelector('[data-drop-modal="return"]');
  var exportForm = exportModal ? exportModal.querySelector(".drop-export") : null;
  var searchForm = searchModal ? searchModal.querySelector(".drop-search") : null;
  var searchInput = searchForm ? searchForm.querySelector('input[type="search"]') : null;
  var returnValue = returnModal ? returnModal.querySelector(".drop-return__value p") : null;
  var pageModals = [exportModal, searchModal, returnModal];
  var lastFocus = null;
  var activeTab = "all";
  var searchQuery = "";
  var lastSearchValue = "";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isPdfFile(file) {
    var type = file && file.type ? file.type.toLowerCase() : "";
    var name = file && file.name ? file.name : "";

    return type === "application/pdf" || /\.pdf$/i.test(name);
  }

  function applyOrderFile(input) {
    var wrap = input.closest(".drop-order__file") || input.closest(".drop-order__chooser");
    var file = input.files && input.files[0];
    var nameEl = wrap ? wrap.querySelector(":scope > p") : null;
    var addLabel = wrap && wrap.classList.contains("drop-order__chooser")
      ? wrap.querySelector("[data-order-file-pick] p")
      : null;

    if (file && !isPdfFile(file)) {
      input.value = "";
      return;
    }

    if (nameEl && file) {
      nameEl.textContent = file.name;
    }

    if (addLabel && file) {
      addLabel.textContent = file.name;
    }
  }

  function animateHeight(el, isOpen) {
    var token = {};

    el._animToken = token;

    if (reduceMotion) {
      el.style.height = isOpen ? "auto" : "0px";
      return;
    }

    if (isOpen) {
      var locked = el.style.height;

      el.style.height = "auto";
      var target = el.scrollHeight;
      el.style.height = locked || "0px";
      el.offsetHeight;
      el.style.height = target + "px";
    } else {
      el.style.height = "0px";
    }

    el.addEventListener("transitionend", function onEnd(event) {
      if (event.target !== el || event.propertyName !== "height" || el._animToken !== token) {
        return;
      }

      el.removeEventListener("transitionend", onEnd);

      if (isOpen) {
        el.style.height = "auto";
      }
    });
  }

  function formatExportDate(value) {
    var parts = value ? value.split("-") : [];

    if (parts.length !== 3) {
      return "дд.мм.рррр";
    }

    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  function syncExportField(input) {
    var control = input ? input.closest(".drop-export__control") : null;
    var label = control ? control.querySelector(".drop-export__placeholder p") : null;

    if (control) {
      control.classList.toggle("is-filled", Boolean(input.value));
    }

    if (label) {
      label.textContent = formatExportDate(input.value);
    }
  }

  function resetExportForm() {
    if (!exportForm) {
      return;
    }

    exportForm.reset();
    Array.prototype.forEach.call(exportForm.querySelectorAll('input[type="date"]'), syncExportField);
  }

  function setModalOpen(modal, isOpen) {
    if (!modal) {
      return;
    }

    modal.classList.toggle("is-open", isOpen);
    modal.inert = !isOpen;
    modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }

  function openModal(modal) {
    var focusEl;

    if (!modal) {
      return;
    }

    lastFocus = document.activeElement;
    pageModals.forEach(function (node) {
      setModalOpen(node, node === modal);
    });
    document.documentElement.classList.add("drop-modal-open");
    focusEl = modal.querySelector("[data-drop-modal-focus]") || modal.querySelector("[data-drop-modal-close]");

    if (focusEl && typeof focusEl.focus === "function") {
      focusEl.focus();
    }

    if (focusEl === searchInput && typeof searchInput.select === "function" && searchInput.value) {
      searchInput.select();
    }
  }

  function restoreSearchInput() {
    if (searchInput) {
      searchInput.value = lastSearchValue;
    }
  }

  function closeModals() {
    var exportWasOpen = exportModal && exportModal.classList.contains("is-open");
    var searchWasOpen = searchModal && searchModal.classList.contains("is-open");

    pageModals.forEach(function (node) {
      setModalOpen(node, false);
    });
    document.documentElement.classList.remove("drop-modal-open");

    if (exportWasOpen) {
      resetExportForm();
    }

    if (searchWasOpen) {
      restoreSearchInput();
    }

    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function orderMatchesSearch(order) {
    var haystack;

    if (!searchQuery) {
      return true;
    }

    haystack = order.textContent.replace(/\s+/g, " ").trim().toLowerCase();

    return haystack.indexOf(searchQuery) !== -1;
  }

  function applyFilters() {
    orders.forEach(function (item) {
      var tabOk = activeTab === "all" || item.getAttribute("data-status") === activeTab;

      item.hidden = !(tabOk && orderMatchesSearch(item));
    });
  }

  function setSearchQuery(value) {
    searchQuery = value ? value.replace(/\s+/g, " ").trim().toLowerCase() : "";
    applyFilters();
  }

  function openExportModal() {
    openModal(exportModal);
  }

  function openSearchModal() {
    openModal(searchModal);
  }

  function openReturnModal(trigger) {
    var row = trigger ? trigger.closest(".drop-order__return-row") : null;
    var input = row ? row.querySelector("input") : null;
    var value = input && input.value.trim() ? input.value.trim() : "—";

    if (returnValue) {
      returnValue.textContent = value;
    }

    openModal(returnModal);
  }

  function openDatePicker(input) {
    if (!input || typeof input.showPicker !== "function") {
      return;
    }

    try {
      input.showPicker();
    } catch (error) {
      input.focus();
    }
  }

  function setOpen(order, isOpen) {
    var toggle = order.querySelector("[data-order-toggle]");
    var body = order.querySelector(".drop-order__body");

    if (body && !reduceMotion) {
      body.style.height = body.getBoundingClientRect().height + "px";
      body.offsetHeight;
    }

    order.classList.toggle("is-open", isOpen);

    if (body) {
      animateHeight(body, isOpen);
    }

    if (!toggle) {
      return;
    }

    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? "Згорнути замовлення" : "Розгорнути замовлення");
  }

  root.addEventListener("click", function (event) {
    var toggle = event.target.closest("[data-order-toggle]");
    var tab = event.target.closest("[data-order-tab]");
    var copy = event.target.closest("[data-copy]");
    var alertToggle = event.target.closest("[data-alert-toggle]");
    var filePick = event.target.closest("[data-order-file-pick]");
    var exportTrigger = event.target.closest("[data-orders-export]");
    var searchTrigger = event.target.closest("[data-orders-search]");
    var returnTrigger = event.target.closest("[data-orders-return-save]");

    if (exportTrigger && root.contains(exportTrigger)) {
      openExportModal();
      return;
    }

    if (searchTrigger && root.contains(searchTrigger)) {
      openSearchModal();
      return;
    }

    if (returnTrigger && root.contains(returnTrigger)) {
      openReturnModal(returnTrigger);
      return;
    }

    if (toggle && root.contains(toggle)) {
      var order = toggle.closest(".drop-order");
      setOpen(order, !order.classList.contains("is-open"));
      return;
    }

    if (tab && root.contains(tab)) {
      var filter = tab.getAttribute("data-order-tab");

      root.querySelectorAll("[data-order-tab]").forEach(function (item) {
        var isCurrent = item === tab;
        item.classList.toggle("is-active", isCurrent);
        item.setAttribute("aria-selected", isCurrent ? "true" : "false");
      });

      activeTab = filter;
      applyFilters();
      return;
    }

    if (copy && root.contains(copy)) {
      var value = copy.getAttribute("data-copy");

      if (navigator.clipboard && value) {
        navigator.clipboard.writeText(value);
      }
      return;
    }

    if (filePick && root.contains(filePick)) {
      var wrap = filePick.closest(".drop-order__file") || filePick.closest(".drop-order__chooser");
      var picker = wrap ? wrap.querySelector("[data-order-file]") : null;

      if (picker) {
        picker.click();
      }

      return;
    }

    if (alertToggle && root.contains(alertToggle)) {
      var alert = alertToggle.closest(".drop-order__alert");
      var body = alert.querySelector(".drop-order__alert-body");
      var isOpen = alert.classList.contains("is-collapsed");
      var label = alertToggle.querySelector("p");

      if (body && !reduceMotion) {
        body.style.height = body.getBoundingClientRect().height + "px";
        body.offsetHeight;
      }

      alert.classList.toggle("is-collapsed", !isOpen);
      alertToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (label) {
        label.textContent = isOpen ? "Згорнути" : "Розгорнути";
      }

      if (body) {
        animateHeight(body, isOpen);
      }
    }
  });

  root.addEventListener("change", function (event) {
    var input = event.target.closest("[data-order-file]");

    if (input && root.contains(input)) {
      applyOrderFile(input);
    }
  });

  if (exportModal) {
    exportModal.addEventListener("click", function (event) {
      var control = event.target.closest(".drop-export__control");
      var dateInput;

      if (event.target === exportModal || event.target.closest("[data-drop-modal-close]")) {
        event.preventDefault();
        closeModals();
        return;
      }

      if (control && exportModal.contains(control)) {
        dateInput = control.querySelector('input[type="date"]');
        openDatePicker(dateInput);
      }
    });

    exportModal.addEventListener("change", function (event) {
      if (event.target.matches('input[type="date"]')) {
        syncExportField(event.target);
      }
    });
  }

  if (exportForm) {
    exportForm.addEventListener("submit", function (event) {
      event.preventDefault();
      closeModals();
    });
  }

  if (searchModal) {
    searchModal.addEventListener("click", function (event) {
      if (event.target === searchModal) {
        closeModals();
      }
    });
  }

  if (returnModal) {
    returnModal.addEventListener("click", function (event) {
      if (event.target === returnModal || event.target.closest("[data-drop-modal-close]")) {
        event.preventDefault();
        closeModals();
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      lastSearchValue = searchInput ? searchInput.value : "";
      setSearchQuery(lastSearchValue);
      closeModals();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.querySelector("[data-drop-modal].is-open")) {
      closeModals();
    }
  });
})();
