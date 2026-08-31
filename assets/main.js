/* Icy Power - shared site behaviour (vanilla, light) */
(function () {
  'use strict';

  /* ---- skip to content (accessibility: lets keyboard/screen-reader users
     bypass the header nav instead of tabbing through it every page load) ---- */
  (function skipLink() {
    var nav = document.querySelector('header.nav');
    var target = nav ? nav.nextElementSibling : document.body.firstElementChild;
    if (!target) return;
    if (!target.hasAttribute('id')) target.id = 'main-content';
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    var link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#' + target.id;
    link.textContent = 'דלג לתוכן הראשי';
    document.body.insertBefore(link, document.body.firstChild);
  })();

  /* ---- nav: solidify on scroll ---- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  /* ---- scroll reveal ---- */
  /* the intro section sits right under the hero and should fade in with
     the page load itself, not wait for the user to scroll to it */
  var introSection = document.querySelector('.section.intro');
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (introSection) {
    reveals = reveals.filter(function (el) {
      if (introSection.contains(el)) { el.classList.add('in'); return false; }
      return true;
    });
  }
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px 0px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- gallery lightbox ---- */
  /* the lightbox markup only lived on gallery.html, so clicking a tile in
     the homepage's own gallery preview ("the first gallery") did nothing -
     build the same markup here if a page has .gtile tiles but no lightbox
     of its own, so every gallery grid on the site can enlarge its photos */
  var lb = document.querySelector('.lightbox');
  if (!lb && document.querySelector('.gtile')) {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.id = 'lightbox';
    lb.innerHTML = '<button class="lb-close" aria-label="סגור"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="lb-img"></div>';
    document.body.appendChild(lb);
  }
  if (lb) {
    var lbImg = lb.querySelector('.lb-img');
    document.querySelectorAll('.gtile').forEach(function (tile) {
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('aria-label', 'הגדלת תמונה');
      function openTile() {
        var ph = tile.querySelector('.ph');
        if (ph && lbImg) { lbImg.style.backgroundImage = ph.style.backgroundImage; }
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      tile.addEventListener('click', openTile);
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTile(); }
      });
    });
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb-close')) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---- swipe: lets touch users drag between carousel slides, not just tap the arrows ---- */
  function addSwipe(el, onLeft, onRight) {
    if (!el) return;
    var startX = 0, startY = 0, tracking = false;
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });
    /* touchend must be non-passive: after a recognized swipe we preventDefault
       it so iOS doesn't also fire its usual "ghost" click on whichever card
       ended up under the finger once the coverflow re-positioned - without
       this, a swipe advanced the carousel and was then immediately followed
       by a second, wrong jump from that synthetic click. */
    el.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return; /* mostly-vertical drags stay a page scroll */
      e.preventDefault();
      if (dx < 0) { onLeft(); } else { onRight(); }
    }, { passive: false });
  }

  /* ---- whatsapp: attach a friendly prefilled message to every wa.me link ---- */
  var waMsg = encodeURIComponent('היי Icy Power! אשמח לשמוע פרטים על חוויית אמבט הקרח והנשימות!');
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    if (a.href.indexOf('text=') === -1) {
      a.href += (a.href.indexOf('?') === -1 ? '?' : '&') + 'text=' + waMsg;
    }
  });

  /* ---- year in footer ---- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ---- FAQ accordion (single-open) ---- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      faqItems.forEach(function (other) { other.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---- hero video: instant hard-cut switching between clips ----
     Two stacked <video> elements swap which one is "active" (opacity 1,
     no transition - an instant cut, not a fade). The next clip is
     preloaded into the hidden element while the visible one is still
     playing, so by the time we switch, the new clip is already loaded
     and playing underneath - no flash of black/blank. */
  var heroVidA = document.getElementById('heroVideoA');
  var heroVidB = document.getElementById('heroVideoB');
  if (heroVidA && heroVidB) {
    var heroClips = [
      'assets/video/hero-9.mp4',
      'assets/video/hero-7.mp4',
      'assets/video/hero-13.mp4',
      'assets/video/hero-11.mp4',
      'assets/video/hero-2.mp4',
      'assets/video/hero-3.mp4',
      'assets/video/hero-4.mp4',
      'assets/video/hero-5.mp4',
      'assets/video/hero-14.mp4',
      'assets/video/hero-10.mp4',
      'assets/video/hero-15.mp4'
    ];
    var heroIndex = 0;
    var heroCurrent = heroVidA;
    var heroNext = heroVidB;

    function heroQueueNext() {
      var nextIndex = (heroIndex + 1) % heroClips.length;
      heroNext.src = heroClips[nextIndex];
      heroNext.load();
    }

    function heroSwitch() {
      heroIndex = (heroIndex + 1) % heroClips.length;
      var incoming = heroNext;
      var outgoing = heroCurrent;
      // don't touch currentTime here - load() already reset it to 0 when
      // this clip was queued earlier; forcing another seek right at the
      // switch moment caused a brief decode stall. Only reveal it once
      // play() confirms playback has actually started.
      var playPromise = incoming.play();
      function reveal() {
        incoming.classList.add('is-active');
        outgoing.classList.remove('is-active');
      }
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(reveal).catch(reveal);
      } else {
        reveal();
      }
      heroCurrent = incoming;
      heroNext = outgoing;
      // the switch is instant (no fade), so the outgoing clip is already
      // invisible immediately - safe to reuse it as the preload buffer
      // right away instead of waiting for a transition to finish
      heroQueueNext();
    }

    heroVidA.addEventListener('ended', heroSwitch);
    heroVidB.addEventListener('ended', heroSwitch);

    heroCurrent.src = heroClips[0];
    heroCurrent.play();
    heroQueueNext();

    // Mobile browsers (iOS Safari, Chrome Android) pause videos when the app
    // is backgrounded. Resume the active clip when the user returns.
    function heroResume() {
      if (!document.hidden && heroCurrent.paused) {
        heroCurrent.play();
      }
    }
    document.addEventListener('visibilitychange', heroResume);
    // pageshow fires on back-forward cache restore (bfcache) — visibilitychange
    // alone doesn't always fire in that case on iOS Safari.
    window.addEventListener('pageshow', heroResume);

    // iOS Low Power Mode (and some strict autoplay settings) block automatic
    // playback entirely - the video loads its first frame but won't start on
    // its own. iOS DOES allow play() when it's triggered by a user gesture,
    // even in Low Power Mode. So on the very first interaction anywhere on the
    // page (a tap, a scroll, a touch), kick the video into playing. Since
    // visitors almost always touch/scroll immediately, this makes the hero
    // video play even in Low Power Mode, right after they engage with the page.
    function heroKick() {
      if (heroCurrent.paused) { heroCurrent.play(); }
    }
    var kickEvents = ['touchstart', 'click', 'scroll', 'keydown'];
    function heroKickOnce() {
      heroKick();
      kickEvents.forEach(function (ev) {
        window.removeEventListener(ev, heroKickOnce);
      });
    }
    kickEvents.forEach(function (ev) {
      window.addEventListener(ev, heroKickOnce, { passive: true });
    });
  }

  /* ---- intro photo carousel ---- */
  var slides = document.querySelectorAll('.carousel-slide');
  var dots = document.querySelectorAll('.carousel-dots .dot');
  if (slides.length) {
    var cur = 0;
    function showSlide(n) {
      slides[cur].classList.remove('active');
      dots[cur] && dots[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dots[cur] && dots[cur].classList.add('active');
    }
    showSlide(0);
    var timer = setInterval(function () { showSlide(cur + 1); }, 2000);
    function restartTimer() { clearInterval(timer); timer = setInterval(function () { showSlide(cur + 1); }, 2000); }
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { showSlide(i); restartTimer(); });
    });
    var introCarousel = document.querySelector('.intro-carousel');
    addSwipe(introCarousel,
      function () { showSlide(cur + 1); restartTimer(); },
      function () { showSlide(cur - 1); restartTimer(); }
    );
  }

  /* ---- logo coverflow carousel: center card largest, arrows + click-to-jump ---- */
  var logoStage = document.getElementById('logoStage');
  var logoCards = logoStage ? Array.prototype.slice.call(logoStage.querySelectorAll('.logo-card')) : [];
  if (logoStage && logoCards.length) {
    var logoActive = 0;
    var logoCount = logoCards.length;
    function renderLogos() {
      logoCards.forEach(function (card, i) {
        var offset = i - logoActive;
        if (offset > logoCount / 2) offset -= logoCount;
        if (offset < -logoCount / 2) offset += logoCount;
        card.className = 'logo-card pos-' + offset;
      });
    }
    var logoTimer;
    function goLogo(delta) {
      logoActive = (logoActive + delta + logoCount) % logoCount;
      renderLogos();
    }
    function resetLogoTimer() {
      clearInterval(logoTimer);
      logoTimer = setInterval(function () { goLogo(1); }, 3200);
    }
    renderLogos();
    resetLogoTimer();
    var prevBtn = document.querySelector('.logo-nav.prev');
    var nextBtn = document.querySelector('.logo-nav.next');
    if (prevBtn) prevBtn.addEventListener('click', function () { goLogo(-1); resetLogoTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goLogo(1); resetLogoTimer(); });
    logoCards.forEach(function (card, i) {
      card.addEventListener('click', function () { logoActive = i; renderLogos(); resetLogoTimer(); });
    });
    addSwipe(logoStage, function () { goLogo(1); resetLogoTimer(); }, function () { goLogo(-1); resetLogoTimer(); });
  }

  /* ---- WhatsApp screenshot coverflow ---- */
  var waStage = document.getElementById('waStage');
  var waShotCards = waStage ? Array.prototype.slice.call(waStage.querySelectorAll('.wa-shot-card')) : [];
  if (waStage && waShotCards.length) {
    var waActive = 0;
    var waCount = waShotCards.length;
    function renderWa() {
      waShotCards.forEach(function (card, i) {
        var offset = i - waActive;
        if (offset > waCount / 2) offset -= waCount;
        if (offset < -waCount / 2) offset += waCount;
        card.className = 'wa-shot-card pos-' + offset;
      });
    }
    function goWa(delta) {
      waActive = (waActive + delta + waCount) % waCount;
      renderWa();
    }
    renderWa();
    var waPrev = document.querySelector('.wa-nav.prev');
    var waNext = document.querySelector('.wa-nav.next');
    if (waPrev) waPrev.addEventListener('click', function () { goWa(-1); });
    if (waNext) waNext.addEventListener('click', function () { goWa(1); });
    waShotCards.forEach(function (card, i) {
      card.addEventListener('click', function () { if (i !== waActive) { waActive = i; renderWa(); } });
    });
    addSwipe(waStage, function () { goWa(1); }, function () { goWa(-1); });
  }

  /* ---- back to top ---- */
  /* injected once here (rather than pasted into every page) so it shows up
     site-wide from a single change */
  var backTop = document.createElement('button');
  backTop.className = 'back-to-top';
  backTop.type = 'button';
  backTop.setAttribute('aria-label', 'חזרה לראש העמוד');
  backTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(backTop);
  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', function () {
    backTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });

  /* ---- accessibility widget ----
     A small self-contained toolbar (bigger text, high contrast, underlined
     links, reduced motion) - injected site-wide the same way as the
     back-to-top button. Preferences persist per-device via localStorage and
     are re-applied as classes on <html> so the CSS in styles.css can react. */
  (function a11yWidget() {
    var STORAGE_KEY = 'icypower_a11y';
    var TEXT_CLASSES = ['a11y-text-lg', 'a11y-text-xl'];

    function readPrefs() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
      catch (e) { return {}; }
    }
    function savePrefs(p) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
    }
    function applyPrefs(p) {
      var root = document.documentElement;
      TEXT_CLASSES.forEach(function (c) { root.classList.remove(c); });
      if (p.textSize === 'lg') root.classList.add('a11y-text-lg');
      if (p.textSize === 'xl') root.classList.add('a11y-text-xl');
      root.classList.toggle('a11y-contrast', !!p.contrast);
      root.classList.toggle('a11y-underline', !!p.underline);
      root.classList.toggle('a11y-motion-off', !!p.motionOff);
    }

    var prefs = readPrefs();
    applyPrefs(prefs);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'a11y-toggle';
    toggle.setAttribute('aria-label', 'תפריט נגישות');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M19 8c-3 1-4.5 1-7 1s-4-0-7-1"/><path d="M12 9v5"/><path d="m8 21 2-7"/><path d="m16 21-2-7"/><path d="M9 12H5"/><path d="M19 12h-4"/></svg>';

    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'הגדרות נגישות');
    panel.innerHTML =
      '<h3>נגישות</h3>' +
      '<div class="a11y-row"><span>גודל טקסט</span><div class="a11y-btns">' +
        '<button type="button" class="a11y-opt" data-text="normal">רגיל</button>' +
        '<button type="button" class="a11y-opt" data-text="lg">גדול</button>' +
        '<button type="button" class="a11y-opt" data-text="xl">גדול מאוד</button>' +
      '</div></div>' +
      '<div class="a11y-row"><span>ניגודיות גבוהה</span><button type="button" class="a11y-opt" data-toggle="contrast">הפעל/כבה</button></div>' +
      '<div class="a11y-row"><span>קו תחתון לקישורים</span><button type="button" class="a11y-opt" data-toggle="underline">הפעל/כבה</button></div>' +
      '<div class="a11y-row"><span>עצירת אנימציות</span><button type="button" class="a11y-opt" data-toggle="motionOff">הפעל/כבה</button></div>' +
      '<button type="button" class="a11y-reset">איפוס הגדרות</button>';

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    function syncButtons() {
      panel.querySelectorAll('[data-text]').forEach(function (b) {
        b.classList.toggle('active', (prefs.textSize || 'normal') === b.getAttribute('data-text'));
      });
      panel.querySelectorAll('[data-toggle]').forEach(function (b) {
        b.classList.toggle('active', !!prefs[b.getAttribute('data-toggle')]);
      });
    }
    syncButtons();

    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    panel.querySelectorAll('[data-text]').forEach(function (b) {
      b.addEventListener('click', function () {
        prefs.textSize = b.getAttribute('data-text');
        applyPrefs(prefs); savePrefs(prefs); syncButtons();
      });
    });
    panel.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-toggle');
        prefs[key] = !prefs[key];
        applyPrefs(prefs); savePrefs(prefs); syncButtons();
      });
    });
    panel.querySelector('.a11y-reset').addEventListener('click', function () {
      prefs = {};
      applyPrefs(prefs); savePrefs(prefs); syncButtons();
    });
  })();

  /* ---- contact form: submit via fetch, no page navigation ---- */
  var contactForm = document.getElementById('contactForm');
  var formToast = document.getElementById('formToast');
  var toastTimer;
  if (contactForm && formToast) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      /* give each submission a unique subject line so Gmail doesn't group
         every lead into one long conversation thread */
      var subjectField = contactForm.querySelector('input[name="_subject"]');
      if (subjectField) {
        var nameField = contactForm.querySelector('#name');
        var nameVal = (nameField && nameField.value) ? nameField.value : 'ליד חדש';
        var stamp = new Date().toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        subjectField.value = 'ליד חדש מאתר Icy Power - ' + nameVal + ' - ' + stamp;
      }
      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        mode: 'no-cors'
      }).then(function () {
        contactForm.reset();
        if (submitBtn) submitBtn.disabled = false;
        clearTimeout(toastTimer);
        formToast.classList.add('show');
        toastTimer = setTimeout(function () { formToast.classList.remove('show'); }, 5000);
      }).catch(function () {
        // fall back to a normal submit if the request itself failed
        contactForm.submit();
      });
    });
  }
})();
