// The card on screen: rendering a card's content, following the drag (tilt +
// choice text), flying off when committed, and flipping in the next one.

import { CONTENT } from '../content.js';
import { portraitSvg, portraitBg } from './portraits.js';

let el = {};

// Wait for a CSS transition/animation on `node`, with a timeout in case it
// never fires (reduced motion, a background tab).
function after(node, ms) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (e) => {
      if (done || (e && e.target !== node)) return; // ignore bubbling from children
      done = true;
      node.removeEventListener('transitionend', finish);
      node.removeEventListener('animationend', finish);
      resolve();
    };
    node.addEventListener('transitionend', finish);
    node.addEventListener('animationend', finish);
    setTimeout(finish, ms + 80);
  });
}

// refs: { card, face, choiceLeft, choiceRight, labelLeft, labelRight, prompt, name, title }
export function mountCard(refs) {
  el = refs;
}

export function renderCard(card) {
  const ch = CONTENT.characters[card.character] ?? { name: card.character ?? '???', title: '' };
  el.face.innerHTML = portraitSvg(card.character);
  el.card.style.setProperty('--card-bg', portraitBg(card.character));
  el.labelLeft.textContent = card.left?.label ?? '';
  el.labelRight.textContent = card.right?.label ?? '';
  el.prompt.textContent = card.text ?? '';
  el.name.textContent = ch.name ?? '';
  el.title.textContent = ch.title ?? '';
  el.card.setAttribute('aria-label', `${ch.name ?? ''}: ${card.text ?? ''}`);
  dragCard(0, false);
}

// Move the card to horizontal offset dx (px). `threshold` is the commit
// distance, used to scale how visible the choice text is.
export function dragCard(dx, animate, threshold = 100) {
  el.card.classList.toggle('animating', !!animate);
  el.card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
  const t = Math.min(1, Math.max(0, (Math.abs(dx) - 10) / (threshold * 0.5)));
  el.choiceLeft.style.opacity = dx < 0 ? t : 0;
  el.choiceRight.style.opacity = dx > 0 ? t : 0;

  // On a phone the card's leading edge goes off screen as it moves, so pad
  // the choice text in by however much of the card's top corner is hidden.
  const margin = (window.innerWidth - el.card.offsetWidth) / 2;
  const tilt = 1.4 * el.card.offsetHeight * Math.sin((Math.abs(dx) / 18) * (Math.PI / 180));
  const hidden = Math.max(0, Math.abs(dx) + tilt - margin + 8);
  el.choiceLeft.style.paddingLeft = `${16 + (dx < 0 ? hidden : 0)}px`;
  el.choiceRight.style.paddingRight = `${16 + (dx > 0 ? hidden : 0)}px`;
}

export function flyOff(side) {
  const dir = side === 'left' ? -1 : 1;
  const dist = Math.max(window.innerWidth, 600) * 1.1;
  el.card.classList.add('animating', 'flying');
  el.card.style.transform = `translate(${dir * dist}px, 60px) rotate(${dir * 35}deg)`;
  return after(el.card, 380);
}

// Flip the (already rendered) next card into place.
export function enterCard() {
  el.card.classList.remove('flying', 'animating', 'entering');
  el.card.style.transform = '';
  el.choiceLeft.style.opacity = 0;
  el.choiceRight.style.opacity = 0;
  void el.card.offsetWidth;
  el.card.classList.add('entering');
  el.prompt.classList.remove('fresh');
  void el.prompt.offsetWidth;
  el.prompt.classList.add('fresh');
  return after(el.card, 420).then(() => el.card.classList.remove('entering'));
}

export function cardWidth() {
  return el.card.getBoundingClientRect().width;
}
