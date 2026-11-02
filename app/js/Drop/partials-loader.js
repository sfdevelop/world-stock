(function () {
  var placeholders = document.querySelectorAll("[data-partial]");

  if (!placeholders.length) {
    document.dispatchEvent(new CustomEvent("partials:loaded"));
    return;
  }

  Promise.all(Array.from(placeholders).map(function (placeholder) {
    var name = placeholder.getAttribute("data-partial");

    if (!name) {
      return Promise.resolve();
    }

    return fetch("partials/" + name + ".html")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Partial not found: " + name);
        }

        return response.text();
      })
      .then(function (html) {
        placeholder.outerHTML = html.trim();
      });
  }))
    .catch(function () {})
    .finally(function () {
      document.dispatchEvent(new CustomEvent("partials:loaded"));
    });
})();
