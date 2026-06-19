function setupMenus() {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function setupSearchForms() {
  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const target = form.getAttribute('data-search-url') || 'search.html';
      const value = input ? input.value.trim() : '';
      const url = value ? target + '?q=' + encodeURIComponent(value) : target;
      window.location.href = url;
    });
  });
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  if (slides.length < 2) {
    return;
  }
  let current = 0;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
    });
  });
  setInterval(function () {
    show(current + 1);
  }, 5200);
}

function bindMoviePlayer(video, button, source) {
  if (!video || !source) {
    return;
  }
  let ready = false;
  function prepare() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }
  function start() {
    prepare();
    if (button) {
      button.classList.add('hidden');
    }
    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }
  video.addEventListener('click', start);
  if (button) {
    button.addEventListener('click', start);
  }
  prepare();
}

function setupSearchPage() {
  const form = document.querySelector('[data-search-box]');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const recommend = document.querySelector('[data-search-recommend]');
  if (!form || !input || !results || typeof SEARCH_ITEMS === 'undefined') {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  input.value = initial;
  function render(value) {
    const query = value.trim().toLowerCase();
    results.innerHTML = '';
    if (!query) {
      if (recommend) {
        recommend.style.display = '';
      }
      return;
    }
    if (recommend) {
      recommend.style.display = 'none';
    }
    const matched = SEARCH_ITEMS.filter(function (item) {
      return item.text.toLowerCase().includes(query);
    }).slice(0, 120);
    if (!matched.length) {
      results.innerHTML = '<p class="empty-result">未找到匹配影片，请尝试其他关键词。</p>';
      return;
    }
    results.innerHTML = matched.map(function (item) {
      return '<article class="movie-card"><a href="' + item.href + '" title="' + item.title + '"><figure class="poster-frame"><img src="' + item.cover + '" alt="' + item.title + '"><figcaption>' + item.year + '</figcaption></figure><div class="movie-card-body"><h3>' + item.title + '</h3><p>' + item.desc + '</p><div class="movie-meta"><span>' + item.region + '</span><span>' + item.type + '</span></div><div class="tag-row"><span>' + item.genre + '</span></div></div></a></article>';
    }).join('');
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render(input.value);
    const next = input.value.trim() ? 'search.html?q=' + encodeURIComponent(input.value.trim()) : 'search.html';
    history.replaceState(null, '', next);
  });
  render(initial);
}

document.addEventListener('DOMContentLoaded', function () {
  setupMenus();
  setupSearchForms();
  setupHero();
  setupSearchPage();
});
