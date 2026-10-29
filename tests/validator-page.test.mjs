// The validator page in a browser: it loads with no errors, shows the summary, and the
// simulation button plays runs.

import { assert } from './harness.mjs';

export const browser = true;
export const pages = ['validator.html', 'file:validator.html'];
export const viewport = { width: 390, height: 844 };

export const tests = [
  ['loads and shows zero errors', async (page) => {
    const v = await page.evaluate(() => ({ errors: validator.errors.length, cards: validator.stats.cards }));
    assert(v.errors === 0 && v.cards > 80, JSON.stringify(v));
    assert((await page.locator('#tiles .tile').count()) === 6, 'summary tiles missing');
    assert((await page.locator('.bal-row').count()) === 4, 'not four meter rows');
    assert(page.errors.length === 0, page.errors.join('\n'));
  }],

  ['the simulation plays runs for both bots', async (page) => {
    await page.click('#btn-sim');
    await page.waitForFunction(() => document.querySelectorAll('.sim-bot').length === 2, null, { timeout: 60000 });
    assert((await page.locator('.end-row').count()) > 4, 'no ending rows');
  }],

  ['the card filter narrows the list', async (page) => {
    await page.fill('#search', 'crypto miner');
    const shown = await page.locator('#cards .card:not([hidden])').count();
    assert(shown >= 1 && shown < 10, `${shown} cards shown`);
  }],
];
