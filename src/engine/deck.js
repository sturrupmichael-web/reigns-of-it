// Card selection: decides which card comes next. No DOM in here.
//
// Order of priority:
//   1. A queued follow-up whose turn has come (oldest first). Follow-ups skip
//      the random draw but still respect `conditions`, so a follow-up quietly
//      fizzles if the situation changed (e.g. its flag was cleared).
//   2. A weighted random draw from every eligible card.

import { CONTENT } from '../content.js';
import { calendar } from './state.js';

// Does this card's `conditions` block pass for the current state?
export function conditionsMet(card, state) {
  const c = card.conditions;
  if (!c) return true;
  const cal = calendar(state.turn);

  if (c.requires && !c.requires.every((f) => !!state.flags[f])) return false;
  if (c.excludes && c.excludes.some((f) => !!state.flags[f])) return false;
  if (c.minYear != null && cal.year < c.minYear) return false;
  if (c.maxYear != null && cal.year > c.maxYear) return false;
  if (c.weeks) {
    const [from, to] = c.weeks;
    // A window like [50, 4] wraps around New Year.
    const inWindow = from <= to ? cal.week >= from && cal.week <= to : cal.week >= from || cal.week <= to;
    if (!inWindow) return false;
  }
  for (const [k, r] of Object.entries(c.counters ?? {})) {
    const v = Number(state.flags[k]) || 0;
    if (r.min != null && v < r.min) return false;
    if (r.max != null && v > r.max) return false;
  }
  for (const [k, r] of Object.entries(c.meters ?? {})) {
    const v = state.meters[k];
    if (r.min != null && v < r.min) return false;
    if (r.max != null && v > r.max) return false;
  }
  return true;
}

// Can this card be drawn at random right now?
export function isEligible(card, state) {
  if (card.followUpOnly) return false;
  if (card.once && state.seen[card.id]) return false;
  if (state.recent.includes(card.id)) return false;
  if (state.queue.some((q) => q.card === card.id)) return false;
  return conditionsMet(card, state);
}

function takeDueFollowUp(state) {
  for (let i = 0; i < state.queue.length; i++) {
    const q = state.queue[i];
    if (q.due > state.turn) continue;
    state.queue.splice(i--, 1);
    const card = CONTENT.cardById[q.card];
    if (!card || (card.once && state.seen[card.id]) || !conditionsMet(card, state)) continue;
    return card;
  }
  return null;
}

const weightOf = (c) => c.weight ?? 1;

function weightedDraw(cards, rng) {
  let roll = rng() * cards.reduce((sum, c) => sum + weightOf(c), 0);
  for (const c of cards) {
    roll -= weightOf(c);
    if (roll < 0) return c;
  }
  return cards[cards.length - 1];
}

// Pick and "deal" the next card: records it as seen and recent.
// `rng` defaults to Math.random; tests pass their own.
export function drawCard(state, rng = Math.random) {
  let card = takeDueFollowUp(state);

  if (!card) {
    let pool = CONTENT.cards.filter((c) => isEligible(c, state));
    if (!pool.length) {
      // Everything is on cooldown: relax the cooldown rather than stall.
      pool = CONTENT.cards.filter((c) => !c.followUpOnly && !(c.once && state.seen[c.id]) && conditionsMet(c, state));
    }
    if (!pool.length) return null;
    card = weightedDraw(pool, rng);
  }

  state.seen[card.id] = (state.seen[card.id] || 0) + 1;
  state.recent.push(card.id);
  while (state.recent.length > (CONTENT.config.repeatCooldown || 0)) state.recent.shift();
  return card;
}
