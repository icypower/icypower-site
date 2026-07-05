/* IcyPower — shared site behaviour (vanilla, light) */
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
})();
