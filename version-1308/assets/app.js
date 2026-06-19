(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
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

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        play();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var list = document.querySelector("[data-card-list]");
            var empty = document.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (input && initial) {
                input.value = initial;
            }

            function textOf(card) {
                return [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
            }

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var r = region ? region.value : "";
                var y = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var matchText = !q || textOf(card).indexOf(q) !== -1;
                    var matchRegion = !r || card.getAttribute("data-region") === r;
                    var matchYear = !y || card.getAttribute("data-year") === y;
                    var show = matchText && matchRegion && matchYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayer() {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        if (!video || !cover) {
            return;
        }
        var source = video.getAttribute("data-stream") || cover.getAttribute("data-stream") || "";
        var started = false;
        var hlsInstance = null;

        function attach() {
            if (!source) {
                return;
            }
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        cover.addEventListener("click", attach);
        video.addEventListener("click", function () {
            if (!started) {
                attach();
                return;
            }
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
