(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const showSlide = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle('is-active', currentIndex === index);
            });
            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle('is-active', currentIndex === index);
            });
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });

        restart();
    }

    const localFilter = document.querySelector('[data-local-filter]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const filterList = document.querySelector('[data-filter-list]');

    if (filterList && (localFilter || yearFilter)) {
        const cards = Array.from(filterList.querySelectorAll('.movie-card'));
        const applyFilter = function () {
            const keyword = localFilter ? localFilter.value.trim().toLowerCase() : '';
            const year = yearFilter ? yearFilter.value : '';

            cards.forEach(function (card) {
                const text = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.year
                ].join(' ').toLowerCase();
                const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                const yearMatch = !year || card.dataset.year === year;
                card.hidden = !(keywordMatch && yearMatch);
            });
        };

        if (localFilter) {
            localFilter.addEventListener('input', applyFilter);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
    }

    const searchData = window.SEARCH_MOVIES;
    const searchInput = document.querySelector('[data-search-input]');
    const searchResults = document.querySelector('[data-search-results]');
    const searchTitle = document.querySelector('[data-search-title]');

    if (Array.isArray(searchData) && searchInput && searchResults) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        const createCard = function (movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
                '        <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-hidden\')">',
                '        <span class="poster-glow"></span>',
                '        <span class="play-mark">▶</span>',
                '    </a>',
                '    <div class="card-body">',
                '        <div class="meta-line">',
                '            <a href="./categories/' + movie.categorySlug + '.html">' + escapeHtml(movie.category) + '</a>',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '        </div>',
                '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-line">',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '        </div>',
                '    </div>',
                '</article>'
            ].join('');
        };

        const renderSearch = function () {
            const query = searchInput.value.trim().toLowerCase();
            const matched = searchData.filter(function (movie) {
                const text = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.tags,
                    movie.oneLine,
                    movie.category
                ].join(' ').toLowerCase();
                return !query || text.indexOf(query) !== -1;
            }).slice(0, 80);

            if (searchTitle) {
                searchTitle.textContent = query ? '搜索：' + searchInput.value.trim() : '精选影片';
            }

            searchResults.innerHTML = matched.map(createCard).join('');
        };

        searchInput.addEventListener('input', renderSearch);
        renderSearch();
    }

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.player-start');
        const status = shell.querySelector('.player-status');
        const source = shell.dataset.source;
        let loaded = false;

        const setStatus = function (message) {
            if (status) {
                status.textContent = message;
            }
        };

        const loadVideo = function () {
            if (!video || !source || loaded) {
                return;
            }

            loaded = true;
            setStatus('正在加载播放源');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {
                        setStatus('点击继续播放');
                    });
                }, { once: true });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setStatus('点击继续播放');
                    });
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    setStatus('当前线路暂时不可用');
                });
                return;
            }

            video.src = source;
            video.play().catch(function () {
                setStatus('当前浏览器暂不支持此播放格式');
            });
        };

        const startPlay = function () {
            loadVideo();
            shell.classList.add('is-playing');
            if (video) {
                video.controls = true;
                video.play().catch(function () {
                    setStatus('点击继续播放');
                    shell.classList.remove('is-playing');
                });
            }
        };

        shell.addEventListener('click', function (event) {
            if (event.target && event.target.tagName === 'VIDEO') {
                return;
            }
            startPlay();
        });

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlay();
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
        }
    });

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
