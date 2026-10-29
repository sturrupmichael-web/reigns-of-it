// Loads everything under data/ into one CONTENT object the engine and UI read
// from, with lookups by id. Content mistakes (duplicate ids, a card naming a
// character that doesn't exist) are reported in CONTENT.problems and logged,
// and `npm test` fails on them.

import { CONFIG, METERS } from '../data/config.js';
import { CHARACTERS } from '../data/characters.js';
import { ENDINGS } from '../data/endings.js';
import { ALL_CARDS } from '../data/cards/index.js';
import { followUpsOf } from './engine/state.js';

export const METER_KEYS = METERS.map((m) => m.key);

function load() {
  const problems = [];
  const cardById = {};
  for (const card of ALL_CARDS) {
    if (!card || !card.id) problems.push('a card has no id');
    else if (cardById[card.id]) problems.push(`duplicate card id "${card.id}"`);
    else cardById[card.id] = card;
  }
  for (const card of Object.values(cardById)) {
    if (!CHARACTERS[card.character]) problems.push(`card "${card.id}": unknown character "${card.character}"`);
    for (const side of ['left', 'right']) {
      const c = card[side];
      if (!c || !c.label) { problems.push(`card "${card.id}": ${side} side has no label`); continue; }
      for (const k of Object.keys(c.effects ?? {})) {
        if (!METER_KEYS.includes(k)) problems.push(`card "${card.id}": ${side} effect on unknown meter "${k}"`);
      }
      for (const [k, n] of Object.entries(c.add ?? {})) {
        if (typeof n !== 'number') problems.push(`card "${card.id}": ${side} adds a non-number to counter "${k}"`);
      }
      for (const fu of followUpsOf(c)) {
        if (!cardById[fu.card]) problems.push(`card "${card.id}": ${side} follows up with unknown card "${fu.card}"`);
      }
      if (c.ending && !ENDINGS[c.ending]) problems.push(`card "${card.id}": ${side} ends with unknown ending "${c.ending}"`);
    }
  }
  // A flag or counter that a condition checks but no choice ever sets is almost
  // always a typo, and the card behind it can never (or always) appear.
  const set = new Set();
  for (const card of Object.values(cardById)) {
    for (const side of ['left', 'right']) for (const k of [...Object.keys(card[side]?.flags ?? {}), ...Object.keys(card[side]?.add ?? {})]) set.add(k);
  }
  for (const card of Object.values(cardById)) {
    const c = card.conditions ?? {};
    for (const k of [...(c.requires ?? []), ...(c.excludes ?? []), ...Object.keys(c.counters ?? {})]) {
      if (!set.has(k)) problems.push(`card "${card.id}": checks flag "${k}", which no choice sets`);
    }
  }
  if (CONFIG.startCard && !cardById[CONFIG.startCard]) problems.push(`config.startCard "${CONFIG.startCard}" is not a card`);
  for (const k of METER_KEYS) {
    for (const end of ['min', 'max']) if (!ENDINGS[`${k}_${end}`]) problems.push(`missing ending "${k}_${end}"`);
  }
  for (const p of problems) console.warn(`[Reigns of IT] ${p}`);

  const characters = {};
  for (const [id, ch] of Object.entries(CHARACTERS)) characters[id] = { id, ...ch };
  const endings = {};
  for (const [id, e] of Object.entries(ENDINGS)) endings[id] = { id, ...e };

  return { config: CONFIG, meters: METERS, characters, endings, cards: Object.values(cardById), cardById, problems };
}

export const CONTENT = load();
