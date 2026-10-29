# Reigns of IT

A Reigns-style swipe card game. You're the newly hired IT Director at a mid-size
company, and every card is a request, a crisis or a decision from someone in the org.
Swipe left or right to choose. Every choice moves four meters: 💰 Budget, 🛡️ Security,
🙂 User Happiness and 👔 CIO Patience. Let any of them hit 0 or 100 and your tenure ends.

**Play it:** <https://michaelsturrup.com/reigns-of-it/> ·
**Card validator:** <https://michaelsturrup.com/reigns-of-it/validator.html>

112 cards from 19 characters, five story arcs (the Merger, a Ransomware Scare, the Cloud
Migration, the Audit and AI Everything), seasonal cards, characters who remember what you
did, a week and year clock, eight meter endings plus four story endings, 15 achievements
(some unlock cards in later runs), an endings gallery, a new "IT Director #N" every run,
sound effects, and light and dark themes. No runtime dependencies.

```
dev.html             the game, for development (loads src/ and data/ as ES modules)
validator-dev.html   the card validator page, for development
index.html           the built game (npm run build): one self-contained file; not in git
validator.html       the built validator page; not in git
data/                the content: cards, characters, endings, achievements, names, tuning
src/                 the game: engine/ (rules, no DOM), ui/, audio/, tools/ (validator)
docs/SCHEMA.md       every field of every data file
docs/card-template.js  a standalone card and a small arc, ready to copy
scripts/             npm run validate, npm run balance
build.mjs            builds index.html and validator.html
tests/               npm test
```

## Run it locally

```sh
npm install
npm run serve            # python3 -m http.server 8000
```

Open <http://localhost:8000/dev.html>. It loads the source straight from `src/` and
`data/`, so refresh to see a change. Any static server works, but opening `dev.html`
directly from disk doesn't: browsers won't load ES modules from `file://`.

The card validator is at <http://localhost:8000/validator-dev.html>.

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

## Writing cards

All the content is in `data/`, as JavaScript objects (so comments and trailing commas are
fine). [docs/SCHEMA.md](docs/SCHEMA.md) has every field; this is the short version.

### A new card

Add it to any file in `data/cards/` (`office.js` is the home for everyday cards):

```js
{
  id: 'printer_review',                 // unique, lowercase_snake_case, never renamed
  character: 'helpdesk',                // a key from data/characters.js
  text: 'The printer is printing the CEO\'s performance review. On a loop.',
  left:  { label: 'Pull the plug', effects: { happiness: -5, security: 10 } },
  right: { label: 'Let it finish', effects: { happiness: 5, patience: -10 } },
},
```

Optional extras, all on the same card:

- `conditions: { tenure: { min: 10 } }` holds it back until week 10;
  `weeks: [40, 46]` makes it seasonal; `requires: ['some_flag']` ties it to an earlier
  choice.
- `once: true` shows it at most once a run, and `weight: 2` makes it twice as likely.
- On a choice, `flags: { some_flag: true }` remembers it and `add: { cfo_grudge: 1 }`
  counts it. `followUp: { card: 'other_id', delay: 3 }` brings another card three
  weeks later, and `ending: 'id'` ends the run.

### A new arc

An arc is a starter card plus follow-up cards. The starter sets a flag and queues the
next beats. Each follow-up is `followUpOnly: true` (never drawn at random), and its
`conditions` decide whether it still shows when its week comes. So a single starter can
branch: queue every possible beat, and let each beat's `requires` and `excludes` pick
the ones that fit what the player did.

The template is [docs/card-template.js](docs/card-template.js): copy it to
`data/cards/<arc>.js`, rename the ids, and register the file in `data/cards/index.js`:

```js
import { CARDS as MY_ARC } from './my-arc.js';
export const ALL_CARDS = [...STARTER, /* ... */ ...MY_ARC];
```

To end the arc with a story ending, add the ending to `data/endings.js` and point a
choice at it with `ending: 'my_ending'`. For a new character, add them to
`data/characters.js` (the portrait is built from a few options, with no image files).

### Check your work

```sh
npm run validate         # errors, warnings and meter balance
npm run validate -- --sim  # plus 1000 simulated runs per bot
```

**Errors** break the game and fail CI. They include an unknown character or follow-up, a
misspelled field (`conditon`, `folowUp`), an effect that isn't a number, and an
impossible condition.

**Warnings** probably aren't what you meant. They include a card that can never appear
(a follow-up nobody queues, or a flag nobody sets), a label over five words, a choice
that's all upside, and an ending nothing reaches.

The same checks run in the browser at `validator.html`, live on the site after every
deploy. That page also has meter balance bars, simulated runs and a searchable list of
every card.

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
npm run validate         # the card validator
npm run balance          # run lengths, ending spread, cards never seen
```

The tests check the content for broken references, play the engine through hundreds of
random runs, and drive the game in headless Chromium on a phone-sized touch screen:
`dev.html` and `index.html` served under `/reigns-of-it/` like the live site, and
`index.html` opened straight from disk.

## Deploy

GitHub Actions runs lint, the validator and the tests on every push. When they pass on
`main`, the Deploy workflow builds `index.html` and `validator.html` and publishes them
to GitHub Pages. Everything uses relative paths, so the same files work at the site root,
at `/reigns-of-it/` or opened from disk. There are two ways to get the game served at
`michaelsturrup.com/reigns-of-it/`.

### Option A: a folder in the main site's repo

1. Run `npm run build` here.
2. Copy `index.html` and `validator.html` into a `reigns-of-it/` folder in the repo
   that serves michaelsturrup.com, then commit and push that repo.

This is simple, but it's manual every time. The main site's repo also fills up with
build output, and the tests here never gate what goes live.

### Option B: its own repo (recommended, and how this repo is set up)

GitHub Pages serves a project repo at `/<repo name>/` under the custom domain of the
main `<user>.github.io` site. So a repo named `reigns-of-it` is served at
`michaelsturrup.com/reigns-of-it/`, with no copying.

1. Name the repo `reigns-of-it` (Settings > General > Repository name). The URL path
   is the repo name.
2. Set Settings > Pages > Source to **GitHub Actions**.
3. Push to `main`. Tests runs, then Deploy publishes. The Actions tab shows both.

**Recommendation: B.** Every push to `main` is tested and deployed with nothing to copy
by hand. The game keeps its own history and issues, and it works the same way as the
other games on the site. If the URL ever comes out wrong, check the repo name first.
