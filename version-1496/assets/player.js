(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (panel) {
      var video = panel.querySelector("video");
      var trigger = panel.querySelector("[data-player-trigger]");
      var stream = video ? video.getAttribute("data-stream") : "";
      var prepared = false;
      var hls = null;

      function prepare() {
        if (!video || !stream || prepared) {
          return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function start() {
        prepare();
        panel.classList.add("is-playing");

        if (video) {
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(function () {});
          }
        }
      }

      if (trigger) {
        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }

      panel.addEventListener("click", function (event) {
        if (event.target.closest("button") || prepared) {
          return;
        }
        start();
      });

      if (video) {
        video.addEventListener("play", function () {
          panel.classList.add("is-playing");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
