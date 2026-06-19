(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('is-active', i === active);
    });
  }

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5600);
  }

  var filter = document.querySelector('[data-filter-input]');
  if (filter) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var apply = function () {
      var value = filter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
      });
    };
    filter.addEventListener('input', apply);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filter.value = query;
      apply();
    }
  }
})();
