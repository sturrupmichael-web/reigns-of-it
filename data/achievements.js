/*
 * ACHIEVEMENTS
 * ============
 * Unlocked once, kept forever (across runs, in localStorage). Some of them also
 * unlock content for every run after: each unlocked achievement sets the flag
 * `ach_<id>` at the start of a run, so a card can use
 * `conditions: { requires: ['ach_said_no_ceo'] }` (see data/cards/legacy.js).
 *
 * Fields:
 *   id       Unique, lowercase_snake_case. Never rename one players may have.
 *   icon     Emoji for the gallery and the banner.
 *   title    Short name.
 *   text     How to get it, in a line.
 *   unlocks  (optional) What it adds to future runs, shown in the gallery.
 *   when     What has to be true. Any card condition works here (requires,
 *            excludes, counters, meters, tenure, ...), checked after every swipe,
 *            plus these, checked when a run ends:
 *              ending: 'id'          the run ended with this ending
 *              specialEnding: true   the run ended with a story ending (not a meter)
 *              quick: 8              the run ended within this many weeks
 *              runs: 10              this many runs finished, in total
 *              endingsFound: 12      this many different endings found, in total
 *              allMeterEndings: true all eight meter endings found
 */
export const ACHIEVEMENTS = [
  {
    id: 'probation',
    icon: '🎫',
    title: 'Passed Probation',
    text: 'Survive your first 13 weeks.',
    when: { tenure: { min: 13 } },
  },
  {
    id: 'year_one',
    icon: '🎂',
    title: 'One Year In',
    text: 'Survive a full year.',
    unlocks: 'The CIO remembers your anniversary. Sort of.',
    when: { tenure: { min: 52 } },
  },
  {
    id: 'five_years',
    icon: '🏅',
    title: 'Five-Year Pin',
    text: 'Survive five years. HR has a pin for that.',
    when: { tenure: { min: 260 } },
  },
  {
    id: 'ten_years',
    icon: '🏆',
    title: 'Survived 10 Years',
    text: 'Ten years in one IT job. Nobody has ever done this.',
    when: { tenure: { min: 520 } },
  },
  {
    id: 'said_no_ceo',
    icon: '🙅',
    title: 'Said No to the CEO and Lived',
    text: 'Push back on the CEO, then last another half year.',
    unlocks: 'The CEO starts asking your opinion.',
    when: { counters: { ceo_no: { min: 1 } }, tenure: { min: 26 } },
  },
  {
    id: 'admin_for_all',
    icon: '🔓',
    title: 'Gave Everyone Admin',
    text: 'Local admin for the whole company. What could go wrong?',
    when: { requires: ['everyone_admin'] },
  },
  {
    id: 'clean_audit',
    icon: '✅',
    title: 'No Significant Findings',
    text: 'Get through the audit without a single finding.',
    when: { requires: ['audit_clean'] },
  },
  {
    id: 'hired_tyler',
    icon: '🧑‍🎓',
    title: 'Hired the Intern',
    text: 'Give Tyler a full-time job. On purpose.',
    unlocks: 'Tyler comes back as your junior sysadmin.',
    when: { requires: ['hired_tyler'] },
  },
  {
    id: 'paid_ransom',
    icon: '🪙',
    title: 'Valued Customer',
    text: 'Pay the ransom.',
    unlocks: 'The attackers remember you fondly.',
    when: { requires: ['paid_ransom'] },
  },
  {
    id: 'replaced_by_ai',
    icon: '🤖',
    title: 'Automated',
    text: 'Get replaced by an AI agent you hired yourself.',
    unlocks: 'The AI needs a reference letter.',
    when: { ending: 'ai_ending' },
  },
  {
    id: 'off_script',
    icon: '📜',
    title: 'Off Script',
    text: 'End a run with a story ending instead of a meter.',
    when: { specialEnding: true },
  },
  {
    id: 'speedrun',
    icon: '⏱️',
    title: 'Speedrun',
    text: 'Lose the job within 8 weeks.',
    when: { quick: 8 },
  },
  {
    id: 'revolving_door',
    icon: '🚪',
    title: 'Revolving Door',
    text: 'Go through 10 IT Directors.',
    unlocks: 'One of your predecessors left a note.',
    when: { runs: 10 },
  },
  {
    id: 'every_way_out',
    icon: '🎲',
    title: 'Every Way Out',
    text: 'Find all eight meter endings.',
    when: { allMeterEndings: true },
  },
  {
    id: 'seen_it_all',
    icon: '🗂️',
    title: 'Seen It All',
    text: 'Find all twelve endings.',
    when: { endingsFound: 12 },
  },
];
