// ARC: Cloud Migration
// The CIO wants everything in the cloud by Q3. Lift-and-shift is fast and gets you a
// terrifying bill; re-architecting is slow and gets you a terrifying CIO. Either way,
// someone will ask for admin on the cloud account, and someone will leave a storage
// bucket public.
//
// Flags: cloud_on, cloud_lift, cloud_proper, dev_cloud_admin, server_room_gone.

export const CARDS = [
  {
    id: 'cloud_mandate',
    character: 'cio',
    text: 'I read an article on the plane. We\'re moving everything to the cloud. Everything. By Q3.',
    left: {
      label: 'Re-architect it properly',
      effects: { patience: -10, budget: -5, security: 5 },
      flags: { cloud_on: true, cloud_proper: true },
      followUp: [{ card: 'cloud_bill_ok', delay: 4 }, { card: 'cloud_q3', delay: 9 }],
    },
    right: {
      label: 'Lift and shift it all',
      effects: { patience: 10, budget: -5, security: -5 },
      flags: { cloud_on: true, cloud_lift: true },
      followUp: [{ card: 'cloud_bill_shock', delay: 4 }, { card: 'cloud_q3', delay: 9 }],
    },
    conditions: { tenure: { min: 6 }, weeks: [1, 26] },
    weight: 2,
    once: true,
  },
  {
    id: 'cloud_bill_shock',
    character: 'cfo',
    text: 'This month\'s cloud bill is bigger than the mortgage on this building. Someone left forty GPU servers running. They\'re mining nothing. Just vibing.',
    left: { label: 'Shut down anything idle', effects: { budget: 15, happiness: -10 }, add: { cfo_grudge: 1 } },
    right: { label: 'Buy a cost tool', effects: { budget: -5, patience: 5, happiness: 5 } },
    conditions: { requires: ['cloud_lift'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'cloud_bill_ok',
    character: 'cfo',
    text: 'The cloud bill is reasonable. Suspiciously reasonable. The project is also eight weeks behind. Are these related?',
    left: { label: 'Yes, and that\'s fine', effects: { patience: -10, budget: 5 } },
    right: { label: 'Speed it up', effects: { budget: -5, patience: 10, security: -5 }, add: { security_debt: 1 } },
    conditions: { requires: ['cloud_proper'] },
    followUpOnly: true,
    once: true,
  },
  {
    id: 'cloud_dev_admin',
    character: 'dev_lead',
    text: 'Can I get owner rights on the cloud account? Just for a second. I need to change one setting and the ticket system makes me sad.',
    left: { label: 'Least privilege', effects: { security: 10, happiness: -5 }, add: { raj_grudge: 1 } },
    right: { label: 'One second, sure', effects: { happiness: 10, security: -10 }, flags: { dev_cloud_admin: true }, add: { security_debt: 1 } },
    conditions: { requires: ['cloud_on'] },
    once: true,
  },
  {
    id: 'cloud_public_bucket',
    character: 'secops',
    text: 'A storage bucket full of customer records was public for six weeks. A security researcher found it. He was very polite about it.',
    left: { label: 'Lock it and disclose', effects: { security: 10, patience: -10, budget: -5 } },
    right: { label: 'Lock it quietly', effects: { security: 5, patience: 5, budget: 5 }, add: { security_debt: 2 } },
    conditions: { requires: ['dev_cloud_admin'] },
    once: true,
  },
  {
    id: 'cloud_outage',
    character: 'helpdesk',
    text: 'Our cloud provider is down. So is the entire company. Their status page says everything is green.',
    left: { label: 'Wait it out', effects: { happiness: -15, patience: -5, budget: 5 } },
    right: { label: 'Pay for a second region', effects: { budget: -5, happiness: 5, patience: 5 } },
    conditions: { requires: ['cloud_on'] },
    once: true,
  },
  {
    id: 'cloud_server_room',
    character: 'facilities',
    text: 'Now that we\'re in the cloud, can I turn the server room into a nap pod? I already bought the beanbags.',
    left: { label: 'Not yet', effects: { happiness: -5, budget: -5, security: 5 } },
    right: { label: 'Nap pod it is', effects: { happiness: 10, budget: 5, security: -5 }, flags: { server_room_gone: true } },
    conditions: { requires: ['cloud_on'], tenure: { min: 14 } },
    once: true,
  },
  {
    id: 'cloud_q3',
    character: 'cio',
    text: 'It\'s Q3. Are we in the cloud? The board is asking. I\'m asking. My wife is asking.',
    left: { label: 'Mostly. Honestly.', effects: { patience: -10, security: 5 } },
    right: { label: 'Declare victory', effects: { patience: 10, security: -10 }, add: { security_debt: 1 } },
    followUpOnly: true,
    once: true,
  },
];
