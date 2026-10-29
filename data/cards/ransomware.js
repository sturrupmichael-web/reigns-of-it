// ARC: Ransomware Scare
// Every shortcut you take elsewhere adds to the `security_debt` counter (admin rights,
// trimmed backups, postponed patches, ...). This arc reads it: catch the attack early
// and it's one laptop; let it run with a lot of debt and it's everything. Trimmed
// backups make the recovery much worse. Afterwards the board hires a CISO, who then
// turns up in the regular deck.
//
// Flags: rw_started, paid_ransom, ciso_hired.

export const CARDS = [
  {
    id: 'rw_strange_traffic',
    character: 'secops',
    text: 'Something on our network talks to a server overseas at 3 a.m. Every night. It sends about 40 GB. Probably fine?',
    left: {
      label: 'Pull the plug now',
      effects: { happiness: -10, security: 10 },
      flags: { rw_started: true },
      followUp: { card: 'rw_contained', delay: 1 },
    },
    right: {
      label: 'Probably the backups',
      effects: { happiness: 5, security: -10 },
      flags: { rw_started: true },
      add: { security_debt: 1 },
      followUp: [
        { card: 'rw_total_loss', delay: 2 },
        { card: 'rw_encrypted', delay: 2 },
      ],
    },
    conditions: { tenure: { min: 16 }, counters: { security_debt: { min: 2 } } },
    weight: 2,
    once: true,
  },
  {
    id: 'rw_contained',
    character: 'secops',
    text: 'We isolated it. One infected laptop. It\'s the Sales VP\'s. Of course it is. It was running something called "FreeDemoInstaller.exe".',
    left: { label: 'Reimage it, move on', effects: { security: 5, happiness: -5, budget: 5 }, add: { security_debt: -1 } },
    right: {
      label: 'Full incident review',
      effects: { budget: -5, security: 10, patience: 5 },
      add: { security_debt: -2 },
      followUp: { card: 'rw_ciso', delay: 4 },
    },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'rw_encrypted',
    character: 'helpdesk',
    text: 'Every file on the shared drive now ends in ".lol". There\'s a ransom note on every desktop. It\'s in Comic Sans.',
    left: {
      label: 'Restore from backups',
      effects: { happiness: -10, budget: 5 },
      followUp: ['rw_restore_ok', 'rw_restore_bad'],
    },
    right: {
      label: 'Pay the ransom',
      effects: { budget: -15, patience: -10, security: -5 },
      flags: { paid_ransom: true },
      followUp: { card: 'rw_ciso', delay: 3 },
    },
    conditions: { counters: { security_debt: { max: 4 } } },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'rw_total_loss',
    character: 'secops',
    text: 'It\'s everything. Email, payroll, the badge readers, the coffee machine. They\'re in the CEO\'s calendar. They scheduled a meeting with us.',
    left: {
      label: 'Rebuild from scratch',
      effects: { budget: -15, happiness: -15, security: 15 },
      add: { security_debt: -3 },
      followUp: { card: 'rw_ciso', delay: 3 },
    },
    right: { label: 'Take the meeting', ending: 'ransomware_ending' },
    conditions: { counters: { security_debt: { min: 5 } } },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'rw_restore_ok',
    character: 'sysadmin',
    text: 'Backups are clean. I tested them last month, because nobody else ever does. Full restore takes three days.',
    left: {
      label: 'Work the weekend',
      effects: { happiness: -10, security: 10 },
      add: { gary_grudge: 1, security_debt: -2 },
      followUp: { card: 'rw_ciso', delay: 3 },
    },
    right: {
      label: 'Business hours only',
      effects: { happiness: 5, patience: -10, security: 5 },
      add: { security_debt: -1 },
      followUp: { card: 'rw_ciso', delay: 3 },
    },
    conditions: { excludes: ['backups_trimmed'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'rw_restore_bad',
    character: 'sysadmin',
    text: 'Remember when Finance trimmed the backups? The last good one is from March. Of last year.',
    left: {
      label: 'Restore from March',
      effects: { happiness: -20, patience: -10, budget: 5 },
      followUp: { card: 'rw_ciso', delay: 3 },
    },
    right: {
      label: 'Pay them after all',
      effects: { budget: -15, patience: -15 },
      flags: { paid_ransom: true },
      followUp: { card: 'rw_ciso', delay: 3 },
    },
    conditions: { requires: ['backups_trimmed'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'rw_ciso',
    character: 'ceo',
    text: 'The board wants a Chief Information Security Officer. Her name is Morgan. She\'ll share your budget. And your office.',
    left: { label: 'Welcome, Morgan', effects: { budget: -5, security: 10, patience: 5 }, flags: { ciso_hired: true } },
    right: { label: 'I can handle security', effects: { patience: -10, budget: 5 }, flags: { ciso_hired: true }, add: { ciso_friction: 1, ceo_no: 1 } },
    followUpOnly: true,
    once: true,
  },

  // ── Morgan, the CISO (only after the incident) ──────────────────────────
  {
    id: 'ciso_mfa_everywhere',
    character: 'ciso',
    text: 'MFA on everything. The printers. The fridge. The CEO. Especially the CEO. Starting Monday.',
    left: { label: 'Phase it in', effects: { security: 5, patience: 5, happiness: -5 }, add: { ciso_friction: 1 } },
    right: { label: 'Monday it is', effects: { security: 15, happiness: -15 }, add: { security_debt: -1 } },
    conditions: { requires: ['ciso_hired'] },
    once: true,
  },
  {
    id: 'ciso_tabletop',
    character: 'ciso',
    text: 'I\'m running an incident tabletop exercise. Four hours. Every department head. Phones in a box.',
    left: { label: 'Make it two hours', effects: { happiness: 5, security: -5 }, add: { ciso_friction: 1 } },
    right: { label: 'Phones in the box', effects: { security: 10, happiness: -10, patience: 5 } },
    conditions: { requires: ['ciso_hired'] },
    once: true,
  },
  {
    id: 'ciso_budget_war',
    character: 'ciso',
    text: 'I need 30% of your budget for a security operations center. You\'ve said no to me twice. Third time\'s the charm?',
    left: { label: 'Split it with you', effects: { budget: -5, security: 10, patience: 5 }, add: { ciso_friction: -2 } },
    right: { label: 'Still no', effects: { budget: 5, security: -10, patience: -10 } },
    conditions: { requires: ['ciso_hired'], counters: { ciso_friction: { min: 2 } } },
    weight: 2,
    once: true,
  },
];
