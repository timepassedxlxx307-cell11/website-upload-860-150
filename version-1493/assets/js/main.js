(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = $("[data-menu-toggle]");
    var nav = $("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dot", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    var forms = $all("[data-search-form]");
    if (!forms.length || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }
    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var panel = form.querySelector("[data-search-results]");
      if (!input || !panel) {
        return;
      }
      function render() {
        var q = normalize(input.value);
        if (!q) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var results = window.SITE_MOVIES.filter(function (item) {
          return normalize(item.t + " " + item.y + " " + item.r + " " + item.g + " " + item.k).indexOf(q) !== -1;
        }).slice(0, 10);
        if (!results.length) {
          panel.innerHTML = '<div class="search-result"><div></div><div><strong>未找到相关影片</strong><span>换个关键词继续搜索</span></div></div>';
          panel.classList.add("is-open");
          return;
        }
        panel.innerHTML = results.map(function (item) {
          return '<a class="search-result" href="./' + item.u + '"><img src="' + item.c + '" alt="' + item.t.replace(/"/g, "&quot;") + '"><div><strong>' + item.t + '</strong><span>' + item.y + ' · ' + item.r + ' · ' + item.g + '</span></div></a>';
        }).join("");
        panel.classList.add("is-open");
      }
      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function initPageFilter() {
    var filter = $("[data-page-filter]");
    var grid = $("[data-filter-grid]");
    if (!filter || !grid) {
      return;
    }
    var input = filter.querySelector("[data-filter-keyword]");
    var year = filter.querySelector("[data-filter-year]");
    var type = filter.querySelector("[data-filter-type]");
    var empty = $("[data-empty-state]");
    var cards = $all("[data-movie-card]", grid);
    function apply() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-tags"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (t && cardType.indexOf(t) === -1) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.setupMoviePlayer = function (url) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    var notice = document.getElementById("player-notice");
    if (!video || !url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && notice) {
          notice.textContent = "播放暂时不可用";
          notice.hidden = false;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (notice) {
      notice.textContent = "播放暂时不可用";
      notice.hidden = false;
    }
    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initPageFilter();
  });
})();
