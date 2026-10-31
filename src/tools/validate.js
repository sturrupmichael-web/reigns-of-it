// The card validator: reads everything under data/ (through content.js) and reports
//
//   errors     things that break the game: a broken reference, a missing field, a typo
//              in a field name, an effect on a meter that doesn't exist
//   warnings   things that probably aren't what you meant: a card nothing can ever
//              reach, a label that's too long, a choice with no cost
//   stats      meter balance and how the content is spread out
//
// No DOM and no Node APIs, so `npm run validate` and the validator page both use it.

import { CONTENT, METER_KEYS } from '../content.js';
import { followUpsOf } from '../engine/state.js';

const CARD_KEYS = ['id', 'character', 'text', 'left', 'right', 'conditions', 'weight', 'once', 'followUpOnly'];
const CHOICE_KEYS = ['label', 'effects', 'flags', 'add', 'followUp', 'ending'];
const CONDITION_KEYS = ['requires', 'excludes', 'minYear', 'maxYear', 'weeks', 'meters', 'counters', 'tenure'];
const CHARACTER_KEYS = ['name', 'title', 'bio', 'portrait'];
const ENDING_KEYS = ['id', 'title', 'text', 'icon'];
const SIDES = ['left', 'right'];

const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

// Did they mean one of `allowed`? For "conditon" -> "conditions".
function suggest(key, allowed) {
  const k = key.toLowerCase();
  const near = allowed.find((a) => a.toLowerCase().startsWith(k.slice(0, 4)) || k.startsWith(a.toLowerCase().slice(0, 4)));
  return near ? ` (did you mean "${near}"?)` : '';
}

function unknownKeys(obj, allowed, where, errors) {
  for (const k of Object.keys(obj ?? {})) {
    if (!allowed.includes(k)) errors.push({ where, text: `unknown field "${k}"${suggest(k, allowed)}; the game ignores it` });
  }
}

function checkRange(r, label, where, errors) {
  if (r == null) return;
  if (typeof r !== 'object' || Array.isArray(r)) { errors.push({ where, text: `${label} should look like { min: 2, max: 5 }` }); return; }
  for (const k of Object.keys(r)) if (k !== 'min' && k !== 'max') errors.push({ where, text: `${label} has "${k}"; only min and max work` });
  if (r.min != null && !isNum(r.min)) errors.push({ where, text: `${label}.min is not a number` });
  if (r.max != null && !isNum(r.max)) errors.push({ where, text: `${label}.max is not a number` });
  if (isNum(r.min) && isNum(r.max) && r.min > r.max) errors.push({ where, text: `${label} has min ${r.min} above max ${r.max}, so it can never pass` });
}

function checkConditions(c, where, errors) {
  if (c == null) return;
  unknownKeys(c, CONDITION_KEYS, where, errors);
  for (const k of ['requires', 'excludes']) {
    if (c[k] != null && (!Array.isArray(c[k]) || c[k].some((f) => typeof f !== 'string'))) errors.push({ where, text: `${k} should be a list of flag names, like ['flag_a']` });
  }
  if (Array.isArray(c.requires) && Array.isArray(c.excludes)) {
    for (const f of c.requires) if (c.excludes.includes(f)) errors.push({ where, text: `flag "${f}" is both required and excluded` });
  }
  if (c.weeks != null) {
    const w = c.weeks;
    if (!Array.isArray(w) || w.length !== 2 || !w.every((n) => Number.isInteger(n) && n >= 1 && n <= (CONTENT.config.weeksPerYear || 52))) {
      errors.push({ where, text: 'weeks should be two week numbers from 1 to 52, like [40, 52]' });
    }
  }
  if (isNum(c.minYear) && isNum(c.maxYear) && c.minYear > c.maxYear) errors.push({ where, text: `minYear ${c.minYear} is after maxYear ${c.maxYear}` });
  checkRange(c.tenure, 'tenure', where, errors);
  for (const [k, r] of Object.entries(c.meters ?? {})) {
    if (!METER_KEYS.includes(k)) errors.push({ where, text: `meters condition on unknown meter "${k}"` });
    checkRange(r, `meters.${k}`, where, errors);
  }
  for (const [k, r] of Object.entries(c.counters ?? {})) checkRange(r, `counters.${k}`, where, errors);
}

// What every reachable choice can do to flags: which flags can become truthy, and
// which counters can go up. Starts from the cards that can show up on their own and
// grows until nothing new is reached, so a card that needs a flag only an unreachable
// card sets is itself unreachable.
function reachability() {
  const cards = CONTENT.cards;
  const setTrue = new Set(CONTENT.achievements.map((a) => `ach_${a.id}`));
  const counterUp = new Set();
  const reachable = new Set();
  const referenced = new Set([CONTENT.config.startCard]);

  const canPass = (card) => {
    const c = card.conditions ?? {};
    if ((c.requires ?? []).some((f) => !setTrue.has(f) && !counterUp.has(f))) return false;
    for (const [k, r] of Object.entries(c.counters ?? {})) if (r?.min > 0 && !counterUp.has(k)) return false;
    return true;
  };

  let grew = true;
  while (grew) {
    grew = false;
    for (const card of cards) {
      if (reachable.has(card.id)) continue;
      if (card.followUpOnly && !referenced.has(card.id)) continue;
      if (!canPass(card)) continue;
      reachable.add(card.id);
      grew = true;
      for (const side of SIDES) {
        const ch = card[side] ?? {};
        for (const [f, v] of Object.entries(ch.flags ?? {})) if (v) setTrue.add(f);
        for (const [f, n] of Object.entries(ch.add ?? {})) if (n > 0) counterUp.add(f);
        for (const fu of followUpsOf(ch)) referenced.add(fu.card);
      }
    }
  }
  return { reachable, referenced };
}

export function validateContent() {
  const errors = CONTENT.problems.map((text) => ({ where: 'content', text }));
  const warnings = [];
  const cards = CONTENT.cards;

  // ── Cards ──
  for (const card of cards) {
    const where = `card ${card.id}`;
    unknownKeys(card, CARD_KEYS, where, errors);
    if (!card.character) errors.push({ where, text: 'has no character' });
    if (typeof card.text !== 'string' || !card.text.trim()) errors.push({ where, text: 'has no text' });
    else if (card.text.length > 220) warnings.push({ where, text: `text is ${card.text.length} characters; over about 200 it crowds the card on a phone` });
    if (card.weight != null && !(isNum(card.weight) && card.weight > 0)) errors.push({ where, text: 'weight should be a number above 0' });
    checkConditions(card.conditions, where, errors);

    for (const side of SIDES) {
      const ch = card[side];
      const w = `${where}, ${side}`;
      if (!ch || typeof ch !== 'object') continue; // content.js already reported it
      unknownKeys(ch, CHOICE_KEYS, w, errors);
      if (ch.label && words(ch.label) > 5) warnings.push({ where: w, text: `label "${ch.label}" is ${words(ch.label)} words; 2-5 reads best while dragging` });
      for (const [k, v] of Object.entries(ch.effects ?? {})) {
        if (!isNum(v)) errors.push({ where: w, text: `effect on ${k} is not a number` });
        else if (Math.abs(v) > 30) warnings.push({ where: w, text: `${k} ${v > 0 ? '+' : ''}${v} is huge; most effects are 5-15` });
      }
      for (const fu of followUpsOf(ch)) {
        if (fu.delay != null && !(Number.isInteger(fu.delay) && fu.delay >= 0)) errors.push({ where: w, text: `follow-up "${fu.card}" has a delay that isn't a whole number` });
      }
      const fx = Object.values(ch.effects ?? {}).filter((v) => v);
      if (!ch.ending && fx.length && fx.every((v) => v > 0) && !ch.add && !ch.flags && !ch.followUp) {
        warnings.push({ where: w, text: 'only gains and nothing comes back later: fine for a reward, otherwise give it a cost' });
      }
      if (!ch.ending && !fx.length && !ch.flags && !ch.add && !ch.followUp) warnings.push({ where: w, text: 'does nothing at all' });
    }
  }

  // ── Reachability ──
  const { reachable, referenced } = reachability();
  for (const card of cards) {
    if (reachable.has(card.id)) continue;
    const why = card.followUpOnly && !referenced.has(card.id)
      ? 'it is followUpOnly, but no choice follows up with it'
      : 'it needs a flag or counter that no reachable card ever sets';
    warnings.push({ where: `card ${card.id}`, text: `can never appear: ${why}` });
  }

  // ── Characters ──
  const used = {};
  for (const card of cards) used[card.character] = (used[card.character] || 0) + 1;
  for (const ch of Object.values(CONTENT.characters)) {
    const where = `character ${ch.id}`;
    unknownKeys(Object.fromEntries(Object.entries(ch).filter(([k]) => k !== 'id')), CHARACTER_KEYS, where, errors);
    if (!ch.name) errors.push({ where, text: 'has no name' });
    if (!ch.title) errors.push({ where, text: 'has no title' });
    if (!ch.portrait) errors.push({ where, text: 'has no portrait' });
    if (!used[ch.id]) warnings.push({ where, text: 'no card uses this character' });
  }

  // ── Endings ──
  const endingUses = new Set(METER_KEYS.flatMap((k) => [`${k}_min`, `${k}_max`]));
  for (const card of cards) for (const side of SIDES) if (card[side]?.ending) endingUses.add(card[side].ending);
  for (const e of Object.values(CONTENT.endings)) {
    const where = `ending ${e.id}`;
    unknownKeys(e, ENDING_KEYS, where, errors);
    if (!e.title) errors.push({ where, text: 'has no title' });
    if (!e.text) errors.push({ where, text: 'has no text' });
    if (!endingUses.has(e.id)) warnings.push({ where, text: 'no card choice ends with it, so it can never happen' });
  }

  // ── Achievements ──
  for (const a of CONTENT.achievements) {
    const where = `achievement ${a.id}`;
    if (!a.icon) warnings.push({ where, text: 'has no icon' });
    if (!a.text) errors.push({ where, text: 'has no text' });
    if (a.unlocks && !cards.some((c) => c.conditions?.requires?.includes(`ach_${a.id}`))) {
      warnings.push({ where, text: `says it unlocks something, but no card requires "ach_${a.id}"` });
    }
  }

  return { errors, warnings, stats: contentStats(reachable) };
}

// Meter balance and how the content is spread out.
export function contentStats(reachable = null) {
  const cards = CONTENT.cards;
  const meters = METER_KEYS.map((key) => {
    let up = 0, down = 0, touched = 0;
    for (const card of cards) for (const side of SIDES) {
      const v = card[side]?.effects?.[key] || 0;
      if (v > 0) up += v; else down += v;
      if (v) touched++;
    }
    return { key, label: CONTENT.meters.find((m) => m.key === key).label, up, down, net: up + down, touched };
  });

  // How many meters each choice touches (the brief: most should touch 2-3).
  const touches = {};
  let choices = 0;
  for (const card of cards) for (const side of SIDES) {
    if (card[side]?.ending) continue;
    const n = Object.values(card[side]?.effects ?? {}).filter((v) => v).length;
    touches[n] = (touches[n] || 0) + 1;
    choices++;
  }

  const byCharacter = Object.values(CONTENT.characters)
    .map((ch) => ({ id: ch.id, name: ch.name, cards: cards.filter((c) => c.character === ch.id).length }))
    .sort((a, b) => b.cards - a.cards);

  return {
    cards: cards.length,
    standalone: cards.filter((c) => !c.followUpOnly && !c.conditions?.requires).length,
    followUpOnly: cards.filter((c) => c.followUpOnly).length,
    once: cards.filter((c) => c.once).length,
    seasonal: cards.filter((c) => c.conditions?.weeks).length,
    reachable: reachable ? reachable.size : null,
    characters: Object.keys(CONTENT.characters).length,
    endings: Object.keys(CONTENT.endings).length,
    achievements: CONTENT.achievements.length,
    meters,
    choices,
    touches,
    byCharacter,
  };
}
