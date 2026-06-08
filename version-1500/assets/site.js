(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.getElementById('siteNav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var panel = scope.previousElementSibling;
    while (panel && !panel.classList.contains('filter-panel')) {
      panel = panel.previousElementSibling;
    }
    if (!panel) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var select = panel.querySelector('[data-category-select]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    var applyFilter = function () {
      var query = normalize(input ? input.value : '');
      var category = select ? select.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardCategory = card.getAttribute('data-category') || '';
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedCategory = !category || cardCategory === category;
        card.classList.toggle('is-hidden', !(matchedQuery && matchedCategory));
      });
    };

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });
})();

function initializePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var status = document.getElementById('playerStatus');
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  var setStatus = function (message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  var attachSource = function () {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放加载失败，请稍后重试。');
        }
      });
      return;
    }

    video.src = source;
  };

  var startPlayback = function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };

  attachSource();

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
