# Reigns of IT: content schema

Everything the player reads lives under `data/`, as plain JavaScript objects. The code
under `src/` never mentions a card, character or ending by name (except the start card,
which is set in `data/config.js`).

```
data/
  config.js        meters (names, icons) and tuning numbers
  characters.js    who says each card, and how their portrait is drawn
  endings.js       the text for each way a run can end
  cards/
    index.js       the list of card files (add new files here)
    starter.js     the Phase 1 cards
```

The data files are JavaScript rather than JSON so you can write comments, leave trailing
commas, and use either quote style. Each file exports one object or list.

When you change anything here, run `npm test`. The first test checks the content for
duplicate ids, cards that name a character or follow-up that doesn't exist, effects on a
meter that doesn't exist, and missing endings. The same problems are also logged to the
browser console while you play `dev.html`.

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
| `followUp` | Optional. A card to show later, by id. `'card_id'` (or `{ card: 'card_id', delay: 0 }`) shows it next. `{ card: 'card_id', delay: 3 }` shows it after three other cards, i.e. three weeks later. |
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
| `weeks: [40, 52]` | the week of the year, 1-52, for seasonal cards. A window that wraps, like `[50, 4]`, covers late December to January. |
| `meters: { budget: { max: 30 }, security: { min: 60 } }` | meter ranges, e.g. only when money is tight |

Follow-ups skip the random draw but still check their conditions when their turn comes.
If the conditions fail then (say the player cleared the flag in the meantime), the
follow-up is quietly dropped. That's how the crypto miner card only arrives if the Sales
VP still has admin.

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
`ending` field.

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

3. Run `npm test`.
