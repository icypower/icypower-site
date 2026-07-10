/* IcyPower - shared site behaviour (vanilla, light) */
(function () {
  'use strict';

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
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- gallery lightbox ---- */
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var lbImg = lb.querySelector('.lb-img');
    document.querySelectorAll('.gtile').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var ph = tile.querySelector('.ph');
        if (ph && lbImg) { lbImg.style.backgroundImage = ph.style.backgroundImage; }
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb-close')) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---- whatsapp: attach a friendly prefilled message to every wa.me link ---- */
  var waMsg = encodeURIComponent('היי IcyPower! אשמח לשמוע פרטים על חוויית אמבט הקרח והנשימות!');
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
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { clearInterval(timer); showSlide(i); timer = setInterval(function () { showSlide(cur + 1); }, 2000); });
    });
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
  }

  /* ---- contact form: submit via fetch, no page navigation ---- */
  var contactForm = document.getElementById('contactForm');
  var formToast = document.getElementById('formToast');
  var toastTimer;
  if (contactForm && formToast) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
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
