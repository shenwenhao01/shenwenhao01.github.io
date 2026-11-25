(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var connection = navigator.connection;
  var automaticDisabled = reducedMotion.matches || !!(connection && connection.saveData);
  var previews = Array.from(document.querySelectorAll('[data-video-preview]')).map(function (media) {
    var video = media.querySelector('video');
    var button = media.querySelector('button');
    var icon = button.querySelector('i');
    var state = { visible: false, choice: null, blocked: false, failed: false };
    video.muted = true;
    button.hidden = false;

    function updateButton() {
      var label = video.paused ? 'Play video preview' : 'Pause video preview';
      button.setAttribute('aria-label', label);
      button.title = label;
      icon.className = video.paused ? 'fas fa-play' : 'fas fa-pause';
    }

    function sync() {
      var automatic = !reducedMotion.matches && !(connection && connection.saveData) && !state.blocked;
      var wanted = state.choice === null ? automatic : state.choice;
      var visible = state.visible && !document.hidden && !media.closest('[hidden]');
      if (state.failed || !visible || !wanted) {
        video.pause();
        return;
      }
      // Assign the source only when playback is needed, keeping offscreen videos unloaded.
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      if (video.paused) {
        var attempt = video.play();
        if (attempt) attempt.catch(function (error) {
          if (error.name === 'NotAllowedError') {
            state.blocked = true;
            state.choice = null;
          }
          updateButton();
        });
      }
    }

    video.addEventListener('playing', function () {
      media.classList.add('is-ready');
      updateButton();
    });
    video.addEventListener('pause', updateButton);
    video.addEventListener('error', function () {
      state.failed = true;
      video.pause();
      media.classList.remove('is-ready');
      button.hidden = true;
    });
    button.addEventListener('click', function () {
      state.choice = video.paused;
      state.blocked = false;
      // Clicking is an explicit request, including on browsers without IntersectionObserver.
      state.visible = true;
      sync();
    });

    return { media: media, state: state, sync: sync };
  });

  function syncPreviews() { previews.forEach(function (preview) { preview.sync(); }); }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var preview = previews.find(function (item) { return item.media === entry.target; });
        preview.state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        preview.sync();
      });
    }, { threshold: [0, 0.2] });
    previews.forEach(function (preview) { observer.observe(preview.media); });
  }
  document.addEventListener('visibilitychange', syncPreviews);
  window.addEventListener('pagehide', function () {
    previews.forEach(function (preview) { preview.media.querySelector('video').pause(); });
  });
  window.addEventListener('pageshow', syncPreviews);
  function preferencesChanged() {
    var disabled = reducedMotion.matches || !!(connection && connection.saveData);
    // Connection events also fire for bandwidth estimates; preserve the user's pause choice.
    if (disabled === automaticDisabled) return;
    automaticDisabled = disabled;
    if (disabled) previews.forEach(function (preview) {
      if (preview.state.choice !== false) preview.state.choice = null;
    });
    syncPreviews();
  }
  reducedMotion.addEventListener('change', preferencesChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', preferencesChanged);

  var publications = document.querySelector('[data-publications]');
  if (!publications) return;

  var form = publications.querySelector('.publication-filters');
  var query = form.querySelector('input[type="search"]');
  var year = form.querySelector('select');
  var count = form.querySelector('[role="status"]');
  var papers = Array.from(publications.querySelectorAll('.publication'));
  var groups = Array.from(publications.querySelectorAll('.publication-group'));
  var empty = publications.querySelector('.publication-empty');
  var searchable = papers.map(function (paper) {
    return paper.textContent.toLocaleLowerCase().replace(/\s+/g, ' ');
  });

  function filter() {
    var terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    var visible = 0;

    papers.forEach(function (paper, index) {
      var matches = (year.value === 'all' || paper.dataset.year === year.value) &&
        terms.every(function (term) { return searchable[index].includes(term); });
      paper.hidden = !matches;
      if (matches) visible += 1;
    });

    groups.forEach(function (group) {
      group.hidden = !group.querySelector('.publication:not([hidden])');
    });
    count.textContent = visible + (visible === 1 ? ' publication' : ' publications');
    empty.hidden = visible !== 0;
    syncPreviews();
  }

  form.hidden = false;
  form.addEventListener('submit', function (event) { event.preventDefault(); });
  query.addEventListener('input', filter);
  year.addEventListener('change', filter);
  publications.querySelector('[data-reset-filters]').addEventListener('click', function () {
    form.reset();
    filter();
    query.focus();
  });
  window.addEventListener('pageshow', filter);
  filter();
}());
