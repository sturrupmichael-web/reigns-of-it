// ARC: The Audit
// Every autumn the auditor arrives, and finds whatever you neglected. Each finding is a
// follow-up that only shows if you actually left that mess behind: the Sales VP's admin
// rights, Gary's undocumented payroll server, a pile of security debt. If none apply, you
// get the rarest card in the game. Every finding adds to `audit_findings`, so fixing
// things mid-audit doesn't earn you the clean report too.
//
// Flags: audit_prepared. Counters: audit_findings.

export const CARDS = [
  {
    id: 'audit_kickoff',
    character: 'auditor',
    text: 'The annual audit begins Monday. I\'ll need a quiet room, every policy you have, and a chair without wheels. Wheels make me anxious.',
    left: {
      label: 'Prep the team for weeks',
      effects: { happiness: -10, budget: -5, security: 5 },
      flags: { audit_prepared: true },
      followUp: [
        { card: 'audit_sales_admin', delay: 2 },
        { card: 'audit_gary_server', delay: 3 },
        { card: 'audit_debt', delay: 4 },
        { card: 'audit_clean', delay: 5 },
      ],
    },
    right: {
      label: 'We\'re always ready',
      effects: { patience: 5, happiness: 5, budget: 5 },
      followUp: [
        { card: 'audit_sales_admin', delay: 2 },
        { card: 'audit_gary_server', delay: 3 },
        { card: 'audit_debt', delay: 4 },
        { card: 'audit_clean', delay: 5 },
      ],
    },
    conditions: { weeks: [34, 44], tenure: { min: 8 } }, // audit season
    weight: 4,
    once: true,
  },
  {
    id: 'audit_sales_admin',
    character: 'auditor',
    text: 'The VP of Sales has local admin rights. He also has a browser extension called "Crypto Gains 4 U". I\'ve highlighted both.',
    left: { label: 'Revoke it today', effects: { security: 10, happiness: -10 }, flags: { sales_vp_admin: false }, add: { sales_grudge: 1, audit_findings: 1 } },
    right: { label: 'It\'s a business exception', effects: { patience: -10, security: -5 }, add: { audit_findings: 1 } },
    conditions: { requires: ['sales_vp_admin'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'audit_gary_server',
    character: 'auditor',
    text: 'Payroll runs on an undocumented server under a desk. When I asked for the documentation, I was introduced to Gary.',
    left: { label: 'Document it. All of it.', effects: { security: 10, budget: -5, happiness: -5 }, flags: { gary_undocumented: false }, add: { gary_grudge: 1, audit_findings: 1 } },
    right: { label: 'Gary is the control', effects: { patience: -10, security: -5, budget: 5 }, add: { audit_findings: 1 } },
    conditions: { requires: ['gary_undocumented'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'audit_debt',
    character: 'auditor',
    text: 'I\'ve found a number of significant findings. The number is large. I needed a second highlighter.',
    left: { label: 'Fund a remediation plan', effects: { budget: -10, security: 15 }, add: { security_debt: -3, audit_findings: 1 } },
    right: { label: 'Formally accept the risk', effects: { patience: -15, budget: 5 }, add: { audit_findings: 1 } },
    conditions: { counters: { security_debt: { min: 3 } } },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'audit_clean',
    character: 'auditor',
    text: 'No significant findings. I\'ve never written that sentence before. I\'m going to have it framed.',
    left: { label: 'Credit the team', effects: { happiness: 10, patience: 5 }, add: { helpdesk_morale: 1 } },
    right: { label: 'Take the credit', effects: { patience: 15, happiness: -10 } },
    conditions: { counters: { audit_findings: { max: 0 }, security_debt: { max: 2 } }, excludes: ['sales_vp_admin', 'gary_undocumented'] },
    followUpOnly: true,
    once: true,
  },
];
