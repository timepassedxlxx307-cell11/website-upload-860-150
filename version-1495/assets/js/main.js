(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  qsa('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var url = './search.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  });

  qsa('[data-hero-slider]').forEach(function (slider) {
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot') || 0);
        show(nextIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function applyFilters(root) {
    var input = qs('[data-filter-input]', root);
    var select = qs('[data-filter-select="type"]', root);
    var cards = qsa('[data-movie-card]', root);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filter() {
      var keyword = normalize(input ? input.value : '');
      var typeValue = normalize(select ? select.value : '');

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
        card.classList.toggle('hidden-card', !(matchedKeyword && matchedType));
      });
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    if (select) {
      select.addEventListener('change', filter);
    }
    if (input || select) {
      filter();
    }
  }

  qsa('[data-filter-grid]').forEach(function (grid) {
    applyFilters(grid.closest('main') || document);
  });
})();
