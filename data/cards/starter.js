/*
 * CARDS: starter set (Phase 1)
 * ============================
 * Full reference: docs/SCHEMA.md. Quick version:
 *
 * {
 *   id: 'sales_vp_admin',          // unique, lowercase_snake_case
 *   character: 'sales_vp',         // id from data/characters.js
 *   text: 'What they say.',        // one or two lines
 *
 *   left:  {                       // swipe left / left arrow
 *     label: 'Submit a ticket',    // 2-5 words, shown while dragging
 *     effects: { happiness: -10, patience: -5 },   // any of budget, security,
 *                                                  // happiness, patience
 *     flags: { some_flag: true },  // optional: remember this choice
 *     followUp: 'card_id',         // optional: this card comes next, or
 *     followUp: { card: 'card_id', delay: 3 },     // ...comes 3 weeks later
 *     ending: 'ending_id',         // optional: end the run right here
 *   },
 *   right: { ...same as left },    // swipe right / right arrow
 *
 *   // All optional:
 *   conditions: {
 *     requires: ['flag_a'],        // all these flags must be set (truthy)
 *     excludes: ['flag_b'],        // none of these flags may be set
 *     minYear: 2, maxYear: 5,      // which years of your tenure (1 = first)
 *     weeks: [40, 52],             // week-of-year window (1-52), for seasons
 *     meters: { budget: { max: 30 } },  // meter ranges, e.g. only when broke
 *   },
 *   weight: 1,                     // how common: 2 = twice as likely, 0.5 = half
 *   once: true,                    // at most once per run
 *   followUpOnly: true,            // never drawn at random, only via followUp
 * }
 *
 * Effects are deltas. Keep most in the 5-15 range; 20+ is a big moment.
 * Try to give both sides a cost, and touch 2-3 meters per side.
 */
export const CARDS = [
  // ── Opening card (config.startCard) ─────────────────────────────────────
  {
    id: 'cio_welcome',
    character: 'cio',
    text: 'Welcome aboard! Your predecessor lasted eleven weeks. No pressure. Do you want to start with a listening tour or a quick win?',
    left: { label: 'Listening tour', effects: { happiness: 5, patience: -5 } },
    right: { label: 'Quick win, obviously', effects: { patience: 5, budget: -5 } },
    followUpOnly: true,
  },

  // ── The Sales VP and the crypto miner ───────────────────────────────────
  {
    id: 'sales_vp_admin',
    character: 'sales_vp',
    text: 'I need local admin so I can install the demo software. Clients are waiting!',
    left: { label: 'Submit a ticket', effects: { happiness: -10, patience: -5 } },
    right: {
      label: 'Fine, just this once',
      effects: { happiness: 10, security: -15 },
      flags: { sales_vp_admin: true },
      followUp: { card: 'sales_vp_miner', delay: 3 },
    },
    conditions: { excludes: ['sales_vp_admin'] },
  },
  {
    id: 'sales_vp_miner',
    character: 'secops',
    text: 'We found a crypto miner on the Sales VP\'s laptop. It\'s been running since Tuesday. His fans sound like a jet engine.',
    left: {
      label: 'Wipe it. Revoke admin.',
      effects: { security: 15, happiness: -10 },
      flags: { sales_vp_admin: false },
    },
    right: { label: 'Just delete the miner', effects: { security: -10, happiness: 5, patience: -5 } },
    followUpOnly: true,
    once: true,
  },

  // ── The CFO, who remembers ──────────────────────────────────────────────
  {
    id: 'cfo_cut_backups',
    character: 'cfo',
    text: 'We need to cut 10% from IT. I was looking at backup storage. When was the last time anyone actually used a backup?',
    left: { label: 'Over my dead body', effects: { budget: -10, patience: -5, security: 5 } },
    right: { label: 'Trim the backups', effects: { budget: 15, security: -15 } },
  },
  {
    id: 'cfo_shadow_saas',
    character: 'cfo',
    text: 'Finance bought a reporting tool on a corporate card. It just needs SSO. And read access to payroll. Today, ideally.',
    left: {
      label: 'Shut it down',
      effects: { security: 10, happiness: -10 },
      flags: { killed_cfo_tool: true },
      followUp: { card: 'cfo_petty_revenge', delay: 4 },
    },
    right: { label: 'Fine, integrate it', effects: { security: -10, budget: -5, happiness: 10 } },
    once: true,
  },
  {
    id: 'cfo_petty_revenge',
    character: 'cfo',
    text: 'Your software renewal request? Funny thing. It got lost. Much like my reporting tool.',
    left: { label: 'Escalate to the CIO', effects: { budget: 5, patience: -10 } },
    right: { label: 'Eat the cost', effects: { budget: -15, happiness: 5 } },
    conditions: { requires: ['killed_cfo_tool'] },
    followUpOnly: true,
    once: true,
  },

  // ── Standalone ──────────────────────────────────────────────────────────
  {
    id: 'secops_vpn_patch',
    character: 'secops',
    text: 'Critical patch for the VPN appliance. It\'s being exploited in the wild. Patching means two hours of downtime, during business hours.',
    left: { label: 'Patch it now', effects: { security: 15, happiness: -10 } },
    right: { label: 'Wait for the weekend', effects: { security: -10, happiness: 5 } },
  },
  {
    id: 'helpdesk_password_resets',
    character: 'helpdesk',
    text: 'The ticket queue is at 400. Half of them are password resets. Can we please get self-service password reset?',
    left: { label: 'Not in the budget', effects: { budget: 5, happiness: -10 } },
    right: { label: 'Buy it', effects: { budget: -10, happiness: 10, security: 5 } },
  },
  {
    id: 'intern_printer',
    character: 'intern',
    text: 'The printer on 3 says "PC LOAD LETTER". I turned it off and on. Am I allowed to... hit it?',
    left: { label: 'Call the vendor', effects: { budget: -10, happiness: 5 } },
    right: { label: 'Hit it. Firmly.', effects: { happiness: 5, budget: 5, patience: -5 } },
  },
  {
    id: 'intern_gift_cards',
    character: 'intern',
    text: 'The CEO emailed asking me to buy gift cards for a client. I already bought four. Her email address looks kind of weird though?',
    left: { label: 'Phishing training. Everyone.', effects: { security: 10, happiness: -10 } },
    right: { label: 'Expense it, move on', effects: { budget: -10, security: -5, happiness: 5 } },
  },
  {
    id: 'vendor_steakhouse',
    character: 'vendor',
    text: 'I\'d love to walk you through our AI-Powered Zero-Trust Synergy Platform. Over lunch. Steakhouse. My treat.',
    left: { label: 'Just send a PDF', effects: { patience: -5, budget: 5 } },
    right: { label: 'I am hungry', effects: { budget: -15, security: 5, patience: 10 } },
  },
  {
    id: 'ceo_macs',
    character: 'ceo',
    text: 'My nephew says everyone should be on Macs. He\'s very smart. Can we switch the whole company by Monday?',
    left: { label: 'Let me write a proposal', effects: { patience: -10, budget: 5 } },
    right: { label: 'Of course!', effects: { budget: -20, happiness: 10, security: -5 } },
  },
  {
    id: 'sysadmin_desk_server',
    character: 'sysadmin',
    text: 'The server under my desk is making the noise again. It runs payroll. Nobody knows the root password but me. That\'s job security.',
    left: { label: 'Document everything', effects: { security: 10, happiness: -5, budget: -5 } },
    right: { label: 'If it ain\'t broke...', effects: { security: -10, budget: 5 } },
  },
  {
    id: 'auditor_domain_admins',
    character: 'auditor',
    text: 'I\'d like a list of everyone with domain admin rights. And a written justification for each. Take your time. I\'ll wait. Here.',
    left: { label: 'Here\'s the list', effects: { security: 10, patience: -10 } },
    right: { label: 'Can it wait a quarter?', effects: { patience: -5, security: -10, happiness: 5 } },
  },
  {
    id: 'cio_green_dashboard',
    character: 'cio',
    text: 'The board wants an IT health dashboard. Lots of green. Can you make it green?',
    left: { label: 'Show real numbers', effects: { patience: -10, security: 5 } },
    right: { label: 'Everything is green', effects: { patience: 10, security: -5, happiness: -5 } },
  },
];
