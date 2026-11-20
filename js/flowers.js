function attach(g, x, y, angle, scale = 1, type = 'leaf', delay = 0) {
  const item = { g, x, y, angle, scale, type, delay, duration: type === 'flower' ? 2.65 : 1.2, phase: random(0, Math.PI * 2) };
  attachments.push(item);
  if (type === 'flower') flowerTips.push(item);
}
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); parent.append(e); return e; }
function line(parent, d, delay = 0, width = 2, color = 'url(#stem)', duration = 1.5) {
  const path = el('path', { d, class: 'line', pathLength: 1, stroke: color, 'stroke-width': width, style: `--delay:${delay}s;--duration:${duration}s` }, parent);
  // Sample each curve once; the wind field bends these points continuously.
  const length = path.getTotalLength();
  const count = Math.max(2, Math.ceil(length / 4));
  const points = Array.from({ length: count + 1 }, (_, i) => {
    const p = path.getPointAtLength(length * i / count);
    return { x: p.x, y: p.y, bend: 72 * Math.pow(Math.max(0, (835 - p.y) / 735), 1.8) };
  });
  stems.push({ path, points, delay, duration, width }); growthEnd = Math.max(growthEnd, delay + duration); return path;
}
function leaf(parent, x, y, angle, length, width, delay) {
  const g = el('g', { transform: `translate(${x} ${y}) rotate(${angle})` }, parent);
  growthEnd = Math.max(growthEnd, delay + 1.2);
  attach(g, x, y, angle, 1, 'leaf', delay);
  const s = el('g', { class: 'sprout', style: `--delay:${delay}s` }, g);
  el('path', { d: `M0 0 Q${-width} ${-length * .52} 0 ${-length} Q${width * .9} ${-length * .5} 0 0`, fill: 'url(#leaf)' }, s);
  el('path', { d: `M0 0 Q${-width * .1} ${-length * .5} 0 ${-length}`, fill: 'none', stroke: '#aedfd1', 'stroke-opacity': '.23', 'stroke-width': '.7' }, s);
}
function dot(parent, x, y, r, delay, color = '#ffe5d0') {
  el('circle', { cx: x, cy: y, r, fill: color, class: 'pollen', style: `--delay:${delay}s` }, parent);
}
function flower(parent, x, y, angle, scale, delay) {
  const g = el('g', { transform: `translate(${x} ${y}) rotate(${angle}) scale(${scale})` }, parent);
  growthEnd = Math.max(growthEnd, delay + 2.65);
  attach(g, x, y, angle, scale, 'flower', delay);
  // Anchor (0, 0) is the stem connection, at the bottom of the calyx.
  const head = el('g', { transform: 'translate(-2 -39)' }, g);
  const cup = el('g', { class: 'sprout', style: `--delay:${delay}s;transform-origin:2px 39px;--duration:.65s` }, head);
  el('path', { d: 'M-13 -3 Q0 2 13 -3 Q10 18 2 39 Q-11 21 -13 -3', fill: 'url(#cup)' }, cup);
  el('path', { d: 'M-10 0 Q-3 14 2 34', fill: 'none', stroke: '#97d9cc', 'stroke-opacity': '.25' }, cup);
  const stamens = el('g', { class: 'pollen', style: `--delay:${delay + 1.2}s`, fill: 'none', stroke: '#b5a36d', 'stroke-width': 1.2 }, head);
  for (const [a, b, c, d] of [[-7, -37, -21, -94], [0, -35, -5, -106], [6, -36, 15, -96]]) {
    el('path', { d: `M${a} ${b} Q${c} ${d + 22} ${c} ${d}` }, stamens);
    el('ellipse', { cx: c, cy: d, rx: 2.5, ry: 3.3, fill: '#e4cd91', stroke: 'none' }, stamens);
  }
  const petals = [
    ['M0 0 C-16 -15 -41 -54 -33 -82 C-26 -100 -3 -88 0 -58 C4 -90 27 -100 32 -78 C40 -52 17 -13 0 0', 'url(#back)'],
    ['M0 0 C-25 -5 -53 -31 -61 -55 C-43 -55 -16 -33 0 0', '#ffd2ed'],
    ['M0 0 C-20 -8 -51 -52 -43 -72 C-35 -93 -14 -78 -9 -54 C-4 -32 0 -12 0 0', 'url(#pink)'],
    ['M0 0 C19 -3 49 -31 51 -76 C38 -68 22 -45 0 0', '#ffa7dd'],
    ['M0 0 C-13 -16 -22 -66 -15 -79 C-6 -98 12 -90 14 -73 C18 -49 7 -17 0 0', 'url(#pink)'],
    ['M0 0 C11 -15 15 -57 28 -74 C42 -89 51 -71 43 -53 C34 -30 15 -6 0 0', 'url(#pink)'],
    ['M0 0 C14 -6 36 -35 62 -52 C55 -30 25 -5 0 0', '#ffceeb']
  ];
  petals.forEach(([d, fill], i) => el('path', { d, fill, class: 'petal', style: `--delay:${delay + .7 + i * .075}s` }, head));
  // Fine peach folds run down the petals into their common base.
  const folds = el('g', { class: 'pollen', style: `--delay:${delay + 1.6}s`, fill: 'none', stroke: '#bf438e', 'stroke-opacity': '.32', 'stroke-width': 1 }, head);
  for (const d of ['M0 0 Q-28 -31 -35 -69', 'M0 0 Q-8 -35 -7 -73', 'M0 0 Q19 -24 34 -62', 'M0 0 Q34 -20 49 -40']) el('path', { d }, folds);
}
function bud(parent, x, y, angle, size, delay) {
  const g = el('g', { transform: `translate(${x} ${y}) rotate(${angle}) scale(${size})` }, parent);
  growthEnd = Math.max(growthEnd, delay + 1.2);
  attach(g, x, y, angle, size, 'bud', delay);
  const anchor = el('g', { transform: 'translate(0 -9)' }, g);
  const s = el('g', { class: 'sprout', style: `--delay:${delay}s;transform-origin:0px 9px` }, anchor);
  el('path', { d: 'M0 3 Q-9 -4 -7 -14 Q-2 -20 0 -6 Q2 -22 6 -18 Q11 -11 0 3', fill: 'url(#pink)' }, s);
  el('path', { d: 'M-4 0 L0 9 L4 -1 Q0 3 -4 0', fill: '#65b6b3' }, s);
}
// All forks, buds, and flowers use the same exact endpoint as their stem.
function segment(parent, from, c1, c2, to, delay, width = 2.5, duration = 1.25) {
  delay = Math.max(delay, nodeTimes.get(from.join(',')) ?? 0);
  nodeTimes.set(to.join(','), delay + duration);
  const d = `M${from} C${c1} ${c2} ${to}`;
  const path = line(parent, d, delay, width, 'url(#stem)', duration);
  return { path, to, delay, duration };
}
function foliage(parent, branch, side = 1, count = 3) {
  const length = branch.path.getTotalLength();
  for (let i = 0; i < count; i++) {
    const t = .28 + i * .22;
    const p = branch.path.getPointAtLength(length * t);
    const q = branch.path.getPointAtLength(Math.min(length, length * t + 1));
    const angle = Math.atan2(q.x - p.x, p.y - q.y) * 180 / Math.PI;
    const direction = (i % 2 ? -1 : 1) * side;
    const a = (angle + direction * 52) * Math.PI / 180;
    const reach = 15 + (i % 2) * 4;
    const end = [p.x + Math.sin(a) * reach, p.y - Math.cos(a) * reach];
    const delay = branch.delay + branch.duration * t + .15;
    line(parent, `M${p.x} ${p.y} Q${p.x + Math.sin(a) * reach * .4} ${p.y - Math.cos(a) * reach * .4} ${end}`, delay, 1.05, '#559b9e', .6);
    leaf(parent, ...end, angle + direction * 57, 25 + (i % 3) * 5, 8 + (i % 2) * 1.5, delay + .6);
  }
}
function build() {
  art.replaceChildren(); stems = []; attachments = []; flowerTips = []; nodeTimes = new Map(); growthEnd = 0;
  const ground = el('g', {}, art);
  el('ellipse', { cx: 492, cy: 843, rx: 112, ry: 13, fill: '#34eddd', opacity: '.09', style: 'filter:blur(9px)' }, ground);
  treeLayer = el('g', { id: 'tree' }, art);
  const neon = el('g', { filter: 'url(#neon-glow)' }, treeLayer);
  const branches = el('g', { id: 'branches' }, neon), leaves = el('g', { id: 'leaves' }, neon), blossoms = el('g', { id: 'blossoms' }, neon);
  const root = [492, 835], a = [487, 664], b = [496, 511], c = [494, 354], d = [520, 220];
  const trunk = [
    segment(branches, root, [479, 779], [481, 718], a, 0, 10, 1.3),
    segment(branches, a, [504, 607], [485, 556], b, .8, 7, 1.3),
    segment(branches, b, [510, 455], [482, 409], c, 1.6, 5, 1.3),
    segment(branches, c, [501, 303], [524, 267], d, 2.4, 3.5, 1.3)
  ];
  trunk.slice(1).forEach((s, i) => foliage(leaves, s, i % 2 ? 1 : -1, 2));
  // A gently irregular crown: major forks, smaller forks, and terminal flowers.
  const specs = [
    [a, [424, 661], [386, 623], [350, 607], 1, 5],
    [[350, 607], [298, 583], [285, 537], [258, 500], 1.9, 3.7],
    [[258, 500], [215, 479], [173, 469], [145, 445], 2.8, 2.3, -25, .55],
    [[258, 500], [230, 516], [210, 537], [177, 541], 2.8, 1.9, -65, .42],
    [[350, 607], [326, 571], [341, 534], [317, 495], 2, 2.5, -12, .52],
    [b, [447, 489], [409, 465], [373, 433], 1.9, 4.5],
    [[373, 433], [345, 399], [329, 357], [310, 325], 2.8, 3.2],
    [[310, 325], [286, 306], [266, 279], [239, 258], 3.6, 2.2, -35, .66],
    [[373, 433], [317, 443], [259, 392], [210, 357], 2.8, 2.2, -52, .48],
    [[310, 325], [331, 290], [343, 259], [335, 222], 3.6, 2.1],
    [[335, 222], [328, 197], [321, 177], [308, 158], 4.4, 1.8, -18, .52],
    [c, [460, 321], [435, 288], [420, 254], 2.7, 2.9],
    [[420, 254], [400, 220], [400, 186], [403, 160], 3.6, 2],
    [[403, 160], [405, 132], [412, 111], [420, 88], 4.4, 1.5, 15, .52],
    [d, [500, 182], [494, 149], [490, 118], 3.3, 2, 0, .6],
    [a, [551, 644], [592, 637], [630, 620], 1.2, 4.8],
    [[630, 620], [678, 599], [694, 570], [720, 534], 2.1, 3.6],
    [[720, 534], [742, 505], [767, 477], [784, 451], 3, 2.2, 30, .55],
    [[720, 534], [750, 541], [780, 562], [807, 564], 3, 1.9, 65, .42],
    [[630, 620], [658, 580], [645, 546], [665, 514], 2.2, 2.5, 14, .53],
    [b, [546, 489], [579, 467], [601, 444], 2, 4.2],
    [[601, 444], [640, 407], [652, 375], [676, 348], 2.9, 3.2],
    [[676, 348], [699, 326], [727, 323], [748, 306], 3.7, 2.3, 50, .67],
    [[601, 444], [641, 443], [675, 423], [700, 405], 3, 2, 65, .45],
    [[676, 348], [659, 307], [647, 283], [651, 252], 3.7, 2.1],
    [[651, 252], [651, 231], [664, 209], [676, 196], 4.5, 1.7, 20, .5],
    [c, [528, 334], [551, 329], [571, 307], 2.9, 2.9],
    [[571, 307], [595, 273], [596, 240], [591, 206], 3.8, 2.1],
    [[591, 206], [590, 181], [576, 161], [568, 143], 4.6, 1.5, -12, .5],
  ];
  for (const [from, c1, c2, to, delay, width, angle, size] of specs) {
    const s = segment(branches, from, c1, c2, to, delay, width, 1.15);
    foliage(leaves, s, to[0] < 492 ? -1 : 1, size ? 2 : 1);
    if (size) flower(blossoms, ...to, angle, size, s.delay + s.duration);
  }
  // Slim bud-bearing shoots split directly from points on the larger branches.
  for (const [index, s] of trunk.entries()) {
    if (index === 0) continue;
    const len = s.path.getTotalLength();
    for (const side of [-1, 1]) {
      const p = s.path.getPointAtLength(len * (side < 0 ? .45 : .7));
      const tip = [p.x + side * (46 + index * 5), p.y - 63];
      const delay = s.delay + 1.4;
      const shoot = segment(branches, [p.x, p.y], [p.x + side * 24, p.y - 8], [tip[0] - side * 12, tip[1] + 21], tip, delay, 1.5, .9);
      foliage(leaves, shoot, side, 1);
      bud(blossoms, ...tip, side * 24, .85, shoot.delay + shoot.duration);
    }
  }
  // Low branches fan out at staggered heights, leaving the root uncluttered.
  const basal = [
    [[484, 785], [457, 768], [421, 760], [389, 742], -48, 37],
    [[483, 755], [509, 743], [547, 741], [570, 721], 46, 35]
  ];
  basal.forEach(([from, c1, c2, to, angle, length], i) => {
    // Sample the actual trunk rather than using a nearby disconnected coordinate.
    const trunkLength = trunk[0].path.getTotalLength();
    let closest = from, closestDistance = Infinity;
    for (let j = 0; j <= 200; j++) {
      const p = trunk[0].path.getPointAtLength(trunkLength * j / 200);
      if (Math.abs(p.y - from[1]) < closestDistance) { closestDistance = Math.abs(p.y - from[1]); closest = [p.x, p.y]; }
    }
    from = closest;
    const delay = trunk[0].delay + trunk[0].duration + i * .23;
    const s = segment(branches, from, c1, c2, to, delay, 2.3, .95);
    foliage(leaves, s, i % 2 ? 1 : -1, 1);
    leaf(leaves, ...to, angle, length, 13, delay + .95);
  });
  line(branches, 'M492 835 Q465 823 441 838', .2, 2.5, 'url(#stem)', 1);
  line(branches, 'M492 835 Q520 826 541 839', .35, 2, 'url(#stem)', 1);
}
// Branches and their attachments share one continuous bending field.
// The canvas is cleared and painted once per frame; animated SVG filters never
// have to re-rasterize the trunk while it moves.
function worldPoint(x, y) {
  const h = Math.max(0, (835 - y) / 735);
  const spread = (x - 492) / 380;
  return { x: x + wind * (48 * Math.pow(h, 1.85) + 12 * spread * spread * h), y };
}
function windAngle(x, y) {
  const h = Math.max(0, (835 - y) / 735), spread = (x - 492) / 380;
  return Math.atan(wind * (48 * 1.85 * Math.pow(h, .85) + 12 * spread * spread) / 735) * 180 / Math.PI;
}
function spriteFor(item) {
  const group = item.g.cloneNode(true); group.removeAttribute('transform');
  for (const e of [group, ...group.querySelectorAll('*')]) { e.removeAttribute('class'); e.removeAttribute('style'); }
  const serialized = new XMLSerializer().serializeToString(group);
  if (spriteCache.has(serialized)) return spriteCache.get(serialized);
  const promise = (async () => {
    const b = item.g.getBBox(), pad = 12;
    const box = { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2 };
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
    svg.setAttribute('width', Math.ceil(box.width * 2)); svg.setAttribute('height', Math.ceil(box.height * 2));
    svg.append(document.querySelector('#garden defs').cloneNode(true), group);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
    const image = new Image(); image.src = url;
    try { await image.decode(); } finally { URL.revokeObjectURL(url); }
    const texture = document.createElement('canvas'); texture.width = Math.ceil(box.width * 2); texture.height = Math.ceil(box.height * 2);
    const ctx = texture.getContext('2d'); ctx.shadowColor = item.type === 'leaf' ? '#41ffe0' : '#ff8bd9'; ctx.shadowBlur = 5;
    ctx.drawImage(image, 0, 0, texture.width, texture.height);
    return { texture, ...box };
  })();
  spriteCache.set(serialized, promise); return promise;
}
async function prepareRenderer() {
  const generation = ++rendererGeneration;
  // Commit the finished growth state, then release all completed animations.
  for (const e of treeLayer.querySelectorAll('.line,.sprout,.petal,.pollen')) {
    e.style.animation = 'none'; e.style.opacity = '1';
    if (e.classList.contains('line')) { e.style.strokeDasharray = 'none'; e.style.strokeDashoffset = '0'; }
    else e.style.transform = 'none';
  }
  try {
    await Promise.all(attachments.map(async item => { item.sprite = await spriteFor(item); }));
    if (generation !== rendererGeneration) return;
    const layers = { leaf: 0, bud: 1, flower: 2 };
    drawOrder = [...attachments].sort((a, b) => layers[a.type] - layers[b.type]);
    resizeCanvas(); growthClock = reducedMotion.matches ? growthEnd : 0;
    startedAt = performance.now(); rendererReady = true; moveTree();
    treeLayer.style.visibility = 'hidden';
  } catch (error) { console.error('Unable to prepare flower renderer', error); }
}
const clamp01 = x => Math.max(0, Math.min(1, x));
const growEase = x => 1 - Math.pow(1 - clamp01(x), 3);
function moveTree() {
  if (!rendererReady) return;
  paint.setTransform(1, 0, 0, 1, 0, 0); paint.clearRect(0, 0, windCanvas.width, windCanvas.height);
  const m = screenMatrix;
  if (!m) return;
  paint.setTransform(m.a * canvasScale, m.b * canvasScale, m.c * canvasScale, m.d * canvasScale, m.e * canvasScale, m.f * canvasScale);
  paint.lineCap = 'round'; paint.lineJoin = 'round'; paint.globalAlpha = 1;
  paint.save(); paint.translate(492, 843); paint.scale(1, .15);
  const ground = paint.createRadialGradient(0, 0, 0, 0, 0, 112); ground.addColorStop(0, '#34eddd26'); ground.addColorStop(1, '#34eddd00');
  paint.fillStyle = ground; paint.beginPath(); paint.arc(0, 0, 112, 0, Math.PI * 2); paint.fill(); paint.restore();
  // A single dim outline provides the neon halo without any SVG filter layers.
  const paths = [];
  for (const s of stems) {
    const progress = growEase((growthClock - s.delay) / s.duration);
    if (progress <= 0) continue;
    const p = new Path2D(), last = progress * (s.points.length - 1), whole = Math.floor(last);
    for (let i = 0; i <= whole; i++) {
      const v = s.points[i], q = worldPoint(v.x, v.y); if (i) p.lineTo(q.x, q.y); else p.moveTo(q.x, q.y);
    }
    if (whole < s.points.length - 1) {
      const a = s.points[whole], b = s.points[whole + 1], f = last - whole;
      const q = worldPoint(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f); p.lineTo(q.x, q.y);
    }
    paths.push({ p, width: s.width });
  }
  const halo = new Path2D(); for (const { p } of paths) halo.addPath(p);
  paint.strokeStyle = '#48f8e5'; paint.globalAlpha = .2; paint.lineWidth = 6;
  paint.shadowColor = '#41e6d6'; paint.shadowBlur = 5; paint.stroke(halo);
  paint.shadowBlur = 0; paint.globalAlpha = 1;
  const gradient = paint.createLinearGradient(492, 835, 492, 80);
  gradient.addColorStop(0, '#388d9e'); gradient.addColorStop(.5, '#5bdedb'); gradient.addColorStop(1, '#a3fff0');
  paint.strokeStyle = gradient;
  for (const { p, width } of paths) { paint.lineWidth = width; paint.stroke(p); }
  for (const item of drawOrder) {
    const age = growthClock - item.delay, growth = growEase(age / item.duration);
    if (growth <= 0) continue;
    const p = worldPoint(item.x, item.y), sprite = item.sprite;
    const angle = item.angle + windAngle(item.x, item.y);
    item.currentAngle = angle;
    paint.save(); paint.translate(p.x, p.y); paint.rotate(angle * Math.PI / 180);
    const opening = item.type === 'flower' ? growEase((age - .2) / (item.duration - .2)) : growth;
    paint.scale(item.scale * growth * opening, item.scale * growth);
    paint.globalAlpha = growEase(age / .45);
    paint.drawImage(sprite.texture, sprite.x, sprite.y, sprite.width, sprite.height); paint.restore();
  }
  for (const p of particles) {
    paint.save(); paint.translate(p.x, p.y); paint.rotate((p.onWater ? Math.sin(p.phase + p.age * .2) * 8 : p.rotation) * Math.PI / 180); paint.globalAlpha = p.alpha || 0;
    if (p.petal) {
      const flutter = .45 + Math.abs(Math.cos(p.age * 2 + p.phase)) * .55;
      paint.scale(p.size * flutter, p.size * (p.onWater ? .22 : 1)); paint.fillStyle = '#ffb3e1';
      paint.fill(fallingPetalShape);
    } else { paint.fillStyle = '#a8fff2'; paint.beginPath(); paint.arc(0, 0, p.size, 0, Math.PI * 2); paint.fill(); }
    paint.restore();
  }
}
const fallingPetalShape = new Path2D('M0 -9 C11 -12 14 0 0 12 C-9 5 -10 -4 0 -9');
