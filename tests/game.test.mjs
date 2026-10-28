// The game in a browser on a phone-sized touch screen: it boots, the card follows a drag
// and shows the choice and the preview dots, a short drag springs back, a long one
// commits, the buttons and arrow keys work, and a run ends on the game over screen and
// restarts.

import { assert, ready } from './harness.mjs';

export const browser = true;
export const pages = ['dev.html', 'index.html', 'file:index.html'];

const clock = (page) => page.textContent('#clock');

async function cardCenter(page) {
  const b = await page.locator('#card').boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, width: b.width };
}

async function drag(page, dx, { release = true } = {}) {
  const c = await cardCenter(page);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(c.x + (dx * i) / 10, c.y);
  if (release) await page.mouse.up();
}

export const tests = [
  ['boots on the first card with no errors', async (page) => {
    await ready(page);
    assert((await clock(page)) === 'Year 1, Week 1', await clock(page));
    assert((await page.textContent('#char-name')) === 'Raymond Vance', 'first card is not the CIO');
    assert((await page.locator('.meter').count()) === 4, 'not four meters');
    assert(page.errors.length === 0, page.errors.join('\n'));
  }],

  ['the whole layout fits on the screen, with nothing to scroll', async (page) => {
    const fits = await page.evaluate(() => {
      const r = document.querySelector('.controls').getBoundingClientRect();
      return r.bottom <= innerHeight && document.documentElement.scrollWidth <= innerWidth;
    });
    assert(fits, 'the controls are off screen or the page scrolls sideways');
  }],

  ['dragging shows the choice text and dots, and a short drag springs back', async (page) => {
    await ready(page);
    await drag(page, 60, { release: false });
    const opacity = Number(await page.$eval('#choice-right', (e) => e.style.opacity));
    const dots = await page.locator('.meter-dot.on').count();
    await page.mouse.up();
    assert(opacity > 0, 'right choice text not showing');
    assert(dots > 0, 'no preview dots while dragging');
    await page.waitForTimeout(350);
    assert((await clock(page)) === 'Year 1, Week 1', 'a short drag made a choice');
    assert((await page.locator('.meter-dot.on').count()) === 0, 'dots still showing after letting go');
  }],

  ['a long drag commits the choice', async (page) => {
    await ready(page);
    const before = await page.evaluate(() => ({ ...reigns.game.state.meters }));
    await drag(page, 220);
    await page.waitForFunction(() => reigns.game.state.turn === 1);
    await ready(page);
    const after = await page.evaluate(() => ({ ...reigns.game.state.meters }));
    assert((await clock(page)) === 'Year 1, Week 2', await clock(page));
    assert(JSON.stringify(before) !== JSON.stringify(after), 'meters did not move');
  }],

  ['a button tap leans the card, and a second tap commits', async (page) => {
    await ready(page);
    await page.tap('#btn-left');
    await page.waitForTimeout(300);
    assert(Number(await page.$eval('#choice-left', (e) => e.style.opacity)) > 0, 'left choice not previewed');
    assert((await clock(page)) === 'Year 1, Week 2', 'first tap committed');
    await page.tap('#btn-left');
    await page.waitForFunction(() => reigns.game.state.turn === 2);
  }],

  ['arrow keys lean, then commit', async (page) => {
    await ready(page);
    await page.keyboard.press('ArrowRight');
    assert((await page.evaluate(() => reigns.game.state.turn)) === 2, 'first key press committed');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => reigns.game.state.turn === 3);
  }],

  ['a new year gets a banner', async (page) => {
    await ready(page);
    await page.evaluate(() => { reigns.game.state.turn = 51; });
    await page.evaluate(() => reigns.choose('left'));
    await page.waitForSelector('#toast.show');
    assert((await page.textContent('#toast')) === 'Year 2', await page.textContent('#toast'));
    assert((await page.textContent('#clock')) === 'Year 2, Week 1', await page.textContent('#clock'));
  }],

  ['a run ends on the game over screen, and a new one starts from it', async (page) => {
    for (let i = 0; i < 300 && !(await page.evaluate(() => reigns.game.state.ended)); i++) {
      await ready(page);
      await page.evaluate(() => reigns.choose('right'));
    }
    const ended = await page.evaluate(() => reigns.game.state.ended);
    assert(ended, 'run never ended');
    await page.waitForSelector('#gameover.show');
    const title = await page.textContent('#end-title');
    assert(title.length > 0, 'no ending title');
    // The panel must actually be on screen, and the button clickable.
    await page.click('#btn-restart', { timeout: 3000 });
    await ready(page);
    assert((await clock(page)) === 'Year 1, Week 1', 'did not restart');
    assert(await page.$eval('#gameover', (e) => e.hidden), 'game over screen still showing');
    assert(page.errors.length === 0, page.errors.join('\n'));
  }],
];
