// Run state and the rules for applying a choice. No DOM in here.
//
// A run's state is a plain object so it can be saved as JSON later (Phase 2):
//   meters    { budget, security, happiness, patience }  0-100
//   flags     { flag_name: value }  set by card choices
//   turn      swipes made so far (0 on the first card)
//   queue     [{ card, due }]  follow-up cards waiting for turn `due`
//   recent    ids of the last few cards shown (for the repeat cooldown)
//   seen      { card_id: times shown }
//   ended     null, or the ending id once the run is over

import { CONTENT, METER_KEYS } from '../content.js';

export function newRun() {
  const cfg = CONTENT.config;
  const meters = {};
  for (const k of METER_KEYS) meters[k] = cfg.startMeters?.[k] ?? 50;
  return {
    meters,
    flags: {},
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

// Apply one side of a card to the state (mutates it).
// Returns { before, after, ending } where ending is an ending id or null.
export function applyChoice(state, card, side) {
  const choice = card[side] ?? {};
  const before = { ...state.meters };

  for (const [k, d] of Object.entries(choice.effects ?? {})) {
    if (k in state.meters) state.meters[k] = clamp(state.meters[k] + d);
  }
  if (choice.flags) Object.assign(state.flags, choice.flags);

  // Queue the follow-up. delay 0 (or a bare id) means "next card".
  if (choice.followUp) {
    const fu = typeof choice.followUp === 'string' ? { card: choice.followUp, delay: 0 } : choice.followUp;
    state.queue.push({ card: fu.card, due: state.turn + 1 + (fu.delay || 0) });
  }

  state.turn += 1;
  state.ended = choice.ending || meterEnding(state.meters) || null;
  return { before, after: { ...state.meters }, ending: state.ended };
}
