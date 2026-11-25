(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  const savingData = Boolean(navigator.connection?.saveData);
  const records = new Map();
  let globalPaused = reduced.matches || mobile.matches || savingData;
  let userSetGlobal = false;

  function updateVideoButton(record) {
    const playing = !record.video.paused;
    record.stage.classList.toggle('is-playing', playing);
    record.button.setAttribute('aria-label', playing ? 'Pause motion' : 'Play motion');
    record.button.setAttribute('aria-pressed', String(playing));
    record.button.querySelector('.icon').className = `icon ${playing ? 'pause' : 'play'}`;
    updateComparisonButtons();
  }

  function updateComparisonButtons() {
    document.querySelectorAll('[data-group-play]').forEach(button => {
      const group = button.closest('.comparison-group');
      const playing = [...group.querySelectorAll('video')].some(video => !video.paused);
      button.querySelector('.icon').className = `icon ${playing ? 'pause' : 'play'}`;
      button.querySelector('span').textContent = playing ? 'Pause all' : 'Play all';
    });
  }

  function load(record) {
    if (!record.video.hasAttribute('src')) {
      record.video.src = record.video.dataset.src;
      record.video.load();
    }
  }

  async function play(record, explicit = false) {
    if (!records.has(record.video) || record.failed || document.hidden) return;
    if (explicit) {
      globalPaused = false;
      userSetGlobal = true;
      record.manualPaused = false;
      record.authorized = true;
    }
    if (mobile.matches) {
      // A comparison is one viewing unit; allow its three clips to play together.
      const others = [...records.values()].filter(r => r !== record && !r.video.paused &&
        !(record.comparison && r.comparison && record.slide === r.slide));
      if (others.length && !explicit) return;
      for (const other of others) {
        other.manualPaused = true;
        other.video.pause();
      }
    }
    load(record);
    try {
      await record.video.play();
      // A scroll, sample change or pause can occur while play() waits for data.
      if (!records.has(record.video) || globalPaused || record.manualPaused || !record.visible || document.hidden ||
          record.slide && !record.slide.classList.contains('is-active')) {
        record.video.pause();
      }
    } catch (_) {
      record.video.pause();
    }
    updateVideoButton(record);
  }

  function synchronize() {
    for (const record of records.values()) {
      const auto = !mobile.matches && !reduced.matches && !savingData;
      const active = !record.slide || record.slide.classList.contains('is-active');
      const shouldPlay = active && record.visible && !document.hidden && !globalPaused && !record.manualPaused && (auto || record.authorized);
      if (shouldPlay) play(record);
      else record.video.pause();
    }
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = records.get(entry.target);
      if (record) record.visible = entry.isIntersecting && entry.intersectionRatio >= 0.12;
    }
    synchronize();
  }, { threshold: [0, 0.12] }) : null;

  function register(scope = document) {
    scope.querySelectorAll('[data-media-stage]').forEach(stage => {
      const video = stage.querySelector('video');
      if (records.has(video)) return;
      const button = stage.querySelector('.video-toggle');
      const bounds = video.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, 0));
      const record = {
        stage, video, button, visible: bounds.height > 0 && visibleHeight / bounds.height >= 0.12,
        slide: stage.closest('.carousel-slide'),
        manualPaused: false,
        authorized: false, comparison: Boolean(stage.closest('.comparison-film')), failed: false,
      };
      records.set(video, record);
      video.muted = true;
      button.addEventListener('click', () => {
        if (video.paused) {
          record.visible = true;
          play(record, true);
        } else {
          record.manualPaused = true;
          video.pause();
        }
      });
      video.addEventListener('play', () => updateVideoButton(record));
      video.addEventListener('pause', () => updateVideoButton(record));
      video.addEventListener('error', () => {
        if (!video.hasAttribute('src')) return;
        record.failed = true;
        button.hidden = true;
        stage.querySelector('.media-error').hidden = false;
      });
      if (observer) observer.observe(video);
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const originals = [...track.children];
    const lastClone = originals.at(-1).cloneNode(true);
    const firstClone = originals[0].cloneNode(true);
    lastClone.classList.remove('is-active');
    firstClone.classList.remove('is-active');
    track.prepend(lastClone);
    track.append(firstClone);
    const slides = [...track.children];
    const dots = carousel.querySelector('.carousel-dots');
    dots.innerHTML = originals.map((_, i) => `<button type="button" class="carousel-dot" data-dot="${i}" aria-label="Show example ${i + 1}" aria-pressed="${i === 0}"><span></span></button>`).join('');
    dots.hidden = false;
    const dotButtons = [...dots.children];
    let current = 1;
    let ticking = false;
    let settleTimer;
    const target = index => slides[index].offsetLeft - (track.clientWidth - slides[index].offsetWidth) / 2;
    function mark(index) {
      current = index;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
        slide.querySelectorAll('button').forEach(button => { button.tabIndex = i === index ? 0 : -1; });
      });
      const sampleIndex = Number(slides[index].dataset.sampleIndex);
      dotButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === sampleIndex)));
      const dot = dotButtons[sampleIndex];
      dots.scrollTo({left: dot.offsetLeft - dots.offsetLeft - (dots.clientWidth - dot.offsetWidth) / 2, behavior: reduced.matches ? 'instant' : 'smooth'});
      carousel.querySelector('.carousel-count').textContent = `${String(sampleIndex + 1).padStart(2, '0')} / ${String(originals.length).padStart(2, '0')}`;
      synchronize();
    }
    function go(index, smooth = true) {
      track.scrollTo({left: target(index), behavior: smooth && !reduced.matches ? 'smooth' : 'instant'});
      if (!smooth) mark(index);
    }
    function settle() {
      if (current === 0) go(originals.length, false);
      if (current === slides.length - 1) go(1, false);
    }
    track.addEventListener('scroll', () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 180);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        let nearest = 0;
        slides.forEach((slide, i) => {
          if (Math.abs(target(i) - track.scrollLeft) < Math.abs(target(nearest) - track.scrollLeft)) nearest = i;
        });
        if (nearest !== current) mark(nearest);
      });
    }, {passive: true});
    dots.addEventListener('click', event => {
      const button = event.target.closest('[data-dot]');
      if (button) go(Number(button.dataset.dot) + 1);
    });
    track.addEventListener('click', event => {
      const slide = event.target.closest('.carousel-slide');
      if (slide && !slide.classList.contains('is-active')) {
        event.preventDefault();
        event.stopPropagation();
        go(slides.indexOf(slide));
      }
    }, true);
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    prev.hidden = next.hidden = false;
    prev.addEventListener('click', () => go(Math.max(0, current - 1)));
    next.addEventListener('click', () => go(Math.min(slides.length - 1, current + 1)));
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        go(Math.max(0, Math.min(slides.length - 1, current + (event.key === 'ArrowLeft' ? -1 : 1))));
      }
    });
    new ResizeObserver(() => go(current, false)).observe(track);
    go(1, false);
  });
  register();
  document.querySelectorAll('.comparison-group').forEach(group => {
    function playGroup(replay = false) {
      const groupRecords = [...group.querySelectorAll('video')].map(video => records.get(video));
      const shouldPlay = replay || groupRecords.every(record => record.video.paused);
      groupRecords.forEach(record => {
        record.manualPaused = !shouldPlay;
        if (shouldPlay) {
          if (replay) { load(record); record.video.currentTime = 0; }
          play(record, true);
        } else record.video.pause();
      });
    }
    group.querySelector('[data-group-play]').addEventListener('click', () => playGroup());
    group.querySelector('[data-group-replay]').addEventListener('click', () => playGroup(true));
  });
  document.addEventListener('visibilitychange', synchronize);
  const preferenceChange = () => {
    if (!userSetGlobal) globalPaused = reduced.matches || mobile.matches || savingData;
    synchronize();
  };
  reduced.addEventListener('change', preferenceChange);
  mobile.addEventListener('change', preferenceChange);

  function setupSamples(content) {
    const links = document.querySelector('[data-paper-links]');
    for (const [label, url] of [['Paper', content.paper.paperUrl], ['Code', content.paper.codeUrl]]) {
      if (!url || !/^https:\/\//.test(url)) continue;
      const a = document.createElement('a');
      a.textContent = label;
      a.href = url;
      a.className = 'button secondary';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      links.append(a);
    }
    if (!content.anonymous && content.paper.bibtex) {
      document.querySelector('[data-citation-section]').hidden = false;
      const code = document.querySelector('[data-bibtex]');
      code.textContent = content.paper.bibtex;
      document.querySelector('[data-copy-citation]').addEventListener('click', async () => {
        const status = document.querySelector('[data-copy-status]');
        try {
          await navigator.clipboard.writeText(content.paper.bibtex);
          status.textContent = 'BibTeX copied.';
        } catch (_) {
          const selection = getSelection();
          const range = document.createRange();
          range.selectNodeContents(code);
          selection.removeAllRanges();
          selection.addRange(range);
          status.textContent = 'Select and copy the highlighted citation.';
        }
      });
    }
  }

  const tabs = [...document.querySelectorAll('[data-benchmark]')];
  document.querySelector('.benchmark-tabs').hidden = false;
  function selectTab(tab) {
    tabs.forEach(button => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = tabs[1 - i];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs.at(-1);
      if (next) {
        event.preventDefault();
        selectTab(next);
        next.focus();
      }
    });
  });
  selectTab(tabs[0]);

  const dialog = document.querySelector('.figure-dialog');
  document.querySelectorAll('[data-figure]').forEach(link => {
    link.addEventListener('click', event => {
      if (typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      const image = dialog.querySelector('img');
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      dialog.showModal();
    });
  });
  document.querySelector('[data-close-figure]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  fetch('./data/content.json').then(response => {
    if (!response.ok) throw new Error('Content unavailable');
    return response.json();
  }).then(setupSamples).catch(() => {
    // The generated HTML retains all research content and individual playback.
  });
})();
