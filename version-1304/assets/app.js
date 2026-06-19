(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var button = qs('[data-nav-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });
    if (index < 0) {
      index = 0;
    }
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupLocalFilter() {
    var input = qs('[data-local-search]');
    var typeSelect = qs('[data-filter-type]');
    var yearSelect = qs('[data-filter-year]');
    var items = qsa('[data-search]');
    if (!items.length) {
      return;
    }
    function apply() {
      var keyword = normalize(input && input.value);
      var mediaType = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search'));
        var typeOk = !mediaType || haystack.indexOf(mediaType) !== -1;
        var yearOk = !year || haystack.indexOf(year) !== -1;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        item.classList.toggle('is-hidden-by-filter', !(typeOk && yearOk && keywordOk));
      });
    }
    [input, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupSearchPage() {
    var input = qs('[data-search-page-input]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    setupLocalFilter();
  }

  function initPlayer(source) {
    var video = qs('[data-player-video]');
    var cover = qs('[data-player-cover]');
    if (!video || !source) {
      return;
    }
    var loaded = false;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        window.addEventListener('pagehide', function () {
          hls.destroy();
        });
      } else {
        video.src = source;
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });

  window.StaticMovieSite = {
    initPlayer: initPlayer
  };
})();
