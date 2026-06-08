import { H as Hls } from './hls.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupHeader() {
  const header = $('[data-site-header]');
  const toggle = $('[data-mobile-toggle]');
  const mobileNav = $('[data-mobile-nav]');

  const updateHeader = () => {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener('click', () => {
      const opened = mobileNav.classList.toggle('is-open');
      header.classList.toggle('mobile-open', opened);
      document.body.classList.toggle('mobile-nav-open', opened);
    });
  }
}

function setupImageFallbacks() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      const holder = image.closest('.cover-media, .hero-poster, .poster-card');
      if (holder) {
        holder.classList.add('image-missing');
      }
      image.remove();
    }, { once: true });
  });
}

function setupHeroCarousel() {
  const carousel = $('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  const slides = $$('.hero-slide', carousel);
  const dots = $$('.hero-dot', carousel);
  const prev = $('[data-hero-prev]', carousel);
  const next = $('[data-hero-next]', carousel);

  if (slides.length <= 1) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prev?.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    start();
  });

  next?.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.heroDot || 0);
      showSlide(index);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  start();
}

function setupClientCardFilter() {
  const toolbar = $('[data-client-filter]');
  if (!toolbar) {
    return;
  }

  const input = $('[data-card-filter-input]', toolbar);
  const count = $('[data-card-filter-count]', toolbar);
  const cards = $$('.movie-card', $('[data-card-list]') || document);

  if (!input) {
    return;
  }

  const filter = () => {
    const keyword = input.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const matched = card.textContent.toLowerCase().includes(keyword);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });

    if (count) {
      count.textContent = String(visibleCount);
    }
  };

  input.addEventListener('input', filter);
}

function setupSearchPage() {
  const page = $('[data-search-page]');
  if (!page || !Array.isArray(window.MOVIES)) {
    return;
  }

  const form = $('[data-search-form]', page);
  const input = $('[data-search-input]', page);
  const categoryFilter = $('[data-category-filter]', page);
  const typeFilter = $('[data-type-filter]', page);
  const summary = $('[data-search-summary]', page);
  const results = $('[data-search-results]', page);
  const params = new URLSearchParams(window.location.search);

  const types = [...new Set(window.MOVIES.map((movie) => movie.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter?.appendChild(option);
  });

  if (input) {
    input.value = params.get('q') || '';
  }
  if (categoryFilter) {
    categoryFilter.value = params.get('category') || '';
  }
  if (typeFilter) {
    typeFilter.value = params.get('type') || '';
  }

  const movieCardTemplate = (movie) => {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
      <article class="movie-card">
        <a class="cover-media" href="${escapeAttribute(movie.url)}" aria-label="观看 ${escapeAttribute(movie.title)}">
          <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)}" loading="lazy">
          <span class="cover-fallback">${escapeHtml(movie.title)}</span>
          <span class="play-badge">▶</span>
          <span class="duration-badge">${escapeHtml(movie.duration)}</span>
        </a>
        <div class="movie-card-body">
          <div class="card-meta-row">
            <a class="category-pill" href="category/${escapeAttribute(movie.categorySlug)}.html">${escapeHtml(movie.category)}</a>
            <span>${escapeHtml(movie.year)}</span>
          </div>
          <h3><a href="${escapeAttribute(movie.url)}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine || movie.summary || '')}</p>
          <div class="movie-tags">${tags}</div>
          <div class="card-foot">
            <span>${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</span>
            <span>${formatNumber(movie.views)} 次观看</span>
          </div>
        </div>
      </article>`;
  };

  const runSearch = () => {
    const keyword = (input?.value || '').trim().toLowerCase();
    const category = categoryFilter?.value || '';
    const type = typeFilter?.value || '';

    const matched = window.MOVIES.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.summary,
        movie.category,
        ...(movie.tags || []),
      ].join(' ').toLowerCase();

      const keywordMatched = !keyword || haystack.includes(keyword);
      const categoryMatched = !category || movie.category === category;
      const typeMatched = !type || movie.type === type;
      return keywordMatched && categoryMatched && typeMatched;
    }).slice(0, 240);

    if (summary) {
      const keywordText = keyword ? `“${escapeHtml(input.value.trim())}”` : '全部影片';
      summary.innerHTML = `共找到 <strong>${matched.length}</strong> 条结果，当前关键词：${keywordText}。`;
    }

    if (results) {
      results.innerHTML = matched.map(movieCardTemplate).join('') || '<p>没有找到匹配影片，可以尝试更换关键词或清空筛选条件。</p>';
      setupImageFallbacks();
    }
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextParams = new URLSearchParams();
    if (input?.value.trim()) {
      nextParams.set('q', input.value.trim());
    }
    if (categoryFilter?.value) {
      nextParams.set('category', categoryFilter.value);
    }
    if (typeFilter?.value) {
      nextParams.set('type', typeFilter.value);
    }
    const nextUrl = `${window.location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ''}`;
    history.replaceState(null, '', nextUrl);
    runSearch();
  });

  input?.addEventListener('input', runSearch);
  categoryFilter?.addEventListener('change', runSearch);
  typeFilter?.addEventListener('change', runSearch);
  runSearch();
}

function setupPlayer() {
  const card = $('[data-player]');
  const video = $('video[data-video-source]');
  const startButton = $('[data-player-start]');
  const status = $('[data-player-status]');

  if (!card || !video || !startButton) {
    return;
  }

  const source = video.dataset.videoSource;
  let initialized = false;
  let hls = null;

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const initializePlayer = async () => {
    if (!source) {
      setStatus('未找到可用播放源。');
      return;
    }

    card.classList.add('is-loading');

    if (!initialized) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data?.fatal) {
            setStatus('播放源加载遇到问题，请稍后刷新页面再试。');
          }
        });
      } else {
        setStatus('当前浏览器不支持 HLS 播放。');
        return;
      }
      initialized = true;
    }

    try {
      await video.play();
      card.classList.add('is-playing');
      setStatus('正在播放。');
    } catch (error) {
      setStatus('浏览器阻止了自动播放，请再次点击视频播放按钮。');
    }
  };

  startButton.addEventListener('click', initializePlayer);
  video.addEventListener('play', () => card.classList.add('is-playing'));
  video.addEventListener('pause', () => card.classList.remove('is-loading'));

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function formatNumber(number) {
  return Number(number || 0).toLocaleString('zh-CN');
}

document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  setupImageFallbacks();
  setupHeroCarousel();
  setupClientCardFilter();
  setupSearchPage();
  setupPlayer();
});
