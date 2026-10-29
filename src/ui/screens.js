// Overlay screens: the title screen, the endings and achievements gallery, the game
// over screen, and the achievement banner. They only draw; main.js decides when.

import { CONTENT, METER_KEYS } from '../content.js';
import { calendar } from '../engine/state.js';
import { endingFor } from '../engine/game.js';

const $ = (id) => document.getElementById(id);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const METER_ENDINGS = METER_KEYS.flatMap((k) => [`${k}_min`, `${k}_max`]);

export const directorLabel = (d) => (d ? `IT Director #${d.number}` : 'IT Director');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function open(overlay, focus) {
  overlay.hidden = false;
  // Let the hidden -> shown change apply before animating in.
  requestAnimationFrame(() => {
    overlay.classList.add('show');
    focus?.focus({ preventScroll: true });
  });
}

function close(overlay) {
  overlay.classList.remove('show');
  overlay.hidden = true;
}

const foundEndings = (stats) => Object.keys(stats.endings).filter((id) => CONTENT.endings[id]);
const unlockedCount = (stats) => CONTENT.achievements.filter((a) => stats.achievements[a.id]).length;

// ── Title screen ──────────────────────────────────────────────────────────

// `run`: the saved run's state if there's one to continue, else null.
// `nextNumber`: the number the next new director would get.
export function showTitle({ stats, run, nextNumber, settings }) {
  const cont = !!run;
  if (cont) {
    const cal = calendar(run.turn);
    $('title-director').textContent = `${directorLabel(run.director)}${run.director?.name ? `, ${run.director.name},` : ''} is at Year ${cal.year}, Week ${cal.week}.`;
  } else {
    $('title-director').textContent = stats.runs
      ? `IT Director #${nextNumber} starts Monday. ${plural(stats.runs, 'predecessor')} didn't make it.`
      : 'You\'re the new IT Director. Good luck.';
  }
  $('btn-play').textContent = cont ? 'Continue' : stats.runs ? `Start as IT Director #${nextNumber}` : 'Start';
  $('btn-new').hidden = !cont;
  $('count-endings').textContent = `${foundEndings(stats).length}/${Object.keys(CONTENT.endings).length}`;
  $('count-achievements').textContent = `${unlockedCount(stats)}/${CONTENT.achievements.length}`;
  $('title-stats').textContent = stats.runs
    ? `${plural(stats.runs, 'run')} · best ${plural(stats.bestWeeks, 'week')} · ${plural(stats.totalWeeks, 'week')} served in total`
    : '';
  updateSettings(settings);
  open($('title'), $('btn-play'));
}

export const hideTitle = () => close($('title'));
export const titleShowing = () => !$('title').hidden;

export function updateSettings(settings) {
  $('set-sound').textContent = `Sound: ${settings.muted ? 'Off' : 'On'}`;
  $('set-sound').setAttribute('aria-pressed', String(!settings.muted));
  $('set-theme').textContent = `Theme: ${settings.theme[0].toUpperCase()}${settings.theme.slice(1)}`;
  $('btn-mute').querySelector('span').textContent = settings.muted ? '🔇' : '🔊';
  $('btn-mute').setAttribute('aria-pressed', String(!settings.muted));
  $('btn-mute').setAttribute('aria-label', settings.muted ? 'Sound off' : 'Sound on');
}

// ── Gallery ───────────────────────────────────────────────────────────────

function endingTile(id, stats) {
  const e = CONTENT.endings[id];
  const times = stats.endings[id] || 0;
  const tile = el('div', `tile${times ? '' : ' locked'}`);
  if (times) {
    tile.append(el('span', 'tile-icon', e.icon ?? '💀'));
    const body = el('span', 'tile-body');
    body.append(el('b', null, e.title), el('span', null, e.text), el('small', null, `Reached ${plural(times, 'time')}`));
    tile.append(body);
  } else {
    // Meter endings hint at which meter; story endings stay a mystery.
    const meter = CONTENT.meters.find((m) => id === `${m.key}_min` || id === `${m.key}_max`);
    tile.append(el('span', 'tile-icon', meter ? meter.icon : '❔'));
    const body = el('span', 'tile-body');
    body.append(el('b', null, '???'), el('span', null, meter ? `${meter.label} ${id.endsWith('_min') ? 'hits 0' : 'hits 100'}.` : 'A story ending. Your choices will find it.'));
    tile.append(body);
  }
  return tile;
}

function achievementTile(a, stats) {
  const got = !!stats.achievements[a.id];
  const tile = el('div', `tile${got ? '' : ' locked'}`);
  tile.append(el('span', 'tile-icon', got ? a.icon : '🔒'));
  const body = el('span', 'tile-body');
  body.append(el('b', null, a.title), el('span', null, a.text));
  if (a.unlocks) body.append(el('small', null, got ? `Unlocked: ${a.unlocks}` : 'Unlocks something in future runs'));
  tile.append(body);
  return tile;
}

let galleryStats = null;

function renderGallery(tab) {
  const stats = galleryStats;
  $('tab-endings').setAttribute('aria-selected', String(tab === 'endings'));
  $('tab-achievements').setAttribute('aria-selected', String(tab === 'achievements'));
  const list = $('gallery-list');
  if (tab === 'endings') {
    const ids = [...METER_ENDINGS, ...Object.keys(CONTENT.endings).filter((id) => !METER_ENDINGS.includes(id))];
    $('gallery-sub').textContent = `${foundEndings(stats).length} of ${ids.length} endings found`;
    list.replaceChildren(...ids.map((id) => endingTile(id, stats)));
  } else {
    $('gallery-sub').textContent = `${unlockedCount(stats)} of ${CONTENT.achievements.length} unlocked`;
    list.replaceChildren(...CONTENT.achievements.map((a) => achievementTile(a, stats)));
  }
  list.scrollTop = 0;
  list.querySelectorAll('.tile').forEach((t, i) => t.style.setProperty('--i', i));
}

export function showGallery(tab, stats) {
  galleryStats = stats;
  renderGallery(tab);
  open($('gallery'), $(`tab-${tab}`));
}

export const hideGallery = () => close($('gallery'));
export const galleryShowing = () => !$('gallery').hidden;

export function mountGallery(onClose) {
  $('tab-endings').addEventListener('click', () => renderGallery('endings'));
  $('tab-achievements').addEventListener('click', () => renderGallery('achievements'));
  $('btn-gallery-close').addEventListener('click', onClose);
}

// ── Game over ─────────────────────────────────────────────────────────────

// `record` is what save.js recordRun() returned for this run; `earned` the
// achievements this run unlocked, as ids.
export function showGameOver(endingId, state, record, earned = []) {
  const ending = endingFor(endingId);
  const cal = calendar(state.turn - 1);
  const d = state.director;
  $('end-kicker').textContent = d ? `${directorLabel(d)} is out` : 'Your tenure has ended';
  $('end-icon').textContent = ending.icon ?? '💀';
  $('end-title').textContent = ending.title;
  $('end-text').textContent = ending.text;
  $('end-stats').textContent = `${d?.name ?? 'You'} lasted ${plural(state.turn, 'week')} (Year ${cal.year}, Week ${cal.week}).`;

  const found = foundEndings(record).length;
  // One line per fact; the news (a new best, a new ending, achievements) is highlighted.
  const lines = [];
  if (record.isBest && record.prevBest > 0) lines.push([`New best! Your old record was ${plural(record.prevBest, 'week')}.`, true]);
  else if (!record.isBest) lines.push([`Your best is ${plural(record.bestWeeks, 'week')}.`, false]);
  lines.push([`${record.firstEnding ? 'New ending! ' : ''}Endings found: ${found} of ${Object.keys(CONTENT.endings).length}.`, record.firstEnding]);
  for (const id of earned) {
    const a = CONTENT.achievements.find((x) => x.id === id);
    if (a) lines.push([`${a.icon} Achievement: ${a.title}`, true]);
  }
  $('end-record').replaceChildren(...lines.map(([text, news]) => {
    const line = el('span', news ? 'highlight' : '', text);
    return line;
  }));
  open($('gameover'), $('btn-restart'));
}

export const hideGameOver = () => close($('gameover'));

// ── Achievement banner ────────────────────────────────────────────────────

const bannerQueue = [];
let bannerBusy = false;

// Slides in from the top for a couple of seconds, one at a time.
export function announceAchievement(id, onShow) {
  const a = CONTENT.achievements.find((x) => x.id === id);
  if (!a) return;
  bannerQueue.push(a);
  if (!bannerBusy) nextBanner(onShow);
}

function nextBanner(onShow) {
  const a = bannerQueue.shift();
  const b = $('banner');
  if (!a) { bannerBusy = false; b.hidden = true; return; }
  bannerBusy = true;
  $('banner-icon').textContent = a.icon;
  $('banner-title').textContent = a.title;
  b.hidden = false;
  b.classList.remove('show');
  void b.offsetWidth;
  b.classList.add('show');
  onShow?.();
  setTimeout(() => nextBanner(onShow), 2600);
}
