/** Small polite status message at the bottom of the screen. */
export class Toast {
  constructor(element) {
    this.element = element;
    this.timer = null;
  }

  show(message, { duration = 3800 } = {}) {
    clearTimeout(this.timer);
    this.element.textContent = message;
    this.element.classList.add('is-visible');
    this.timer = setTimeout(() => this.element.classList.remove('is-visible'), duration);
  }
}

/** DOM confetti used when WebGL is unavailable (and as a light accent elsewhere). */
export function domConfetti(origin, { amount = 60 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ff8fb7', '#78d5f4', '#ffca55', '#93dcae', '#b49cff'];
  const layer = document.createElement('div');
  layer.className = 'dom-confetti';
  layer.setAttribute('aria-hidden', 'true');
  const rect = origin?.getBoundingClientRect?.() ?? { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 220;
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * distance * 0.6 + 160}px`);
    piece.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    piece.style.animationDelay = `${Math.random() * 0.15}s`;
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1800);
}
