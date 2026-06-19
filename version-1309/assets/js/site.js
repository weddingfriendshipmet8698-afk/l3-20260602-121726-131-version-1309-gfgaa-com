(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    if (slides.length > 0) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-search]');
    var year = scope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));

    if (scope.hasAttribute('data-query-page') && input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchKeyword = keyword === '' || text.indexOf(keyword) !== -1;
        var matchYear = selectedYear === '' || card.getAttribute('data-year') === selectedYear;
        card.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }
    if (year) {
      year.addEventListener('change', filterCards);
    }
    filterCards();
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var source = player.getAttribute('data-stream');
    var hlsInstance = null;

    function startVideo() {
      player.classList.add('playing');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = source;
        }
        video.play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.play();
        }
        return;
      }

      if (!video.src) {
        video.src = source;
      }
      video.play();
    }

    if (button && video && source) {
      button.addEventListener('click', startVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
    }
  });
})();
