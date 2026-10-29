// Input: drag (touch and mouse, via Pointer Events), arrow keys, and the
// left/right buttons. It only reports intent; main.js decides what happens.
//
// The controller passed to bindInput() provides:
//   locked()              true while a card is flying or the run is over
//   drag(dx)              finger/mouse moved; dx in px from the start
//   release(dx, velocity) finger/mouse let go; velocity in px/ms
//   lean(side)            'left' | 'right' | null: tilt the card to preview
//   leaning()             current lean side or null
//   commit(side)          make the choice

export function bindInput({ card, leftBtn, rightBtn }, ctl) {
  let pointerId = null;
  let startX = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;

  // ── Drag ──────────────────────────────────────────────────────────────
  card.addEventListener('pointerdown', (e) => {
    if (ctl.locked() || pointerId !== null) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    lastT = e.timeStamp;
    velocity = 0;
    card.setPointerCapture(pointerId);
    card.classList.add('dragging');
    e.preventDefault();
  });

  card.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId) return;
    const dt = e.timeStamp - lastT;
    if (dt > 0) velocity = 0.8 * ((e.clientX - lastX) / dt) + 0.2 * velocity;
    lastX = e.clientX;
    lastT = e.timeStamp;
    ctl.drag(e.clientX - startX);
  });

  card.addEventListener('pointerup', (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    card.classList.remove('dragging');
    if (e.timeStamp - lastT > 80) velocity = 0; // a pause before letting go kills the flick
    ctl.release(e.clientX - startX, velocity);
  });

  card.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    card.classList.remove('dragging');
    ctl.release(0, 0);
  });

  // ── Buttons ───────────────────────────────────────────────────────────
  // Mouse: hovering previews, clicking commits.
  // Touch: the first tap previews, a second tap on the same side commits.
  for (const [side, btn] of [['left', leftBtn], ['right', rightBtn]]) {
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && !ctl.locked()) ctl.lean(side);
    });
    btn.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && !ctl.locked() && ctl.leaning() === side) ctl.lean(null);
    });
    btn.addEventListener('click', () => {
      if (ctl.locked()) return;
      if (ctl.leaning() === side) ctl.commit(side);
      else ctl.lean(side);
    });
  }

  // ── Keyboard ──────────────────────────────────────────────────────────
  // ← / → (or A / D) lean, pressing the same one again commits.
  // Enter / Space commit the lean, Esc / ↓ cancel it.
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || ctl.locked()) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const side = key === 'ArrowLeft' || key === 'a' ? 'left' : key === 'ArrowRight' || key === 'd' ? 'right' : null;
    if (side) {
      e.preventDefault();
      if (ctl.leaning() === side) ctl.commit(side);
      else ctl.lean(side);
    } else if ((key === 'Enter' || key === ' ') && ctl.leaning()) {
      // A focused button handles Enter/Space itself (its click).
      if (document.activeElement?.tagName === 'BUTTON') return;
      e.preventDefault();
      ctl.commit(ctl.leaning());
    } else if ((key === 'Escape' || key === 'ArrowDown') && ctl.leaning()) {
      e.preventDefault();
      ctl.lean(null);
    }
  });
}
