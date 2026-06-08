
(function () {
  "use strict";

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", root);
    var dots = selectAll("[data-hero-dot]", root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    if (slides.length > 1) {
      start();
    }
  }

  function initSearchForms() {
    selectAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";

        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function createResultCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="movie-cover" href="' + movie.url + '">',
      '  <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '  <span class="play-mark" aria-hidden="true">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p>' + escapeHtml(movie.oneLine || movie.genre || "") + '</p>',
      '  <div class="tag-row">',
      '    <span>' + escapeHtml(movie.region) + '</span>',
      '    <span>' + escapeHtml(movie.year) + '</span>',
      '    <span>' + escapeHtml(movie.genre) + '</span>',
      '  </div>',
      '</div>'
    ].join("");
    return article;
  }

  function initSearchPage() {
    var container = document.getElementById("search-results");

    if (!container) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var input = document.querySelector(".search-panel input[name='q']");

    if (input) {
      input.value = params.get("q") || "";
    }

    if (!query) {
      container.innerHTML = '<div class="search-empty">请输入关键词后开始搜索。</div>';
      return;
    }

    var data = window.MOVIE_SEARCH_INDEX || [];
    var results = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();

      return haystack.indexOf(query) !== -1;
    }).slice(0, 80);

    if (!results.length) {
      container.innerHTML = '<div class="search-empty">没有找到匹配影片，请换一个关键词。</div>';
      return;
    }

    var heading = document.createElement("div");
    heading.className = "section-heading";
    heading.innerHTML = '<div><span class="eyebrow">搜索结果</span><h2>找到 ' + results.length + ' 条相关影片</h2></div>';

    var grid = document.createElement("div");
    grid.className = "movie-grid";
    results.forEach(function (movie) {
      grid.appendChild(createResultCard(movie));
    });

    container.innerHTML = "";
    container.appendChild(heading);
    container.appendChild(grid);
  }

  function initHlsPlayers() {
    selectAll(".hls-video").forEach(function (video) {
      var source = video.getAttribute("data-hls-src") || "";
      var startButton = video.parentElement ? video.parentElement.querySelector("[data-player-start]") : null;
      var hlsInstance = null;

      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }

      if (startButton) {
        startButton.addEventListener("click", function () {
          var playPromise = video.play();
          startButton.classList.add("is-hidden");

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              startButton.classList.remove("is-hidden");
            });
          }
        });

        video.addEventListener("play", function () {
          startButton.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            startButton.classList.remove("is-hidden");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNavigation();
    initHeroSlider();
    initSearchForms();
    initSearchPage();
    initHlsPlayers();
  });
})();
