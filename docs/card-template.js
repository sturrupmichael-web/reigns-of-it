// TEMPLATE: copy this file to data/cards/<your-topic>.js, rename the ids, and add it to
// data/cards/index.js. Then run `npm run validate`. Full field reference: docs/SCHEMA.md.
//
// This file shows both kinds of content:
//   1. a standalone card, which can turn up any time
//   2. a small arc: a starter card that sets a flag and queues follow-ups, where each
//      follow-up only shows if its conditions still hold when its week comes
//
// Writing tips
//   - text: one or two sentences, in the character's voice. The joke is the real IT
//     situation, said out loud.
//   - labels: 2-5 words, what you'd actually say back.
//   - effects: 5-15 each, 20+ for a big moment. Touch 2-3 meters per side, and give
//     both sides a cost, so there's no free answer.

export const CARDS = [
  // ── 1. A standalone card ────────────────────────────────────────────────
  {
    id: 'example_printer',
    character: 'helpdesk',
    text: 'The third-floor printer is printing the same page over and over. It\'s the CEO\'s performance review.',
    left: { label: 'Pull the plug', effects: { happiness: -5, security: 10 } },
    right: { label: 'Let it finish', effects: { happiness: 5, patience: -10 }, add: { security_debt: 1 } },
    weight: 1, // optional: 2 = twice as likely as other cards
  },

  // ── 2. A small arc ──────────────────────────────────────────────────────
  // The starter: only after 10 weeks, at most once per run.
  {
    id: 'example_arc_start',
    character: 'cfo',
    text: 'We\'re switching expense systems. The vendor says it\'s "plug and play". Go live is Monday.',
    left: {
      label: 'Push it back a month',
      effects: { patience: -10, security: 5 },
      flags: { expense_delayed: true },
      followUp: { card: 'example_arc_ok', delay: 4 }, // 4 weeks later
    },
    right: {
      label: 'Monday it is',
      effects: { patience: 10, happiness: -5 },
      flags: { expense_rushed: true },
      // Queue several beats at once; each checks its own conditions when due.
      followUp: [{ card: 'example_arc_chaos', delay: 1 }, { card: 'example_arc_ok', delay: 4 }],
    },
    conditions: { tenure: { min: 10 } },
    once: true,
  },
  // Only reached as a follow-up, and only if you rushed it.
  {
    id: 'example_arc_chaos',
    character: 'helpdesk',
    text: 'Nobody can submit expenses. Sales has started paying for client dinners with "IOU" napkins.',
    left: { label: 'Roll back', effects: { budget: -10, happiness: 10 }, flags: { expense_rushed: false } },
    right: { label: 'Fix forward', effects: { happiness: -10, patience: 5 } },
    conditions: { requires: ['expense_rushed'] },
    followUpOnly: true,
    once: true,
  },
  // The ending beat. A choice can also end the run with a special ending
  // (`ending: 'some_id'`, defined in data/endings.js).
  {
    id: 'example_arc_ok',
    character: 'cfo',
    text: 'The new expense system works. I\'m told this has never happened before. I\'m suspicious.',
    left: { label: 'Credit the team', effects: { happiness: 10, patience: -5 } },
    right: { label: 'Credit the vendor', effects: { patience: 5, budget: 5, happiness: -5 } },
    conditions: { excludes: ['expense_rushed'] }, // only if it went well
    followUpOnly: true,
    once: true,
  },
];
