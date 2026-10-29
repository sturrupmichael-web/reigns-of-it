// Test helpers: a tiny static server for the repo and a headless Chromium page on it.
// The server serves the repo under /reigns-of-it/ (not /), the way the live site does,
// so a root-relative path that only works at / fails here. `file:index.html` opens the
// built page straight from disk instead, as double-clicking it would.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const BASE = '/reigns-of-it/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function serve() {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!url.startsWith(BASE)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const path = normalize(url.slice(BASE.length)).replace(/^(\.\.[/\\])+/, '');
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((ok) => server.listen(0, () => ok(server)));
}

// Opens `file` (e.g. dev.html) on a phone-sized touch screen and passes a Playwright page
// to `fn`. Console errors and page errors are collected on page.errors.
// Tests begin past the title screen, unless the test file sets `title: true`.
export async function withPage(file, fn, viewport = { width: 390, height: 844 }, opts = {}) {
  const { chromium } = await import('playwright');
  const fromDisk = file.startsWith('file:');
  const server = fromDisk ? null : await serve();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    const page = await browser.newPage({ viewport, hasTouch: true });
    page.errors = [];
    page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && page.errors.push(m.text()));
    page.on('pageerror', (e) => page.errors.push(e.message));
    await page.goto(fromDisk ? new URL(`../${file.slice(5)}`, import.meta.url).href : `http://localhost:${server.address().port}${BASE}${file}`);
    await page.waitForFunction(() => window.reigns && !document.getElementById('boot'), null, { timeout: 15000 });
    if (!opts.title) await startFromTitle(page);
    await fn(page);
  } finally {
    await browser.close();
    server?.close();
  }
}

// Taps Start (or Continue) on the title screen.
export async function startFromTitle(page) {
  await page.waitForSelector('#title.show');
  await page.click('#btn-play');
  await page.waitForSelector('#title', { state: 'hidden' });
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Waits until the current card has finished animating and accepts input.
export async function ready(page) {
  await page.waitForFunction(() => !reigns.locked(), null, { timeout: 5000 });
}
