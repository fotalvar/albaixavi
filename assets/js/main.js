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
      <div class="countdown-unit"><span class="countdown-number">${pad(days)}</span><span class="countdown-label">Días</span></div>
      <div class="countdown-separator">|</div>
      <div class="countdown-unit"><span class="countdown-number">${pad(hours)}</span><span class="countdown-label">Horas</span></div>
      <div class="countdown-separator">|</div>
      <div class="countdown-unit"><span class="countdown-number">${pad(minutes)}</span><span class="countdown-label">Minutos</span></div>
      <div class="countdown-separator">|</div>
      <div class="countdown-unit"><span class="countdown-number">${pad(seconds)}</span><span class="countdown-label">Segundos</span></div>
    `;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", startCountdown);
