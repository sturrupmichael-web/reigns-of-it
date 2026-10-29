# Reigns of IT: content schema

Everything the player reads lives under `data/`, as plain JavaScript objects. The code
under `src/` never mentions a card, character or ending by name (except the start card,
which is set in `data/config.js`).

```
data/
  config.js        meters (names, icons) and tuning numbers
  characters.js    who says each card, and how their portrait is drawn
  endings.js       the text for each way a run can end
  achievements.js  achievements, and what they unlock
  directors.js     name lists for "IT Director #N"
  cards/
    index.js       the list of card files (add new files here)
    *.js           the cards (see "Card files" below)
```

The data files are JavaScript rather than JSON so you can write comments, leave trailing
commas, and use either quote style. Each file exports one object or list.

When you change anything here, run `npm run validate` (or open `validator.html`). It
reports broken references, missing or misspelled fields, impossible conditions, cards
that can never appear, and meter balance. The basic reference checks are also logged to
the browser console while you play `dev.html`. There's a ready-to-copy card file at
[docs/card-template.js](card-template.js).

## Cards

```js
{
  id: 'sales_vp_admin',            // unique across every card file, lowercase_snake_case
  character: 'sales_vp',           // a key from data/characters.js
  text: 'I need local admin so I can install the demo software. Clients are waiting!',

  left: {                          // swipe left, ← key, or the left button
    label: 'Submit a ticket',      // 2-5 words, shown on the card while dragging
    effects: { happiness: -10, patience: -5 },
  },
  right: {                         // swipe right, → key, or the right button
    label: 'Fine, just this once',
    effects: { happiness: 10, security: -15 },
    flags: { sales_vp_admin: true },
    followUp: { card: 'sales_vp_miner', delay: 3 },
  },

  conditions: { excludes: ['sales_vp_admin'] },
}
```

### Required fields

| Field | What it is |
|---|---|
| `id` | Unique name for the card. Other cards refer to it by this, so don't rename it once it's used. |
| `character` | Who is talking: a key from `data/characters.js`. |
| `text` | What they say. One or two sentences reads best on a phone. |
| `left`, `right` | The two choices (see below). Both need a `label`. |

### A choice (`left` or `right`)

| Field | What it does |
|---|---|
| `label` | The answer, 2-5 words, shown at the top of the card as you drag toward that side. |
| `effects` | How much each meter moves: any of `budget`, `security`, `happiness`, `patience`. Leave out a meter to leave it alone. Before the player commits, every meter in here shows a dot: small for 1-6, medium for 7-12, large for 13+ (set in `config.js`). The dot never says which direction. |
| `flags` | Optional. Things to remember for the rest of the run: `{ name: value }`. Use `true` to set and `false` to clear. Any value works; conditions treat anything except `false`, `0`, `''`, `null` and `undefined` as set. |
| `add` | Optional. Adds to counters: `{ cfo_grudge: 1 }`, or a negative number to take away. A counter starts at 0. Use counters for things that build up over a run, like a grudge, a favor owed, or how many shortcuts you've taken. |
| `followUp` | Optional. A card to show later, by id. `'card_id'` (or `{ card: 'card_id', delay: 0 }`) shows it next. `{ card: 'card_id', delay: 3 }` shows it after three other cards, i.e. three weeks later. A list, like `[{ card: 'a', delay: 2 }, { card: 'b', delay: 6 }]`, queues several at once; this is how an arc lays out its beats. |
| `ending` | Optional. End the run right now with this ending id (a key from `data/endings.js`), for special story endings. |

Effects are added to the meters and clamped to 0-100. Most effects should be 5-15;
20 or more is a big moment. Good cards give both sides a cost, and touch two or three
meters per side.

### Optional card fields

| Field | What it does |
|---|---|
| `conditions` | When the card is allowed to appear (see below). No conditions means any time. |
| `weight` | How often it comes up compared to other eligible cards. Default 1; 2 is twice as likely, 0.5 half as likely. |
| `once` | `true`: at most once per run. Use it for story beats. |
| `followUpOnly` | `true`: never drawn at random, only ever shown as some choice's `followUp` (or as the start card). |

### Conditions

All the parts you include must be true for the card to be eligible.

| Field | Means |
|---|---|
| `requires: ['flag_a', 'flag_b']` | every one of these flags is set |
| `excludes: ['flag_c']` | none of these flags are set |
| `minYear: 2`, `maxYear: 5` | the year of your tenure (Year 1 is the first 52 weeks) |
| `tenure: { min: 10, max: 60 }` | how many weeks you've survived so far. Use it to hold big arcs back until the player has settled in. |
| `weeks: [40, 52]` | the week of the year, 1-52, for seasonal cards. A window that wraps, like `[50, 4]`, covers late December to January. |
| `meters: { budget: { max: 30 }, security: { min: 60 } }` | meter ranges, e.g. only when money is tight |
| `counters: { cfo_grudge: { min: 2 } }` | counter ranges (a counter that was never added to is 0) |

## Characters remember

There are two ways to make a character hold a choice against the player (or thank them
for it). For a specific callback, set a flag and queue a `followUp` with a delay: the CFO
comes back four weeks after you kill her reporting tool. For a slow build, add to a
counter on every slight and give a card `conditions: { counters: { ... } }`: two CFO
grudges unlock her expense audit, and three unlock her attempt to take over IT.

## Follow-ups and conditions

Follow-ups skip the random draw but still check their conditions when their turn comes.
If the conditions fail then (say the player cleared the flag in the meantime), the
follow-up is quietly dropped. That's how the crypto miner card only arrives if the Sales
VP still has admin.

Branching arcs use this. A choice queues every possible next beat, and each beat's
conditions decide which ones actually show. When the auditor arrives, it queues a finding
for the Sales VP's admin rights, one for Gary's server, one for a pile of security debt
and a clean bill of health; you only see the findings you earned.

### Arcs and shared counters

| Arc | File | Starts | What carries in |
|---|---|---|---|
| The Merger | `merger.js` | after 10 weeks | the consultant Trent and the acquired IT lead Bea join the cast |
| Ransomware Scare | `ransomware.js` | after 16 weeks, with 2+ security debt | how bad it gets depends on `security_debt` and `backups_trimmed`; hiring the CISO unlocks Morgan |
| Cloud Migration | `cloud.js` | weeks 1-26, after 6 weeks | lift-and-shift vs re-architect picks the bill you get |
| The Audit | `audit.js` | weeks 34-44 (audit season) | finds `sales_vp_admin`, `gary_undocumented` and `security_debt` |
| AI Everything | `ai.js` | after 12 weeks | careful vs all-in changes the beats; the agent pilot can replace you |

`security_debt` is the thread that ties them together: most shortcuts in the game add 1
to it ("skip patching", "lock it quietly", "just this once"), and the Ransomware and
Audit arcs read it back.

### How the next card is picked

1. If a follow-up is due, it's shown (oldest first).
2. Otherwise one card is drawn at random from every eligible card, by `weight`. A card is
   eligible when its conditions pass, it isn't `followUpOnly`, it isn't a `once` card
   that's already been seen, it isn't waiting in the follow-up queue, and it wasn't one
   of the last few cards shown (`repeatCooldown` in `config.js`, default 6).

## Characters

```js
cfo: {
  name: 'Diane Okafor',
  title: 'Chief Financial Officer',
  bio: 'Knows the cost of everything. Never forgets a slight, or a line item.',
  portrait: { bg: '#2a9d8f', skin: '#8d5524', hair: 'bun', hairColor: '#1b1b1b',
              shirt: '#264653', extras: ['glasses', 'earrings'], mouth: 'flat' },
},
```

The key (`cfo`) is the id cards use. `bio` isn't shown yet; it's a note for whoever
writes their cards (and the gallery later).

Portraits are drawn as SVG from the `portrait` fields, so there are no image files:

| Field | Options |
|---|---|
| `bg` | card background color |
| `skin`, `hairColor`, `shirt` | colors (`#rrggbb`) |
| `hair` | `short` `long` `bun` `curly` `bald` `balding` `ponytail` `spiky` `slick` `none` |
| `extras` | any of `glasses` `shades` `tie` `bowtie` `headset` `beard` `mustache` `earrings` `lanyard` `hoodie` `cap` `pearls` |
| `mouth` | `smile` (default) `grin` `flat` `frown` `o` |

## Endings

```js
security_max: {
  icon: '🔒',
  title: 'Locked Down',
  text: 'Users need three MFA prompts to open Notepad. The business revolts...',
},
```

A meter hitting 0 shows `<meter>_min`, and hitting 100 shows `<meter>_max`, so all
eight of those must exist. Any other id is a special ending, triggered by a choice's
`ending` field. For example, the CFO's last card:

```js
{
  id: 'cfo_final_straw',
  character: 'cfo',
  text: 'I\'ve proposed moving IT under Finance. ...',
  left: { label: 'Apologize. Publicly.', effects: { patience: -10, happiness: -5 }, add: { cfo_grudge: -3 } },
  right: { label: 'Go over her head', ending: 'cfo_takeover' },
  conditions: { counters: { cfo_grudge: { min: 3 } } },
  weight: 3,
  once: true,
}
```

The game over screen counts how many of all the endings the player has found.

## Achievements

`data/achievements.js`. Each one has an `id`, `icon`, `title`, `text` (how to get it),
an optional `unlocks` (what it adds to later runs, shown in the gallery), and `when`.
`when` takes any card condition (`requires`, `counters`, `tenure`, ...), checked after
every swipe, plus a few checked when a run ends:

| Field | Means |
|---|---|
| `ending: 'ai_ending'` | the run ended with this ending |
| `specialEnding: true` | the run ended with a story ending, not a meter |
| `quick: 8` | the run ended within this many weeks |
| `runs: 10` | this many runs finished in total |
| `endingsFound: 12` | this many different endings found in total |
| `allMeterEndings: true` | all eight meter endings found |

```js
{
  id: 'said_no_ceo',
  icon: '🙅',
  title: 'Said No to the CEO and Lived',
  text: 'Push back on the CEO, then last another half year.',
  unlocks: 'The CEO starts asking your opinion.',
  when: { counters: { ceo_no: { min: 1 } }, tenure: { min: 26 } },
},
```

To make a choice count toward one, give it a flag or counter (`add: { ceo_no: 1 }`).

### Unlocking cards in later runs

Every unlocked achievement sets the flag `ach_<id>` at the start of each run after it.
A card that needs it is a legacy card (`data/cards/legacy.js`):
`conditions: { requires: ['ach_said_no_ceo'] }`. The tests check that every achievement
with `unlocks` has at least one card behind it.

## Director names

Every run is "IT Director #N", numbered across all runs, with a name built from the
lists in `data/directors.js` (first names, last names, and nicknames for about a third
of them). Add to the lists freely.

## Config

`data/config.js` has the meter list (key, icon, label) and the tuning numbers: starting
values, the danger zone where meters flash red (below 15, above 85), weeks per year, the
start card, the repeat cooldown and the dot sizes.

## Adding a card file

1. Create `data/cards/<topic>.js`:

   ```js
   export const CARDS = [
     {
       id: 'merger_announced',
       character: 'ceo',
       text: '...',
       left: { label: '...', effects: { budget: -5, patience: 5 } },
       right: { label: '...', effects: { happiness: -5, security: 5 } },
     },
   ];
   ```

2. Add it to `data/cards/index.js`:

   ```js
   import { CARDS as MERGER } from './merger.js';
   export const ALL_CARDS = [...STARTER, ...MERGER];
   ```

3. Run `npm test`, then `npm run balance` to see how often each card turns up and
   which endings players hit (below).

## Balance

`npm run balance` plays a few thousand runs with two bots, one that swipes at random and
one that keeps the meters near the middle, and prints the total push on each meter, how
many weeks runs last, how often each ending comes up, and any card that never appeared.
A healthy spread has every meter ending in the mix, random runs lasting around 20 weeks,
and every card seen. If one meter dominates the endings, soften that meter's costs or
give the cheap side of some cards a small gain.

## Card files

| File | What's in it |
|---|---|
| `starter.js` | the first cards: the CIO's welcome, the Sales VP's admin rights, the CFO's grudge |
| `office.js` | standalone everyday cards, plus grudge and reward cards for the cast |
| `seasonal.js` | cards tied to the time of year (tax phishing, interns, budget season, change freeze) |
| `merger.js`, `ransomware.js`, `cloud.js`, `audit.js`, `ai.js` | the five story arcs |
| `legacy.js` | cards unlocked by achievements from earlier runs |
