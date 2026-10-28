// Loads everything under data/ into one CONTENT object the engine and UI read
// from, with lookups by id. Content mistakes (duplicate ids, a card naming a
// character that doesn't exist) are reported in CONTENT.problems and logged,
// and `npm test` fails on them.

import { CONFIG, METERS } from '../data/config.js';
import { CHARACTERS } from '../data/characters.js';
import { ENDINGS } from '../data/endings.js';
import { ALL_CARDS } from '../data/cards/index.js';

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
      const fu = typeof c.followUp === 'string' ? c.followUp : c.followUp?.card;
      if (fu && !cardById[fu]) problems.push(`card "${card.id}": ${side} follows up with unknown card "${fu}"`);
      if (c.ending && !ENDINGS[c.ending]) problems.push(`card "${card.id}": ${side} ends with unknown ending "${c.ending}"`);
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
