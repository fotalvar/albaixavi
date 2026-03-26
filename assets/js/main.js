// JS principal para la boda


// Cuenta atrás para el 26 de septiembre de 2026
function startCountdown() {
	const countdownEl = document.getElementById('countdown');
	const targetDate = new Date('2026-09-26T00:00:00');

	function updateCountdown() {
		const now = new Date();
		const diff = targetDate - now;
		if (diff <= 0) {
			countdownEl.textContent = '¡Ha llegado el gran día!';
			return;
		}
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
		const minutes = Math.floor((diff / (1000 * 60)) % 60);
		const seconds = Math.floor((diff / 1000) % 60);
		countdownEl.textContent = `${days} días ${hours}h ${minutes}m ${seconds}s`;
	}

	updateCountdown();
	setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', startCountdown);
