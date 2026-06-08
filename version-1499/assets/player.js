(function () {
    function bind(videoSelector, overlaySelector, source) {
        const video = document.querySelector(videoSelector);
        const overlay = document.querySelector(overlaySelector);

        if (!video || !overlay || !source) {
            return;
        }

        let prepared = false;

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }

            prepared = true;
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }

            const Hls = window.MovieHls;

            if (Hls && Hls.isSupported && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.hlsInstance = hls;
                return Promise.resolve();
            }

            video.src = source;
            return Promise.resolve();
        }

        function play() {
            overlay.classList.add("is-hidden");
            prepare().then(function () {
                const promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            });
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    window.MoviePlayer = {
        bind: bind
    };
})();
