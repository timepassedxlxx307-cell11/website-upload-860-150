(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        show(0);
        start();
    }

    function matchCard(card, query) {
        var title = card.getAttribute("data-title") || "";
        var keywords = card.getAttribute("data-keywords") || "";
        var text = (title + " " + keywords).toLowerCase();
        return text.indexOf(query) !== -1;
    }

    function filterScope(scope, input) {
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var empty = scope.querySelector("[data-empty-state]");
        var visible = 0;
        cards.forEach(function (card) {
            var ok = !query || matchCard(card, query);
            card.style.display = ok ? "" : "none";
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("show", visible === 0);
        }
    }

    function initSearch() {
        document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
            var inputs = Array.prototype.slice.call(scope.querySelectorAll("[data-search-input]"));
            inputs.forEach(function (input) {
                input.addEventListener("input", function () {
                    filterScope(scope, input);
                });
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query && input.hasAttribute("data-query-input")) {
                    input.value = query;
                    filterScope(scope, input);
                }
            });
            var clear = scope.querySelector("[data-clear-search]");
            if (clear && inputs[0]) {
                clear.addEventListener("click", function () {
                    inputs[0].value = "";
                    filterScope(scope, inputs[0]);
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState({}, "", window.location.pathname);
                    }
                });
            }
        });
    }

    function initPlayers() {
        document.querySelectorAll(".player-box").forEach(function (box) {
            var video = box.querySelector("video");
            var cover = box.querySelector(".player-cover");
            var button = box.querySelector(".player-start");
            var url = box.getAttribute("data-video");
            var loaded = false;
            var instance = null;

            if (!video || !cover || !button || !url) {
                return;
            }

            function loadVideo() {
                if (loaded) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({ enableWorker: true });
                    instance.loadSource(url);
                    instance.attachMedia(video);
                } else {
                    video.src = url;
                }
                loaded = true;
            }

            function playVideo() {
                loadVideo();
                box.classList.add("is-playing");
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            cover.addEventListener("click", playVideo);
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                playVideo();
            });
            cover.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    playVideo();
                }
            });
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            window.addEventListener("pagehide", function () {
                if (instance && typeof instance.destroy === "function") {
                    instance.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initSearch();
        initPlayers();
    });
})();
