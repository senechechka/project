(function () {
  'use strict';

  var data = window.KITSMAN_DATA;
  if (!data) return;

  // --- 1. Scroll-Driven 3D Statue Controller & Header State ---
  var heroSection = document.getElementById('hero');
  var statueContainer = document.getElementById('statue-canvas-wrap');
  var statueFallback = document.getElementById('statue-fallback');
  var topbar = document.getElementById('topbar');
  var scrollBar = document.getElementById('scroll-progress-bar');
  var heroScrollCue = document.getElementById('hero-scroll-cue');

  var statueController = null;
  if (statueContainer && typeof window.initIvasyukStatue === 'function') {
    statueController = window.initIvasyukStatue(statueContainer, statueFallback);
  }

  var ivasyukSubStage = document.getElementById('ivasyuk-3d-stage');
  if (ivasyukSubStage && typeof window.initIvasyukStatue === 'function') {
    window.initIvasyukStatue(ivasyukSubStage, null, { cursorFollowOnly: true });
  }

  function updateScrollEffects() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    var globalProgress =
      docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

    if (scrollBar) {
      scrollBar.style.transform = 'scaleX(' + globalProgress.toFixed(4) + ')';
    }

    if (topbar) {
      topbar.classList.toggle('is-scrolled', scrollY > 32);
    }

    if (heroSection) {
      var heroTop = heroSection.offsetTop;
      var heroRunway = Math.max(360, heroSection.offsetHeight - window.innerHeight);
      var heroProgress = Math.min(
        1,
        Math.max(0, (scrollY - heroTop) / heroRunway)
      );

      if (statueController) {
        statueController.setScrollProgress(heroProgress);
      } else if (statueFallback && !statueFallback.hidden) {
        var deg = heroProgress * 360;
        var sc = Math.max(0.05, 1 - heroProgress * 0.95);
        var op = Math.max(0, 1 - heroProgress * 1.25);
        statueFallback.style.transform =
          'rotateY(' + deg + 'deg) scale(' + sc + ')';
        statueFallback.style.opacity = op.toFixed(3);
      }

      if (heroScrollCue) {
        heroScrollCue.style.opacity = Math.max(0, 1 - heroProgress * 3.5).toFixed(3);
      }
    }
  }

  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  window.addEventListener('resize', updateScrollEffects);
  updateScrollEffects();

  // --- 2. Preload Landmark Images ---
  data.landmarks.forEach(function (item) {
    var img = new Image();
    img.src = item.image;
  });

  // --- 3. Tabbed Landmark Showcase (Fast Directional Slide + Blur, NO Zoom) ---
  var tabsList = document.getElementById('landmark-tabs');
  var showcaseCard = document.getElementById('landmark-showcase-card');
  var mediaBlurWrap = document.getElementById('showcase-media-blur');
  var textBlurWrap = document.getElementById('showcase-text-blur');
  var photoEl = document.getElementById('showcase-photo');
  var photoTagEl = document.getElementById('showcase-photo-tag');
  var photoCounterEl = document.getElementById('showcase-counter');
  var photoCreditEl = document.getElementById('showcase-photo-credit');
  var categoryEl = document.getElementById('showcase-category');
  var titleEl = document.getElementById('showcase-title');
  var yearEl = document.getElementById('showcase-year');
  var addressEl = document.getElementById('showcase-address');
  var statusEl = document.getElementById('showcase-status');
  var summaryEl = document.getElementById('showcase-summary');
  var historyEl = document.getElementById('showcase-history');
  var detailLabelEl = document.getElementById('showcase-detail-label');
  var detailTextEl = document.getElementById('showcase-detail-text');
  var prevBtn = document.getElementById('showcase-prev');
  var nextBtn = document.getElementById('showcase-next');
  var dotsWrap = document.getElementById('showcase-dots');

  var currentIndex = 0;
  var swapToken = 0;
  var swapTimerOut = null;
  var swapTimerIn = null;

  var TRANSITION_CLASSES = [
    'is-out-left',
    'is-out-right',
    'is-in-left',
    'is-in-right'
  ];

  function clearTransitionClasses(el) {
    TRANSITION_CLASSES.forEach(function (cls) {
      el.classList.remove(cls);
    });
  }

  function applyLandmarkContent(item, index) {
    photoEl.src = item.image;
    photoEl.alt = item.alt;
    photoTagEl.textContent = item.address + ' · ' + item.year;
    photoCounterEl.textContent =
      item.num + ' / ' + String(data.landmarks.length).padStart(2, '0');
    photoCreditEl.textContent = item.photoCredit;

    categoryEl.textContent = item.category;
    titleEl.textContent = item.title;
    yearEl.textContent = item.year;
    addressEl.textContent = item.address;
    statusEl.textContent = item.status;
    summaryEl.textContent = item.summary;
    historyEl.textContent = item.history;
    detailLabelEl.textContent = item.detailLabel;
    detailTextEl.textContent = item.detailText;

    if (tabsList) {
      var tabs = tabsList.querySelectorAll('.landmark-tab');
      tabs.forEach(function (t, i) {
        var active = i === index;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    if (dotsWrap) {
      var dots = dotsWrap.querySelectorAll('.showcase-dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === index);
      });
    }
  }

  function renderTabsAndDots() {
    if (!tabsList) return;
    tabsList.innerHTML = '';
    if (dotsWrap) dotsWrap.innerHTML = '';

    data.landmarks.forEach(function (item, idx) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'landmark-tab' + (idx === 0 ? ' is-active' : '');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      tab.innerHTML =
        '<span class="tab-num">' +
        item.num +
        '</span><span class="tab-label">' +
        item.shortTitle +
        '</span>';
      tab.addEventListener('click', function () {
        var dir = idx > currentIndex ? 1 : -1;
        selectLandmark(idx, false, dir);
      });
      tabsList.appendChild(tab);

      if (dotsWrap) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'showcase-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', item.title);
        dot.addEventListener('click', function () {
          var dir = idx > currentIndex ? 1 : -1;
          selectLandmark(idx, false, dir);
        });
        dotsWrap.appendChild(dot);
      }
    });
  }

  function selectLandmark(nextIdx, immediate, direction) {
    var total = data.landmarks.length;
    var normalized = ((nextIdx % total) + total) % total;
    if (!immediate && normalized === currentIndex) return;

    var dir = direction || (normalized > currentIndex ? 1 : -1);
    currentIndex = normalized;
    var item = data.landmarks[currentIndex];

    if (immediate) {
      applyLandmarkContent(item, currentIndex);
      return;
    }

    clearTimeout(swapTimerOut);
    clearTimeout(swapTimerIn);
    swapToken += 1;
    var token = swapToken;

    clearTransitionClasses(mediaBlurWrap);
    clearTransitionClasses(textBlurWrap);

    var outClass = dir > 0 ? 'is-out-left' : 'is-out-right';
    var inClass = dir > 0 ? 'is-in-right' : 'is-in-left';

    mediaBlurWrap.classList.add(outClass);
    textBlurWrap.classList.add(outClass);

    swapTimerOut = setTimeout(function () {
      if (token !== swapToken) return;

      applyLandmarkContent(item, currentIndex);

      mediaBlurWrap.style.transition = 'none';
      textBlurWrap.style.transition = 'none';
      clearTransitionClasses(mediaBlurWrap);
      clearTransitionClasses(textBlurWrap);
      mediaBlurWrap.classList.add(inClass);
      textBlurWrap.classList.add(inClass);

      void mediaBlurWrap.offsetWidth;

      mediaBlurWrap.style.transition = '';
      textBlurWrap.style.transition = '';

      requestAnimationFrame(function () {
        if (token !== swapToken) return;
        clearTransitionClasses(mediaBlurWrap);
        clearTransitionClasses(textBlurWrap);
      });

      swapTimerIn = setTimeout(function () {
        if (token !== swapToken) return;
        clearTransitionClasses(mediaBlurWrap);
        clearTransitionClasses(textBlurWrap);
      }, 210);
    }, 155);
  }

  if (showcaseCard && tabsList) {
    renderTabsAndDots();
    selectLandmark(0, true);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      selectLandmark(currentIndex - 1, false, -1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      selectLandmark(currentIndex + 1, false, 1);
    });
  }

  if (showcaseCard) {
    showcaseCard.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectLandmark(currentIndex - 1, false, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectLandmark(currentIndex + 1, false, 1);
      }
    });

    var touchStartX = null;
    showcaseCard.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
        }
      },
      { passive: true }
    );
    showcaseCard.addEventListener('touchend', function (e) {
      if (touchStartX === null || !e.changedTouches || !e.changedTouches.length) {
        return;
      }
      var dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) > 48) {
        selectLandmark(
          dx > 0 ? currentIndex - 1 : currentIndex + 1,
          false,
          dx > 0 ? -1 : 1
        );
      }
    });
  }

  // --- 4. Chronicle Vertical Spine Timeline Rendering ---
  var chronicleList = document.getElementById('chronicle-list');
  if (chronicleList) {
    chronicleList.className = 'chronicle-timeline';
    chronicleList.innerHTML = data.chronicle
      .map(function (entry, idx) {
        var sideClass =
          idx % 2 === 0 ? 'chronicle-row--even' : 'chronicle-row--odd';
        return (
          '<article class="chronicle-row ' +
          sideClass +
          ' reveal-on-scroll" style="--stagger:' +
          idx +
          '">' +
          '<div class="chronicle-date-col">' +
          '<span class="chronicle-year">' +
          entry.year +
          '</span>' +
          '<span class="chronicle-era">' +
          entry.era +
          '</span>' +
          '</div>' +
          '<div class="chronicle-axis-col" aria-hidden="true">' +
          '<span class="chronicle-dot"></span>' +
          '</div>' +
          '<div class="chronicle-story-col">' +
          '<h3 class="chronicle-title">' +
          entry.title +
          '</h3>' +
          '<p class="chronicle-text">' +
          entry.text +
          '</p>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  // --- 5. Varied Cultural Heritage & Region Formats ---
  function renderCultureLexicon(block, idx) {
    return (
      '<section class="culture-lexicon reveal-on-scroll" style="--stagger:' +
      idx +
      '">' +
      '<div class="culture-block-head">' +
      '<span class="culture-tag">' +
      block.tag +
      '</span>' +
      '<h3 class="culture-title">' +
      block.title +
      '</h3>' +
      '</div>' +
      '<div class="lexicon-rows">' +
      block.entries
        .map(function (item) {
          return (
            '<div class="lexicon-row">' +
            '<span class="lexicon-num">' +
            item.num +
            '</span>' +
            '<div class="lexicon-body">' +
            '<strong class="lexicon-label">' +
            item.label +
            '</strong>' +
            '<p class="lexicon-text">' +
            item.text +
            '</p>' +
            '</div>' +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      '</section>'
    );
  }

  function renderCultureMetrics(block, idx) {
    return (
      '<section class="culture-metrics reveal-on-scroll" style="--stagger:' +
      idx +
      '">' +
      '<div class="culture-block-head">' +
      '<span class="culture-tag">' +
      block.tag +
      '</span>' +
      '<h3 class="culture-title">' +
      block.title +
      '</h3>' +
      '</div>' +
      '<div class="metrics-matrix">' +
      block.metrics
        .map(function (m) {
          return (
            '<div class="metric-cell">' +
            '<div class="metric-headline">' +
            '<span class="metric-figure">' +
            m.figure +
            '</span>' +
            '<span class="metric-unit">' +
            m.unit +
            '</span>' +
            '</div>' +
            '<p class="metric-text">' +
            m.text +
            '</p>' +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      '</section>'
    );
  }

  function renderCultureDirectory(block, idx) {
    return (
      '<section class="culture-directory reveal-on-scroll" style="--stagger:' +
      idx +
      '">' +
      '<div class="directory-head">' +
      '<span class="culture-tag">' +
      block.tag +
      '</span>' +
      '<h3 class="culture-title">' +
      block.title +
      '</h3>' +
      '</div>' +
      '<div class="directory-cols">' +
      block.places
        .map(function (p) {
          return (
            '<div class="directory-col">' +
            '<span class="directory-kicker">' +
            p.kicker +
            '</span>' +
            '<h4 class="directory-place-title">' +
            p.title +
            '</h4>' +
            '<p class="directory-text">' +
            p.text +
            '</p>' +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      '</section>'
    );
  }

  var cultureRenderers = {
    lexicon: renderCultureLexicon,
    metrics: renderCultureMetrics,
    directory: renderCultureDirectory
  };

  var cultureGrid = document.getElementById('culture-grid');
  if (cultureGrid && data.culturalFacts) {
    cultureGrid.className = 'culture-mosaic';
    cultureGrid.innerHTML = data.culturalFacts
      .map(function (block, idx) {
        var renderer = cultureRenderers[block.kind] || renderCultureLexicon;
        return renderer(block, idx);
      })
      .join('');
  }

  // --- 6. Initialize Real Google Street View & Maps Section ---
  if (typeof window.initKitsmanGoogleStreetView === 'function') {
    window.initKitsmanGoogleStreetView({
      onOpenLandmark: function (landmarkId) {
        var idx = data.landmarks.findIndex(function (item) {
          return item.id === landmarkId;
        });
        if (idx >= 0) {
          var target = document.getElementById('landmarks');
          if (target) {
            var y =
              target.getBoundingClientRect().top +
              (window.scrollY || window.pageYOffset || 0) -
              76;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          }
          var dir = idx >= currentIndex ? 1 : -1;
          selectLandmark(idx, false, dir);
        }
      }
    });
  }

  // --- 7. Archival Photo Lightbox Modal ---
  var lightbox = document.getElementById('photo-lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.classList.add('is-open');
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    setTimeout(function () {
      lightbox.hidden = true;
    }, 220);
  }

  var zoomShowcaseBtn = document.getElementById('showcase-zoom-btn');
  if (zoomShowcaseBtn) {
    zoomShowcaseBtn.addEventListener('click', function () {
      var item = data.landmarks[currentIndex];
      openLightbox(
        item.image,
        item.title + ' — ' + item.address + ' (' + item.year + ')'
      );
    });
  }

  document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
    el.addEventListener('click', function () {
      openLightbox(
        el.getAttribute('data-lightbox-src'),
        el.getAttribute('data-lightbox-caption')
      );
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });

  // --- 8. Smooth Anchor Scroll with Sticky Header Offset ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerOffset = id === '#hero' ? 0 : 76;
      var y =
        target.getBoundingClientRect().top +
        (window.scrollY || window.pageYOffset || 0) -
        headerOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      if (history && history.replaceState) {
        history.replaceState(null, '', id);
      }
    });
  });

  // --- 9. Scroll Reveal Animations ---
  var revealEls = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 40px 0px' }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // --- 10. Interactive Before/After Sliders (Education Page) ---
  document.querySelectorAll('.compare-container').forEach(function (box) {
    var range = box.querySelector('.compare-range');
    var afterPane = box.querySelector('.compare-pane--after');
    var line = box.querySelector('.compare-handle-line');
    var btn = box.querySelector('.compare-handle-btn');
    if (!range || !afterPane) return;

    function updateCompare(val) {
      var pct = Math.min(100, Math.max(0, parseFloat(val)));
      afterPane.style.clipPath = 'polygon(' + pct + '% 0, 100% 0, 100% 100%, ' + pct + '% 100%)';
      if (line) line.style.left = pct + '%';
      if (btn) btn.style.left = pct + '%';
    }

    range.addEventListener('input', function (e) {
      updateCompare(e.target.value);
    });
    range.addEventListener('change', function (e) {
      updateCompare(e.target.value);
    });
    updateCompare(range.value || 50);
  });

  // --- 11. Interactive Heraldry Inspector (Symbols Page) ---
  var heraldryItems = document.querySelectorAll('.heraldry-item');
  if (heraldryItems.length) {
    heraldryItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        heraldryItems.forEach(function (other) {
          other.style.opacity = other === item ? '1' : '0.65';
        });
      });
      item.addEventListener('mouseleave', function () {
        heraldryItems.forEach(function (other) {
          other.style.opacity = '1';
        });
      });
    });
  }
})();
