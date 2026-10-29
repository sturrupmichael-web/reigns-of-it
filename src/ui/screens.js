// Overlay screens. Phase 1 has the game over screen only; the title screen,
// endings gallery and achievements arrive in Phase 4.

import { calendar } from '../engine/state.js';
import { endingFor } from '../engine/game.js';

let refs = {};

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// r: { overlay, icon, title, text, stats, restartBtn }
export function mountScreens(r, onRestart) {
  refs = r;
  r.restartBtn.addEventListener('click', () => {
    hideGameOver();
    onRestart();
  });
}

export function showGameOver(endingId, state) {
  const ending = endingFor(endingId);
  const cal = calendar(state.turn - 1);
  refs.icon.textContent = ending.icon ?? '💀';
  refs.title.textContent = ending.title;
  refs.text.textContent = ending.text;
  refs.stats.textContent = `You lasted ${plural(state.turn, 'week')} (Year ${cal.year}, Week ${cal.week}).`;
  refs.overlay.hidden = false;
  // Let the hidden -> shown change apply before animating in.
  requestAnimationFrame(() => {
    refs.overlay.classList.add('show');
    refs.restartBtn.focus({ preventScroll: true });
  });
}

export function hideGameOver() {
  refs.overlay.classList.remove('show');
  refs.overlay.hidden = true;
}
