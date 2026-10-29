// The engine and the content, without a browser: the data loads cleanly, choices move the
// meters, flags and follow-ups work, every meter bound has its ending, and random runs
// always end without running out of cards.

import { assert } from './harness.mjs';
import { CONTENT, METER_KEYS } from '../src/content.js';
import { newRun, applyChoice, calendar } from '../src/engine/state.js';
import { drawCard } from '../src/engine/deck.js';
import { createGame } from '../src/engine/game.js';

// A repeatable random number generator, so a failing run can be replayed.
function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export const tests = [
  ['the content loads with no problems', async () => {
    assert(CONTENT.problems.length === 0, CONTENT.problems.join('\n'));
    assert(CONTENT.cards.length >= 10, `only ${CONTENT.cards.length} cards`);
  }],

  ['every run opens with the start card', async () => {
    const card = drawCard(newRun());
    assert(card.id === CONTENT.config.startCard, `first card was ${card.id}`);
  }],

  ['a choice applies its effects and advances the week', async () => {
    const state = newRun();
    const card = { id: 't', left: { label: 'x', effects: { budget: -10, security: 5 } }, right: { label: 'y' } };
    applyChoice(state, card, 'left');
    assert(state.meters.budget === 40 && state.meters.security === 55, JSON.stringify(state.meters));
    assert(state.turn === 1, `turn ${state.turn}`);
  }],

  ['the calendar rolls over after 52 weeks', async () => {
    const a = calendar(0);
    const b = calendar(52);
    assert(a.year === 1 && a.week === 1, JSON.stringify(a));
    assert(b.year === 2 && b.week === 1, JSON.stringify(b));
  }],

  ['each meter ends the run at 0 and at 100 with its own ending', async () => {
    const titles = new Set();
    for (const k of METER_KEYS) {
      for (const [delta, end] of [[-100, 'min'], [100, 'max']]) {
        const state = newRun();
        const r = applyChoice(state, { id: 't', left: { label: 'x', effects: { [k]: delta } } }, 'left');
        assert(r.ending === `${k}_${end}`, `${k} ${end}: got ${r.ending}`);
        titles.add(CONTENT.endings[r.ending].title);
      }
    }
    assert(titles.size === METER_KEYS.length * 2, 'two endings share a title');
  }],

  ['the Sales VP gets admin, and three weeks later the crypto miner turns up', async () => {
    const state = newRun();
    drawCard(state);
    applyChoice(state, CONTENT.cardById.sales_vp_admin, 'right');
    assert(state.flags.sales_vp_admin === true, 'flag not set');
    const seen = [];
    for (let i = 0; i < 4; i++) {
      const card = drawCard(state, seeded(i + 1));
      seen.push(card.id);
      applyChoice(state, card.id === 'sales_vp_miner' ? card : { id: card.id, left: {} }, 'left');
    }
    assert(seen.indexOf('sales_vp_miner') === 3, `miner came at ${seen.indexOf('sales_vp_miner')}: ${seen.join(', ')}`);
    assert(state.flags.sales_vp_admin === false, 'wiping the laptop should clear the flag');
  }],

  ['follow-up-only cards never turn up at random', async () => {
    const state = newRun();
    drawCard(state);
    for (let i = 0; i < 300; i++) {
      const card = drawCard(state, seeded(i + 7));
      assert(!card.followUpOnly, `${card.id} came up at random`);
      state.turn++;
    }
  }],

  ['random runs always end, and never run out of cards', async () => {
    for (let seed = 1; seed <= 200; seed++) {
      const rng = seeded(seed);
      const game = createGame(rng);
      game.start();
      let turns = 0;
      while (!game.state.ended && turns < 2000) {
        const r = game.choose(rng() < 0.5 ? 'left' : 'right');
        assert(r.ending || r.next, `seed ${seed}: no next card at turn ${turns}`);
        turns++;
      }
      assert(game.state.ended, `seed ${seed}: still going after ${turns} turns`);
    }
  }],
];
