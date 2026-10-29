// The card validator, from the command line. Checks every file under data/ and prints
// errors, warnings and meter balance. Exits with an error if anything is broken, so CI
// fails on a bad card.
//
//   npm run validate             checks and stats
//   npm run validate -- --sim    also plays 1000 simulated runs per bot
//
// The same checks run in the browser at validator.html.

import { validateContent } from '../src/tools/validate.js';
import { simulate } from '../src/tools/simulate.js';

const { errors, warnings, stats } = validateContent();
const sign = (n) => (n > 0 ? `+${n}` : String(n));

console.log(`\nReigns of IT content: ${stats.cards} cards (${stats.reachable} reachable), ${stats.characters} characters, ` +
  `${stats.endings} endings, ${stats.achievements} achievements`);
console.log(`  ${stats.standalone} standalone, ${stats.followUpOnly} follow-up only, ${stats.seasonal} seasonal, ${stats.once} once-per-run`);

console.log('\nMeter balance (sum of every choice):');
for (const m of stats.meters) {
  console.log(`  ${m.label.padEnd(15)} ${sign(m.up).padStart(5)} / ${String(m.down).padStart(5)}   net ${sign(m.net).padStart(5)}   on ${m.touched} choices`);
}
console.log('\nMeters touched per choice:');
for (const [n, count] of Object.entries(stats.touches).sort()) {
  console.log(`  ${n} meter${n === '1' ? ' ' : 's'}: ${count} (${Math.round((100 * count) / stats.choices)}%)`);
}

const list = (title, items) => {
  console.log(`\n${title}: ${items.length}`);
  for (const i of items) console.log(`  ${i.where}: ${i.text}`);
};
list('Warnings', warnings);
list('Errors', errors);

if (process.argv.includes('--sim')) {
  for (const bot of ['random', 'careful']) {
    const r = simulate(bot, 1000);
    console.log(`\n${bot} bot, ${r.runs} runs: average ${r.average.toFixed(1)} weeks, median ${r.median}, longest ${r.longest}`);
    for (const [id, n] of r.endings) console.log(`  ${((100 * n) / r.runs).toFixed(1).padStart(5)}%  ${id}`);
    if (r.neverSeen.length) console.log(`  never seen: ${r.neverSeen.join(', ')}`);
  }
}

console.log(errors.length ? `\n✗ ${errors.length} error(s). Fix these before shipping.` : '\n✓ No errors.');
process.exit(errors.length ? 1 : 0);
