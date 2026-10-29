// Balance report: plays thousands of runs with two simple bots and prints how long
// runs last, which endings come up, and which cards are rarely or never seen.
//
//   npm run balance            2000 runs per bot
//   npm run balance -- 10000   more runs
//
// "random" picks a side at random. "careful" picks the side that keeps the meters
// closest to the middle, which is roughly how a decent player behaves, and is the
// one that reaches the late arcs.

import { CONTENT, METER_KEYS } from '../src/content.js';
import { createGame } from '../src/engine/game.js';

const RUNS = Number(process.argv[2]) || 2000;
const MAX_TURNS = 2000;

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// How far the meters would sit from the middle after a choice; lower is safer.
function risk(state, choice) {
  if (choice.ending) return Infinity;
  let worst = 0;
  for (const k of METER_KEYS) {
    const v = state.meters[k] + (choice.effects?.[k] || 0);
    worst = Math.max(worst, Math.abs(v - 50));
  }
  return worst;
}

const BOTS = {
  random: (game, rng) => (rng() < 0.5 ? 'left' : 'right'),
  careful: (game, rng) => {
    const l = risk(game.state, game.card.left);
    const r = risk(game.state, game.card.right);
    return l === r ? (rng() < 0.5 ? 'left' : 'right') : l < r ? 'left' : 'right';
  },
};

function play(bot, seed) {
  const rng = seeded(seed);
  const game = createGame(seeded(seed * 7919));
  game.start();
  const seen = new Set();
  let result = null;
  while (game.card && game.state.turn < MAX_TURNS) {
    seen.add(game.card.id);
    result = game.choose(bot(game, rng));
    if (result.ending) break;
  }
  return { turns: game.state.turn, ending: result?.ending || 'none', seen };
}

function pct(n, total) {
  return `${((100 * n) / total).toFixed(1)}%`.padStart(6);
}

// Net effect of every choice on each meter. Close to zero means no meter
// drifts one way on its own.
console.log('\nNet effect per meter, summed over every choice:');
for (const k of METER_KEYS) {
  let up = 0, down = 0;
  for (const card of CONTENT.cards) {
    for (const side of ['left', 'right']) {
      const v = card[side].effects?.[k] || 0;
      if (v > 0) up += v; else down += v;
    }
  }
  console.log(`  ${k.padEnd(10)} +${up} / ${down}  net ${up + down}`);
}

for (const [name, bot] of Object.entries(BOTS)) {
  const endings = {};
  const seenCount = {};
  const lengths = [];
  for (let s = 1; s <= RUNS; s++) {
    const r = play(bot, s);
    lengths.push(r.turns);
    endings[r.ending] = (endings[r.ending] || 0) + 1;
    for (const id of r.seen) seenCount[id] = (seenCount[id] || 0) + 1;
  }
  lengths.sort((a, b) => a - b);
  const avg = lengths.reduce((a, b) => a + b, 0) / RUNS;
  console.log(`\n== ${name} bot, ${RUNS} runs ==`);
  console.log(`Weeks survived: average ${avg.toFixed(1)}, median ${lengths[RUNS >> 1]}, ` +
    `10th pct ${lengths[Math.floor(RUNS * 0.1)]}, 90th pct ${lengths[Math.floor(RUNS * 0.9)]}, longest ${lengths[RUNS - 1]}`);
  console.log('Endings:');
  for (const [id, n] of Object.entries(endings).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pct(n, RUNS)}  ${id}`);
  }
  const never = CONTENT.cards.filter((c) => !seenCount[c.id]).map((c) => c.id);
  console.log(`Cards seen at least once: ${CONTENT.cards.length - never.length}/${CONTENT.cards.length}`);
  if (never.length) console.log(`  never seen: ${never.join(', ')}`);
}
