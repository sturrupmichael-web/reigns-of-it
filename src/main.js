// Boot and glue: connects input (swipe.js) to the game (engine/) and the
// views (card.js, meters.js, screens.js).

import { CONTENT } from './content.js';
import { calendar } from './engine/state.js';
import { createGame } from './engine/game.js';
import { mountMeters, setMeters, previewMeters } from './ui/meters.js';
import { mountCard, renderCard, dragCard, flyOff, enterCard, cardWidth } from './ui/card.js';
import { bindInput } from './ui/swipe.js';
import { mountScreens, showGameOver } from './ui/screens.js';
import { sfx } from './audio/sfx.js';
import { loadRun, saveRun, clearRun, loadStats, recordRun } from './save.js';

const $ = (id) => document.getElementById(id);
const game = createGame();

let locked = true; // true while animating or on the game over screen
let leanSide = null; // 'left' | 'right' | null

// How far the card must travel to commit, and how far a key/button lean goes.
const threshold = () => Math.max(70, cardWidth() * 0.32);
const leanDistance = () => threshold() * 0.55;
const sideOf = (dx) => (dx < -12 ? 'left' : dx > 12 ? 'right' : null);

function showPreview(side) {
  previewMeters(side && game.card?.[side] ? game.card[side].effects : null);
}

function updateClock() {
  const cal = calendar(game.state.turn);
  $('clock').textContent = `Year ${cal.year}, Week ${cal.week}`;
}

function updateBest() {
  const { bestWeeks } = loadStats();
  $('best').textContent = bestWeeks ? `Best: ${bestWeeks} ${bestWeeks === 1 ? 'week' : 'weeks'}` : '';
}

// A short banner over the card, e.g. at the start of each new year.
let toastTimer = 0;
function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.hidden = false;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
}

const controller = {
  locked: () => locked,
  leaning: () => leanSide,

  drag(dx) {
    leanSide = null;
    dragCard(dx, false, threshold());
    showPreview(sideOf(dx));
  },

  release(dx, velocity) {
    const side = sideOf(dx);
    const flick = Math.abs(velocity) > 0.6 && Math.abs(dx) > 30 && sideOf(velocity * 100) === side;
    if (side && (Math.abs(dx) >= threshold() || flick)) controller.commit(side);
    else controller.lean(null);
  },

  lean(side) {
    leanSide = side;
    const dx = side === 'left' ? -leanDistance() : side === 'right' ? leanDistance() : 0;
    dragCard(dx, true, threshold());
    showPreview(side);
  },

  commit(side) {
    if (locked) return;
    locked = true;
    leanSide = null;
    previewMeters(null);
    sfx.swipe();

    const result = game.choose(side);
    setMeters(result.after, true);
    sfx.tick();
    // Save straight away, so closing the tab mid-animation loses nothing.
    let record = null;
    if (result.ending) {
      clearRun();
      record = recordRun(result.ending, game.state.turn);
    } else {
      saveRun(game.snapshot());
    }

    flyOff(side).then(() => {
      if (result.ending) {
        sfx.sting();
        updateBest();
        showGameOver(result.ending, game.state, record);
        return;
      }
      updateClock();
      const cal = calendar(game.state.turn);
      if (cal.week === 1) toast(`Year ${cal.year}`);
      renderCard(result.next);
      return enterCard().then(() => { locked = false; });
    });
  },
};

// Shows the run in game.state / game.card, fresh or resumed.
function showRun(card) {
  setMeters(game.state.meters, false);
  previewMeters(null);
  updateClock();
  leanSide = null;
  renderCard(card);
  locked = true;
  enterCard().then(() => { locked = false; });
}

function newRun() {
  const card = game.start();
  saveRun(game.snapshot());
  showRun(card);
}

mountMeters($('meters'));
mountCard({
  card: $('card'),
  face: $('card-face'),
  choiceLeft: $('choice-left'),
  choiceRight: $('choice-right'),
  labelLeft: $('label-left'),
  labelRight: $('label-right'),
  prompt: $('prompt'),
  name: $('char-name'),
  title: $('char-title'),
});
bindInput({ card: $('card'), leftBtn: $('btn-left'), rightBtn: $('btn-right') }, controller);
mountScreens({
  overlay: $('gameover'),
  icon: $('end-icon'),
  title: $('end-title'),
  text: $('end-text'),
  stats: $('end-stats'),
  record: $('end-record'),
  restartBtn: $('btn-restart'),
}, newRun);

updateBest();
// Pick up where the player left off, if there's a run in progress.
const resumed = game.resume(loadRun());
if (resumed) showRun(resumed);
else newRun();
$('boot')?.remove();

// For the tests and the browser console: reigns.game.state, reigns.content, reigns.choose('left').
window.reigns = {
  game,
  content: CONTENT,
  choose: (side) => controller.commit(side),
  locked: () => locked,
};
