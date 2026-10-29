// The engine and the content, without a browser: the data loads cleanly, choices move the
// meters, flags, counters and follow-ups work, every meter bound has its ending, saved runs
// resume, and random runs always end without running out of cards.

import { assert } from './harness.mjs';
import { CONTENT, METER_KEYS } from '../src/content.js';
import { newRun, applyChoice, calendar } from '../src/engine/state.js';
import { drawCard, conditionsMet } from '../src/engine/deck.js';
import { createGame } from '../src/engine/game.js';
import { achievementMet, newAchievements, directorName } from '../src/engine/achievements.js';

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

  ['counters add up, and gate cards by range', async () => {
    const state = newRun();
    const card = { id: 't', left: { label: 'x', add: { grudge: 2 } }, right: { label: 'y', add: { grudge: -1 } } };
    applyChoice(state, card, 'left');
    applyChoice(state, card, 'right');
    assert(state.flags.grudge === 1, `grudge is ${state.flags.grudge}`);
    const gated = { id: 'g', conditions: { counters: { grudge: { min: 2 } } } };
    assert(!conditionsMet(gated, state), 'card shown below its counter minimum');
    applyChoice(state, card, 'left');
    assert(conditionsMet(gated, state), 'card hidden at its counter minimum');
    assert(conditionsMet({ id: 'n', conditions: { counters: { never_set: { max: 0 } } } }, state), 'a missing counter should count as 0');
  }],

  ['three CFO grudges unlock her final card, which can end the run with a special ending', async () => {
    const state = newRun();
    const finalStraw = CONTENT.cardById.cfo_final_straw;
    assert(!conditionsMet(finalStraw, state), 'final straw available from the start');
    applyChoice(state, CONTENT.cardById.cfo_cut_backups, 'left');
    applyChoice(state, CONTENT.cardById.cfo_shadow_saas, 'left');
    applyChoice(state, CONTENT.cardById.cfo_petty_revenge, 'left');
    assert(conditionsMet(finalStraw, state), `final straw still locked at grudge ${state.flags.cfo_grudge}`);
    const r = applyChoice(state, finalStraw, 'right');
    assert(r.ending === 'cfo_takeover' && CONTENT.endings.cfo_takeover, `ending was ${r.ending}`);
  }],

  ['the audit only raises the findings you earned', async () => {
    // Draw cards until the audit's queued follow-ups have all come due.
    const auditCards = (setup) => {
      const state = newRun();
      setup(state);
      applyChoice(state, CONTENT.cardById.audit_kickoff, 'right');
      const shown = [];
      for (let i = 0; i < 8; i++) {
        const card = drawCard(state, seeded(i + 3));
        if (card.id.startsWith('audit_')) shown.push(card.id);
        applyChoice(state, card, 'left');
        state.meters = Object.fromEntries(METER_KEYS.map((k) => [k, 50]));
      }
      return shown.sort().join(',');
    };
    const clean = auditCards(() => {});
    assert(clean === 'audit_clean', `clean run got ${clean}`);
    const messy = auditCards((s) => { s.flags.sales_vp_admin = true; s.flags.security_debt = 4; });
    assert(messy === 'audit_debt,audit_sales_admin', `messy run got ${messy}`);
  }],

  ['achievements unlock on their conditions, and the run-end ones only at the end', async () => {
    const a = (id) => CONTENT.achievements.find((x) => x.id === id);
    const state = newRun();
    state.turn = 13;
    assert(achievementMet(a('probation'), state), 'probation not met at week 13');
    assert(!achievementMet(a('speedrun'), state), 'speedrun met mid-run');
    state.turn = 5;
    assert(achievementMet(a('speedrun'), state, 'budget_min', { runs: 1, endings: { budget_min: 1 } }), 'speedrun not met');
    assert(!achievementMet(a('off_script'), state, 'budget_min', { runs: 1, endings: {} }), 'a meter ending counted as a story ending');
    assert(achievementMet(a('off_script'), state, 'cfo_takeover', { runs: 1, endings: {} }), 'story ending not counted');
    const all = Object.fromEntries(METER_KEYS.flatMap((k) => [[`${k}_min`, 1], [`${k}_max`, 1]]));
    assert(achievementMet(a('every_way_out'), state, 'budget_min', { runs: 8, endings: all }), 'all eight endings not counted');
    const fresh = newAchievements({}, state, 'budget_min', { runs: 10, endings: { budget_min: 1 } });
    assert(fresh.includes('revolving_door') && fresh.includes('speedrun'), fresh.join(','));
    assert(!newAchievements({ speedrun: true }, state, 'budget_min', { runs: 1, endings: {} }).includes('speedrun'), 'an unlocked achievement came back');
  }],

  ['unlocked achievements carry into the next run and unlock legacy cards', async () => {
    const card = CONTENT.cardById.ex_director_note;
    const plain = newRun();
    plain.turn = 5;
    assert(!conditionsMet(card, plain), 'legacy card available without the achievement');
    const veteran = newRun({ unlocked: { revolving_door: true }, director: { number: 11, name: 'Pat Nguyen' } });
    veteran.turn = 5;
    assert(veteran.flags.ach_revolving_door === true && veteran.director.number === 11, JSON.stringify(veteran));
    assert(conditionsMet(card, veteran), 'legacy card still locked');
    for (const a of CONTENT.achievements.filter((x) => x.unlocks)) {
      assert(CONTENT.cards.some((c) => c.conditions?.requires?.includes(`ach_${a.id}`)), `${a.id} says it unlocks something, but no card needs it`);
    }
    const name = directorName(seeded(3));
    assert(typeof name === 'string' && name.split(' ').length >= 2, name);
  }],

  ['a saved run resumes exactly where it was, and bad saves are ignored', async () => {
    const rng = seeded(42);
    const a = createGame(rng);
    a.start();
    for (let i = 0; i < 5; i++) a.choose(i % 2 ? 'left' : 'right');
    const saved = JSON.parse(JSON.stringify(a.snapshot()));
    const b = createGame(seeded(1));
    const card = b.resume(saved);
    assert(card && card.id === a.card.id, 'resumed on a different card');
    assert(JSON.stringify(b.state) === JSON.stringify(a.state), 'resumed state differs');
    for (const bad of [null, {}, { ...saved, v: 0 }, { ...saved, card: 'no_such_card' }, { ...saved, state: { ...saved.state, meters: {} } }]) {
      assert(createGame().resume(bad) === null, `accepted a bad save: ${JSON.stringify(bad)?.slice(0, 60)}`);
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
