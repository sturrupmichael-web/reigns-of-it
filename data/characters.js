/*
 * CHARACTERS
 * ==========
 * Every card is "said" by a character. Cards point at a character by its id
 * (the key on the left, e.g. `cfo`). Ids are lowercase_snake_case and never
 * change once cards use them.
 *
 * Fields:
 *   name      Display name.
 *   title     Job title, shown under the name.
 *   bio       (optional) One line about their personality. Not shown in the
 *             game yet; it's for you as the writer, and for the gallery later.
 *   portrait  How the SVG face is drawn (no image files needed):
 *     bg         Card background color.
 *     skin       Face color.
 *     hair       One of: 'short' 'long' 'bun' 'curly' 'bald' 'balding'
 *                'ponytail' 'spiky' 'slick' 'none'
 *     hairColor  Hair color.
 *     shirt      Shirt / jacket color.
 *     extras     (optional) Any of: 'glasses' 'shades' 'tie' 'headset'
 *                'beard' 'mustache' 'earrings' 'lanyard' 'hoodie' 'cap'
 *                'pearls' 'bowtie'
 *     mouth      (optional) 'smile' (default), 'grin', 'flat', 'frown', 'o'
 */
export const CHARACTERS = {
  cio: {
    name: 'Raymond Vance',
    title: 'Chief Information Officer',
    bio: 'Your boss. Loves dashboards, hates surprises, reads one airline magazine article a month and acts on it.',
    portrait: { bg: '#3d5a80', skin: '#e0ac8b', hair: 'balding', hairColor: '#b8b8b8', shirt: '#22303f', extras: ['glasses', 'tie'], mouth: 'flat' },
  },
  ceo: {
    name: 'Gwen Hartley',
    title: 'Chief Executive Officer',
    bio: 'Visionary. Reads tech headlines on the treadmill. Every idea is due Friday.',
    portrait: { bg: '#9d4edd', skin: '#f1c7a5', hair: 'long', hairColor: '#e9c46a', shirt: '#1d1d2c', extras: ['pearls'], mouth: 'grin' },
  },
  cfo: {
    name: 'Diane Okafor',
    title: 'Chief Financial Officer',
    bio: 'Knows the cost of everything. Never forgets a slight, or a line item.',
    portrait: { bg: '#2a9d8f', skin: '#8d5524', hair: 'bun', hairColor: '#1b1b1b', shirt: '#264653', extras: ['glasses', 'earrings'], mouth: 'flat' },
  },
  sales_vp: {
    name: 'Chad Brennan',
    title: 'VP of Sales',
    bio: 'Every request is urgent because a client is waiting. The client is always waiting.',
    portrait: { bg: '#e76f51', skin: '#f4c9a8', hair: 'slick', hairColor: '#6b3e1f', shirt: '#1f2a44', extras: ['tie'], mouth: 'grin' },
  },
  secops: {
    name: 'Priya Raman',
    title: 'SecOps Analyst',
    bio: 'Has not slept since the last zero-day. Sees phishing in her dreams.',
    portrait: { bg: '#264653', skin: '#c68863', hair: 'ponytail', hairColor: '#111111', shirt: '#3a3a3a', extras: ['headset', 'hoodie'], mouth: 'flat' },
  },
  helpdesk: {
    name: 'Marisol Diaz',
    title: 'Help Desk Lead',
    bio: 'Holds the line between users and chaos. Has a mug that says "Did you reboot?"',
    portrait: { bg: '#f4a261', skin: '#d8a07a', hair: 'curly', hairColor: '#3b2416', shirt: '#2b6cb0', extras: ['headset', 'lanyard'], mouth: 'smile' },
  },
  intern: {
    name: 'Tyler',
    title: 'Summer Intern',
    bio: 'Eager. Dangerous. Has admin on something and nobody knows what.',
    portrait: { bg: '#8ac926', skin: '#f6d1b3', hair: 'spiky', hairColor: '#d4a017', shirt: '#ffffff', extras: ['cap', 'lanyard'], mouth: 'o' },
  },
  vendor: {
    name: 'Brock Steele',
    title: 'Enterprise Account Executive',
    bio: 'Sells a platform. What the platform does is unclear. Always has a steakhouse reservation.',
    portrait: { bg: '#ffb703', skin: '#e8b48f', hair: 'short', hairColor: '#2b2b2b', shirt: '#3c3c3c', extras: ['shades', 'tie'], mouth: 'grin' },
  },
  sysadmin: {
    name: 'Gary Nowak',
    title: 'Senior Sysadmin (since 1998)',
    bio: 'Knows where every body is buried, because he buried them. Only he has the root password.',
    portrait: { bg: '#6c757d', skin: '#e2b18f', hair: 'long', hairColor: '#7a6a58', shirt: '#2f4f2f', extras: ['beard', 'glasses'], mouth: 'flat' },
  },
  auditor: {
    name: 'Mr. Pemberton',
    title: 'External Auditor',
    bio: 'Polite. Thorough. Brings his own highlighter. Has never been surprised.',
    portrait: { bg: '#adb5bd', skin: '#f0d0b8', hair: 'bald', hairColor: '#000000', shirt: '#2d2d2d', extras: ['glasses', 'bowtie', 'mustache'], mouth: 'flat' },
  },
};
