(function (window) {
  var ROOT_SELECTOR = "[data-drop-select]";
  var instances = [];

  function DropSelect(root) {
    this.root = root;
    this.native = root.querySelector("select");
    this.toggle = root.querySelector("[data-drop-select-toggle]");
    this.valueEl = root.querySelector("[data-drop-select-value]");
    this.menu = null;
    this.options = [];
    this.isOpen = false;

    if (!this.native || !this.toggle) {
      return;
    }

    this.buildMenu();
    this.sync();
    this.bind();
  }

  DropSelect.prototype.buildMenu = function () {
    var select = this;
    var label = this.root.querySelector(".drop-select__label");
    var listId = (this.native.id || "drop-select") + "-list";
    var menu = document.createElement("ul");

    menu.className = "drop-select__menu";
    menu.id = listId;
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    Array.prototype.forEach.call(this.native.options, function (option) {
      var item = document.createElement("li");

      item.setAttribute("role", "option");
      item.setAttribute("data-value", option.value);
      item.textContent = option.textContent.trim();
      menu.appendChild(item);
    });

    this.root.appendChild(menu);
    this.menu = menu;
    this.options = Array.prototype.slice.call(menu.children);

    this.toggle.setAttribute("type", "button");
    this.toggle.setAttribute("aria-haspopup", "listbox");
    this.toggle.setAttribute("aria-controls", listId);
    this.toggle.setAttribute("aria-expanded", "false");

    if (label) {
      this.toggle.setAttribute("aria-label", label.textContent.trim());
    }
  };

  DropSelect.prototype.sync = function () {
    var value = this.native.value;
    var selected = this.native.options[this.native.selectedIndex];

    if (this.valueEl && selected) {
      this.valueEl.textContent = selected.textContent.trim();
    }

    this.options.forEach(function (item) {
      var isActive = item.getAttribute("data-value") === value;

      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  };

  DropSelect.prototype.setOpen = function (isOpen) {
    if (!this.menu || this.isOpen === isOpen) {
      return;
    }

    if (isOpen) {
      closeAll(this);
    }

    this.isOpen = isOpen;
    this.root.classList.toggle("is-open", isOpen);
    this.menu.hidden = !isOpen;
    this.toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  DropSelect.prototype.setValue = function (value) {
    if (this.native.value === value) {
      this.setOpen(false);
      return;
    }

    this.native.value = value;
    this.sync();
    this.setOpen(false);
    this.native.dispatchEvent(new Event("change", { bubbles: true }));
  };

  DropSelect.prototype.bind = function () {
    var select = this;

    this.toggle.addEventListener("click", function (event) {
      event.preventDefault();
      select.setOpen(!select.isOpen);
    });

    this.menu.addEventListener("click", function (event) {
      var option = event.target.closest("[role='option']");

      if (!option || !select.menu.contains(option)) {
        return;
      }

      select.setValue(option.getAttribute("data-value"));
    });

    this.native.addEventListener("change", function () {
      select.sync();
    });

    this.toggle.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select.setOpen(true);
      }

      if (event.key === "Escape") {
        select.setOpen(false);
      }
    });
  };

  function closeAll(except) {
    instances.forEach(function (select) {
      if (select !== except) {
        select.setOpen(false);
      }
    });
  }

  function bindAll(scope) {
    (scope || document).querySelectorAll(ROOT_SELECTOR).forEach(function (root) {
      if (root.getAttribute("data-drop-select-ready") === "true") {
        return;
      }

      root.setAttribute("data-drop-select-ready", "true");
      instances.push(new DropSelect(root));
    });
  }

  document.addEventListener("click", function (event) {
    if (!event.target.closest(ROOT_SELECTOR)) {
      closeAll();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAll();
    }
  });

  window.DropSelect = {
    bindAll: bindAll,
    closeAll: closeAll
  };
})(window);
