document.addEventListener('DOMContentLoaded', function () {
  setupMobileNav();
  setupSearchAndFilters();
  setupHeroCarousel();
  setupPlayers();
});

function setupMobileNav() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', function () {
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
  });
}

function setupSearchAndFilters() {
  var forms = document.querySelectorAll('[data-filter-scope]');

  forms.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var cards = scope.querySelectorAll('[data-movie-card]');
    var empty = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
      var query = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search-text'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || cardYear === year;
        var matchType = !type || cardType === type;
        var show = matchQuery && matchYear && matchType;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', runFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', runFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', runFilter);
    }
  });
}

function setupHeroCarousel() {
  var slides = document.querySelectorAll('[data-hero-slide]');

  if (slides.length <= 1) {
    return;
  }

  var current = 0;

  window.setInterval(function () {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, 4600);
}

function setupPlayers() {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-overlay]');
    var button = box.querySelector('[data-player-button]');
    var src = box.getAttribute('data-video-src');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !src) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      attachSource();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          playVideo();
        }
      });
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}
