// Flat geometric SVG portraits, built from a character's `portrait` spec
// (see data/characters.js). No image files.

import { CONTENT } from '../content.js';

// Darken (amt < 0) or lighten (amt > 0) a #rrggbb color.
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  return '#' + ((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
}

function hairBack(p) {
  const c = p.hairColor;
  switch (p.hair) {
    case 'long': return `<path d="M54 92 Q52 44 100 42 Q148 44 146 92 L152 168 Q100 182 48 168Z" fill="${c}"/>`;
    case 'bun': return `<circle cx="100" cy="40" r="20" fill="${c}"/>`;
    case 'ponytail': return `<path d="M138 74 Q170 90 160 150 Q150 126 136 104Z" fill="${c}"/>`;
    default: return '';
  }
}

function hairFront(p) {
  const c = p.hairColor;
  switch (p.hair) {
    case 'short':
    case 'long':
    case 'bun':
    case 'ponytail':
      return `<path d="M57 98 Q54 50 100 48 Q146 50 143 98 Q136 72 112 68 Q100 76 80 70 Q62 76 57 98Z" fill="${c}"/>`;
    case 'slick':
      return `<path d="M57 96 Q54 46 104 46 Q146 50 143 92 Q132 64 92 66 Q70 70 57 96Z" fill="${c}"/>` +
        `<path d="M92 66 Q110 58 136 74" stroke="${shade(c, 0.25)}" stroke-width="3" fill="none"/>`;
    case 'spiky':
      return `<path d="M57 96 L60 58 L72 66 L78 40 L90 60 L100 34 L110 60 L122 40 L128 66 L140 58 L143 96 Q120 70 100 70 Q80 70 57 96Z" fill="${c}"/>`;
    case 'curly':
      return [[62, 84], [66, 66], [80, 54], [100, 49], [120, 54], [134, 66], [138, 84]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>`).join('');
    case 'balding':
      return `<path d="M56 108 Q54 80 66 72 Q66 92 64 110Z" fill="${c}"/><path d="M144 108 Q146 80 134 72 Q134 92 136 110Z" fill="${c}"/>`;
    case 'bald':
      return '<ellipse cx="86" cy="66" rx="10" ry="5" fill="#ffffff" opacity=".35"/>';
    default:
      return '';
  }
}

function mouth(type) {
  switch (type) {
    case 'grin': return '<path d="M84 126 Q100 144 116 126Z" fill="#ffffff" stroke="#3a2a2a" stroke-width="3" stroke-linejoin="round"/>';
    case 'flat': return '<path d="M88 130 L112 130" stroke="#3a2a2a" stroke-width="4" stroke-linecap="round"/>';
    case 'frown': return '<path d="M86 134 Q100 122 114 134" stroke="#3a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>';
    case 'o': return '<ellipse cx="100" cy="131" rx="6" ry="8" fill="#3a2a2a"/>';
    default: return '<path d="M86 126 Q100 138 114 126" stroke="#3a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>';
  }
}

// Extras drawn behind the head.
function extrasBack(p, ex) {
  return ex.hoodie ? `<path d="M44 220 Q40 70 100 62 Q160 70 156 220Z" fill="${shade(p.shirt, 0.15)}"/>` : '';
}

// Extras on the body (after the shirt, before the head).
function extrasBody(p, ex) {
  let s = '';
  if (ex.tie) s += '<path d="M100 160 L92 168 L100 212 L108 168Z" fill="#c1121f"/><path d="M94 158 L106 158 L103 168 L97 168Z" fill="#9d0208"/>';
  if (ex.bowtie) s += '<path d="M100 164 L84 156 L84 172Z M100 164 L116 156 L116 172Z" fill="#c1121f"/><circle cx="100" cy="164" r="4" fill="#9d0208"/>';
  if (ex.pearls) {
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      s += `<circle cx="${(78 + 44 * t).toFixed(1)}" cy="${(160 + 14 * Math.sin(Math.PI * t)).toFixed(1)}" r="3.5" fill="#f8f4ec" stroke="#d8cfc0" stroke-width="1"/>`;
    }
  }
  if (ex.lanyard) s += '<path d="M86 158 L98 196 M114 158 L102 196" stroke="#1d4ed8" stroke-width="4"/><rect x="90" y="194" width="20" height="24" rx="3" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/><rect x="94" y="200" width="12" height="6" fill="#94a3b8"/>';
  if (ex.hoodie) s += '<path d="M90 160 L88 196 M110 160 L112 196" stroke="#f1f1f1" stroke-width="3" stroke-linecap="round"/>';
  return s;
}

// Extras on the face (after the head).
function extrasFace(p, ex) {
  let s = '';
  if (ex.beard) s += `<path d="M58 104 Q60 160 100 164 Q140 160 142 104 Q136 126 120 122 Q100 118 80 122 Q64 126 58 104Z" fill="${p.hairColor}"/><path d="M90 130 Q100 136 110 130" stroke="#3a2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (ex.mustache) s += `<path d="M82 124 Q92 114 100 120 Q108 114 118 124 Q108 122 100 126 Q92 122 82 124Z" fill="${p.hair === 'bald' ? '#5a4632' : p.hairColor}"/>`;
  if (ex.glasses) s += '<g stroke="#1b1b1b" stroke-width="3.5" fill="#ffffff" fill-opacity=".18"><circle cx="83" cy="102" r="12"/><circle cx="117" cy="102" r="12"/><path d="M95 102 L105 102 M71 100 L59 96 M129 100 L141 96" fill="none"/></g>';
  if (ex.shades) s += '<g fill="#111111"><rect x="68" y="92" width="28" height="18" rx="6"/><rect x="104" y="92" width="28" height="18" rx="6"/><rect x="94" y="96" width="12" height="4"/></g><path d="M74 96 L84 96" stroke="#ffffff" stroke-width="2" opacity=".5"/>';
  if (ex.earrings) s += '<circle cx="58" cy="122" r="4" fill="#ffd166"/><circle cx="142" cy="122" r="4" fill="#ffd166"/>';
  if (ex.headset) s += '<path d="M54 104 Q52 40 100 40 Q148 40 146 104" stroke="#222222" stroke-width="6" fill="none"/><rect x="46" y="94" width="14" height="24" rx="6" fill="#222222"/><rect x="140" y="94" width="14" height="24" rx="6" fill="#222222"/><path d="M52 116 Q60 140 84 134" stroke="#222222" stroke-width="4" fill="none"/><circle cx="86" cy="134" r="4" fill="#222222"/>';
  if (ex.cap) s += '<path d="M56 82 Q56 40 100 40 Q144 40 144 82Z" fill="#e63946"/><path d="M56 82 Q30 84 28 74 Q60 70 100 76Z" fill="#c1121f"/><circle cx="100" cy="42" r="4" fill="#c1121f"/>';
  return s;
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// An SVG string for a character id. Unknown ids get a neutral face.
export function portraitSvg(characterId) {
  const ch = CONTENT.characters[characterId] ?? {};
  const p = { bg: '#888888', skin: '#e0b08a', hair: 'short', hairColor: '#333333', shirt: '#444444', extras: [], mouth: 'smile', ...ch.portrait };
  const ex = Object.fromEntries((p.extras ?? []).map((e) => [e, true]));
  const hideHair = ex.cap && p.hair !== 'long' && p.hair !== 'curly';
  const brow = shade(p.hairColor === '#000000' ? '#5a4632' : p.hairColor, -0.2);

  return (
    `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeAttr(ch.name ?? 'Someone')}">` +
    extrasBack(p, ex) +
    hairBack(p) +
    `<path d="M26 220 Q28 160 100 154 Q172 160 174 220Z" fill="${p.shirt}"/>` +
    `<path d="M86 160 L100 176 L114 160Z" fill="${shade(p.shirt, -0.3)}"/>` +
    `<rect x="88" y="132" width="24" height="30" rx="8" fill="${shade(p.skin, -0.12)}"/>` +
    extrasBody(p, ex) +
    `<circle cx="58" cy="106" r="9" fill="${shade(p.skin, -0.06)}"/>` +
    `<circle cx="142" cy="106" r="9" fill="${shade(p.skin, -0.06)}"/>` +
    `<ellipse cx="100" cy="100" rx="42" ry="50" fill="${p.skin}"/>` +
    (hideHair ? '' : hairFront(p)) +
    `<path d="M76 90 L90 88 M110 88 L124 90" stroke="${brow}" stroke-width="4" stroke-linecap="round"/>` +
    '<circle cx="83" cy="102" r="4.5" fill="#1b1b1b"/><circle cx="117" cy="102" r="4.5" fill="#1b1b1b"/>' +
    `<path d="M100 104 Q96 116 102 118" stroke="${shade(p.skin, -0.25)}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    mouth(p.mouth) +
    extrasFace(p, ex) +
    '</svg>'
  );
}

export function portraitBg(characterId) {
  return CONTENT.characters[characterId]?.portrait?.bg ?? '#888888';
}
