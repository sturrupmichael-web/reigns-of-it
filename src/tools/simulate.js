// Plays the game with simple bots, with no screen, to see how the content behaves:
// how long runs last, which endings come up, and which cards ever turn up. Used by
// `npm run balance` and the validator page.
//
//   random   swipes left or right at random
//   careful  picks the side that keeps every meter closest to the middle, roughly how a
//            decent player plays (and the one that reaches the late arcs)

import { CONTENT, METER_KEYS } from '../content.js';
import { createGame } from '../engine/game.js';

const MAX_TURNS = 2000;

// A repeatable random number generator, so a run can be replayed from its seed.
export function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// How far the meters would sit from the middle after a choice; lower is safer.
function risk(state, choice) {
  if (choice.ending) return Infinity;
  let worst = 0;
  for (const k of METER_KEYS) worst = Math.max(worst, Math.abs(state.meters[k] + (choice.effects?.[k] || 0) - 50));
  return worst;
}

export const BOTS = {
  random: (game, rng) => (rng() < 0.5 ? 'left' : 'right'),
  careful: (game, rng) => {
    const l = risk(game.state, game.card.left);
    const r = risk(game.state, game.card.right);
    return l === r ? (rng() < 0.5 ? 'left' : 'right') : l < r ? 'left' : 'right';
  },
};

function play(bot, seed, unlocked) {
  const rng = seeded(seed);
  const game = createGame(seeded(seed * 7919));
  game.start({ unlocked });
  const seen = new Set();
  let ending = 'none';
  while (game.card && game.state.turn < MAX_TURNS) {
    seen.add(game.card.id);
    const result = game.choose(bot(game, rng));
    if (result.ending) { ending = result.ending; break; }
  }
  return { turns: game.state.turn, ending, seen };
}

// Plays `runs` games with one bot. With `allUnlocked`, every achievement counts as
// already unlocked, so legacy cards can turn up too.
export function simulate(botName, runs = 1000, { allUnlocked = true } = {}) {
  const unlocked = allUnlocked ? Object.fromEntries(CONTENT.achievements.map((a) => [a.id, true])) : {};
  const endings = {};
  const seenCount = {};
  const lengths = [];
  for (let s = 1; s <= runs; s++) {
    const r = play(BOTS[botName], s, unlocked);
    lengths.push(r.turns);
    endings[r.ending] = (endings[r.ending] || 0) + 1;
    for (const id of r.seen) seenCount[id] = (seenCount[id] || 0) + 1;
  }
  lengths.sort((a, b) => a - b);
  const at = (p) => lengths[Math.min(runs - 1, Math.floor(runs * p))];
  return {
    bot: botName,
    runs,
    average: lengths.reduce((a, b) => a + b, 0) / runs,
    median: at(0.5),
    p10: at(0.1),
    p90: at(0.9),
    longest: lengths[runs - 1],
    endings: Object.entries(endings).sort((a, b) => b[1] - a[1]),
    seenCount,
    neverSeen: CONTENT.cards.filter((c) => !seenCount[c.id]).map((c) => c.id),
  };
}
