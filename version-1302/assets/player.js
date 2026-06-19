(function () {
  function activate(video) {
    if (!video) return;
    var url = video.getAttribute('data-stream');
    if (!url) return;
    var shell = video.closest('.video-shell');
    var ready = function () {
      if (shell) shell.classList.add('is-ready');
      var play = video.play();
      if (play && typeof play.catch === 'function') play.catch(function () {});
    };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) video.src = url;
      ready();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._streamReady) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        video._streamReady = true;
      }
      ready();
      return;
    }
    if (!video.src) video.src = url;
    ready();
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-play')).forEach(function (button) {
    button.addEventListener('click', function () {
      activate(document.getElementById(button.getAttribute('data-target')));
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('video[data-stream]')).forEach(function (video) {
    video.addEventListener('click', function () {
      if (!video.src) activate(video);
    });
  });
})();
