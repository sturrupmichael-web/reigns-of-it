// Sound effects, made on the fly with the Web Audio API (no sound files). Browsers
// only allow audio after the player has touched or clicked something, so the audio
// context is created on the first sound, which always follows a tap, swipe or key.
// Any failure (old browser, audio blocked) just means silence.

let muted = false;
let ctx = null;
let master = null;

function audio() {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// One note: a tone that starts at `freq` (optionally sliding to `to`), with a quick
// attack and a decay so it doesn't click.
function tone({ freq, to = freq, type = 'sine', at = 0, dur = 0.12, vol = 0.5 }) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// A puff of filtered noise: the card whooshing off.
function whoosh(dur = 0.22) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(600, t);
  filter.frequency.exponentialRampToValueAtTime(3200, t + dur);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
}

export const sfx = {
  // A card was committed and is flying off.
  swipe() { whoosh(); },
  // Meters changed: one soft tick per meter that moved, rising if it went up.
  tick(changes = []) {
    changes.slice(0, 4).forEach((up, i) => tone({ freq: up ? 660 : 440, to: up ? 880 : 330, at: 0.05 + i * 0.05, dur: 0.07, vol: 0.18, type: 'triangle' }));
  },
  // The run ended: a sad little descending phrase.
  sting() {
    [523, 415, 349, 262].forEach((f, i) => tone({ freq: f, at: i * 0.16, dur: i === 3 ? 0.6 : 0.18, vol: 0.3, type: 'square' }));
  },
  // An achievement: a quick bright arpeggio.
  achievement() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, at: i * 0.07, dur: 0.16, vol: 0.25, type: 'triangle' }));
  },
  // A menu button.
  click() { tone({ freq: 520, to: 700, dur: 0.05, vol: 0.15, type: 'triangle' }); },
  setMuted(m) {
    muted = !!m;
    if (muted && ctx?.state === 'running') ctx.suspend().catch(() => {});
  },
  isMuted() { return muted; },
};
