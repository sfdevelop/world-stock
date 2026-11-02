(function () {
  function initDropPage() {
    var upButton = document.querySelector("[data-drop-up]");
    var cookie = document.querySelector("[data-drop-cookie]");
    var accept = document.querySelector("[data-drop-cookie-accept]");

    if (upButton) {
      upButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (cookie && accept) {
      accept.addEventListener("click", function () {
        cookie.hidden = true;
      });
    }
  }

  if (document.querySelector("[data-partial]")) {
    document.addEventListener("partials:loaded", initDropPage);
    return;
  }

  initDropPage();
})();
