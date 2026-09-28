/* ═══════════════════════════════════════════════════════════════
   BAITULLAH TRAVEL — main.js v2
   Stack: GSAP 3.12 + ScrollTrigger + Lenis + SplitType
   Animasi: Page Loader → Lenis Smooth → GSAP Reveal →
            SplitType Text → Parallax → Pinned Story →
            Horizontal Journey → Testimonial Slider
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── HELPERS ─── */
const qs  = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];
const isMobile = () => window.innerWidth <= 768;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════════════════
   0. GSAP REGISTER
═══════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════
   1. PAGE LOADER
═══════════════════════════════════════════════════ */
function initLoader() {
  const loader  = qs('#page-loader');
  const bar     = qs('#loader-bar');
  const text    = qs('#loader-text');
  const body    = document.body;
  if (!loader || !bar) return;

  const messages = [
    'Mempersiapkan Perjalanan...',
    'Menyiapkan Tanah Suci...',
    'Selamat Datang...',
  ];
  let msgIdx = 0;
  let progress = 0;

  const msgTimer = setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length;
    if (text) text.textContent = messages[msgIdx];
  }, 700);

  // Fake progress
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      clearInterval(msgTimer);

      bar.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('done');
        body.classList.remove('is-loading');
        initAfterLoad();
      }, 500);
    }
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, 140);
}

/* ═══════════════════════════════════════════════════
   2. LENIS SMOOTH SCROLL + GSAP SYNC
═══════════════════════════════════════════════════ */
let lenis;

function initLenis() {
  if (prefersReduced) return;

  // Initialize Lenis with autoRaf: false so GSAP ticker is the single master clock
  lenis = new Lenis({
    autoRaf: false,
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  // Synchronize Lenis scroll position with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Single unified rAF loop driven by GSAP ticker (Lenis expects milliseconds)
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable lag smoothing to prevent stutter/drift on frame drops
  gsap.ticker.lagSmoothing(0);
}

/* ═══════════════════════════════════════════════════
   3. CUSTOM CURSOR (GPU Accelerated with quickSetter)
═══════════════════════════════════════════════════ */
function initCursor() {
  const cursor    = qs('#cursor');
  const cursorDot = qs('#cursor-dot');
  if (!cursor || !cursorDot || isMobile()) return;

  const setCursorX = gsap.quickSetter(cursor, 'x', 'px');
  const setCursorY = gsap.quickSetter(cursor, 'y', 'px');
  const setDotX    = gsap.quickSetter(cursorDot, 'x', 'px');
  const setDotY    = gsap.quickSetter(cursorDot, 'y', 'px');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  setDotX(mx);
  setDotY(my);
  setCursorX(cx);
  setCursorY(cy);

  const onMove = (e) => {
    mx = e.clientX;
    my = e.clientY;
    setDotX(mx);
    setDotY(my);
  };
  window.addEventListener('mousemove', onMove, { passive: true });

  // Smooth cursor follow with GSAP ticker without layout reflows
  gsap.ticker.add(() => {
    cx += (mx - cx) * 0.16;
    cy += (my - cy) * 0.16;
    setCursorX(cx);
    setCursorY(cy);
  });

  // Hover effects
  const links = qsa('a, button, .pkg, .mengapa-card, .journey-step, input, select, textarea');
  links.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
}

/* ═══════════════════════════════════════════════════
   4. NAV — scroll state + luxury mobile drawer
═══════════════════════════════════════════════════ */
function initNav() {
  const nav     = qs('#main-nav');
  const burger  = qs('#nav-burger');
  const wrapper = qs('#nav-menu-wrapper');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      nav.classList.toggle('scrolled', self.scroll() > 80);
    }
  });

  burger?.addEventListener('click', () => {
    const open = wrapper?.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  wrapper?.addEventListener('click', (e) => {
    if (e.target.closest('.nav__link') || e.target.closest('.nav__drawer-wa')) {
      wrapper.classList.remove('open');
      burger?.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  });
}

/* ═══════════════════════════════════════════════════
   5. HERO ANIMATIONS (Staggered entrance)
═══════════════════════════════════════════════════ */
function initHero() {
  if (prefersReduced) {
    qsa('.hero__eyebrow, .hero__hl-block, .hero__sub, .hero__actions').forEach(el => {
      el.style.opacity = '1';
    });
    return;
  }

  // Hero image slow zoom-out
  const heroImg = qs('#hero-img');
  if (heroImg) {
    gsap.to(heroImg, {
      scale: 1,
      duration: 2.2,
      ease: 'power2.out',
    });
  }

  // Eyebrow
  gsap.to('.hero__eyebrow', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.4,
    ease: 'expo.out',
  });

  // Headline lines — clip-path reveal
  const lines = qsa('.hero__hl-block');
  lines.forEach((line, i) => {
    gsap.fromTo(line,
      { yPercent: 105, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.1,
        delay: 0.6 + i * 0.12,
        ease: 'expo.out',
      }
    );
  });

  // Sub + actions
  gsap.to('.hero__sub', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    delay: 0.9,
    ease: 'expo.out',
  });
  gsap.fromTo('.hero__actions',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.9, delay: 1.1, ease: 'expo.out' }
  );

  // Footer fade in
  gsap.fromTo('.hero__footer',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.9, delay: 1.3, ease: 'expo.out' }
  );

  // Hero nums fade
  gsap.fromTo('.hero__nums',
    { opacity: 0 },
    { opacity: 1, duration: 0.8, delay: 1.5, ease: 'power2.out' }
  );

  // Number cycling
  const nums = qsa('.hero__num');
  let activeIdx = 2;
  setInterval(() => {
    nums[activeIdx]?.classList.remove('hero__num--active');
    activeIdx = (activeIdx + 1) % nums.length;
    nums[activeIdx]?.classList.add('hero__num--active');
  }, 3200);

  // Hero parallax on scroll
  if (!isMobile() && heroImg) {
    gsap.to(heroImg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }
}

/* ═══════════════════════════════════════════════════
   6. SPLITTYPE TEXT ANIMATIONS
═══════════════════════════════════════════════════ */
function initSplitText() {
  if (prefersReduced || typeof SplitType === 'undefined') return;

  // Split all .js-split-line elements — line by line reveal
  const lineEls = qsa('.js-split-line');
  lineEls.forEach(el => {
    const split = new SplitType(el, { types: 'lines' });
    gsap.fromTo(split.lines,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });

  // Word-by-word reveal for eyebrow labels
  const wordEls = qsa('.js-split-word');
  wordEls.forEach(el => {
    const split = new SplitType(el, { types: 'words' });
    gsap.fromTo(split.words,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        }
      }
    );
  });
}

/* ═══════════════════════════════════════════════════
   7. FADE UP / STAGGER REVEALS
═══════════════════════════════════════════════════ */
function initReveal() {
  if (prefersReduced) return;

  // Generic fade-up
  qsa('.js-fade-up').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 44 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 87%',
        }
      }
    );
  });

  // Stagger groups
  const groups = {};
  qsa('.js-stagger').forEach(el => {
    const parent = el.parentElement.id || 'default';
    if (!groups[parent]) groups[parent] = [];
    groups[parent].push(el);
  });

  Object.values(groups).forEach(group => {
    gsap.fromTo(group,
      { opacity: 0, y: 56 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: group[0],
          start: 'top 85%',
        }
      }
    );
  });

  // Label appear
  qsa('.js-label').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        }
      }
    );
  });
}

/* ═══════════════════════════════════════════════════
   8. KISAH SECTION — Float image parallax
═══════════════════════════════════════════════════ */
function initKisah() {
  if (prefersReduced || isMobile()) return;

  const floatImg = qs('#kisah-float');
  if (!floatImg) return;

  gsap.fromTo(floatImg,
    { opacity: 0, x: 60, scale: 0.96 },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#kisah',
        start: 'top 70%',
      }
    }
  );

  // Floating parallax (scrub: true for instant 1:1 sync with Lenis)
  gsap.to(floatImg, {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '#kisah',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });

  // BG text parallax
  const bgText = qs('.kisah__bg-text');
  if (bgText) {
    gsap.to(bgText, {
      xPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: '#kisah',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }
}

/* ═══════════════════════════════════════════════════
   9. TICKER
═══════════════════════════════════════════════════ */
function initTicker() {
  const track = qs('#ticker-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
}

/* ═══════════════════════════════════════════════════
   10. PAKET CARDS — Entrance, Filter Pills & Mobile Sync
═══════════════════════════════════════════════════ */
function initPaket() {
  const cards = qsa('.pkg');
  const grid  = qs('#paket-grid');
  const dots  = qsa('.paket__dot');
  const pills = qsa('.pkg-filter-pill');

  // Entrance animation
  if (!prefersReduced) {
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          delay: i * 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '#paket-grid',
            start: 'top 82%',
          }
        }
      );
    });
  }

  // Filter Pills (All / Umrah / Haji)
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.classList.remove('is-active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('is-active');
      pill.setAttribute('aria-selected', 'true');

      const filter = pill.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('is-hidden', !show);
      });

      // Recalculate ScrollTrigger positions after layout shift
      ScrollTrigger.refresh();
    });
  });

  // Mobile Horizontal Swipe Dots Sync
  if (grid && dots.length) {
    grid.addEventListener('scroll', () => {
      const scrollLeft = grid.scrollLeft;
      const cardWidth  = cards[0]?.offsetWidth || 300;
      const activeIdx  = Math.min(dots.length - 1, Math.max(0, Math.round(scrollLeft / (cardWidth + 16))));
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeIdx);
      });
    }, { passive: true });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const targetCard = cards[idx];
        if (targetCard) {
          grid.scrollTo({
            left: targetCard.offsetLeft - grid.offsetLeft,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  // Auto-select package in form when clicking 'Daftar'
  qsa('.pkg__cta').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectVal = btn.dataset.select;
      const paketSelect = qs('#paket-select');
      if (selectVal && paketSelect) {
        paketSelect.value = selectVal;
        // Visual feedback on selected field
        paketSelect.style.borderColor = 'var(--c-gold)';
        setTimeout(() => {
          paketSelect.style.borderColor = '';
        }, 1500);
      }
    });
  });
}

/* ═══════════════════════════════════════════════════
   11. ARAFAH — Pinned Scroll Story
═══════════════════════════════════════════════════ */
function initArafah() {
  const section = qs('#arafah-section');
  const panels  = qsa('.arafah-panel');
  if (!section || !panels.length) return;

  // Observe each panel entering viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
    });
  }, { threshold: 0.35 });

  panels.forEach(p => observer.observe(p));

  if (prefersReduced) return;

  // GSAP: title scale + overlay on scroll
  const overlay = qs('#arafah-overlay');
  const title   = qs('#arafah-title');

  if (overlay) {
    gsap.to(overlay, {
      opacity: 0.9,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      }
    });
  }

  // Entrance animation for sticky content
  gsap.fromTo('#arafah-content',
    { opacity: 0, x: -50 },
    {
      opacity: 1,
      x: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      }
    }
  );
}

/* ═══════════════════════════════════════════════════
   12. MENGAPA CARDS — Stagger + hover flip
═══════════════════════════════════════════════════ */
function initMengapa() {
  if (prefersReduced) return;

  // Horizontal line reveal above each card
  const cards = qsa('.mengapa-card');
  gsap.fromTo(cards,
    { opacity: 0, y: 48 },
    {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#mengapa-grid',
        start: 'top 82%',
      }
    }
  );
}

/* ═══════════════════════════════════════════════════
   13. JOURNEY — Horizontal drag scroll
═══════════════════════════════════════════════════ */
function initJourney() {
  const wrap  = qs('#journey-scroll-wrap');
  const track = qs('#journey-track');
  const hint  = qs('#journey-drag-hint');
  if (!wrap || !track) return;

  // Show drag hint on enter
  ScrollTrigger.create({
    trigger: '#journey',
    start: 'top 80%',
    onEnter: () => hint?.classList.add('visible'),
  });

  // Drag to scroll
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  wrap.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
    wrap.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - wrap.offsetLeft;
    const walk = (x - startX) * 1.5;
    wrap.scrollLeft = scrollLeft - walk;
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    wrap.style.userSelect = '';
  });

  // Touch scroll is native
  // GSAP step reveal
  if (prefersReduced) return;
  const steps = qsa('.journey-step');
  gsap.fromTo(steps,
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#journey',
        start: 'top 80%',
      }
    }
  );
}

/* ═══════════════════════════════════════════════════
   14. JAMAAH TESTIMONIALS SLIDER
═══════════════════════════════════════════════════ */
function initJamaah() {
  const track   = qs('#jamaah-track');
  const prevBtn = qs('#jamaah-prev');
  const nextBtn = qs('#jamaah-next');
  const dots    = qsa('.jamaah-dot');
  const cards   = qsa('.testi');
  if (!track || !cards.length) return;

  const count = cards.length;
  let current = 0;
  let isDragging = false;
  let startX = 0;
  let autoTimer;

  const getCardWidth = () => {
    const style = getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 20;
    return (cards[0]?.offsetWidth || 0) + gap;
  };

  const goTo = (idx) => {
    current = ((idx % count) + count) % count;

    const offset = getCardWidth() * current;
    if (prefersReduced) {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(-${offset}px)`;

    // Dots
    dots.forEach((d, i) => {
      d.classList.toggle('jamaah-dot--active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });

    // Cards border
    cards.forEach((c, i) => c.classList.toggle('is-active', i === current));

    // Buttons opacity
    if (prevBtn) prevBtn.style.opacity = current === 0 ? '0.35' : '1';
    if (nextBtn) nextBtn.style.opacity = current === count - 1 ? '0.35' : '1';
  };

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5500);
  };
  const stopAuto = () => clearInterval(autoTimer);

  prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((d) => {
    d.addEventListener('click', () => { goTo(+d.dataset.idx); startAuto(); });
  });

  // Drag swipe
  const wrap = qs('#jamaah-track-wrap');
  if (wrap) {
    wrap.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      stopAuto();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
    });
    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    });
    wrap.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });
    wrap.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    });

    // Pause on hover
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);
  }

  goTo(0);
  startAuto();
}

/* ═══════════════════════════════════════════════════
   15. STATS COUNTER
═══════════════════════════════════════════════════ */
function initStats() {
  const nums   = qsa('.stats-bar__num');
  let fired    = false;
  const ease   = (t) => 1 - Math.pow(1 - t, 4);

  const animateNum = (el, target) => {
    const duration = 1800;
    const start    = performance.now();
    const update   = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const val      = Math.round(ease(progress) * target);
      el.textContent = val.toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  ScrollTrigger.create({
    trigger: '#stats-bar',
    start: 'top 80%',
    onEnter: () => {
      if (fired) return;
      fired = true;
      nums.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        animateNum(el, target);
      });
    }
  });

  // Stats bar entrance
  if (prefersReduced) return;
  gsap.fromTo('.stats-bar__item',
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#stats-bar',
        start: 'top 80%',
      }
    }
  );
}

/* ═══════════════════════════════════════════════════
   16. DAFTAR SECTION — CTA reveal
═══════════════════════════════════════════════════ */
function initDaftar() {
  if (prefersReduced) return;

  gsap.fromTo('.daftar__form-wrap',
    { opacity: 0, x: 60 },
    {
      opacity: 1,
      x: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#daftar',
        start: 'top 75%',
      }
    }
  );
}

/* ═══════════════════════════════════════════════════
   17. FORM VALIDATION + TOAST
═══════════════════════════════════════════════════ */
function initForm() {
  const form  = qs('#inquiry-form');
  const toast = qs('#form-toast');
  if (!form || !toast) return;

  let toastTimer;

  const showToast = () => {
    clearTimeout(toastTimer);
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 5000);
  };

  const setError = (fieldId, show) => {
    const field = qs(`#field-${fieldId}`);
    if (field) field.classList.toggle('has-error', show);
    const input = qs(`#${fieldId}`) || qs(`#${fieldId}-select`) || qs(`#paket-select`);
    if (input) input.classList.toggle('error', show);
  };

  const clearError = (fieldId) => setError(fieldId, false);

  // Live clear on change
  qsa('.form-input').forEach(input => {
    input.addEventListener('input', () => {
      const fieldId = input.closest('.form-field')?.id?.replace('field-', '');
      if (fieldId) clearError(fieldId);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nama  = qs('#nama');
    const wa    = qs('#wa');
    const paket = qs('#paket-select');

    if (!nama?.value.trim()) {
      setError('nama', true); valid = false;
    } else { clearError('nama'); }

    const waVal = wa?.value.trim().replace(/\D/g, '');
    if (!waVal || waVal.length < 8) {
      setError('wa', true); valid = false;
    } else { clearError('wa'); }

    if (!paket?.value) {
      setError('paket', true); valid = false;
    } else { clearError('paket'); }

    if (!valid) return;

    // Simulate submit
    const btn     = qs('#form-submit-btn');
    const btnText = btn?.querySelector('.form-submit__text');
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
    }
    if (btnText) btnText.textContent = 'Mengirim...';

    setTimeout(() => {
      form.reset();
      if (btn) { btn.style.pointerEvents = ''; btn.style.opacity = ''; }
      if (btnText) btnText.textContent = 'Kirim & Konsultasikan Sekarang';
      showToast();

      // Animate toast in with GSAP
      gsap.fromTo(toast,
        { y: 20, scale: 0.95 },
        { y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }, 1400);
  });
}

/* ═══════════════════════════════════════════════════
   18. FOOTER — entrance
═══════════════════════════════════════════════════ */
function initFooter() {
  if (prefersReduced) return;

  const cols = qsa('.footer__col, .footer__brand');
  gsap.fromTo(cols,
    { opacity: 0, y: 36 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '.footer__top',
        start: 'top 85%',
      }
    }
  );
}

/* ═══════════════════════════════════════════════════
   19. SMOOTH ANCHOR SCROLL
═══════════════════════════════════════════════════ */
function initAnchorScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      const target = qs(href);
      if (!target) return;
      e.preventDefault();

      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 70;

      if (lenis) {
        lenis.scrollTo(target, { offset: -navH, duration: 1.6 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════
   20. SECTION BORDER LINE REVEAL
═══════════════════════════════════════════════════ */
function initLineReveal() {
  // Kept lightweight to avoid expensive GPU clipPath repaints during scroll
}

/* ═══════════════════════════════════════════════════
   21. MOBILE STICKY CONCIERGE BAR
═══════════════════════════════════════════════════ */
function initMobileConciergeBar() {
  const bar = qs('#mobile-concierge-bar');
  if (!bar) return;

  // Reveal when scrolled past hero (180px)
  ScrollTrigger.create({
    start: 'top -180',
    onUpdate: (self) => {
      if (self.scroll() > 180) {
        bar.classList.add('is-visible');
      } else {
        bar.classList.remove('is-visible');
      }
    }
  });

  // Hide when inquiry form is in viewport so it doesn't obstruct inputs or submit button
  ScrollTrigger.create({
    trigger: '#daftar',
    start: 'top 85%',
    end: 'bottom bottom',
    onEnter: () => bar.classList.add('is-hidden'),
    onLeaveBack: () => bar.classList.remove('is-hidden'),
  });
}

/* ═══════════════════════════════════════════════════
   INIT AFTER LOADER — Main entry
═══════════════════════════════════════════════════ */
function initAfterLoad() {
  initLenis();
  initCursor();
  initNav();
  initHero();
  initSplitText();
  initReveal();
  initKisah();
  initTicker();
  initPaket();
  initArafah();
  initMengapa();
  initJourney();
  initJamaah();
  initStats();
  initDaftar();
  initForm();
  initFooter();
  initAnchorScroll();
  initLineReveal();
  initMobileConciergeBar();

  // Refresh ScrollTrigger on resize
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });

  // Ensure ScrollTrigger measures accurate layout after fonts and SplitType settle
  if (document.fonts) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 350);
}

/* ─── BOOTSTRAP ─── */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
});
