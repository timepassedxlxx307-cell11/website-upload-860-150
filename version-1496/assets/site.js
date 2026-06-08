(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var search = scope.querySelector("[data-search]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function norm(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var query = norm(search && search.value);
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";

        cards.forEach(function (card) {
          var text = norm(card.getAttribute("data-search") || card.textContent);
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }

          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            matched = false;
          }

          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            matched = false;
          }

          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            matched = false;
          }

          card.classList.toggle("hidden", !matched);
        });
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (search) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && !search.value) {
          search.value = query;
        }
      }

      apply();
    });
  });
})();
