// JS principal para la boda

// Cuenta atrás para el 26 de septiembre de 2026
function startCountdown() {
  const countdownEl = document.getElementById("countdown");
  const targetDate = new Date("2026-09-26T00:00:00");

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      countdownEl.textContent = "¡Ha llegado el gran día!";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const pad = n => String(n).padStart(2, "0");
    countdownEl.innerHTML = `
      <div class="countdown-unit"><span class="countdown-number">${pad(days)}</span><span class="countdown-label">Dies</span></div>
      <div class="countdown-separator">|</div>
      <div class="countdown-unit"><span class="countdown-number">${pad(hours)}</span><span class="countdown-label">Hores</span></div>
      <div class="countdown-separator">|</div>
      <div class="countdown-unit"><span class="countdown-number">${pad(minutes)}</span><span class="countdown-label">Minuts</span></div>
      <div class="countdown-separator">|</div>
      <div class="countdown-unit"><span class="countdown-number">${pad(seconds)}</span><span class="countdown-label">Segons</span></div>
    `;
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
});
