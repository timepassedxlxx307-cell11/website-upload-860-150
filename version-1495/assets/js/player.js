(function () {
  window.bindPlayer = function (source) {
    var area = document.querySelector('[data-player]');
    if (!area) {
      return;
    }

    var video = area.querySelector('video');
    var button = area.querySelector('[data-start]');
    var hls = null;
    var started = false;

    function start() {
      if (!video || !source) {
        return;
      }

      area.classList.add('is-playing');
      video.setAttribute('controls', 'controls');

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = source;
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    area.addEventListener('click', function (event) {
      if (event.target === area) {
        start();
      }
    });

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
  };
})();
