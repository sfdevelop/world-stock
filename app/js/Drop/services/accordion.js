(function (window) {
  var DURATION_MS = 1000;
  var EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
  var TRANSITION = "height " + DURATION_MS + "ms " + EASE;
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TOGGLE_SELECTOR = [
    "[data-drop-accordion-toggle]",
    "[data-drop-pref-toggle]",
    "[data-drop-terms-toggle]",
    "[data-drop-menu-toggle]",
    "[data-drop-dropdown-toggle]",
    "[data-order-toggle]",
    "[data-alert-toggle]"
  ].join(", ");
  var PANEL_SELECTOR = [
    "[data-drop-accordion-panel]",
    "[data-drop-pref-panel]",
    "[data-drop-terms-panel]",
    "[data-drop-menu-sub]",
    "[data-drop-dropdown-menu]",
    ".drop-order__body",
    ".drop-order__alert-body"
  ].join(", ");

  function prefersReducedMotion() {
    return reduceMotionQuery.matches;
  }

  function applyCssVars() {
    document.documentElement.style.setProperty("--drop-accordion-duration", DURATION_MS + "ms");
    document.documentElement.style.setProperty("--drop-accordion-ease", EASE);
  }

  function getToggle(root) {
    return root ? root.querySelector(TOGGLE_SELECTOR) : null;
  }

  function getPanel(root) {
    return root ? root.querySelector(PANEL_SELECTOR) : null;
  }

  function emitDone(el, isOpen) {
    if (!el || typeof el.dispatchEvent !== "function") {
      return;
    }

    el.dispatchEvent(new CustomEvent("drop-accordion:done", {
      bubbles: true,
      detail: { isOpen: isOpen }
    }));
  }

  function syncToggle(root, isOpen) {
    var toggle = getToggle(root);
    var openLabel;
    var closeLabel;
    var label;

    if (!toggle) {
      return;
    }

    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    openLabel = toggle.getAttribute("data-accordion-label-open");
    closeLabel = toggle.getAttribute("data-accordion-label-close");

    if (openLabel && closeLabel) {
      toggle.setAttribute("aria-label", isOpen ? openLabel : closeLabel);
    }

    label = toggle.querySelector("[data-accordion-label]");

    if (label) {
      label.textContent = isOpen ? (openLabel || "Згорнути") : (closeLabel || "Розгорнути");
    }
  }

  function finish(el, isOpen, onEnd) {
    if (isOpen) {
      el.style.height = "auto";
    }

    if (onEnd) {
      onEnd();
    }

    emitDone(el, isOpen);
  }

  function prepareHeight(el) {
    if (!el || prefersReducedMotion()) {
      return;
    }

    el.style.height = el.getBoundingClientRect().height + "px";
    el.offsetHeight;
  }

  function animateHeight(el, isOpen, onEnd) {
    var token = {};
    var locked;
    var target;
    var from;
    var settled;

    if (!el) {
      if (onEnd) {
        onEnd();
      }

      return;
    }

    el._animToken = token;

    function settle() {
      if (el._animToken !== token || settled) {
        return;
      }

      settled = true;
      finish(el, isOpen, onEnd);
    }

    if (prefersReducedMotion()) {
      el.style.transition = "none";
      el.style.height = isOpen ? "auto" : "0px";
      settle();
      return;
    }

    from = el.getBoundingClientRect().height;
    el.style.transition = "none";

    if (isOpen) {
      locked = el.style.height;
      el.style.height = "auto";
      target = el.scrollHeight;
      el.style.height = locked || "0px";
    } else {
      target = 0;
    }

    el.offsetHeight;
    el.style.transition = TRANSITION;
    el.offsetHeight;
    el.style.height = target + "px";

    if (Math.abs(from - target) < 0.5) {
      settle();
      return;
    }

    el.addEventListener("transitionend", function onTransitionEnd(event) {
      if (event.target !== el || event.propertyName !== "height" || el._animToken !== token) {
        return;
      }

      el.removeEventListener("transitionend", onTransitionEnd);
      settle();
    });

    window.setTimeout(settle, DURATION_MS + 80);
  }

  function setOpen(root, panel, isOpen, onEnd) {
    var groupName;

    if (!root) {
      if (onEnd) {
        onEnd();
      }

      return;
    }

    if (typeof panel === "boolean") {
      onEnd = isOpen;
      isOpen = panel;
      panel = null;
    }

    panel = panel || getPanel(root);

    if (!panel) {
      if (onEnd) {
        onEnd();
      }

      return;
    }

    if (root.classList.contains("is-open") === isOpen) {
      if (onEnd) {
        onEnd();
      }

      return;
    }

    if (isOpen) {
      groupName = root.getAttribute("data-drop-accordion-group");

      if (groupName) {
        document.querySelectorAll('[data-drop-accordion-group="' + groupName + '"]').forEach(function (other) {
          if (other !== root) {
            setOpen(other, getPanel(other), false);
          }
        });
      }
    }

    syncToggle(root, isOpen);
    prepareHeight(panel);
    root.classList.toggle("is-open", isOpen);
    animateHeight(panel, isOpen, onEnd);
  }

  function bindAll(scope) {
    applyCssVars();

    (scope || document).querySelectorAll("[data-drop-accordion]").forEach(function (root) {
      var toggle;
      var panel;

      if (root.getAttribute("data-drop-accordion-ready") === "true") {
        return;
      }

      toggle = getToggle(root);
      panel = getPanel(root);

      if (!toggle || !panel) {
        return;
      }

      root.setAttribute("data-drop-accordion-ready", "true");
      panel.hidden = false;
      panel.style.transition = TRANSITION;
      syncToggle(root, root.classList.contains("is-open"));
      panel.style.height = root.classList.contains("is-open") ? "auto" : "";

      toggle.addEventListener("click", function () {
        setOpen(root, panel, !root.classList.contains("is-open"));
      });
    });
  }

  applyCssVars();

  window.DropAccordion = {
    duration: DURATION_MS,
    ease: EASE,
    prefersReducedMotion: prefersReducedMotion,
    prepareHeight: prepareHeight,
    animateHeight: animateHeight,
    setOpen: setOpen,
    bindAll: bindAll,
    getToggle: getToggle,
    getPanel: getPanel
  };
})(window);
