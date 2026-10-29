// ARC: The Merger
// The company buys a smaller one. Two email domains, duplicate tools, a badge system
// that doesn't talk to yours, and a transformation consultant the board hires to
// "harmonize" everything. Bea, the acquired company's one-person IT team, and Trent the
// consultant only exist once the merger has happened.
//
// Flags: merger_on, two_domains, consultant_on. Counters: bea_trust, trent_annoyed.

export const CARDS = [
  {
    id: 'merger_announce',
    character: 'ceo',
    text: 'Big news! We\'re acquiring a company. It closes in two weeks. IT will be fine, right? You\'ll make it seamless.',
    left: {
      label: 'I need a real plan',
      effects: { patience: -10, budget: -5 },
      flags: { merger_on: true },
      followUp: { card: 'merger_domains', delay: 2 },
    },
    right: {
      label: 'Seamless. Day one.',
      effects: { patience: 10, happiness: -5, budget: 5 },
      flags: { merger_on: true },
      add: { security_debt: 1 },
      followUp: { card: 'merger_domains', delay: 2 },
    },
    conditions: { tenure: { min: 10 } },
    weight: 2,
    once: true,
  },
  {
    id: 'merger_domains',
    character: 'acquired_it',
    text: 'Hi, I\'m Bea. I\'m their whole IT department. Our email runs on a server in a closet in Ohio. Do we migrate everyone this weekend, or run two domains for a while?',
    left: {
      label: 'Run two domains',
      effects: { happiness: 5, security: -10, budget: 5 },
      flags: { two_domains: true },
      followUp: [{ card: 'merger_duplicate_tools', delay: 2 }, { card: 'merger_ohio_closet', delay: 12 }],
    },
    right: {
      label: 'Migrate this weekend',
      effects: { happiness: -10, budget: -5, security: 5 },
      add: { bea_trust: 1 },
      followUp: { card: 'merger_duplicate_tools', delay: 2 },
    },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'merger_duplicate_tools',
    character: 'cfo',
    text: 'We now pay for two ticketing systems, two chat apps and three antivirus products. Pick one of each. By Friday.',
    left: {
      label: 'Keep ours, cut theirs',
      effects: { budget: 10, happiness: -10 },
      add: { bea_trust: -1 },
      followUp: { card: 'merger_consultant', delay: 3 },
    },
    right: {
      label: 'Keep the best of each',
      effects: { budget: 5, happiness: 5, patience: -10 },
      add: { bea_trust: 1 },
      followUp: { card: 'merger_consultant', delay: 3 },
    },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'merger_consultant',
    character: 'ceo',
    text: 'The board hired a transformation consultant to "harmonize" the two companies. His name is Trent. Please be nice to Trent.',
    left: { label: 'Welcome aboard, Trent', effects: { patience: 5, budget: -10 }, flags: { consultant_on: true } },
    right: { label: 'We don\'t need Trent', effects: { patience: -10, happiness: 5, budget: 5 }, flags: { consultant_on: true }, add: { trent_annoyed: 1 } },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'merger_badges',
    character: 'facilities',
    text: 'The new office\'s badge readers only work with their old system. Half the staff are propping the doors open with recycling bins.',
    left: { label: 'Replace the readers', effects: { budget: -10, security: 10 } },
    right: { label: 'Tape up a sign', effects: { security: -10, happiness: 5, budget: 5 }, add: { security_debt: 1 } },
    conditions: { requires: ['merger_on'] },
    once: true,
  },
  {
    id: 'merger_rightsizing',
    character: 'hr',
    text: 'We\'re "right-sizing" the combined IT team. Leadership wants one name from you. Theirs or ours?',
    left: { label: 'Fight for everyone', effects: { budget: -5, happiness: 10, patience: -5 }, add: { bea_trust: 1 } },
    right: { label: 'Cut from theirs', effects: { budget: 10, happiness: -10, patience: 5 }, add: { bea_trust: -2 } },
    conditions: { requires: ['merger_on'], tenure: { min: 18 } },
    once: true,
  },
  {
    id: 'merger_bea_quits',
    character: 'acquired_it',
    text: 'I\'m leaving. The only person who knew how the old payroll export worked was me. Good luck with the 15th.',
    left: { label: 'Counteroffer. Now.', effects: { budget: -10, happiness: 5 }, add: { bea_trust: 2 } },
    right: { label: 'We\'ll figure it out', effects: { happiness: -15, patience: -5, budget: 5 } },
    conditions: { requires: ['merger_on'], counters: { bea_trust: { max: -2 } } },
    weight: 3,
    once: true,
  },
  {
    id: 'merger_ohio_closet',
    character: 'acquired_it',
    text: 'Remember the email server in the Ohio closet? The building manager unplugged it to charge a vacuum. Half the company has no email.',
    left: { label: 'Finally migrate them', effects: { budget: -5, happiness: -10, security: 10 }, flags: { two_domains: false } },
    right: { label: 'Plug it back in', effects: { security: -10, happiness: 5, patience: -5 }, add: { security_debt: 1 } },
    conditions: { requires: ['two_domains'] },
    followUpOnly: true,
    once: true,
  },

  // ── Trent, the consultant (only after the merger) ───────────────────────
  {
    id: 'trent_slides',
    character: 'consultant',
    text: 'I\'ve prepared a 90-slide deck on IT harmonization. Slide 4 is just the word "Synergy". Could you present it to the board for me?',
    left: { label: 'Read it first', effects: { patience: -5, happiness: 5, budget: 5 }, add: { trent_annoyed: 1 } },
    right: { label: 'Present it blind', effects: { patience: 10, budget: -5, happiness: -5 } },
    conditions: { requires: ['consultant_on'] },
    once: true,
  },
  {
    id: 'trent_platform',
    character: 'consultant',
    text: 'My firm happens to resell a platform that replaces your ticketing, chat, wiki and HR tools. All of them. In one.',
    left: { label: 'Hard pass', effects: { patience: -5, budget: 5 }, add: { trent_annoyed: 1 } },
    right: { label: 'Let\'s see a demo', effects: { budget: -5, patience: 10, happiness: -5 } },
    conditions: { requires: ['consultant_on'] },
    once: true,
  },
  {
    id: 'trent_org_chart',
    character: 'consultant',
    text: 'In my new org chart, IT reports to me. Temporarily. For about three years. The board loves it. Any objections?',
    left: { label: 'Accept it gracefully', effects: { patience: -15, happiness: -5 }, add: { trent_annoyed: -2 } },
    right: { label: 'Fight it in the board meeting', ending: 'consultant_takeover' },
    conditions: { requires: ['consultant_on'], counters: { trent_annoyed: { min: 2 } } },
    weight: 3,
    once: true,
  },
];
