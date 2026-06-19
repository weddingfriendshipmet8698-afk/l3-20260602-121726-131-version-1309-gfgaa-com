(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var status = filterPanel.querySelector('[data-filter-status]');
    var empty = document.querySelector('[data-empty-message]');
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');

    if (preset && keywordInput) {
      keywordInput.value = preset;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
        var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var matchCategory = !category || haystack.indexOf(category) !== -1;
        var matched = matchKeyword && matchYear && matchType && matchCategory;

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = '当前显示 ' + visible + ' 部影片';
      }

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  var video = document.getElementById('moviePlayer');
  var playButton = document.querySelector('[data-play-button]');
  var videoOverlay = document.querySelector('[data-video-overlay]');
  var hlsInstance = null;

  function prepareVideo() {
    if (!video) {
      return Promise.resolve();
    }

    var source = video.getAttribute('data-src');

    if (!source) {
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
      if (video.src !== source) {
        video.src = source;
      }
    }

    return Promise.resolve();
  }

  function startVideo() {
    prepareVideo().then(function () {
      if (!video) {
        return;
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(function () {});
      }

      if (videoOverlay) {
        videoOverlay.classList.add('hidden');
      }
    });
  }

  if (video) {
    video.addEventListener('click', startVideo);
    video.addEventListener('play', function () {
      if (videoOverlay) {
        videoOverlay.classList.add('hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (videoOverlay && video.currentTime === 0) {
        videoOverlay.classList.remove('hidden');
      }
    });
  }

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }
})();
