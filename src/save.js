// Everything the game keeps in localStorage. Every key starts with `reignsOfIT:` so it
// can't collide with the other games on michaelsturrup.com, and every read and write is
// wrapped so the game still plays (just without saving) when storage is blocked or full.
//
//   reignsOfIT:run     the run in progress (cleared when it ends)
//   reignsOfIT:stats   { v, runs, bestWeeks, endings: { ending_id: times reached } }

const PREFIX = 'reignsOfIT:';

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage blocked (private mode, a strict browser setting) or full: play on.
  }
}

function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // As above.
  }
}

export const loadRun = () => read('run');
export const saveRun = (snapshot) => (snapshot ? write('run', snapshot) : remove('run'));
export const clearRun = () => remove('run');

export function loadStats() {
  const s = read('stats');
  return {
    runs: Number.isInteger(s?.runs) ? s.runs : 0,
    bestWeeks: Number.isInteger(s?.bestWeeks) ? s.bestWeeks : 0,
    endings: s?.endings && typeof s.endings === 'object' ? s.endings : {},
  };
}

// Records a finished run. Returns the updated stats plus whether it was a new best
// (and the best it beat) and whether this ending was a first.
export function recordRun(endingId, weeks) {
  const stats = loadStats();
  const prevBest = stats.bestWeeks;
  const firstEnding = !stats.endings[endingId];
  stats.runs += 1;
  stats.bestWeeks = Math.max(stats.bestWeeks, weeks);
  stats.endings[endingId] = (stats.endings[endingId] || 0) + 1;
  write('stats', { v: 1, ...stats });
  return { ...stats, isBest: weeks > prevBest, prevBest, firstEnding };
}
