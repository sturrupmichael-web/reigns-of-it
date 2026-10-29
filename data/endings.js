/*
 * ENDINGS
 * =======
 * A run ends when any meter hits 0 or 100. The ending shown is looked up by
 * `<meter>_min` (hit 0) or `<meter>_max` (hit 100), so all 8 of these must
 * exist. Special story endings (Phase 2+) use any other id and are triggered
 * by a card choice with `ending: '<id>'`.
 *
 * Fields:
 *   title  Short headline.
 *   text   One or two sentences. This is the punchline, so make it land.
 *   icon   (optional) Emoji shown big on the game over screen.
 */
export const ENDINGS = {
  budget_min: {
    icon: '💸',
    title: 'Insolvent',
    text: 'The servers are leased, the laptops are leased, and as of this morning, so is your replacement. Finance escorts you out past a row of unplugged monitors.',
  },
  budget_max: {
    icon: '🏦',
    title: 'Hoarder',
    text: 'You hoarded so much budget that Finance clawed it back and replaced you with an MSP. They have a very nice portal.',
  },
  security_min: {
    icon: '🏴‍☠️',
    title: 'Breached',
    text: 'Your customer database is for sale on a forum, bundled with a coupon code. Legal would like a word. Several words. Under oath.',
  },
  security_max: {
    icon: '🔒',
    title: 'Locked Down',
    text: 'Users need three MFA prompts to open Notepad. The business revolts, and your laptop fails its own compliance check on the way out.',
  },
  happiness_min: {
    icon: '🔥',
    title: 'Mutiny',
    text: 'The business forms a shadow IT department in a shared spreadsheet. It has better uptime than you. The CEO thanks you for your service.',
  },
  happiness_max: {
    icon: '🎉',
    title: 'Everyone\'s Favorite',
    text: 'Everyone\'s local admin. Everyone has the Wi-Fi password. Everyone loves you. Ransomware says thanks.',
  },
  patience_min: {
    icon: '🚪',
    title: 'Badge Deactivated',
    text: 'Your badge stops working Monday. Your calendar invite titled "Quick Sync" was, in fact, not quick.',
  },
  patience_max: {
    icon: '🪑',
    title: 'Promoted Out',
    text: 'The CIO trusts you so completely that he retires and hands you his job. You now attend eleven meetings a day and never touch a server again.',
  },
};
