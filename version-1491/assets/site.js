
(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function normalize(str) {
    return (str || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function toggleMenu() {
    var btn = qs('[data-menu-btn]');
    var nav = qs('[data-nav-links]');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
    qsa('[data-nav-links] a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initHeroCarousel() {
    var slides = qsa('[data-hero-slide]');
    if (!slides.length) return;
    var current = 0;
    function show(i) {
      slides.forEach(function (s, idx) {
        s.classList.toggle('active', idx === i);
      });
      current = i;
    }
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    if (prev) prev.addEventListener('click', function () { show((current - 1 + slides.length) % slides.length); });
    if (next) next.addEventListener('click', function () { show((current + 1) % slides.length); });
    setInterval(function () {
      if (document.hidden) return;
      show((current + 1) % slides.length);
    }, 4200);
    show(0);
  }

  function filterCards(rootSel) {
    var root = qs(rootSel);
    if (!root) return;
    var input = qs('[data-filter-input]', root);
    var genre = qs('[data-filter-genre]', root);
    var cards = qsa('[data-filter-card]', root);
    if (!input && !genre) return;
    var noResult = qs('[data-no-result]', root);

    function apply() {
      var q = normalize(input ? input.value : '');
      var g = genre ? genre.value : 'all';
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search') || card.textContent || '');
        var cg = card.getAttribute('data-genre') || '';
        var ok = (!q || text.indexOf(q) !== -1) && (g === 'all' || cg === g);
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });
      if (noResult) noResult.hidden = shown !== 0;
    }
    if (input) input.addEventListener('input', apply);
    if (genre) genre.addEventListener('change', apply);
    apply();
  }

  function initSearchPage() {
    var root = qs('[data-search-page]');
    if (!root || !window.MOVIES_DATA) return;
    var form = qs('[data-search-form]', root);
    var input = qs('[data-search-input]', root);
    var results = qs('[data-search-results]', root);
    var count = qs('[data-search-count]', root);
    var genreFilter = qs('[data-search-genre]', root);
    var yearFilter = qs('[data-search-year]', root);
    var bucketFilter = qs('[data-search-bucket]', root);
    var topTags = qsa('[data-tag-filter]', root);

    function render(list) {
      if (!results) return;
      if (!list.length) {
        results.innerHTML = '<div class="panel" style="grid-column:1/-1"><p class="muted" data-no-result>没有找到匹配内容，请试试别的关键词。</p></div>';
        if (count) count.textContent = '0';
        return;
      }
      if (count) count.textContent = String(list.length);
      results.innerHTML = list.map(function (m) {
        return [
          '<a class="card movie-card" href="' + m.url + '" data-filter-card data-genre="' + (m.bucket || '') + '" data-search="' + [m.title, m.region, m.type, m.year, m.genre, (m.tags || []).join(' '), m.one_line, m.summary, m.bucket_title].join(' ') + '">',
            '<div class="poster" style="--tone-a:' + colorFor(m.id, 0) + ';--tone-b:' + colorFor(m.id, 1) + '">',
              '<div class="poster-text"><strong>' + esc(m.title) + '</strong><span>' + esc([m.region, m.type, m.year].filter(Boolean).join(' · ')) + '</span></div>',
              '<div class="play-dot">▶</div>',
            '</div>',
            '<div class="card-body">',
              '<h4>' + esc(m.title) + '</h4>',
              '<div class="meta-row"><span class="badge">' + esc(m.bucket_title) + '</span><span class="badge">' + esc(m.genre || '') + '</span></div>',
              '<p>' + esc(m.one_line || m.summary || '') + '</p>',
            '</div>',
          '</a>'
        ].join('');
      }).join('');
    }

    function colorFor(key, n) {
      var h = 0;
      var str = key + ':' + n;
      for (var i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) >>> 0;
      }
      var c = (h & 0xffffff).toString(16).padStart(6, '0');
      return '#' + c;
    }

    function esc(s) {
      return (s || '').toString().replace(/[&<>"']/g, function (m) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
      });
    }

    function apply(tagValue) {
      var q = normalize(input ? input.value : '');
      var g = genreFilter ? genreFilter.value : 'all';
      var y = yearFilter ? yearFilter.value : 'all';
      var b = bucketFilter ? bucketFilter.value : 'all';
      var list = window.MOVIES_DATA.filter(function (m) {
        var hay = normalize([m.title, m.region, m.type, m.year, m.genre, (m.tags || []).join(' '), m.one_line, m.summary, m.bucket_title, tagValue || ''].join(' '));
        if (q && hay.indexOf(q) === -1) return false;
        if (g !== 'all' && normalize(m.genre).indexOf(normalize(g)) === -1) return false;
        if (y !== 'all' && String(m.year) !== String(y)) return false;
        if (b !== 'all' && m.bucket !== b) return false;
        if (tagValue && hay.indexOf(normalize(tagValue)) === -1) return false;
        return true;
      });
      list.sort(function (a, b) { return b.score_hot - a.score_hot; });
      render(list.slice(0, 120));
    }

    if (input) input.addEventListener('input', function () { apply(''); });
    if (genreFilter) genreFilter.addEventListener('change', function () { apply(''); });
    if (yearFilter) yearFilter.addEventListener('change', function () { apply(''); });
    if (bucketFilter) bucketFilter.addEventListener('change', function () { apply(''); });
    topTags.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (input) input.value = btn.getAttribute('data-tag-filter') || '';
        apply(btn.getAttribute('data-tag-filter') || '');
      });
    });
    if (form) {
      form.addEventListener('submit', function (e) { e.preventDefault(); apply(''); });
    }
    apply('');
  }

  function initCatalogFilter() {
    filterCards('[data-filter-shell]');
  }

  function initPlayer() {
    var video = qs('[data-player-video]');
    if (!video) return;
    var src = video.getAttribute('data-src');
    if (src) video.src = src;
    var playBtn = qs('[data-play-btn]');
    var muteBtn = qs('[data-mute-btn]');
    var fullscreenBtn = qs('[data-fullscreen-btn]');
    if (playBtn) playBtn.addEventListener('click', function () {
      if (video.paused) video.play(); else video.pause();
      playBtn.textContent = video.paused ? '播放预告' : '暂停预告';
    });
    if (muteBtn) muteBtn.addEventListener('click', function () {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? '开启声音' : '静音';
    });
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', function () {
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    });
    video.addEventListener('play', function () { if (playBtn) playBtn.textContent = '暂停预告'; });
    video.addEventListener('pause', function () { if (playBtn) playBtn.textContent = '播放预告'; });
  }

  onReady(function () {
    toggleMenu();
    initHeroCarousel();
    initCatalogFilter();
    initSearchPage();
    initPlayer();
  });
})();
