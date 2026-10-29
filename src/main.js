// Boot and glue: connects input (swipe.js) to the game (engine/) and the
// views (card.js, meters.js, screens.js).

import { CONTENT, METER_KEYS } from './content.js';
import { calendar } from './engine/state.js';
import { createGame } from './engine/game.js';
import { mountMeters, setMeters, previewMeters } from './ui/meters.js';
import { mountCard, renderCard, dragCard, flyOff, enterCard, cardWidth } from './ui/card.js';
import { bindInput } from './ui/swipe.js';
import {
  showTitle, hideTitle, titleShowing, updateSettings, mountGallery, showGallery, hideGallery, galleryShowing,
  showGameOver, hideGameOver, announceAchievement, directorLabel,
} from './ui/screens.js';
import { newAchievements, directorName } from './engine/achievements.js';
import { sfx } from './audio/sfx.js';
import {
  loadRun, saveRun, clearRun, loadStats, recordRun, unlockAchievements, loadSettings, saveSettings,
} from './save.js';

const $ = (id) => document.getElementById(id);
const game = createGame();

let locked = true; // true while animating, or while a menu or the game over screen is up
let settings = loadSettings();
// Achievements unlocked this session, kept here too so they're only announced once
// even when storage is blocked.
const sessionUnlocked = {};
const unlocked = (stats = loadStats()) => ({ ...stats.achievements, ...sessionUnlocked });

function unlock(ids) {
  for (const id of ids) sessionUnlocked[id] = true;
  unlockAchievements(ids);
}
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
function toast(text, ms = 1800) {
  const el = $('toast');
  el.textContent = text;
  el.hidden = false;
  el.classList.remove('show');
  void el.offsetWidth;
  el.style.setProperty('--toast-ms', `${ms}ms`);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, ms);
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
    sfx.tick(METER_KEYS.filter((k) => result.after[k] !== result.before[k]).map((k) => result.after[k] > result.before[k]));
    // Save straight away, so closing the tab mid-animation loses nothing.
    let record = null;
    let earned = [];
    if (result.ending) {
      clearRun();
      record = recordRun(result.ending, game.state.turn);
      earned = newAchievements(unlocked(record), game.state, result.ending, record);
      unlock(earned);
    } else {
      saveRun(game.snapshot());
      earned = newAchievements(unlocked(), game.state, null);
      unlock(earned);
      for (const id of earned) announceAchievement(id, () => sfx.achievement());
    }

    flyOff(side).then(() => {
      if (result.ending) {
        sfx.sting();
        if (earned.length) setTimeout(() => sfx.achievement(), 900);
        updateBest();
        showGameOver(result.ending, game.state, record, earned);
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
  const stats = loadStats();
  const director = { number: stats.runs + 1, name: directorName() };
  const card = game.start({ unlocked: unlocked(stats), director });
  saveRun(game.snapshot());
  showRun(card);
  toast(`${directorLabel(director)}\n${director.name}`, 2400);
}

// ── Menus ─────────────────────────────────────────────────────────────────

function applyTheme() {
  if (settings.theme === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = settings.theme;
}

function changeSettings(patch) {
  settings = { ...settings, ...patch };
  saveSettings(settings);
  sfx.setMuted(settings.muted);
  applyTheme();
  updateSettings(settings);
}

// The run in progress (if any) is already saved, so the title screen can come up at
// any point and Continue picks it straight back up.
function openTitle() {
  locked = true;
  leanSide = null;
  dragCard(0, true, threshold());
  previewMeters(null);
  const stats = loadStats();
  const run = game.state && !game.state.ended && game.card ? game.state : null;
  showTitle({ stats, run, nextNumber: stats.runs + 1, settings });
}

function play() {
  sfx.click();
  hideTitle();
  if (game.state && !game.state.ended && game.card) showRun(game.card);
  else newRun();
}

function openGallery(tab) {
  sfx.click();
  showGallery(tab, loadStats());
}

function closeGallery() {
  sfx.click();
  hideGallery();
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
mountGallery(closeGallery);
$('btn-restart').addEventListener('click', () => { sfx.click(); hideGameOver(); newRun(); });
$('btn-gameover-menu').addEventListener('click', () => { sfx.click(); hideGameOver(); openTitle(); });
$('btn-play').addEventListener('click', play);
$('btn-new').addEventListener('click', () => { sfx.click(); hideTitle(); clearRun(); newRun(); });
$('btn-endings').addEventListener('click', () => openGallery('endings'));
$('btn-achievements').addEventListener('click', () => openGallery('achievements'));
$('set-sound').addEventListener('click', () => { changeSettings({ muted: !settings.muted }); sfx.click(); });
$('set-theme').addEventListener('click', () => {
  sfx.click();
  changeSettings({ theme: { auto: 'light', light: 'dark', dark: 'auto' }[settings.theme] });
});
$('btn-mute').addEventListener('click', () => { changeSettings({ muted: !settings.muted }); sfx.click(); });
$('btn-menu').addEventListener('click', () => {
  if (locked || titleShowing()) return; // mid-animation: the card is still settling
  sfx.click();
  openTitle();
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && galleryShowing()) closeGallery();
});

sfx.setMuted(settings.muted);
applyTheme();
updateBest();
// Pick up where the player left off, if there's a run in progress, behind the title screen.
const resumed = game.resume(loadRun());
if (resumed) {
  setMeters(game.state.meters, false);
  updateClock();
}
openTitle();
$('boot')?.remove();

// For the tests and the browser console: reigns.game.state, reigns.content, reigns.choose('left').
window.reigns = {
  game,
  content: CONTENT,
  choose: (side) => controller.commit(side),
  locked: () => locked,
  play,
};
