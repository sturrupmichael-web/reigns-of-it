# Reigns of IT

A Reigns-style swipe card game. You're the newly hired IT Director at a mid-size
company, and every card is a request, a crisis or a decision from someone in the org.
Swipe left or right to choose. Every choice moves four meters: 💰 Budget, 🛡️ Security,
🙂 User Happiness and 👔 CIO Patience. Let any of them hit 0 or 100 and your tenure ends.

Phase 1 of 5: the swipe card, the four meters, about fifteen cards and all eight meter
endings. See [docs/SCHEMA.md](docs/SCHEMA.md) for how cards, characters and endings are
written.

```
dev.html          the page for development (loads src/ as ES modules)
index.html        the built page (npm run build), one self-contained file; not in git
data/             the content: cards, characters, endings, tuning numbers
src/              the game: engine/ (rules, no DOM), ui/, audio/, main.js
docs/SCHEMA.md    how to write cards, characters and endings
build.mjs         builds index.html
tests/            npm test
```

## Run it locally

```sh
npm install
npm run serve            # python3 -m http.server 8000
```

Open <http://localhost:8000/dev.html>. It loads the source straight from `src/` and
`data/`, so refresh to see a change. Any static server works, but opening `dev.html`
directly from disk doesn't: browsers won't load ES modules from `file://`.

To try the built page, run `npm run build` and open <http://localhost:8000/index.html>.
Everything is in that one file, cards included, so you can also double-click it or copy
it anywhere and it still runs.

### On your phone

With `npm run serve` running, find your computer's local IP address (for example
`ipconfig getifaddr en0` on a Mac, or `ipconfig` on Windows) and open
`http://<that address>:8000/dev.html` on a phone on the same Wi-Fi. Or push to `main`
and play the deployed copy.

### Controls

| | |
|---|---|
| Touch or mouse | Drag the card left or right; let go past the edge to choose, or short of it to change your mind. A quick flick works too. |
| ← / → (or A / D) | Lean the card that way to read the choice; press the same key again (or Enter) to choose. Esc or ↓ straightens it. |
| The ← / → buttons | With a mouse, hover to read the choice and click to choose. On a touch screen, tap once to read and again to choose. |

## Tests

```sh
npm run lint
npm run build
npm test                 # npm test -- node skips the browser tests
```

The tests check the content for broken references, play the engine through hundreds of
random runs, and drive the game in headless Chromium on a phone-sized touch screen:
`dev.html` and `index.html` served under `/reigns-of-it/` like the live site, and
`index.html` opened straight from disk.

## Deploy

GitHub Actions runs the tests on every push. When they pass on `main`, the Deploy
workflow builds `index.html` and publishes it to GitHub Pages (Settings > Pages >
Source must be set to "GitHub Actions"). With the custom domain on the main site, a
project repo is served at `michaelsturrup.com/<repo name>/`.
