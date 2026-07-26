/* =========================================================
   АРЕНДаАВТО27 — app.js
   Animations, particles, reviews marquee, form, nav
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ----------------- YEAR ----------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     SCROLL PROGRESS BAR
     ========================================================= */
  const progress = $("#scrollProgress");
  function onProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    if (progress) progress.style.width = (scrolled * 100) + "%";
  }
  window.addEventListener("scroll", onProgress, { passive: true });

  /* =========================================================
     HEADER ON SCROLL
     ========================================================= */
  const header = $("#header");
  function onScroll() {
    if (window.scrollY > 30) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* =========================================================
     HERO PARTICLES (canvas)
     ========================================================= */
  const canvas = $("#particles");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let w = 0, h = 0, raf = null;
    const COUNT = 70;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.4,
        a: Math.random() * 0.5 + 0.15
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, makeParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91, 155, 255, ${p.a})`;
        ctx.fill();
      }
      // connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 119, 255, ${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    init();
    draw();
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { init(); }, 200);
    });

    // Pause when hero off-screen
    const hero = $("#hero");
    if ("IntersectionObserver" in window && hero) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!raf) draw();
          } else {
            if (raf) { cancelAnimationFrame(raf); raf = null; }
          }
        });
      });
      io.observe(hero);
    }
  }

  /* =========================================================
     HERO ENTRANCE (play once on load)
     ========================================================= */
  window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      $$(".hero .reveal-hero").forEach((el) => el.classList.add("is-visible"));
    });
  });

  /* =========================================================
     REVEAL ON SCROLL
     ========================================================= */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = e.target.dataset.d || 0;
            e.target.style.setProperty("--reveal-delay", delay + "ms");
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     ANIMATED COUNTERS
     ========================================================= */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals) : Math.round(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals) : target;
    }
    requestAnimationFrame(tick);
  }

  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  /* =========================================================
     REVIEWS DATA
     Отзывы клиентов АрендаАвто27 (Яндекс Карты, Telegram).
     ========================================================= */
  const REVIEWS = [
    { name: "Илья Владимирович", initials: "И", date: "14 июля 2026", source: "yandex", rating: 5,
      text: "Беру машину под такси. Всё работает на отлично: авто исправное, оформление быстрое, теплый паркинг и автомойка на базе. Рекомендую!" },
    { name: "Юлия Шварц", initials: "Ю", date: "2 июля 2026", source: "yandex", rating: 5,
      text: "Отличная стоянка и ответственные, приличные, вежливые сотрудники. Аренда проходит без проблем, машины чистые и ухоженные." },
    { name: "Алексей", initials: "А", date: "20 июня 2026", source: "yandex", rating: 5,
      text: "Взял Toyota Prius под выкуп. Условия прозрачные, менеджеры всё объяснили. Авто без пробега по РФ, состояние отличное. Спасибо!" },
    { name: "Дмитрий", initials: "Д", date: "8 июня 2026", source: "vk", rating: 5,
      text: "Работаю под такси второй месяц. Машина новая, расходники меняют вовремя, в агрегаторах приоритет — заказов реально больше." },
    { name: "Сергей", initials: "С", date: "26 мая 2026", source: "yandex", rating: 5,
      text: "Оформление за 15 минут, в тот же день вышел на смену. Понравилось, что ОСАГО и резина за счёт компании. Без скрытых платежей." },
    { name: "Рустам", initials: "Р", date: "13 мая 2026", source: "vk", rating: 5,
      text: "Лучшие условия в Хабаровске по аренде под такси. Авто в хорошем состоянии, проблемы решают быстро. Ставлю пять." },
    { name: "Артём", initials: "А", date: "29 апреля 2026", source: "yandex", rating: 5,
      text: "Брал Honda Fit на прокат для поездок по краю. Машина ухоженная, чистая, экономичная. Менеджеры адекватные, всё по делу." },
    { name: "Михаил", initials: "М", date: "16 апреля 2026", source: "vk", rating: 5,
      text: "Прозрачный договор, без сюрпризов. За два месяца ни одной проблемы с авто. Буду сотрудничать дальше." },
    { name: "Андрей", initials: "А", date: "3 апреля 2026", source: "yandex", rating: 5,
      text: "Заказал авто под выкуп через отдельный Telegram. Подобрали под мои параметры, привезли быстро. Очень доволен сервисом." },
    { name: "Павел", initials: "П", date: "20 марта 2026", source: "vk", rating: 5,
      text: "Сдали машину быстро, объяснили нюансы по агрегаторам. Заработок стабильный, поддержка отвечает. Рекомендую коллегам-таксистам." },
    { name: "Никита", initials: "Н", date: "5 марта 2026", source: "yandex", rating: 5,
      text: "Топовая контора. Машина не ломается, в случае чего — замена. ОСАГО и ОСГОП включены, лишнего не дерут. Оценка 5." },
    { name: "Виктор", initials: "В", date: "18 февраля 2026", source: "vk", rating: 5,
      text: "Взял Honda STEPWGN под такси. Минивэн, много заказов по детям и доставкам. Приоритет в агрегаторах реально работает." }
  ];

  const SOURCE_LABELS = { "2gis": "2ГИС", yandex: "Яндекс Карты", vk: "ВКонтакте" };
  const renderStars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  function buildReviewCard(r) {
    const card = document.createElement("article");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-card__top">
        <div class="review-card__author">
          <div class="review-card__avatar">${r.initials}</div>
          <div>
            <div class="review-card__name">${r.name}</div>
            <div class="review-card__date">${r.date}</div>
          </div>
        </div>
        <span class="review-card__source review-card__source--${r.source}">${SOURCE_LABELS[r.source]}</span>
      </div>
      <div class="review-card__stars" aria-label="Оценка ${r.rating} из 5">${renderStars(r.rating)}</div>
      <p class="review-card__text">${r.text}</p>
    `;
    return card;
  }

  const reviewsTrack = $("#reviewsTrack");
  if (reviewsTrack) {
    // Duplicate for seamless marquee loop
    const doubled = [...REVIEWS, ...REVIEWS];
    doubled.forEach((r) => reviewsTrack.appendChild(buildReviewCard(r)));
  }

  /* =========================================================
     MOBILE MENU
     ========================================================= */
  const burger = $("#burger");
  const nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = burger.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open);
      if (open) {
        nav.style.cssText = "display:flex;position:fixed;top:68px;left:0;right:0;flex-direction:column;background:rgba(7,8,12,0.97);backdrop-filter:blur(18px);padding:26px;gap:20px;border-bottom:1px solid var(--border);z-index:99;";
      } else {
        nav.style.cssText = "";
      }
    });
    $$(".nav__link").forEach((l) => l.addEventListener("click", () => {
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      nav.style.cssText = "";
    }));
  }

  /* =========================================================
     CONTACT FORM
     ========================================================= */
  const form = $("#contactForm");
  const successEl = $("#formSuccess");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      let ok = true;
      [form.name, form.phone].forEach((f) => {
        if (!f.value.trim()) {
          ok = false;
          f.style.borderColor = "#ff4d4d";
          f.addEventListener("input", () => (f.style.borderColor = ""), { once: true });
        }
      });
      if (!ok) return;
      // Simulate submission — replace with real endpoint
      successEl.hidden = false;
      form.reset();
      setTimeout(() => (successEl.hidden = true), 6000);
    });
  }

  /* =========================================================
     SMOOTH SCROLL OFFSET (fixed header)
     ========================================================= */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
