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
  hr: {
    name: 'Linda Park',
    title: 'HR Director',
    bio: 'Warm, organized, and terrifying in a meeting. Needs every new hire to have a laptop yesterday.',
    portrait: { bg: '#e5989b', skin: '#e9b896', hair: 'bun', hairColor: '#2b1d14', shirt: '#6d597a', extras: ['earrings'], mouth: 'smile' },
  },
  marketing: {
    name: 'Skyler Voss',
    title: 'VP of Marketing',
    bio: 'Has signed up for every SaaS free trial ever made. Thinks a firewall is a brand guideline.',
    portrait: { bg: '#ff70a6', skin: '#f2c6a0', hair: 'spiky', hairColor: '#7b2cbf', shirt: '#22223b', extras: ['shades'], mouth: 'grin' },
  },
  dev_lead: {
    name: 'Raj Malhotra',
    title: 'Lead Developer',
    bio: 'Brilliant. Wants production access, a faster laptop, and for nobody to ever ask for an estimate.',
    portrait: { bg: '#4361ee', skin: '#a8714f', hair: 'short', hairColor: '#111111', shirt: '#3a0ca3', extras: ['hoodie', 'glasses'], mouth: 'flat' },
  },
  facilities: {
    name: 'Dale Kowalski',
    title: 'Facilities Manager',
    bio: 'Controls the thermostat, the badge readers and the server room door. Considers all three his.',
    portrait: { bg: '#bc6c25', skin: '#e2b48c', hair: 'balding', hairColor: '#8a7560', shirt: '#606c38', extras: ['mustache', 'lanyard'], mouth: 'flat' },
  },
  legal: {
    name: 'Harriet Wu',
    title: 'General Counsel',
    bio: 'Reads every license agreement. All of them. Has opinions about the word "perpetual".',
    portrait: { bg: '#335c67', skin: '#f0cfae', hair: 'short', hairColor: '#1b1b1b', shirt: '#14213d', extras: ['glasses', 'pearls'], mouth: 'flat' },
  },
  ciso: {
    name: 'Morgan Reyes',
    title: 'Chief Information Security Officer',
    bio: 'Hired after the incident. Sees every request as an attack surface, including yours.',
    portrait: { bg: '#370617', skin: '#c68e6a', hair: 'short', hairColor: '#4a3426', shirt: '#111111', extras: ['shades'], mouth: 'flat' },
  },
  consultant: {
    name: 'Trent Whitfield',
    title: 'Transformation Consultant',
    bio: 'Brought in by the board after the merger. Bills by the slide. Says "synergy" without irony.',
    portrait: { bg: '#a3b18a', skin: '#f5d0b0', hair: 'slick', hairColor: '#c9a227', shirt: '#283618', extras: ['tie'], mouth: 'grin' },
  },
  acquired_it: {
    name: 'Bea Lindqvist',
    title: 'IT Lead, the acquired company',
    bio: 'Ran IT for the company you just bought, alone, for nine years. Knows where the Ohio closet is.',
    portrait: { bg: '#90be6d', skin: '#f3d3bd', hair: 'ponytail', hairColor: '#e9c46a', shirt: '#2a9d8f', extras: ['glasses', 'lanyard'], mouth: 'smile' },
  },
  ex_director: {
    name: 'The Last IT Director',
    title: 'A note left in your desk drawer',
    bio: 'Unlocked after ten runs. Lasted longer than most. Never explains how.',
    portrait: { bg: '#495057', skin: '#d9b39a', hair: 'balding', hairColor: '#6c757d', shirt: '#343a40', extras: ['glasses', 'lanyard'], mouth: 'frown' },
  },
};
