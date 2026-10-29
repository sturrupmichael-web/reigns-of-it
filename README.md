# Reigns of IT

A Reigns-style swipe card game. You're the newly hired IT Director at a mid-size
company, and every card is a request, a crisis or a decision from someone in the org.
Swipe left or right to choose. Every choice moves four meters: 💰 Budget, 🛡️ Security,
🙂 User Happiness and 👔 CIO Patience. Let any of them hit 0 or 100 and your tenure ends.

Phases 1-4 of 5: the swipe card and four meters, 112 cards from 19 characters, five
story arcs (the Merger, a Ransomware Scare, the Cloud Migration, the Audit and AI
Everything), seasonal cards, characters who remember what you did, the week and year
clock, all eight meter endings plus four special ones, and saving. Around it: a title
screen, a new "IT Director #N" with a generated name every run, 15 achievements (some
unlock cards in later runs), an endings and achievements gallery, Web Audio sound
effects with a mute button, and light, dark or automatic theme. See [docs/SCHEMA.md](docs/SCHEMA.md) for how cards, characters and endings are
written.

```
dev.html          the page for development (loads src/ as ES modules)
index.html        the built page (npm run build), one self-contained file; not in git
data/             the content: cards, characters, endings, achievements, director names, tuning
src/              the game: engine/ (rules, no DOM), ui/, audio/, main.js
docs/SCHEMA.md    how to write cards, characters and endings
scripts/          npm run balance: plays thousands of runs and reports on them
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
| ☰ (top left) | Back to the title screen. The run is saved; Continue picks it up. |
| 🔊 (top right) | Sound on or off. The title screen also has the theme (Auto, Light, Dark). |

## Saving

The run in progress is saved after every swipe, so closing the tab or reloading picks
up on the same card. Finished runs update your best score, the number of runs, total
weeks served, the endings you've found and your achievements. Sound and theme are saved
too. Everything is in `localStorage` under keys starting with
`reignsOfIT:`, so it can't collide with the other games on the site. If storage is
blocked (some private windows), the game still plays; it just doesn't remember.

## Tests

```sh
npm run lint
npm run build
npm test                 # npm test -- node skips the browser tests
npm run balance          # run lengths, ending spread, cards never seen
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
