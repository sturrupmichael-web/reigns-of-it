// The four meters across the top: fill level, danger flashing, the
// after-swipe up/down flash, and the size-only preview dots.

import { CONTENT } from '../content.js';

const els = {}; // key -> { root, fill, dot, value }

function dotSize(delta) {
  const cfg = CONTENT.config;
  const a = Math.abs(delta);
  return a <= cfg.dotSmall ? 'sm' : a <= cfg.dotMedium ? 'md' : 'lg';
}

export function mountMeters(container) {
  container.innerHTML = '';
  for (const m of CONTENT.meters) {
    const root = document.createElement('div');
    root.className = 'meter';
    root.dataset.meter = m.key;
    root.setAttribute('role', 'meter');
    root.setAttribute('aria-label', m.label);
    root.setAttribute('aria-valuemin', '0');
    root.setAttribute('aria-valuemax', '100');
    root.title = m.label;
    root.innerHTML =
      '<span class="meter-dot" aria-hidden="true"></span>' +
      `<span class="meter-tile"><span class="meter-fill"></span><span class="meter-icon" aria-hidden="true">${m.icon}</span></span>` +
      `<span class="meter-label">${m.label}</span>`;
    container.appendChild(root);
    els[m.key] = { root, fill: root.querySelector('.meter-fill'), dot: root.querySelector('.meter-dot'), value: null };
  }
}

// Set all meter values. With `animate`, flash up/down on the ones that moved.
export function setMeters(meters, animate) {
  const cfg = CONTENT.config;
  for (const [k, e] of Object.entries(els)) {
    const v = meters[k];
    const prev = e.value;
    e.value = v;
    e.fill.style.height = `${v}%`;
    e.root.setAttribute('aria-valuenow', String(v));
    e.root.classList.toggle('danger', v < cfg.dangerLow || v > cfg.dangerHigh);
    if (animate && prev != null && prev !== v) {
      const cls = v > prev ? 'up' : 'down';
      e.root.classList.remove('up', 'down');
      void e.root.offsetWidth; // restart the animation
      e.root.classList.add(cls);
      setTimeout(() => e.root.classList.remove(cls), 900);
    }
  }
}

// Show dots for the meters a choice touches (size only, never direction).
// Pass null to hide them all.
export function previewMeters(effects) {
  for (const [k, e] of Object.entries(els)) {
    const d = effects?.[k];
    e.dot.className = 'meter-dot' + (d ? ` on ${dotSize(d)}` : '');
  }
}
