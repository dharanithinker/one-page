(function (window, document) {
  "use strict";

  const BASE_URL = "https://maayaistorage.blob.core.windows.net/web-images/ai_maayai_webpage/";

  function url(path) {
    return new URL(String(path).replace(/^\.\//, ""), BASE_URL).href;
  }

  function apply(root) {
    const scope = root || document;

    scope.querySelectorAll("[data-media-src]").forEach((element) => {
      element.src = url(element.dataset.mediaSrc);
    });

    scope.querySelectorAll("[data-media-poster]").forEach((element) => {
      element.poster = url(element.dataset.mediaPoster);
    });

    scope.querySelectorAll("[data-media-background]").forEach((element) => {
      element.style.backgroundImage = `url("${url(element.dataset.mediaBackground)}")`;
    });
  }

  window.MaayaiMedia = Object.freeze({ BASE_URL, url, apply });
  document.addEventListener("DOMContentLoaded", () => apply(document), { once: true });
})(window, document);
