// Run state and the rules for applying a choice. No DOM in here.
//
// A run's state is a plain object, saved as JSON after every swipe (src/save.js):
//   meters    { budget, security, happiness, patience }  0-100
//   flags     { flag_name: value }  set by card choices (`flags`, and `add` for counters)
//   turn      swipes made so far (0 on the first card)
//   queue     [{ card, due }]  follow-up cards waiting for turn `due`
//   recent    ids of the last few cards shown (for the repeat cooldown)
//   seen      { card_id: times shown }
//   ended     null, or the ending id once the run is over
//   director  { number, name }  who's playing this run ("IT Director #14")

import { CONTENT, METER_KEYS } from '../content.js';

// `unlocked` is the achievements from earlier runs ({ id: true }); each one sets the
// flag `ach_<id>`, so legacy cards can require it.
export function newRun({ unlocked = {}, director = null } = {}) {
  const cfg = CONTENT.config;
  const meters = {};
  for (const k of METER_KEYS) meters[k] = cfg.startMeters?.[k] ?? 50;
  const flags = {};
  for (const id of Object.keys(unlocked)) if (unlocked[id]) flags[`ach_${id}`] = true;
  return {
    meters,
    flags,
    director,
    turn: 0,
    queue: cfg.startCard ? [{ card: cfg.startCard, due: 0 }] : [],
    recent: [],
    seen: {},
    ended: null,
  };
}

// Turn number -> calendar. Turn 0 is Year 1, Week 1.
export function calendar(turn) {
  const wpy = CONTENT.config.weeksPerYear || 52;
  return { year: Math.floor(turn / wpy) + 1, week: (turn % wpy) + 1 };
}

function clamp(v) {
  const cfg = CONTENT.config;
  return Math.max(cfg.meterMin, Math.min(cfg.meterMax, v));
}

// Which meter ending (if any) the meters have hit. If several hit at once,
// the first in display order wins.
export function meterEnding(meters) {
  const cfg = CONTENT.config;
  for (const k of METER_KEYS) {
    if (meters[k] <= cfg.meterMin) return `${k}_min`;
    if (meters[k] >= cfg.meterMax) return `${k}_max`;
  }
  return null;
}

// A choice's `followUp` as a list of { card, delay }. It can be a card id, one
// { card, delay }, or a list of either (for branches: each one is checked
// against its card's conditions when it comes due, and the ones that fail are
// dropped).
export function followUpsOf(choice) {
  const list = Array.isArray(choice?.followUp) ? choice.followUp : choice?.followUp ? [choice.followUp] : [];
  return list.map((fu) => (typeof fu === 'string' ? { card: fu, delay: 0 } : { card: fu.card, delay: fu.delay || 0 }));
}

// Apply one side of a card to the state (mutates it).
// Returns { before, after, ending } where ending is an ending id or null.
export function applyChoice(state, card, side) {
  const choice = card[side] ?? {};
  const before = { ...state.meters };

  for (const [k, d] of Object.entries(choice.effects ?? {})) {
    if (k in state.meters) state.meters[k] = clamp(state.meters[k] + d);
  }
  if (choice.flags) Object.assign(state.flags, choice.flags);
  // Counters: numbers added to a flag (a missing one counts as 0), for things
  // that build up, like a grudge or a favor owed.
  for (const [k, n] of Object.entries(choice.add ?? {})) state.flags[k] = (Number(state.flags[k]) || 0) + n;

  // Queue the follow-ups. delay 0 (or a bare id) means "next card".
  for (const fu of followUpsOf(choice)) state.queue.push({ card: fu.card, due: state.turn + 1 + fu.delay });

  state.turn += 1;
  state.ended = choice.ending || meterEnding(state.meters) || null;
  return { before, after: { ...state.meters }, ending: state.ended };
}
