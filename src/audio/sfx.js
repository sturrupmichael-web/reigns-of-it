// Sound effects. Phase 1 stub: the game already calls these at the right
// moments, and Phase 4 fills them in with the Web Audio API and a mute
// toggle. Until then they do nothing.

let muted = false;

export const sfx = {
  swipe() {}, // a card was committed and is flying off
  tick() {}, // a meter changed
  sting() {}, // the run ended
  setMuted(m) { muted = !!m; },
  isMuted() { return muted; },
};
