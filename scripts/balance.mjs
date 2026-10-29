// Balance report: plays thousands of runs with two simple bots (src/tools/simulate.js)
// and prints how long runs last, which endings come up, and which cards are rarely or
// never seen. Every achievement counts as unlocked, so legacy cards are included.
//
//   npm run balance            2000 runs per bot
//   npm run balance -- 10000   more runs

import { CONTENT } from '../src/content.js';
import { simulate } from '../src/tools/simulate.js';
import { contentStats } from '../src/tools/validate.js';

const RUNS = Number(process.argv[2]) || 2000;
const pct = (n, total) => `${((100 * n) / total).toFixed(1)}%`.padStart(6);

console.log('\nNet effect per meter, summed over every choice:');
for (const m of contentStats().meters) console.log(`  ${m.key.padEnd(10)} +${m.up} / ${m.down}  net ${m.net}`);

for (const bot of ['random', 'careful']) {
  const r = simulate(bot, RUNS);
  console.log(`\n== ${bot} bot, ${RUNS} runs ==`);
  console.log(`Weeks survived: average ${r.average.toFixed(1)}, median ${r.median}, ` +
    `10th pct ${r.p10}, 90th pct ${r.p90}, longest ${r.longest}`);
  console.log('Endings:');
  for (const [id, n] of r.endings) console.log(`  ${pct(n, RUNS)}  ${id}`);
  console.log(`Cards seen at least once: ${CONTENT.cards.length - r.neverSeen.length}/${CONTENT.cards.length}`);
  if (r.neverSeen.length) console.log(`  never seen: ${r.neverSeen.join(', ')}`);
}
