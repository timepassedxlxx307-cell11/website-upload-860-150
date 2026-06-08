(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const sliders = document.querySelectorAll("[data-hero-slider]");

    sliders.forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        let current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    });

    const searchInput = document.querySelector("[data-search-input]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const emptyState = document.querySelector("[data-empty-state]");
    const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
    let activeFilter = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const query = normalize(searchInput ? searchInput.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const terms = normalize(card.getAttribute("data-terms"));
            const category = card.getAttribute("data-category") || "";
            const matchesQuery = !query || terms.indexOf(query) !== -1;
            const matchesFilter = activeFilter === "all" || category === activeFilter;
            const shouldShow = matchesQuery && matchesFilter;

            card.style.display = shouldShow ? "" : "none";
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (searchInput && cards.length) {
        searchInput.addEventListener("input", applyFilters);
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");
        if (initialQuery) {
            searchInput.value = initialQuery;
            applyFilters();
        }
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter") || "all";
            filterButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applyFilters();
        });
    });
})();
