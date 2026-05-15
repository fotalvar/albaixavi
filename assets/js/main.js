// JS principal para la boda

// ── Page loader ──
(function () {
  const loader = document.getElementById("page-loader");

  const minDuration = 2000;
  const startTime = Date.now();

  function dismissLoader() {
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, minDuration - elapsed);
    setTimeout(function () {
      loader.classList.add("hidden");
      document.body.classList.remove("loading");
    }, delay);
  }

  if (document.readyState === "complete") {
    dismissLoader();
  } else {
    window.addEventListener("load", dismissLoader);
  }
})();

// Cuenta atrás para el 26 de septiembre de 2026
function startCountdown() {
  const countdownEl = document.getElementById("countdown");
  const targetDate = new Date("2026-09-26T00:00:00");
  const labels = {
    days:    countdownEl.dataset.days    || "Dies",
    hours:   countdownEl.dataset.hours   || "Hores",
    minutes: countdownEl.dataset.minutes || "Minuts",
    seconds: countdownEl.dataset.seconds || "Segons",
    final:   countdownEl.dataset.final   || "Ha arribat el gran dia!",
  };
  const pad = n => String(n).padStart(2, "0");

  // Track previous values per unit to animate only changed digits
  const prev = { days: null, hours: null, minutes: null, seconds: null };

  function animateDigits(el, newVal) {
    const spans = el.querySelectorAll(".countdown-digit");
    newVal.split("").forEach(function (ch, i) {
      const span = spans[i];
      if (!span || span.dataset.val === ch) return;
      span.dataset.val = ch;
      span.classList.remove("animate-in");
      // force reflow so animation restarts
      void span.offsetWidth;
      span.textContent = ch;
      span.classList.add("animate-in");
    });
  }

  function renderUnit(id, value, label) {
    const val = pad(value);
    let unit = countdownEl.querySelector(`[data-unit="${id}"]`);
    if (!unit) {
      unit = document.createElement("div");
      unit.className = "countdown-unit";
      unit.dataset.unit = id;
      const numEl = document.createElement("span");
      numEl.className = "countdown-number";
      numEl.innerHTML = val.split("").map(ch =>
        `<span class="countdown-digit" data-val="${ch}">${ch}</span>`
      ).join("");
      const labelEl = document.createElement("span");
      labelEl.className = "countdown-label";
      labelEl.textContent = label;
      unit.appendChild(numEl);
      unit.appendChild(labelEl);
      return unit;
    }
    if (prev[id] !== val) {
      animateDigits(unit.querySelector(".countdown-number"), val);
      prev[id] = val;
    }
    return null;
  }

  function renderSep() {
    const sep = document.createElement("div");
    sep.className = "countdown-separator";
    sep.textContent = "|";
    return sep;
  }

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      countdownEl.textContent = labels.final;
      return;
    }
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // First render: build structure
    if (!countdownEl.querySelector("[data-unit]")) {
      countdownEl.innerHTML = "";
      [
        ["days",    days,    labels.days],
        ["hours",   hours,   labels.hours],
        ["minutes", minutes, labels.minutes],
        ["seconds", seconds, labels.seconds],
      ].forEach(function ([id, val, lbl], i) {
        if (i > 0) countdownEl.appendChild(renderSep());
        prev[id] = pad(val);
        countdownEl.appendChild(renderUnit(id, val, lbl));
      });
      return;
    }

    // Subsequent ticks: animate only changed digits
    renderUnit("days",    days,    labels.days);
    renderUnit("hours",   hours,   labels.hours);
    renderUnit("minutes", minutes, labels.minutes);
    renderUnit("seconds", seconds, labels.seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", startCountdown);

// ── Timeline scroll animations ──
(function () {
  const section = document.getElementById("timeline");
  const lineFill = document.getElementById("timelineLine");
  const items = document.querySelectorAll(".timeline-item");

  if (!section || !lineFill) return;

  // Draw small diamond decorations along the line via SVG
  function buildDiamonds() {
    const svg = document.getElementById("timelineDots");
    if (!svg) return;
    const trackH = section.querySelector(".timeline-line-track").offsetHeight;
    svg.setAttribute("viewBox", `0 0 14 ${trackH}`);
    svg.setAttribute("height", trackH);
    const spacing = 28;
    const count = Math.floor(trackH / spacing);
    let markup = "";
    for (let i = 0; i <= count; i++) {
      const y = i * spacing + spacing / 2;
      markup += `<rect x="7" y="${y}" width="4" height="4" rx="0.8"
        transform="rotate(45 7 ${y})"
        fill="none" stroke="#b8ccb2" stroke-width="1.2" opacity="0.55"/>`;
    }
    svg.innerHTML = markup;
  }

  // Animate line height based on scroll progress through section
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Start filling when section top hits 80% of viewport, finish when section bottom leaves
    const start = rect.top - windowH * 0.75;
    const end = rect.bottom - windowH * 0.3;
    const progress = Math.min(1, Math.max(0, -start / (end - start)));
    lineFill.style.height = (progress * 100) + "%";
  }

  // Reveal items with IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.index) * 120;
          setTimeout(() => entry.target.classList.add("visible"), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  items.forEach((item) => observer.observe(item));

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", buildDiamonds, { passive: true });

  buildDiamonds();
  onScroll();
})();


// ── Timeline connector to Festa Major board ──
(function () {
  const connector = document.getElementById("fmConnector");
  const fill = document.getElementById("fmConnectorFill");
  const svg = document.getElementById("fmConnectorDots");
  const section = document.querySelector(".festa-major-section");
  const board = document.querySelector(".fm-board");
  if (!connector || !fill || !section || !board) return;

  let trackHeight = 0;

  function buildDiamonds(h) {
    if (!svg) return;
    svg.setAttribute("viewBox", `0 0 14 ${h}`);
    svg.setAttribute("height", h);
    const spacing = 28;
    const count = Math.floor(h / spacing);
    let markup = "";
    for (let i = 0; i <= count; i++) {
      const y = i * spacing + spacing / 2;
      markup += `<rect x="7" y="${y}" width="4" height="4" rx="0.8"
        transform="rotate(45 7 ${y})"
        fill="none" stroke="#b8ccb2" stroke-width="1.2" opacity="0.55"/>`;
    }
    svg.innerHTML = markup;
  }

  function updateTrack() {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const boardTop = board.getBoundingClientRect().top + window.scrollY;
    trackHeight = Math.max(0, boardTop - sectionTop);
    connector.style.height = trackHeight + "px";
    buildDiamonds(trackHeight);
  }

  function onScroll() {
    if (trackHeight === 0) return;
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Sync with timeline: timeline ends when its bottom = windowH*0.3, i.e. festa rect.top = windowH*0.3
    // Connector fills over exactly trackHeight px of scroll from that point
    const syncTop = windowH * 0.3;
    const progress = Math.min(1, Math.max(0, (syncTop - rect.top) / trackHeight));
    fill.style.height = (progress * 100) + "%";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { updateTrack(); onScroll(); }, { passive: true });

  updateTrack();
  onScroll();
})();

// ── Com arribar entrance animations ──
(function () {
  const section = document.querySelector(".location-section");
  const card = document.querySelector(".location-card");
  if (!section || !card) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              section.classList.add("loc-section-animate");
              card.classList.add("loc-animate");
            });
          });
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(section);
})();

// ── Festa Major entrance animations ──
(function () {
  const scene = document.querySelector(".fm-scene");
  if (!scene) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scene.classList.add("fm-animate");
          observer.unobserve(scene);
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(scene);
})();

// ── Festa Major confetti ──
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.querySelector(".fm-confetti");
  const section = document.querySelector(".festa-major-section");
  if (!canvas || !section) return;

  const ctx = canvas.getContext("2d");

  const COLORS = [
    "#7a9a72", "#a8be9f", "#5e7d58",
    "#f5f0e8", "#ffffff",
    "#c8a870", "#d4b87a",
    "#d4a9a0", "#c9978e",
  ];

  const PARTICLE_COUNT = 200;
  const DURATION = 7000;

  let particles = [];
  let animId = null;
  let startTime = null;
  let running = false;

  function resize() {
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle(side) {
    const w = canvas.width;
    const h = canvas.height;
    // Disparar desde el borde izquierdo o derecho, a altura media del cartel
    const x = side === 0 ? randomBetween(-10, 5) : randomBetween(w - 5, w + 10);
    const y = randomBetween(h * 0.2, h * 0.65);
    // Velocidad inicial: hacia el centro y hacia arriba
    const speed = randomBetween(5, 13);
    const angle = side === 0
      ? randomBetween(-Math.PI * 0.45, Math.PI * 0.15)   // izquierda: disparo hacia derecha-arriba
      : randomBetween(Math.PI - Math.PI * 0.15, Math.PI + Math.PI * 0.45); // derecha: disparo hacia izquierda-arriba
    return {
      x,
      y,
      w: randomBetween(5, 11),
      h: randomBetween(2, 5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: randomBetween(0, Math.PI * 2),
      spin: randomBetween(-0.1, 0.1),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      opacity: randomBetween(0.75, 1),
      decay: randomBetween(0.004, 0.009),
    };
  }

  function spawnParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(i % 2));
    }
  }

  function tick(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.vx *= 0.995; // rozamiento leve
      p.angle += p.spin;
      p.opacity -= p.decay;

      if (p.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (elapsed < DURATION) {
      animId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      running = false;
    }
  }

  function launch() {
    if (running) return;
    running = true;
    startTime = null;
    resize();
    spawnParticles();
    animId = requestAnimationFrame(tick);
  }

  // Trigger when the fm-scene gets fm-animate (same moment as poster entrance)
  const scene = document.querySelector(".fm-scene");
  if (!scene) return;

  const obs = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.type === "attributes" && scene.classList.contains("fm-animate")) {
        obs.disconnect();
        // Small delay so confetti appears as poster settles
        setTimeout(launch, 800);
      }
    });
  });
  obs.observe(scene, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", () => {
    if (running) resize();
  }, { passive: true });
})();

// Acordeon FAQ
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    // Cerrar todos
    document.querySelectorAll(".faq-question").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.nextElementSibling.classList.remove("open");
    });

    // Abrir el clicado si estaba cerrado
    if (!isOpen) {
      btn.setAttribute("aria-expanded", "true");
      answer.classList.add("open");
    }
  });
})();

// Scroll-reveal
document.addEventListener("DOMContentLoaded", function () {
  const earlyTargets = [
    ".countdown-container",
    ".timeline-section",
    ".festa-major-section",
    ".faq-section",
    ".form-section",
    ".quote-section",
  ];
  const lateTargets = [
    ".location-section",
  ];

  const allEls = document.querySelectorAll([...earlyTargets, ...lateTargets].join(","));
  allEls.forEach(el => el.classList.add("reveal"));

  function makeObserver(options) {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            entry.target._revealObserver.unobserve(entry.target);
          }
        });
      },
      options
    );
  }

  const earlyObserver = makeObserver({ threshold: 0.05 });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.querySelectorAll(earlyTargets.join(",")).forEach(function (el) {
        el._revealObserver = earlyObserver;
        earlyObserver.observe(el);
      });

      // Secciones "late": se activan cuando el top del elemento
      // ha pasado el 50% del viewport (mitad de pantalla)
      const lateEls = Array.from(document.querySelectorAll(lateTargets.join(",")));
      lateEls.forEach(el => el.classList.add("reveal"));

      function checkLate() {
        lateEls.forEach(function (el) {
          if (el.classList.contains("visible")) return;
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.5) {
            el.classList.add("visible");
          }
        });
      }

      window.addEventListener("scroll", checkLate, { passive: true });
    });
  });
});
