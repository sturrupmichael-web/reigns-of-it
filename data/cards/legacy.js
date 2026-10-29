// LEGACY CARDS: unlocked by achievements
// None of these can turn up in a first run. Each one needs an achievement from an
// earlier run: unlocked achievements set the flag `ach_<id>` at the start of every run
// (see data/achievements.js).

export const CARDS = [
  {
    id: 'cio_anniversary',
    character: 'cio',
    text: 'Happy work anniversary! I got you a mug. It says "World\'s Okayest IT Director". I also got you another year of the same budget.',
    left: { label: 'Thanks, Raymond', effects: { patience: 10, budget: -5 } },
    right: { label: 'About that budget...', effects: { patience: -10, budget: 10 }, add: { cfo_grudge: 1 } },
    conditions: { requires: ['ach_year_one'], tenure: { min: 50 } },
    once: true,
  },
  {
    id: 'ceo_respect',
    character: 'ceo',
    text: 'You told me no once, and you were right. It was very annoying. Want to come present at the board meeting?',
    left: { label: 'I\'d be honored', effects: { patience: 10, happiness: -5, budget: 5 } },
    right: { label: 'I\'ll send the slides', effects: { patience: -5, happiness: 5 } },
    conditions: { requires: ['ach_said_no_ceo'], tenure: { min: 6 } },
    once: true,
  },
  {
    id: 'tyler_junior',
    character: 'intern',
    text: 'Remember me? I\'m a junior sysadmin now! Unrelated: I automated patching. It patched everything. Including the printers. They\'re all in Korean now.',
    left: { label: 'Roll it back', effects: { happiness: -5, security: -5, patience: 5 } },
    right: { label: 'Keep it, buy a dictionary', effects: { security: 10, happiness: -5 } },
    conditions: { requires: ['ach_hired_tyler'], tenure: { min: 4 } },
    once: true,
  },
  {
    id: 'rw_loyalty',
    character: 'secops',
    text: 'The ransomware gang emailed. They saw we paid last time and they\'re offering a loyalty discount on our next incident.',
    left: { label: 'Fund real backups', effects: { budget: -10, security: 15 }, add: { security_debt: -2 } },
    right: { label: 'Forward it to Legal', effects: { patience: -5, security: -5, happiness: 5 } },
    conditions: { requires: ['ach_paid_ransom'], tenure: { min: 10 } },
    once: true,
  },
  {
    id: 'ai_reference',
    character: 'vendor',
    text: 'The AI agent that replaced your predecessor is applying for a job elsewhere. It listed you as a reference. Would you say it was "a team player"?',
    left: { label: 'Tell the truth', effects: { patience: -5, security: 5, happiness: 5 } },
    right: { label: 'Glowing review', effects: { patience: 5, budget: 5, security: -5 } },
    conditions: { requires: ['ach_replaced_by_ai'] },
    once: true,
  },
  {
    id: 'ex_director_note',
    character: 'ex_director',
    text: 'If you\'re reading this, I didn\'t make it. The root password is under the keyboard. Don\'t trust the CFO\'s smile. Never, ever reboot the thing in the closet.',
    left: { label: 'Change the password', effects: { security: 10, happiness: -5 } },
    right: { label: 'Leave it all alone', effects: { security: -5, patience: 5, happiness: 5 }, add: { security_debt: 1 } },
    conditions: { requires: ['ach_revolving_door'], tenure: { min: 2 } },
    once: true,
  },
  {
    id: 'ex_director_coffee',
    character: 'ex_director',
    text: 'P.S. The coffee machine is on the guest Wi-Fi and it has admin on the domain. I never figured out how. Good luck.',
    left: { label: 'Unplug the coffee', effects: { security: 10, happiness: -15 } },
    right: { label: 'It\'s earned it', effects: { security: -10, happiness: 10 } },
    conditions: { requires: ['ach_revolving_door'], tenure: { min: 12 } },
    once: true,
  },
];
