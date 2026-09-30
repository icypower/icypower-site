/* =====================================================================
   Icy Power — private proposal template (renderer + behavior)
   Reads window.PROPOSAL (from the proposal folder's content.js) and builds
   the page. Shared by every proposal; content never lives in this file.

   · Accessible tabs (WAI-ARIA APG tabs pattern, automatic activation,
     arrow keys mirrored for RTL, Home/End).
   · Hero videos load only for the visible concept, are muted + playsinline,
     have a pause button, and never autoplay under prefers-reduced-motion
     or Save-Data.
   · Gallery opens in a native <dialog> lightbox (user-controlled only).
   ===================================================================== */
(function () {
  'use strict';

  var P = window.PROPOSAL;
  var root = document.getElementById('proposal-root');
  if (!P || !root) return;

  var events = (P.events || []).filter(Boolean);
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  function canAutoplay() { return !reduceMQ.matches && !saveData; }

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function has(a) { return Array.isArray(a) && a.length > 0; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function img(o, cls, eager) {
    if (!o || !o.src) return '';
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(o.src) + '" alt="' + esc(o.alt) + '"' +
      (eager ? '' : ' loading="lazy"') + ' decoding="async" />';
  }
  function initials(name) {
    var w = String(name || '').trim().split(/\s+/);
    return esc(((w[0] || '').charAt(0) + (w[1] || '').charAt(0)) || '·');
  }
  var ICON = {
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.2-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5z"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowNext: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowPrev: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  /* ---------------- templates ---------------- */
  function renderOpening() {
    var h = P.heroImage || {};
    return '' +
      '<header class="pp-top"><div class="pp-wrap">' +
        '<span class="pp-brand"><img src="/assets/img/icy_power_Logo.png" alt="" width="34" height="34" /><span>Icy Power</span></span>' +
      '</div></header>' +
      '<section class="pp-opening" aria-labelledby="pp-title">' +
        '<picture class="pp-opening-media">' +
          (h.srcMobile ? '<source media="(max-width: 760px)" srcset="' + esc(h.srcMobile) + '" />' : '') +
          '<img src="' + esc(h.src) + '" alt="' + esc(h.alt) + '" fetchpriority="high" decoding="async" />' +
        '</picture>' +
        '<div class="pp-scrim" aria-hidden="true"></div>' +
        '<div class="pp-wrap pp-opening-body">' +
          '<p class="pp-eyebrow pp-rise">' + esc(P.eyebrow || 'הצעה אישית') + '</p>' +
          '<h1 id="pp-title" class="pp-rise pp-rise-2"><span class="pp-for">עבור</span> ' + esc(P.client) + '</h1>' +
          (P.subtitle ? '<p class="pp-subtitle pp-rise pp-rise-3">' + esc(P.subtitle) + '</p>' : '') +
          (P.intro ? '<p class="pp-lead pp-rise pp-rise-4">' + esc(P.intro) + '</p>' : '') +
          '<a class="pp-down pp-rise pp-rise-4" href="#concepts">לקונספטים' + ICON.down + '</a>' +
        '</div>' +
      '</section>';
  }

  function renderTabs() {
    return events.map(function (ev, i) {
      var id = 'event-' + pad(i + 1);
      return '<button type="button" role="tab" class="pp-tab" id="tab-' + id + '" aria-controls="' + id + '" aria-selected="false" tabindex="-1">' +
        '<span class="pp-tab-num">' + esc(ev.label || ('אירוע ' + pad(i + 1))) + '</span>' +
        '<span class="pp-tab-name">' + esc(ev.name) + '</span>' +
      '</button>';
    }).join('');
  }

  function renderHero(ev, i) {
    var m = ev.hero || {};
    var media;
    if (m.type === 'video' && m.src) {
      media = '<video class="pp-ev-media" data-src="' + esc(m.src) + '"' + (m.poster ? ' poster="' + esc(m.poster) + '"' : '') +
        ' muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>' +
        (m.alt ? '<span class="pp-sr">' + esc(m.alt) + '</span>' : '') +
        '<button type="button" class="pp-vidbtn" aria-label="הפעלת הווידאו">' + ICON.play + '</button>';
    } else {
      media = img(m, 'pp-ev-media');
    }
    return '<header class="pp-ev-hero">' + media +
      '<div class="pp-scrim" aria-hidden="true"></div>' +
      '<div class="pp-wrap pp-ev-hero-body">' +
        '<p class="pp-eyebrow">' + esc(ev.label || ('אירוע ' + pad(i + 1))) + ' <span class="pp-of">/ ' + pad(events.length) + '</span></p>' +
        '<h2 class="pp-ev-title">' + esc(ev.name) + '</h2>' +
        (ev.tagline ? '<p class="pp-ev-tagline">' + esc(ev.tagline) + '</p>' : '') +
      '</div>' +
    '</header>';
  }

  function renderIntro(ev) {
    if (!ev.intro && !has(ev.facts)) return '';
    return '<section class="pp-sec pp-light pp-ev-intro"><div class="pp-wrap pp-intro-grid reveal">' +
      (ev.intro ? '<p class="pp-ev-lead">' + esc(ev.intro) + '</p>' : '') +
      (has(ev.facts) ? '<dl class="pp-facts">' + ev.facts.map(function (f) {
        return '<div><dt>' + esc(f.label) + '</dt><dd>' + esc(f.value) + '</dd></div>';
      }).join('') + '</dl>' : '') +
    '</div></section>';
  }

  function renderActivities(ev) {
    if (!has(ev.activities)) return '';
    return '<section class="pp-sec pp-light pp-ev-acts"><div class="pp-wrap">' +
      '<div class="pp-head reveal"><p class="pp-eyebrow">החוויה</p><h3>' + esc(ev.activitiesTitle || 'מה חווים באירוע') + '</h3></div>' +
      '<div class="pp-acts pp-acts-' + Math.min(ev.activities.length, 4) + '">' +
        ev.activities.map(function (a, k) {
          return '<article class="pp-act reveal d' + Math.min(k + 1, 4) + '">' +
            (a.image ? '<figure class="pp-act-media">' + img(a.image) + '</figure>' : '') +
            '<p class="pp-act-num">' + pad(k + 1) + '</p>' +
            '<h4>' + esc(a.name) + '</h4>' +
            (a.text ? '<p class="pp-act-text">' + esc(a.text) + '</p>' : '') +
          '</article>';
        }).join('') +
      '</div>' +
    '</div></section>';
  }

  function renderSchedule(ev) {
    if (!has(ev.schedule)) return '';
    return '<section class="pp-sec pp-dark pp-ev-flow"><div class="pp-wrap pp-flow-grid' + (ev.scheduleImage ? '' : ' pp-flow-solo') + '">' +
      '<div class="pp-flow-main">' +
        '<div class="pp-head reveal"><p class="pp-eyebrow">הזרימה</p><h3>' + esc(ev.scheduleTitle || 'מהלך האירוע') + '</h3>' +
          (ev.scheduleNote ? '<p class="pp-note">' + esc(ev.scheduleNote) + '</p>' : '') + '</div>' +
        '<ol class="pp-timeline">' + ev.schedule.map(function (s) {
          return '<li class="reveal"><span class="pp-time">' + esc(s.time) + '</span>' +
            '<div><p class="pp-step-title">' + esc(s.title) + '</p>' +
            (s.text ? '<p class="pp-step-text">' + esc(s.text) + '</p>' : '') + '</div></li>';
        }).join('') + '</ol>' +
      '</div>' +
      (ev.scheduleImage ? '<figure class="pp-flow-media reveal">' + img(ev.scheduleImage) + '</figure>' : '') +
    '</div></section>';
  }

  function renderPeopleAndFood(ev) {
    var hasF = has(ev.facilitators), food = ev.food;
    if (!hasF && !food) return '';
    var people = hasF ? '<div class="pp-people reveal">' +
        '<p class="pp-eyebrow">המנחים</p><h3>' + esc(ev.facilitatorsTitle || 'מי מוביל את האירוע') + '</h3>' +
        '<ul class="pp-people-list">' + ev.facilitators.map(function (f) {
          return '<li><div class="pp-avatar">' + (f.photo ? img({ src: f.photo, alt: '' }) : '<span aria-hidden="true">' + initials(f.name) + '</span>') + '</div>' +
            '<div><p class="pp-person-name">' + esc(f.name) + '</p>' +
            (f.role ? '<p class="pp-person-role">' + esc(f.role) + '</p>' : '') +
            (f.bio ? '<p class="pp-person-bio">' + esc(f.bio) + '</p>' : '') + '</div></li>';
        }).join('') + '</ul></div>' : '';
    var foodHtml = food ? '<div class="pp-food reveal d1">' +
        (food.image ? '<figure class="pp-food-media">' + img(food.image) + '</figure>' : '') +
        '<p class="pp-eyebrow">השולחן</p><h3>' + esc(food.title || 'אוכל ושתייה') + '</h3>' +
        (food.text ? '<p class="pp-food-text">' + esc(food.text) + '</p>' : '') +
        (has(food.items) ? '<ul class="pp-food-items">' + food.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      '</div>' : '';
    return '<section class="pp-sec pp-light2 pp-ev-people"><div class="pp-wrap pp-pf-grid' + (hasF && food ? '' : ' pp-pf-solo') + '">' + people + foodHtml + '</div></section>';
  }

  function renderGallery(ev, i) {
    if (!has(ev.gallery)) return '';
    var n = Math.min(ev.gallery.length, 6);
    return '<section class="pp-sec pp-dark pp-ev-gallery"><div class="pp-wrap">' +
      '<div class="pp-head reveal"><p class="pp-eyebrow">גלריה</p><h3>' + esc(ev.galleryTitle || 'רגעים מאירועים קודמים') + '</h3></div>' +
      '<ul class="pp-gallery pp-gallery-' + n + '" data-event="' + i + '">' +
        ev.gallery.map(function (g, k) {
          return '<li class="reveal d' + Math.min(k + 1, 4) + '"><button type="button" class="pp-gtile" data-index="' + k + '" aria-label="הגדלת תמונה ' + (k + 1) + ' מתוך ' + ev.gallery.length + (g.alt ? ': ' + esc(g.alt) : '') + '">' +
            img({ src: g.src, alt: '' }) + '</button></li>';
        }).join('') +
      '</ul>' +
      '<p class="pp-swipe-hint" aria-hidden="true">החליקו לתמונות נוספות</p>' +
    '</div></section>';
  }

  function renderNext(i) {
    if (events.length < 2) return '';
    var last = i === events.length - 1;
    var ni = last ? 0 : i + 1, nev = events[ni];
    return '<nav class="pp-sec pp-light pp-ev-next" aria-label="מעבר בין קונספטים"><div class="pp-wrap">' +
      '<button type="button" class="pp-next" data-go="' + ni + '">' +
        '<span class="pp-next-kicker">' + (last ? 'חזרה לקונספט הראשון' : 'לקונספט הבא') + '</span>' +
        '<span class="pp-next-name">' + esc(nev.label || '') + ' · ' + esc(nev.name) + ICON.arrowNext + '</span>' +
      '</button>' +
    '</div></nav>';
  }

  function renderPanel(ev, i) {
    var id = 'event-' + pad(i + 1);
    return '<div class="pp-panel" role="tabpanel" id="' + id + '" aria-labelledby="tab-' + id + '" tabindex="0" hidden>' +
      '<article>' + renderHero(ev, i) + renderIntro(ev) + renderActivities(ev) + renderSchedule(ev) +
      renderPeopleAndFood(ev) + renderGallery(ev, i) + renderNext(i) + '</article></div>';
  }

  root.innerHTML = renderOpening() +
    '<main id="concepts" class="pp-concepts" tabindex="-1">' +
      '<div class="pp-tabbar"><div class="pp-wrap"><div class="pp-tabs" role="tablist" aria-label="קונספטים לאירוע">' + renderTabs() + '</div></div></div>' +
      events.map(renderPanel).join('') +
    '</main>' +
    '<footer class="pp-footer"><div class="pp-wrap">' +
      '<span class="pp-brand"><img src="/assets/img/icy_power_Logo.png" alt="" width="30" height="30" loading="lazy" /><span>Icy Power</span></span>' +
      (P.footerNote ? '<p>' + esc(P.footerNote) + '</p>' : '') +
    '</div></footer>' +
    '<dialog class="pp-lightbox" aria-label="תמונה מוגדלת">' +
      '<figure><img alt="" /><figcaption></figcaption></figure>' +
      '<p class="pp-lb-count" aria-live="polite"></p>' +
      '<button type="button" class="pp-lb-btn pp-lb-close" aria-label="סגירה">' + ICON.close + '</button>' +
      '<button type="button" class="pp-lb-btn pp-lb-prev" aria-label="התמונה הקודמת">' + ICON.arrowPrev + '</button>' +
      '<button type="button" class="pp-lb-btn pp-lb-next" aria-label="התמונה הבאה">' + ICON.arrowNext + '</button>' +
    '</dialog>';

  document.title = (P.eyebrow || 'הצעה אישית') + ' · ' + P.client + ' · Icy Power';

  /* ---------------- tabs ---------------- */
  var tabs = [].slice.call(root.querySelectorAll('.pp-tab'));
  var panels = [].slice.call(root.querySelectorAll('.pp-panel'));
  var tablist = root.querySelector('.pp-tabs');
  var tabbar = root.querySelector('.pp-tabbar');
  var current = -1;

  function behavior() { return reduceMQ.matches ? 'auto' : 'smooth'; }

  function keepTabVisible(tab) {
    var tr = tab.getBoundingClientRect(), lr = tablist.getBoundingClientRect();
    if (tr.left < lr.left + 8 || tr.right > lr.right - 8) {
      tablist.scrollBy({ left: (tr.left + tr.width / 2) - (lr.left + lr.width / 2), behavior: behavior() });
    }
  }

  function panelTop(i) {
    return panels[i].getBoundingClientRect().top + window.pageYOffset - tabbar.offsetHeight + 1;
  }

  function select(i, opts) {
    opts = opts || {};
    if (i < 0 || i >= panels.length) return;
    var changed = i !== current;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p, k) {
      if (k === i) {
        p.hidden = false;
        if (changed && current !== -1 && !reduceMQ.matches) {
          p.classList.remove('pp-enter');
          void p.offsetWidth; // restart the fade
          p.classList.add('pp-enter');
        }
      } else {
        p.hidden = true;
      }
    });
    current = i;
    if (opts.focus) tabs[i].focus({ preventScroll: true });
    keepTabVisible(tabs[i]);
    if (opts.hash !== false) {
      try { history.replaceState(null, '', '#' + panels[i].id); } catch (e) {}
    }
    var top = panelTop(i);
    // if the reader is already inside the concepts (tab bar pinned), bring the new concept's top into view
    var inside = tabbar.classList.contains('is-stuck') || window.pageYOffset > top + 2;
    if (opts.scroll === 'always' || (opts.scroll !== 'never' && inside)) {
      window.scrollTo({ top: top, behavior: behavior() });
    }
    syncVideos();
  }

  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { select(k); });
  });
  tablist.addEventListener('keydown', function (e) {
    var k = tabs.indexOf(document.activeElement);
    if (k < 0) return;
    var n = tabs.length, to = null;
    // RTL: the next tab sits to the left, so ArrowLeft moves forward.
    if (e.key === 'ArrowLeft') to = (k + 1) % n;
    else if (e.key === 'ArrowRight') to = (k - 1 + n) % n;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = n - 1;
    if (to === null) return;
    e.preventDefault();
    select(to, { focus: true });
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pp-next');
    if (!b) return;
    select(+b.getAttribute('data-go'), { focus: true, scroll: 'always' });
  });

  // sticky tab bar: add a hairline shadow once it is pinned
  if ('IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.className = 'pp-sentinel';
    tabbar.parentNode.insertBefore(sentinel, tabbar);
    new IntersectionObserver(function (en) {
      tabbar.classList.toggle('is-stuck', !en[0].isIntersecting && en[0].boundingClientRect.top < 0);
    }).observe(sentinel);
  }

  /* ---------------- hero videos ---------------- */
  var videos = [].slice.call(root.querySelectorAll('video.pp-ev-media')).map(function (v) {
    var btn = v.parentNode.querySelector('.pp-vidbtn');
    var st = { v: v, btn: btn, userPaused: false, visible: false };
    function paint() {
      var playing = !v.paused && !v.ended;
      btn.innerHTML = playing ? ICON.pause : ICON.play;
      btn.setAttribute('aria-label', playing ? 'השהיית הווידאו' : 'הפעלת הווידאו');
    }
    v.addEventListener('play', paint);
    v.addEventListener('pause', paint);
    btn.addEventListener('click', function () {
      if (!v.paused) { st.userPaused = true; v.pause(); }
      else { st.userPaused = false; start(st, true); }
    });
    return st;
  });

  function start(st, byUser) {
    var v = st.v;
    if (!v.getAttribute('src')) { v.setAttribute('src', v.getAttribute('data-src')); v.preload = 'auto'; }
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: poster + play button stay */ });
  }

  function syncVideos() {
    videos.forEach(function (st) {
      var panel = st.v.closest('.pp-panel');
      var active = panel && !panel.hidden;
      if (active && st.visible && !st.userPaused && canAutoplay()) start(st);
      else if (!st.v.paused) st.v.pause();
    });
  }

  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        videos.forEach(function (st) { if (st.v === en.target) st.visible = en.isIntersecting; });
      });
      syncVideos();
    }, { rootMargin: '120px 0px', threshold: 0.15 });
    videos.forEach(function (st) { vio.observe(st.v); });
  }
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', syncVideos);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) videos.forEach(function (st) { st.v.pause(); }); else syncVideos();
  });

  /* ---------------- reveal on scroll (reuses the site's .reveal) ---------------- */
  var reveals = [].slice.call(root.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMQ.matches) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- lightbox ---------------- */
  var lb = root.querySelector('.pp-lightbox');
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbCount = lb.querySelector('.pp-lb-count');
  var lbSet = [], lbI = 0, lbReturn = null;

  function lbShow(k) {
    lbI = (k + lbSet.length) % lbSet.length;
    var g = lbSet[lbI];
    lbImg.src = g.src; lbImg.alt = g.alt || '';
    lbCap.textContent = g.caption || '';
    lbCap.hidden = !g.caption;
    lbCount.textContent = (lbI + 1) + ' / ' + lbSet.length;
  }
  function lbOpen(evIndex, k, from) {
    lbSet = events[evIndex].gallery || [];
    if (!lbSet.length) return;
    lbReturn = from;
    lbShow(k);
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    document.documentElement.classList.add('pp-locked');
  }
  function lbClose() { if (lb.open) { if (lb.close) lb.close(); else lb.removeAttribute('open'); } }
  lb.addEventListener('close', function () {
    document.documentElement.classList.remove('pp-locked');
    if (lbReturn) lbReturn.focus();
  });
  root.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.pp-gtile');
    if (!t) return;
    lbOpen(+t.closest('.pp-gallery').getAttribute('data-event'), +t.getAttribute('data-index'), t);
  });
  lb.querySelector('.pp-lb-close').addEventListener('click', lbClose);
  lb.querySelector('.pp-lb-next').addEventListener('click', function () { lbShow(lbI + 1); });
  lb.querySelector('.pp-lb-prev').addEventListener('click', function () { lbShow(lbI - 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbShow(lbI + 1); }       // RTL: left = next
    else if (e.key === 'ArrowRight') { e.preventDefault(); lbShow(lbI - 1); }
    else if (e.key === 'Escape' && !lb.showModal) lbClose();
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) lbShow(lbI + (dx > 0 ? 1 : -1)); // RTL: drag right reveals the next photo
  }, { passive: true });

  /* ---------------- initial state ---------------- */
  var start0 = 0;
  var m = /^#event-(\d+)$/.exec(location.hash);
  if (m && +m[1] >= 1 && +m[1] <= panels.length) start0 = +m[1] - 1;
  select(start0, { hash: false, scroll: 'never' });
  if (m) {
    requestAnimationFrame(function () {
      window.scrollTo({ top: root.querySelector('#concepts').getBoundingClientRect().top + window.pageYOffset, behavior: 'auto' });
    });
  }
})();
