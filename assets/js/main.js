/*!
 * Kabash General Contractors & Designers (U) Ltd
 * Frontend interactions: mobile nav, smooth scroll, active link, counters, filters, Swiper, AOS, contact form
 */
(() => {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const header = qs('.site-header');
  const navToggle = qs('.nav__toggle');
  const navList = qs('#nav-menu');
  const navLinks = qsa('.nav__link');
  const yearEl = qs('#year');

  // Utilities
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  function getHeaderHeight() {
    return header ? header.offsetHeight : 0;
  }

  function scrollWithOffset(target) {
    if (!target) return;
    const headerH = getHeaderHeight();
    const y = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function closeMobileNav() {
    if (!navList) return;
    navList.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  function openMobileNav() {
    if (!navList) return;
    navList.classList.add('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
  }

  function toggleMobileNav() {
    if (!navList) return;
    const isOpen = navList.classList.contains('is-open');
    if (isOpen) closeMobileNav(); else openMobileNav();
  }

  function setActiveLinkByHash(hash) {
    navLinks.forEach(a => a.classList.remove('is-active'));
    const link = navLinks.find(a => (a.getAttribute('href') || '').split('#')[1] === (hash || '').replace('#',''));
    if (link) link.classList.add('is-active');
  }

  // Smooth scroll for internal anchors
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      const target = id ? document.getElementById(id) : null;

      if (target) {
        e.preventDefault();
        scrollWithOffset(target);
        history.pushState(null, '', `#${id}`);
        setActiveLinkByHash(`#${id}`);
        // Close nav on selection (mobile)
        if (window.innerWidth <= 760) closeMobileNav();
      }
    });
  }

  // Active nav link on scroll using IntersectionObserver
  function initSectionObserver() {
    const sections = [
      { id: 'home', el: qs('.hero') || qs('#home') },
      { id: 'about', el: qs('#about') },
      { id: 'services', el: qs('#services') },
      { id: 'projects', el: qs('#projects') },
      { id: 'contact', el: qs('#contact') },
    ].filter(s => s.el);

    // Fallback: mark Home active initially
    setActiveLinkByHash(location.hash || '#home');

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(en => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible[0]) {
        const match = sections.find(s => s.el === visible[0].target);
        if (match) setActiveLinkByHash(`#${match.id}`);
      }
    }, {
      root: null,
      // Top margin accounts for sticky header, bottom margin biases to section in viewport
      rootMargin: `-${getHeaderHeight() + 8}px 0px -60% 0px`,
      threshold: [0.25, 0.5, 0.75, 1]
    });

    sections.forEach(s => observer.observe(s.el));
    // Recompute margins on resize due to header height changes
    window.addEventListener('resize', () => {
      // No direct API to update rootMargin; recreate observer if needed (lightweight approach)
      observer.disconnect();
      initSectionObserver();
    }, { once: true });
  }

  function initMobileNav() {
    if (!navToggle || !navList) return;

    navToggle.addEventListener('click', () => {
      toggleMobileNav();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileNav();
    });

    // Close when clicking a nav link
    navList.addEventListener('click', (e) => {
      const link = e.target.closest('.nav__link');
      if (link) closeMobileNav();
    });
  }

  // Animated counters
  function animateCount(el, to, duration = 1200) {
    const start = 0;
    const startTime = performance.now();
    const formatter = new Intl.NumberFormat();

    function frame(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const value = Math.floor(start + (to - start) * progress);
      el.textContent = formatter.format(value);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatter.format(to);
      }
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    const nums = qsa('.stat__num');
    if (!nums.length) return;

    const done = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && !done.has(en.target)) {
          done.add(en.target);
          const to = parseInt(en.target.getAttribute('data-count') || '0', 10);
          if (!isNaN(to)) animateCount(en.target, to, 1400);
        }
      });
    }, { threshold: 0.4 });

    nums.forEach(n => io.observe(n));
  }

  // Swiper carousel
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;
    const el = qs('.featured');
    if (!el) return;

    // eslint-disable-next-line no-undef
    new Swiper(el, {
      loop: true,
      speed: 650,
      autoplay: { delay: 3000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      slidesPerView: 1,
      spaceBetween: 0
    });
  }

  // Project filters
  function initFilters() {
    const buttons = qsa('.filter');
    const items = qsa('.grid__item');
    if (!buttons.length || !items.length) return;

    function apply(filter) {
      buttons.forEach(b => b.classList.toggle('is-active', b.getAttribute('data-filter') === filter));
      items.forEach(it => {
        const cat = it.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        it.classList.toggle('is-hidden', !show);
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') || 'all';
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        apply(filter);
      });
    });

    // Initial state
    const active = buttons.find(b => b.classList.contains('is-active'));
    apply(active ? active.getAttribute('data-filter') || 'all' : 'all');
  }

  // AOS animations
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    // eslint-disable-next-line no-undef
    AOS.init({
      once: true,
      duration: 700,
      easing: 'ease-out-cubic',
      offset: 60
    });
  }

  // Contact form
  function initContactForm() {
    const form = qs('#contact-form');
    if (!form) return;

    const status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.style.marginTop = '8px';
    status.style.color = '#0D3B66';
    form.appendChild(status);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Use native validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      const prevText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      // Simulate async send
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = prevText;
        status.textContent = 'Thank you! Your message has been sent.';
        status.style.color = '#2a7a2a';
        form.reset();
      }, 900);
    });
  }

  // Footer year
  function initYear() {
    if (yearEl) {
      const y = new Date().getFullYear();
      yearEl.textContent = String(y);
    }
  }

  // Handle initial hash navigation with offset
  function handleInitialHash() {
    if (location.hash) {
      const el = qs(location.hash);
      if (el) {
        // Wait for layout and fonts to settle slightly
        setTimeout(() => scrollWithOffset(el), 50);
      }
    }
  }

  // Project gallery lightbox
  function initLightbox() {
    const lb = qs('.lightbox');
    const grid = qs('.projects .grid');
    if (!lb || !grid) return;

    const figures = qsa('.grid__item', grid);
    const imgs = figures.map(f => f.querySelector('img')).filter(Boolean);
    const names = figures.map(f => (f.querySelector('.name')?.textContent || '').trim());

    const imgEl = qs('.lightbox__img', lb);
    const capEl = qs('.lightbox__caption', lb);
    const btnClose = qs('.lightbox__close', lb);
    const btnPrev = qs('.lightbox__prev', lb);
    const btnNext = qs('.lightbox__next', lb);

    let index = 0;
    let open = false;

    function show(i) {
      if (!imgs.length) return;
      index = (i + imgs.length) % imgs.length;
      const src = imgs[index].getAttribute('src') || '';
      const alt = imgs[index].getAttribute('alt') || names[index] || '';
      imgEl.src = src;
      imgEl.alt = alt;
      capEl.textContent = names[index] || alt;
    }

    function openLb(i) {
      open = true;
      show(i);
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      btnClose.focus();
    }

    function closeLb() {
      open = false;
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      // Clear src to free memory
      imgEl.removeAttribute('src');
      imgEl.removeAttribute('alt');
    }

    // Click on figures to open
    figures.forEach((f, i) => {
      f.addEventListener('click', (e) => {
        const withinImg = e.target.closest('img');
        const withinFigure = e.currentTarget === f;
        if (withinImg || withinFigure) {
          e.preventDefault();
          openLb(i);
        }
      });
    });

    // Controls
    btnClose?.addEventListener('click', closeLb);
    btnPrev?.addEventListener('click', () => show(index - 1));
    btnNext?.addEventListener('click', () => show(index + 1));

    // Click outside (overlay)
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLb();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  // Back-to-top button
  function initToTop() {
    const btn = qs('.to-top');
    if (!btn) return;

    const reveal = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      btn.classList.toggle('is-show', y > 600);
    };

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', reveal, { passive: true });
    reveal();
  }

  // Header shrink on scroll (adds .is-scrolled to .site-header)
  function initHeaderScroll() {
    const headerEl = header;
    if (!headerEl) return;
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      headerEl.classList.toggle('is-scrolled', y > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Hero background rotation (crossfade) - reads images from data-hero-images on .hero
  function initHeroBackground() {
    const hero = qs('.hero');
    const layers = qsa('.hero__bg-layer', hero || document);
    if (!layers || layers.length < 2) return;

    // Parse CSV list from data-hero-images, allow spaces and mixed separators
    const raw = (hero?.dataset.heroImages || '')
      .split(/[,\n;]/)
      .map(s => s.trim())
      .filter(Boolean);

    // Always ensure there is at least one reliable fallback so the hero is never blank
    let images = raw.length ? ['assets/img/hero/hero-1.svg', ...raw] : ['assets/img/hero/hero-1.svg'];

    // Preload (non-blocking)
    images.forEach(src => { const i = new Image(); i.src = src; });

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let current = 0;
    let visible = 0;

    const tint = 'linear-gradient(180deg, rgba(13,59,102,.20), rgba(13,59,102,.60))';
    const setLayer = (layer, url) => {
      layer.style.backgroundImage = `${tint}, url("${url}")`;
    };

    // Initialize layers
    setLayer(layers[0], images[0]);
    setLayer(layers[1], images[images.length > 1 ? 1 : 0]);
    layers[0].classList.add('is-visible');

    // Interval from data-interval (ms), default 7000
    const parsedInterval = parseInt(hero?.dataset.interval || '7000', 10);
    const interval = Number.isFinite(parsedInterval) ? parsedInterval : 7000;

    // Respect reduced motion or single image by disabling rotation
    if (prefersReduced || images.length < 2) {
      return;
    }

    const swap = () => {
      const next = (current + 1) % images.length;
      const hidden = 1 - visible;
      setLayer(layers[hidden], images[next]);
      layers[hidden].classList.add('is-visible');
      layers[visible].classList.remove('is-visible');
      visible = hidden;
      current = next;
    };

    let timer = setInterval(swap, interval);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        timer = setInterval(swap, interval);
      }
    });
  }

  // Initialize
  function init() {
    initMobileNav();
    initSmoothScroll();
    initSectionObserver();
    initCounters();
    initSwiper();
    initFilters();
    initAOS();
    initContactForm();
    initLightbox();
    initHeroBackground();
    initToTop();
    initHeaderScroll();
    initYear();
    handleInitialHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();