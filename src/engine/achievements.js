// Achievements and director names: the parts of meta-progression that are rules, not
// storage (src/save.js keeps what's unlocked). No DOM in here.

import { CONTENT, METER_KEYS } from '../content.js';
import { conditionsMet } from './deck.js';

// The `when` keys that can only be judged once a run is over.
const END_KEYS = ['ending', 'specialEnding', 'quick', 'runs', 'endingsFound', 'allMeterEndings'];
const METER_ENDINGS = METER_KEYS.flatMap((k) => [`${k}_min`, `${k}_max`]);

// Is achievement `a` earned? `state` is the run; `ending` its ending id (null while
// it's still going); `stats` the lifetime stats from save.js, already counting this run.
export function achievementMet(a, state, ending = null, stats = { runs: 0, endings: {} }) {
  const w = a.when ?? {};
  const cardConditions = {};
  for (const [k, v] of Object.entries(w)) if (!END_KEYS.includes(k)) cardConditions[k] = v;
  if (!conditionsMet({ conditions: cardConditions }, state)) return false;
  if (!ending) return !END_KEYS.some((k) => k in w);
  const found = Object.keys(stats.endings ?? {}).filter((id) => CONTENT.endings[id]);
  if (w.ending && w.ending !== ending) return false;
  if (w.specialEnding && METER_ENDINGS.includes(ending)) return false;
  if (w.quick && state.turn > w.quick) return false;
  if (w.runs && (stats.runs ?? 0) < w.runs) return false;
  if (w.endingsFound && found.length < w.endingsFound) return false;
  if (w.allMeterEndings && !METER_ENDINGS.every((id) => found.includes(id))) return false;
  return true;
}

// Ids of the achievements earned now that weren't already unlocked.
export function newAchievements(unlocked, state, ending, stats) {
  return CONTENT.achievements
    .filter((a) => !unlocked[a.id] && achievementMet(a, state, ending, stats))
    .map((a) => a.id);
}

// "Dana 'Reply All' Nguyen". About one in three gets a nickname.
export function directorName(rng = Math.random) {
  const { first, last, nick } = CONTENT.names;
  const pick = (list) => list[Math.floor(rng() * list.length)];
  const f = pick(first);
  const l = pick(last);
  return rng() < 0.35 ? `${f} "${pick(nick)}" ${l}` : `${f} ${l}`;
}
