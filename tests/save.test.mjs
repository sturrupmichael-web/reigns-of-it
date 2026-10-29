// Saving, in a browser: a reload picks the run up where it was, a finished run is
// recorded (best, runs, endings found) and its save cleared, every key carries the
// reignsOfIT: prefix, and the game still plays when storage is blocked.

import { assert, ready, startFromTitle } from './harness.mjs';

export const browser = true;
export const pages = ['dev.html', 'file:index.html'];

const keys = (page) => page.evaluate(() => Object.keys(localStorage));

async function playToEnd(page) {
  for (let i = 0; i < 300 && !(await page.evaluate(() => reigns.game.state.ended)); i++) {
    await ready(page);
    await page.evaluate(() => reigns.choose('right'));
  }
  await page.waitForSelector('#gameover.show');
}

async function reload(page) {
  await page.reload();
  await page.waitForFunction(() => window.reigns && !document.getElementById('boot'));
  await startFromTitle(page);
  await ready(page);
}

export const tests = [
  ['a reload resumes the run in progress', async (page) => {
    await ready(page);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => reigns.choose('left'));
      await ready(page);
    }
    const before = await page.evaluate(() => ({ turn: reigns.game.state.turn, meters: reigns.game.state.meters, card: reigns.game.card.id }));
    await reload(page);
    const after = await page.evaluate(() => ({ turn: reigns.game.state.turn, meters: reigns.game.state.meters, card: reigns.game.card.id }));
    assert(JSON.stringify(before) === JSON.stringify(after), `${JSON.stringify(before)} became ${JSON.stringify(after)}`);
    assert((await page.textContent('#clock')) === `Year 1, Week ${before.turn + 1}`, 'clock not restored');
    assert((await keys(page)).every((k) => k.startsWith('reignsOfIT:')), `unprefixed key in ${await keys(page)}`);
  }],

  ['a finished run records the best score and clears the save', async (page) => {
    await playToEnd(page);
    const turns = await page.evaluate(() => reigns.game.state.turn);
    const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('reignsOfIT:stats')));
    assert(stats.runs === 1 && stats.bestWeeks === turns, JSON.stringify(stats));
    assert(Object.keys(stats.endings).length === 1, JSON.stringify(stats.endings));
    assert((await page.evaluate(() => localStorage.getItem('reignsOfIT:run'))) === null, 'save not cleared');
    assert((await page.textContent('#end-record')).includes('Endings found: 1 of'), await page.textContent('#end-record'));
    await page.click('#btn-restart');
    await ready(page);
    assert((await page.textContent('#best')).includes(`${turns} week`), await page.textContent('#best'));
  }],

  ['a reload after a game over starts a new run', async (page) => {
    await playToEnd(page);
    await reload(page);
    assert((await page.textContent('#clock')) === 'Year 1, Week 1', await page.textContent('#clock'));
    assert(await page.$eval('#gameover', (e) => e.hidden), 'game over screen showing after reload');
  }],

  ['the game still plays when storage is blocked', async (page) => {
    await page.evaluate(() => {
      Storage.prototype.setItem = () => { throw new Error('blocked'); };
      Storage.prototype.getItem = () => { throw new Error('blocked'); };
    });
    await playToEnd(page);
    await page.click('#btn-restart');
    await ready(page);
    assert((await page.textContent('#clock')) === 'Year 1, Week 1', 'did not restart');
    assert(page.errors.length === 0, page.errors.join('\n'));
  }],
];
