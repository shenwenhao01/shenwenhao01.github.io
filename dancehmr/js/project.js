(function () {
  'use strict';
function createCarousel(gallery, onChange) {
  var viewport = gallery.querySelector('.hero-viewport');
  var cards = Array.from(gallery.querySelectorAll('.hero-card'));
  var track = document.createElement('div');
  track.className = 'hero-track';
  viewport.prepend(track);
  var slides = [];
  var dots = Array.from(gallery.querySelectorAll('[data-hero-dot]'));
  var playButton = gallery.querySelector('[data-hero-play]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var active = 1;
  var visible = false;
  var wanted = !reduced.matches && !(navigator.connection && navigator.connection.saveData);
  var automaticPause = new WeakSet();
  var scrollFrame = 0;
  var settleTimer;

  function updatePlayButton() {
    if (!playButton) return;
    var paused = slides[active].querySelector('video').paused;
    playButton.classList.toggle('is-paused', paused);
    playButton.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' featured video');
  }
  function pause(video) {
    if (!video.paused) { automaticPause.add(video); video.pause(); }
  }
  function sync() {
    slides.forEach(function (card, i) {
      var video = card.querySelector('video');
      if (i !== active || !visible || document.hidden || !wanted) { pause(video); return; }
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      if (video.paused) video.play().then(function () {
        // Loading may finish after scrolling has already selected another card.
        if (slides[active] !== card || !visible || document.hidden || !wanted) pause(video);
      }).catch(function () { updatePlayButton(); });
    });
    updatePlayButton();
  }
  function mark(index, manual) {
    active = index;
    if (manual) wanted = true;
    var sample = Number(slides[active].dataset.heroIndex);
    slides.forEach(function (card, i) {
      card.classList.toggle('is-active', i === active);
      var video = card.querySelector('video');
      video.controls = i === active;
      video.tabIndex = i === active ? 0 : -1;
      card.querySelector('.hero-select').tabIndex = Math.abs(i - active) === 1 ? 0 : -1;
    });
    dots.forEach(function (dot, i) { dot.setAttribute('aria-pressed', String(i === sample)); });
    var status = gallery.querySelector('[data-hero-status]');
    if (status) status.textContent = 'Featured video ' + (sample + 1) + ' of ' + cards.length;
    var error = gallery.querySelector('.hero-error');
    if (error) error.hidden = true;
    if (onChange) onChange(sample, cards.length);
    sync();
  }
  function target(index) {
    return slides[index].offsetLeft - (track.clientWidth - slides[index].offsetWidth) / 2;
  }
  function go(index, smooth, manual) {
    index = Math.max(0, Math.min(slides.length - 1, index));
    if (manual) wanted = true;
    track.scrollTo({ left: target(index), behavior: smooth && !reduced.matches ? 'smooth' : 'instant' });
    if (!smooth || reduced.matches) mark(index, manual);
  }
  function settle() {
    // Mirror's endpoint copies keep a neighboring card visible at either end.
    if (Math.abs(track.scrollLeft - target(active)) > 2) return;
    if (active === 0) go(cards.length, false, false);
    else if (active === slides.length - 1) go(1, false, false);
  }
  function makeClone(card) {
    var clone = card.cloneNode(true);
    clone.classList.remove('is-active', 'is-ready');
    clone.dataset.carouselClone = '';
    var video = clone.querySelector('video');
    video.dataset.src = video.getAttribute('src') || video.dataset.src;
    video.removeAttribute('src');
    video.removeAttribute('id');
    video.controls = false;
    return clone;
  }
  function mount() {
    clearTimeout(settleTimer);
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    slides = [makeClone(cards[cards.length - 1])].concat(cards, [makeClone(cards[0])]);
    track.replaceChildren.apply(track, slides);
    slides.forEach(function (card, i) {
      var video = card.querySelector('video');
      video.muted = true;
      var button = card.querySelector('.hero-select');
      button.hidden = false;
      button.addEventListener('click', function () { go(i, true, true); });
      video.addEventListener('playing', function () { card.classList.add('is-ready'); updatePlayButton(); });
      video.addEventListener('play', function () {
        if (slides[active] === card && visible && !document.hidden) wanted = true;
        else pause(video);
      });
      video.addEventListener('pause', function () {
        if (automaticPause.has(video)) automaticPause.delete(video);
        else if (slides[active] === card) wanted = false;
        updatePlayButton();
      });
      video.addEventListener('ended', function () { if (slides[active] === card) go(i + 1, true, false); });
      video.addEventListener('error', function () {
        var error = gallery.querySelector('.hero-error');
        if (slides[active] === card && error) error.hidden = false;
        card.classList.remove('is-ready');
      });
    });
    go(1, false, false);
  }
  // Use the same native scrolling and centered CSS snap as mirror/main.js.
  // No wheel/touch threshold or gesture lock: the track follows the user's input.
  track.addEventListener('scroll', function () {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 180);
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(function () {
      scrollFrame = 0;
      var nearest = 0;
      slides.forEach(function (card, i) {
        if (Math.abs(target(i) - track.scrollLeft) < Math.abs(target(nearest) - track.scrollLeft)) nearest = i;
      });
      if (nearest !== active) mark(nearest, true);
    });
  }, { passive: true });
  dots.forEach(function (dot, i) { dot.addEventListener('click', function () { go(i + 1, true, true); }); });
  gallery.querySelector('[data-hero-prev]').addEventListener('click', function () { go(active - 1, true, true); });
  gallery.querySelector('[data-hero-next]').addEventListener('click', function () { go(active + 1, true, true); });
  if (playButton) playButton.addEventListener('click', function () { wanted = slides[active].querySelector('video').paused; sync(); });
  viewport.addEventListener('keydown', function (event) {
    if (event.target.tagName === 'VIDEO') return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); go(active + (event.key === 'ArrowRight' ? 1 : -1), true, true);
    }
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .2; sync();
  }, { threshold: .2 }).observe(viewport);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', function () { if (reduced.matches) { wanted = false; sync(); } });
  var controls = gallery.querySelector('.hero-controls');
  if (controls) controls.hidden = false;
  gallery.querySelectorAll('.carousel-arrow').forEach(function (button) { button.hidden = false; });
  mount();
  new ResizeObserver(function () { go(active, false, false); }).observe(track);
  return {
    select: function (index) { go(((index + cards.length) % cards.length) + 1, true, true); },
    replace: function (items, label) {
      slides.forEach(function (card) { pause(card.querySelector('video')); });
      cards = items.map(function (item, i) {
        var card = document.createElement('figure');
        card.className = 'hero-card';
        card.dataset.heroIndex = i;
        card.setAttribute('aria-label', label + ', video ' + (i + 1));
        card.setAttribute('aria-roledescription', 'slide');
        var img = document.createElement('img');
        img.src = item.poster; img.alt = label + ' reconstruction';
        var video = document.createElement('video');
        video.dataset.src = item.src; video.poster = item.poster;
        video.muted = true; video.playsInline = true; video.preload = 'none';
        video.setAttribute('aria-label', label + ', video ' + (i + 1));
        var button = document.createElement('button');
        button.type = 'button'; button.className = 'hero-select';
        button.setAttribute('aria-label', 'Play ' + label.toLowerCase() + ', video ' + (i + 1));
        card.append(img, video, button);
        return card;
      });
      wanted = true;
      mount();
    }
  };
}

createCarousel(document.querySelector('[data-hero-gallery]'));
var gallery = document.querySelector('[data-results-gallery]');
var clips = gallery.querySelector('.result-clips');
var categories = gallery.querySelector('.result-categories');
var categoryButtons = Array.from(categories.querySelectorAll('button'));
var category = 'featured';
var lists;
var labels = { featured: 'Featured', full_body: 'Full body', half_body: 'Upper body', fast_motion: 'Fast motion', ubody_test_sub: 'UBody', half_body_hands_out_of_frame: 'Truncated hands' };
var carousel = createCarousel(gallery.querySelector('[data-result-carousel]'), function (index, total) {
  gallery.querySelector('[data-video-count]').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  Array.from(clips.children).forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === index)); });
  gallery.querySelectorAll('video').forEach(function (video) { video.removeAttribute('id'); });
  gallery.querySelector('.hero-card.is-active video').id = 'result-video';
});
function renderClips() {
  clips.replaceChildren();
  lists[category].forEach(function (item, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', labels[category] + ', video ' + (index + 1));
    button.setAttribute('aria-pressed', String(index === 0));
    var img = document.createElement('img'); img.src = item.poster; img.alt = ''; img.loading = 'lazy';
    var number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0');
    button.append(img, number);
    button.addEventListener('click', function () { carousel.select(index); });
    clips.appendChild(button);
  });
}
fetch('video_lists.json').then(function (response) {
  if (!response.ok) throw new Error('Video collection unavailable');
  return response.json();
}).then(function (data) {
  lists = data;
  renderClips();
  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (category === button.dataset.category) return;
      category = button.dataset.category;
      categoryButtons.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      renderClips();
      carousel.replace(lists[category], labels[category]);
      gallery.querySelector('#result-description').textContent = labels[category] + ': whole-body and hand motion recovered from monocular videos.';
    });
  });
  categories.hidden = false;
  clips.hidden = false;
}).catch(function () {
  var error = gallery.querySelector('.result-error');
  error.textContent = 'The video collection could not be loaded. Reload to try again.';
  error.hidden = false;
});
var topbar = document.querySelector('.project-topbar');
window.addEventListener('scroll', function () { topbar.classList.toggle('is-scrolled', window.scrollY > 20); }, { passive: true });
// Both datasets remain readable when JavaScript is unavailable.
document.querySelectorAll('[data-benchmark-group]').forEach(function (group) {
  var tablist = group.querySelector('[role="tablist"]');
  var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (button) {
      var selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.setAttribute('role', 'tabpanel');
    });
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); selectTab(tabs[next]); tabs[next].focus();
    });
  });
  selectTab(tabs[0]);
  tablist.hidden = false;
});
document.querySelector('a[href="#body-results"]').addEventListener('click', function () {
  document.getElementById('tab-emdb').click();
});
// Reveal content as it enters view; content stays visible without JavaScript.
var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  var revealItems = Array.from(document.querySelectorAll('.research-section-heading, .research-highlights > div, .research-figure, .result-highlight, .benchmark-block'));
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  revealItems.forEach(function (item) {
    if (item.getBoundingClientRect().top < window.innerHeight) return;
    item.classList.add('reveal-item', 'is-pending');
    revealObserver.observe(item);
  });
  motionPreference.addEventListener('change', function () {
    if (motionPreference.matches) {
      revealItems.forEach(function (item) { item.classList.remove('is-pending'); });
      revealObserver.disconnect();
    }
  });
}
  var copyButton = document.querySelector('[data-copy-citation]');
  var copyLabel = copyButton.querySelector('span');
  var citation = document.getElementById('citation-code');
  var resetCopy;
  copyButton.hidden = false;
  copyButton.addEventListener('click', async function () {
    window.clearTimeout(resetCopy);
    try {
      await navigator.clipboard.writeText(citation.textContent);
      copyLabel.textContent = 'Copied';
    } catch (_) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      copyLabel.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? 'Press ⌘C to copy' : 'Press Ctrl+C to copy';
    }
    resetCopy = window.setTimeout(function () { copyLabel.textContent = 'Copy BibTeX'; }, 4000);
  });
}());
