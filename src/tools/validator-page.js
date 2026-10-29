// The validator page (validator.html): runs the same checks as `npm run validate` in the
// browser and draws the results. Built into one self-contained file like the game.

import { CONTENT } from '../content.js';
import { validateContent } from './validate.js';
import { simulate } from './simulate.js';
import { followUpsOf } from '../engine/state.js';

const $ = (id) => document.getElementById(id);
const sign = (n) => (n > 0 ? `+${n}` : String(n));

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

const { errors, warnings, stats } = validateContent();

// ── Summary tiles ──
function tile(label, value, state) {
  const t = el('div', `tile ${state ?? ''}`);
  t.append(el('b', null, String(value)), el('span', null, label));
  return t;
}
$('tiles').append(
  tile(errors.length === 1 ? 'error' : 'errors', errors.length, errors.length ? 'bad' : 'good'),
  tile(warnings.length === 1 ? 'warning' : 'warnings', warnings.length, warnings.length ? 'warn' : 'good'),
  tile(`cards (${stats.reachable} reachable)`, stats.cards),
  tile('characters', stats.characters),
  tile('endings', stats.endings),
  tile('achievements', stats.achievements),
);

// ── Issues ──
function issues(list, target, countEl, empty) {
  countEl.textContent = list.length;
  if (!list.length) { target.append(el('li', 'none', empty)); return; }
  for (const i of list) {
    const li = el('li');
    li.append(el('code', null, i.where), document.createTextNode(` ${i.text}`));
    target.append(li);
  }
}
issues(errors, $('errors'), $('n-errors'), 'None. Nothing is broken.');
issues(warnings, $('warnings'), $('n-warnings'), 'None.');

// ── Meter balance: gains to the right, costs to the left, on one shared scale ──
const scale = Math.max(...stats.meters.flatMap((m) => [m.up, -m.down]));
for (const m of stats.meters) {
  const row = el('div', 'bal-row');
  row.title = `${m.label}: ${sign(m.up)} in gains, ${m.down} in costs, net ${sign(m.net)}, on ${m.touched} choices`;
  const icon = CONTENT.meters.find((x) => x.key === m.key).icon;
  row.append(el('span', 'bal-name', `${icon} ${m.label}`));
  const track = el('span', 'bal-track');
  const down = el('span', 'bal-bar down');
  down.style.width = `${(50 * -m.down) / scale}%`;
  const up = el('span', 'bal-bar up');
  up.style.width = `${(50 * m.up) / scale}%`;
  track.append(down, up);
  row.append(track, el('span', 'bal-num', `${m.down} / ${sign(m.up)}`), el('span', `bal-net ${Math.abs(m.net) > 150 ? 'hot' : ''}`, `net ${sign(m.net)}`));
  $('balance').append(row);
}
$('touches').textContent = 'Meters touched per choice: ' + Object.entries(stats.touches)
  .sort()
  .map(([n, c]) => `${n} meter${n === '1' ? '' : 's'} on ${c} (${Math.round((100 * c) / stats.choices)}%)`)
  .join(', ') + '. Most choices should touch 2 or 3.';

// ── Simulation ──
function simResult(r) {
  const box = el('div', 'sim-bot');
  box.append(el('h3', null, `${r.bot === 'random' ? 'Random swiper' : 'Careful player'}: ${r.average.toFixed(1)} weeks on average`));
  box.append(el('p', 'hint', `Median ${r.median} weeks, 10% of runs end by week ${r.p10}, 10% last past week ${r.p90}, longest ${r.longest}.`));
  const max = r.endings[0]?.[1] ?? 1;
  for (const [id, n] of r.endings) {
    const row = el('div', 'end-row');
    const e = CONTENT.endings[id];
    const pct = (100 * n) / r.runs;
    row.title = `${e?.title ?? id}: ${n} of ${r.runs} runs`;
    row.append(el('span', 'end-name', `${e?.icon ?? ''} ${e?.title ?? id}`));
    const bar = el('span', 'end-track');
    const fill = el('span', 'end-bar');
    fill.style.width = `${(100 * n) / max}%`;
    bar.append(fill);
    row.append(bar, el('span', 'end-pct', `${pct.toFixed(1)}%`));
    box.append(row);
  }
  box.append(el('p', 'hint', r.neverSeen.length
    ? `Never seen in ${r.runs} runs: ${r.neverSeen.join(', ')}.`
    : `Every card turned up at least once in ${r.runs} runs.`));
  return box;
}
$('btn-sim').addEventListener('click', () => {
  const btn = $('btn-sim');
  btn.disabled = true;
  btn.textContent = 'Playing...';
  $('sim').replaceChildren();
  // Let the button repaint before the (synchronous) simulation blocks the page.
  setTimeout(() => {
    $('sim').append(simResult(simulate('random', 500)), simResult(simulate('careful', 500)));
    btn.disabled = false;
    btn.textContent = 'Play again';
  }, 30);
});

// ── Cards per character ──
const most = stats.byCharacter[0]?.cards || 1;
for (const c of stats.byCharacter) {
  const row = el('div', 'char-row');
  row.append(el('span', 'char-name', c.name));
  const track = el('span', 'end-track');
  const fill = el('span', 'end-bar');
  fill.style.width = `${(100 * c.cards) / most}%`;
  track.append(fill);
  row.append(track, el('span', 'end-pct', String(c.cards)));
  $('chars').append(row);
}

// ── All cards ──
function effects(fx) {
  return Object.entries(fx ?? {}).map(([k, v]) => `${CONTENT.meters.find((m) => m.key === k)?.icon ?? k} ${sign(v)}`).join('  ');
}
function sideLine(side, ch) {
  const bits = [effects(ch.effects)];
  if (ch.flags) bits.push(`flags ${Object.entries(ch.flags).map(([k, v]) => (v ? k : `no ${k}`)).join(', ')}`);
  if (ch.add) bits.push(Object.entries(ch.add).map(([k, v]) => `${k} ${sign(v)}`).join(', '));
  const fus = followUpsOf(ch);
  if (fus.length) bits.push(`then ${fus.map((f) => (f.delay ? `${f.card} (+${f.delay})` : f.card)).join(', ')}`);
  if (ch.ending) bits.push(`ENDS: ${ch.ending}`);
  const p = el('p', 'side');
  p.append(el('b', null, `${side === 'left' ? '←' : '→'} ${ch.label}`), document.createTextNode(`  ${bits.filter(Boolean).join(' · ')}`));
  return p;
}
const cardEls = CONTENT.cards.map((card) => {
  const d = el('details', 'card');
  const s = el('summary');
  s.append(el('code', null, card.id), document.createTextNode(` ${CONTENT.characters[card.character]?.name ?? card.character}`));
  const tags = [card.followUpOnly && 'follow-up', card.once && 'once', card.conditions?.weeks && `weeks ${card.conditions.weeks.join('-')}`].filter(Boolean);
  if (tags.length) s.append(el('span', 'tags', tags.join(' · ')));
  d.append(s, el('p', 'text', card.text), sideLine('left', card.left), sideLine('right', card.right));
  if (card.conditions) d.append(el('p', 'cond', `Conditions: ${JSON.stringify(card.conditions)}`));
  d.dataset.search = JSON.stringify(card).toLowerCase() + ' ' + (CONTENT.characters[card.character]?.name ?? '').toLowerCase();
  return d;
});
$('cards').append(...cardEls);
$('search').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  for (const c of cardEls) c.hidden = q && !c.dataset.search.includes(q);
});

$('boot')?.remove();
window.validator = { errors, warnings, stats };
