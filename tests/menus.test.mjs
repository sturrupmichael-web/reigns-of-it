// The title screen, the gallery and achievements, in a browser: the game opens on the
// title screen, the menu button brings it back mid-run and Continue resumes, the
// gallery lists every ending and achievement, settings stick, and an achievement
// unlocks with a banner.

import { assert, ready, startFromTitle } from './harness.mjs';

export const browser = true;
export const title = true; // these tests start on the title screen
export const pages = ['dev.html', 'file:index.html'];

const text = (page, sel) => page.textContent(sel);

export const tests = [
  ['opens on the title screen, and Start hires IT Director #1', async (page) => {
    await page.waitForSelector('#title.show');
    assert((await text(page, '#btn-play')) === 'Start', await text(page, '#btn-play'));
    await startFromTitle(page);
    await ready(page);
    assert((await page.evaluate(() => reigns.game.state.director.number)) === 1, 'not director #1');
    await page.waitForSelector('#toast.show');
    assert((await text(page, '#toast')).startsWith('IT Director #1'), await text(page, '#toast'));
    assert(page.errors.length === 0, page.errors.join('\n'));
  }],

  ['the menu button pauses the run, and Continue picks it back up', async (page) => {
    await ready(page);
    await page.evaluate(() => reigns.choose('left'));
    await ready(page);
    const before = await page.evaluate(() => ({ turn: reigns.game.state.turn, card: reigns.game.card.id }));
    await page.click('#btn-menu');
    await page.waitForSelector('#title.show');
    assert((await text(page, '#btn-play')) === 'Continue', await text(page, '#btn-play'));
    assert((await text(page, '#title-director')).includes('Week 2'), await text(page, '#title-director'));
    await page.keyboard.press('ArrowLeft');
    assert((await page.evaluate(() => reigns.game.state.turn)) === before.turn, 'a key played a card behind the menu');
    await startFromTitle(page);
    await ready(page);
    const after = await page.evaluate(() => ({ turn: reigns.game.state.turn, card: reigns.game.card.id }));
    assert(JSON.stringify(before) === JSON.stringify(after), `${JSON.stringify(before)} became ${JSON.stringify(after)}`);
  }],

  ['reaching week 13 unlocks an achievement, with a banner', async (page) => {
    await ready(page);
    await page.evaluate(() => { reigns.game.state.turn = 12; });
    await page.evaluate(() => reigns.choose('left'));
    await page.waitForSelector('#banner.show');
    assert((await text(page, '#banner-title')) === 'Passed Probation', await text(page, '#banner-title'));
    const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('reignsOfIT:stats')));
    assert(stats.achievements.probation === true, JSON.stringify(stats));
  }],

  ['the gallery lists every ending and achievement', async (page) => {
    await ready(page);
    await page.click('#btn-menu');
    await page.waitForSelector('#title.show');
    await page.click('#btn-endings');
    await page.waitForSelector('#gallery.show');
    const endings = await page.evaluate(() => Object.keys(reigns.content.endings).length);
    assert((await page.locator('#gallery-list .tile').count()) === endings, 'not one tile per ending');
    await page.click('#tab-achievements');
    const achievements = await page.evaluate(() => reigns.content.achievements.length);
    assert((await page.locator('#gallery-list .tile').count()) === achievements, 'not one tile per achievement');
    assert((await page.locator('#gallery-list .tile:not(.locked)').count()) === 1, 'probation should be the one unlocked');
    await page.click('#btn-gallery-close');
    await page.waitForSelector('#gallery', { state: 'hidden' });
    assert(await page.isVisible('#title'), 'title screen gone');
  }],

  ['sound and theme settings stick', async (page) => {
    await page.click('#set-sound');
    assert((await text(page, '#set-sound')) === 'Sound: Off', await text(page, '#set-sound'));
    await page.click('#set-theme');
    assert((await page.evaluate(() => document.documentElement.dataset.theme)) === 'light', 'theme not light');
    await page.click('#set-theme');
    assert((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'theme not dark');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('reignsOfIT:settings')));
    assert(saved.muted === true && saved.theme === 'dark', JSON.stringify(saved));
    await page.click('#set-theme');
    await page.click('#set-sound');
    assert((await page.evaluate(() => document.documentElement.dataset.theme)) === undefined, 'theme not back to auto');
  }],

  ['after a game over, the main menu offers the next director', async (page) => {
    await startFromTitle(page);
    for (let i = 0; i < 300 && !(await page.evaluate(() => reigns.game.state.ended)); i++) {
      await ready(page);
      await page.evaluate(() => reigns.choose('right'));
    }
    await page.waitForSelector('#gameover.show');
    assert((await text(page, '#end-kicker')).startsWith('IT Director #1'), await text(page, '#end-kicker'));
    await page.click('#btn-gameover-menu');
    await page.waitForSelector('#title.show');
    assert((await text(page, '#btn-play')) === 'Start as IT Director #2', await text(page, '#btn-play'));
    assert(page.errors.length === 0, page.errors.join('\n'));
  }],
];
