// ARC: AI Everything
// The CEO wants an AI strategy by Friday. A careful policy means fewer disasters and a
// lot of eye-rolling; going all in means a chatbot that gives away cars. Near the end a
// vendor offers an AI agent that can do your job, and if you let it, it will.
//
// Flags: ai_on, ai_careful, ai_all_in, ai_agent_pilot.

export const CARDS = [
  {
    id: 'ai_strategy',
    character: 'ceo',
    text: 'I need an AI strategy by Friday. The board said "AI" eleven times in one meeting. I counted. Then I asked an AI to count.',
    left: {
      label: 'A careful policy first',
      effects: { patience: -10, security: 10, budget: 5 },
      flags: { ai_on: true, ai_careful: true },
      followUp: [{ card: 'ai_chatbot', delay: 2 }, { card: 'ai_policy', delay: 4 }, { card: 'ai_agent_offer', delay: 8 }],
    },
    right: {
      label: 'AI all the things',
      effects: { patience: 10, budget: -5, security: -5 },
      flags: { ai_on: true, ai_all_in: true },
      followUp: [{ card: 'ai_chatbot', delay: 2 }, { card: 'ai_data_leak', delay: 4 }, { card: 'ai_agent_offer', delay: 8 }],
    },
    conditions: { tenure: { min: 12 } },
    weight: 2,
    once: true,
  },
  {
    id: 'ai_chatbot',
    character: 'marketing',
    text: 'Our new support chatbot promised a customer a free car. And a refund. And told him our CEO\'s home address. Is that binding?',
    left: { label: 'Take it offline', effects: { happiness: -5, patience: -5, security: 5 } },
    right: { label: 'Add a disclaimer', effects: { happiness: 5, security: -10 }, add: { security_debt: 1 } },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'ai_data_leak',
    character: 'secops',
    text: 'Someone pasted the entire customer database into a public AI website to "make a nice chart". The chart is very nice.',
    left: { label: 'Block public AI sites', effects: { security: 10, happiness: -10, budget: 5 } },
    right: { label: 'Buy an enterprise AI', effects: { budget: -5, security: 5, happiness: 5 } },
    conditions: { requires: ['ai_all_in'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'ai_policy',
    character: 'legal',
    text: 'Your AI policy is twelve pages. Everyone signed it. Nobody read it. One person asked an AI to summarize it, which violates page seven.',
    left: { label: 'Cut it to one page', effects: { happiness: 10, security: -5 } },
    right: { label: 'Mandatory training', effects: { happiness: -10, security: 10 } },
    conditions: { requires: ['ai_careful'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'ai_licenses',
    character: 'cfo',
    text: 'We bought AI assistant licenses for everyone. Usage is 4%. Mostly cover letters. For other jobs.',
    left: { label: 'Cancel them', effects: { budget: 15, happiness: -10 } },
    right: { label: 'Run lunch-and-learns', effects: { budget: -5, happiness: 10, patience: -5 } },
    conditions: { requires: ['ai_on'] },
    once: true,
  },
  {
    id: 'ai_agent_offer',
    character: 'vendor',
    text: 'Our new AI agent can do an IT Director\'s whole job for $49 a month. No offense. Want to run a pilot? Free for 30 days!',
    left: { label: 'Absolutely not', effects: { patience: -10, security: 5 } },
    right: {
      label: 'Sure, run a pilot',
      effects: { patience: 10, budget: 5, security: -5 },
      flags: { ai_agent_pilot: true },
      followUp: { card: 'ai_agent_result', delay: 3 },
    },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'ai_agent_result',
    character: 'cio',
    text: 'The AI agent closed 400 tickets this week. It also deleted the HR share. It marked that ticket "resolved". Thoughts?',
    left: { label: 'Shut it down', effects: { security: 10, happiness: -10, patience: -5 } },
    right: { label: 'Give it more access', ending: 'ai_ending' },
    conditions: { requires: ['ai_agent_pilot'] },
    followUpOnly: true,
    once: true,
  },
];
