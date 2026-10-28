// Game tuning. Change numbers here rather than in the engine.

// The four meters, in display order. `key` is what card effects use.
export const METERS = [
  { key: 'budget', icon: '💰', label: 'Budget' },
  { key: 'security', icon: '🛡️', label: 'Security' },
  { key: 'happiness', icon: '🙂', label: 'User Happiness' },
  { key: 'patience', icon: '👔', label: 'CIO Patience' },
];

export const CONFIG = {
  // Every meter starts here (0-100).
  startMeters: { budget: 50, security: 50, happiness: 50, patience: 50 },

  // Reaching either bound on any meter ends the run.
  meterMin: 0,
  meterMax: 100,

  // Meters flash red when they're below `dangerLow` or above `dangerHigh`.
  dangerLow: 15,
  dangerHigh: 85,

  // One swipe = one week.
  weeksPerYear: 52,

  // The first card of every run (must be a real card id).
  startCard: 'cio_welcome',

  // A card that has been shown can't come back until this many other cards
  // have been played (stops the same card repeating back to back).
  repeatCooldown: 6,

  // Preview dot sizes: |delta| up to `dotSmall` is a small dot, up to
  // `dotMedium` a medium dot, anything bigger a large dot.
  dotSmall: 6,
  dotMedium: 12,
};
