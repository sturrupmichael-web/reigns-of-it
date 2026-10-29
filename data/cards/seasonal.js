// SEASONAL CARDS
// Each one only turns up in its window of the year (`weeks`, 1-52). A year starts in
// January, so Q4 is roughly weeks 40-52. Most of them can come back every year, so they
// use `weight` instead of `once`, and the repeat cooldown keeps them from doubling up.
//
//   weeks 1-3     new year priorities
//   weeks 8-15    tax-season phishing
//   weeks 10-13   quarter close
//   weeks 20-26   summer interns arrive
//   weeks 22-38   Tyler the intern is around
//   weeks 27-34   summer vacations
//   weeks 34-44   audit season (data/cards/audit.js)
//   weeks 40-46   budget season
//   weeks 45-48   Black Friday
//   weeks 48-51   holiday party
//   weeks 49-52   end-of-year change freeze

export const CARDS = [
  {
    id: 'season_new_year',
    character: 'cio',
    text: 'New year, new priorities! I have fourteen top priorities. They\'re all number one. Which ones are you doing?',
    left: { label: 'Pick three, push back', effects: { patience: -10, happiness: 5, budget: 5 } },
    right: { label: 'All fourteen!', effects: { patience: 10, happiness: -10, budget: -5 } },
    conditions: { weeks: [1, 3], tenure: { min: 4 } },
    weight: 3,
  },
  {
    id: 'season_tax_phish',
    character: 'secops',
    text: 'Tax season phishing is here. Forty people got an email saying their refund is waiting. Eleven clicked. One entered a credit card. It was the company card.',
    left: { label: 'Cancel the card, train everyone', effects: { security: 10, happiness: -10, budget: 5 } },
    right: { label: 'Cancel the card, quietly', effects: { budget: -5, security: -5 }, add: { security_debt: 1 } },
    conditions: { weeks: [8, 15] },
    weight: 2,
  },
  {
    id: 'season_quarter_close',
    character: 'cfo',
    text: 'It\'s quarter close. If the finance system goes down this week, so do you. Unrelated: can we skip patching it?',
    left: { label: 'Patch it anyway', effects: { security: 10, patience: -5 }, add: { cfo_grudge: 1 } },
    right: { label: 'Skip it this quarter', effects: { security: -10, patience: 5 }, add: { security_debt: 1 } },
    conditions: { weeks: [10, 13] },
    weight: 2,
  },
  {
    id: 'season_interns_arrive',
    character: 'hr',
    text: 'Six summer interns start Monday. They each need a laptop, an account and a badge. By Monday. Today is Friday.',
    left: { label: 'Hand-me-down laptops', effects: { happiness: -5, budget: 5, security: -5 } },
    right: { label: 'Buy new ones', effects: { budget: -10, happiness: 10 } },
    conditions: { weeks: [20, 24] },
    weight: 3,
  },
  {
    id: 'season_intern_script',
    character: 'intern',
    text: 'I wrote a script to automate the onboarding spreadsheet! It also emailed the spreadsheet to everyone. Including the salaries tab.',
    left: { label: 'Recall it, apologize', effects: { happiness: -10, patience: -5, budget: 5 } },
    right: { label: 'Hire him', effects: { budget: -5, happiness: 10, security: -5 } },
    conditions: { weeks: [22, 38] },
    once: true,
  },
  {
    id: 'season_intern_ai',
    character: 'intern',
    text: 'I asked an AI how to fix the Wi-Fi and it told me to reset the core switch. So I did. Is the Wi-Fi supposed to be... off?',
    left: { label: 'Lock down his access', effects: { security: 10, happiness: -5, budget: 5 } },
    right: { label: 'Turn it into training', effects: { happiness: 5, patience: -5, budget: -5 } },
    conditions: { weeks: [22, 38] },
    once: true,
  },
  {
    id: 'season_vacation',
    character: 'helpdesk',
    text: 'Half the team is on vacation. The other half is "on vacation" at their desks. Can I bring in a contractor for August?',
    left: { label: 'Tough it out', effects: { happiness: -10, budget: 5 }, add: { helpdesk_morale: -1 } },
    right: { label: 'Bring one in', effects: { budget: -10, happiness: 10 }, add: { helpdesk_morale: 1 } },
    conditions: { weeks: [27, 34] },
    weight: 2,
  },
  {
    id: 'season_budget',
    character: 'cfo',
    text: 'Budget season! Submit next year\'s IT plan by Friday. Pro tip: everyone asks for 30% more. I give them 10% less.',
    left: { label: 'Ask for 30% more', effects: { budget: 10, patience: -10 }, add: { cfo_grudge: 1 } },
    right: { label: 'Ask for what we need', effects: { budget: -5, patience: 10 } },
    conditions: { weeks: [40, 46] },
    weight: 4,
  },
  {
    id: 'season_black_friday',
    character: 'sales_vp',
    text: 'Black Friday is next week. The website cannot go down. Also, I\'ve scheduled a huge marketing email. To everyone. At once.',
    left: { label: 'Code freeze, stress test', effects: { happiness: -5, security: 5, budget: -5 } },
    right: { label: 'Send it, we\'ll be fine', effects: { happiness: 10, patience: -10, budget: 5 } },
    conditions: { weeks: [45, 48] },
    weight: 3,
  },
  {
    id: 'season_holiday_party',
    character: 'hr',
    text: 'The holiday party needs Wi-Fi, a projector and someone to stop the CEO from doing karaoke over the all-hands video call.',
    left: { label: 'I\'ll be there', effects: { happiness: 10, patience: 5, budget: -5 } },
    right: { label: 'The intern\'s got it', effects: { happiness: -5, patience: -5, budget: 5 } },
    conditions: { weeks: [48, 51] },
    weight: 3,
  },
  {
    id: 'season_change_freeze',
    character: 'sales_vp',
    text: 'I know it\'s the end-of-year change freeze, but I need one tiny firewall rule. For a client. It\'s just "allow everything".',
    left: { label: 'Freeze means freeze', effects: { happiness: -10, security: 5 }, add: { sales_grudge: 1 } },
    right: { label: 'Just this once', effects: { happiness: 5, security: -10 }, add: { security_debt: 1 } },
    conditions: { weeks: [49, 52] },
    weight: 3,
  },
  {
    id: 'season_freeze_outage',
    character: 'sysadmin',
    text: 'Happy holidays. The certificate on the main website expires on the 31st. We\'re in a change freeze. Who wants to sign the exception?',
    left: { label: 'I\'ll sign it', effects: { security: 10, patience: -5 } },
    right: { label: 'It can wait until January', effects: { happiness: -15, security: -5 } },
    conditions: { weeks: [50, 52] },
    weight: 2,
  },
];
