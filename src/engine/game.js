// Game controller: owns the current run and exposes a tiny API to the UI.
// Still no DOM here; the UI calls these and renders what comes back.
//
//   game.start()          begins a new run, returns the first card
//   game.state / .card    the current run and card
//   game.choose('left')   applies the choice, returns { before, after, ending, next }

import { CONTENT } from '../content.js';
import { newRun, applyChoice } from './state.js';
import { drawCard } from './deck.js';

export function createGame(rng = Math.random) {
  const game = {
    state: null,
    card: null,

    start() {
      game.state = newRun();
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
  };
  return game;
}

// The ending record for an id, with a safe fallback.
export function endingFor(id) {
  return CONTENT.endings[id] ?? { id, icon: '❓', title: 'The End', text: 'Your tenure is over.' };
}
