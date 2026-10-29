// The card validator: the real content passes, and it catches the mistakes it's for
// (a typo in a field name, a card nothing can reach, a broken follow-up). Then the
// validator page loads, built and from disk.

import { assert } from './harness.mjs';
import { CONTENT } from '../src/content.js';
import { validateContent } from '../src/tools/validate.js';
import { CARDS as TEMPLATE } from '../docs/card-template.js';

export const browser = false;

// Adds cards for one check, then puts the content back.
function withCards(cards, fn) {
  for (const c of cards) { CONTENT.cards.push(c); CONTENT.cardById[c.id] = c; }
  try { return fn(validateContent()); } finally {
    for (const c of cards) { CONTENT.cards.pop(); delete CONTENT.cardById[c.id]; }
  }
}
const mentions = (list, id, words) => list.some((i) => i.where.includes(id) && i.text.includes(words));

export const tests = [
  ['the real content has no errors and no warnings', async () => {
    const { errors, warnings } = validateContent();
    assert(errors.length === 0, errors.map((e) => `${e.where}: ${e.text}`).join('\n'));
    assert(warnings.length === 0, warnings.map((e) => `${e.where}: ${e.text}`).join('\n'));
  }],

  ['the card template in docs/ passes cleanly', async () => {
    withCards(TEMPLATE, ({ errors, warnings }) => {
      const mine = [...errors, ...warnings].filter((i) => i.where.includes('example_'));
      assert(mine.length === 0, mine.map((e) => `${e.where}: ${e.text}`).join('\n'));
    });
  }],

  ['it catches typos, impossible conditions and bad effects', async () => {
    withCards([{
      id: 'test_typos',
      character: 'cio',
      text: 'Test.',
      conditon: { requires: ['x'] },
      left: { label: 'A', effects: { budget: 'ten' }, folowUp: 'cio_welcome' },
      right: { label: 'B', effects: { budget: -5 } },
      weight: 0,
    }, {
      id: 'test_ranges',
      character: 'cio',
      text: 'Test.',
      conditions: { tenure: { min: 10, max: 2 }, weeks: [0, 60] },
      left: { label: 'A', effects: { budget: 5, security: -5 } },
      right: { label: 'B', effects: { budget: -5, security: 5 } },
    }], ({ errors }) => {
      assert(mentions(errors, 'test_typos', '"conditon" (did you mean "conditions"?)'), 'missed the conditon typo');
      assert(mentions(errors, 'test_typos, left', '"folowUp"'), 'missed the folowUp typo');
      assert(mentions(errors, 'test_typos, left', 'not a number'), 'missed the non-number effect');
      assert(mentions(errors, 'test_typos', 'weight'), 'missed weight 0');
      assert(mentions(errors, 'test_ranges', 'min 10 above max 2'), 'missed the impossible tenure');
      assert(mentions(errors, 'test_ranges', 'weeks should be'), 'missed the bad weeks');
    });
  }],

  ['it finds cards that can never appear, and choices with no cost', async () => {
    withCards([{
      id: 'test_orphan',
      character: 'cio',
      text: 'Nobody follows up with me.',
      followUpOnly: true,
      left: { label: 'A', effects: { budget: 5, security: -5 } },
      right: { label: 'B', effects: { budget: -5, security: 5 } },
    }, {
      id: 'test_cleared_only',
      character: 'cio',
      text: 'I need a flag that only ever gets cleared.',
      conditions: { requires: ['test_flag'] },
      left: { label: 'A', effects: { budget: 5, security: -5 }, flags: { test_flag: false } },
      right: { label: 'B', effects: { budget: 10, security: 5 } },
    }], ({ warnings }) => {
      assert(mentions(warnings, 'test_orphan', 'no choice follows up with it'), 'missed the orphan follow-up');
      assert(mentions(warnings, 'test_cleared_only', 'can never appear'), 'missed the unreachable flag');
      assert(mentions(warnings, 'test_cleared_only, right', 'only gains'), 'missed the free win');
    });
  }],
];
