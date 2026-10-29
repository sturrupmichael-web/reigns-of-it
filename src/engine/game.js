// Game controller: owns the current run and exposes a tiny API to the UI.
// Still no DOM here; the UI calls these and renders what comes back.
//
//   game.start(options)   begins a new run, returns the first card
//   game.state / .card    the current run and card
//   game.choose('left')   applies the choice, returns { before, after, ending, next }
//   game.snapshot()       the run as JSON-safe data, for saving
//   game.resume(saved)    continues a saved run

import { CONTENT, METER_KEYS } from '../content.js';
import { newRun, applyChoice } from './state.js';
import { drawCard } from './deck.js';

// Bump when the shape of the run state changes, so old saves are ignored
// instead of half-loaded.
const SAVE_VERSION = 1;

export function createGame(rng = Math.random) {
  const game = {
    state: null,
    card: null,

    // options: { unlocked, director }, see newRun().
    start(options) {
      game.state = newRun(options);
      game.card = drawCard(game.state, rng);
      return game.card;
    },

    choose(side) {
      const { state, card } = game;
      if (!state || !card || state.ended) return null;
      const result = applyChoice(state, card, side);
      game.card = result.ending ? null : drawCard(state, rng);
      // Ran out of cards entirely: shouldn't happen with real content, but
      // don't leave the player staring at nothing.
      if (!result.ending && !game.card) {
        console.warn('[Reigns of IT] No eligible cards left; ending the run.');
        result.ending = state.ended = 'patience_min';
      }
      result.next = game.card;
      return result;
    },

    // A JSON-safe copy of the run in progress, for saving. null once it's over.
    snapshot() {
      if (!game.state || !game.card || game.state.ended) return null;
      return { v: SAVE_VERSION, state: game.state, card: game.card.id };
    },

    // Picks a saved run back up. Returns the current card, or null (and
    // changes nothing) if the save is from an older version, is damaged, or
    // names a card that no longer exists.
    resume(saved) {
      if (!saved || saved.v !== SAVE_VERSION) return null;
      const card = CONTENT.cardById[saved.card];
      const s = saved.state;
      const valid = card && s && !s.ended && Number.isInteger(s.turn) &&
        METER_KEYS.every((k) => typeof s.meters?.[k] === 'number') &&
        Array.isArray(s.queue) && Array.isArray(s.recent) && s.flags && s.seen;
      if (!valid) return null;
      game.state = s;
      game.card = card;
      return card;
    },
  };
  return game;
}

// The ending record for an id, with a safe fallback.
export function endingFor(id) {
  return CONTENT.endings[id] ?? { id, icon: '❓', title: 'The End', text: 'Your tenure is over.' };
}
