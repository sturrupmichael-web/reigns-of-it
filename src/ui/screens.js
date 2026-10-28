// Overlay screens. Phase 2 has the game over screen only; the title screen,
// endings gallery and achievements arrive in Phase 4.

import { CONTENT } from '../content.js';
import { calendar } from '../engine/state.js';
import { endingFor } from '../engine/game.js';

let refs = {};

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// r: { overlay, icon, title, text, stats, record, restartBtn }
export function mountScreens(r, onRestart) {
  refs = r;
  r.restartBtn.addEventListener('click', () => {
    hideGameOver();
    onRestart();
  });
}

// `record` is what save.js recordRun() returned for this run.
export function showGameOver(endingId, state, record) {
  const ending = endingFor(endingId);
  const cal = calendar(state.turn - 1);
  refs.icon.textContent = ending.icon ?? '💀';
  refs.title.textContent = ending.title;
  refs.text.textContent = ending.text;
  refs.stats.textContent = `You lasted ${plural(state.turn, 'week')} (Year ${cal.year}, Week ${cal.week}).`;

  const found = Object.keys(record.endings).filter((id) => CONTENT.endings[id]).length;
  // One line per fact; the news (a new best, a new ending) is highlighted.
  const lines = [];
  if (record.isBest && record.prevBest > 0) lines.push([`New best! Your old record was ${plural(record.prevBest, 'week')}.`, true]);
  else if (!record.isBest) lines.push([`Your best is ${plural(record.bestWeeks, 'week')}.`, false]);
  lines.push([`${record.firstEnding ? 'New ending! ' : ''}Endings found: ${found} of ${Object.keys(CONTENT.endings).length}.`, record.firstEnding]);
  refs.record.replaceChildren(...lines.map(([text, news]) => {
    const line = document.createElement('span');
    line.textContent = text;
    line.classList.toggle('highlight', news);
    return line;
  }));

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
