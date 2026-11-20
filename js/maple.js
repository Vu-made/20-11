function makeMaple() {
  mapleBranches.push({ points: [[0, 0], [-11, -80], [-15, -180], [-8, -270]], width: 17 });
  function twig(x, y, angle, length, depth, seed) {
    const radians = angle * Math.PI / 180, nx = x + Math.cos(radians) * length, ny = y + Math.sin(radians) * length;
    const points = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, curve = Math.sin(t * Math.PI) * length * .06;
      points.push([x + (nx - x) * t + curve, y + (ny - y) * t]);
    }
    mapleBranches.push({ points, width: Math.max(1.1, depth * 4.3 + 1.5) });
    if (depth <= 4) {
      for (let i = 0; i < (depth === 0 ? 5 : depth === 1 ? 3 : 12); i++) {
        const a = seeded(seed + i * 7) * Math.PI * 2, r = Math.sqrt(seeded(seed + i * 13 + 10)) * (depth >= 2 ? 64 : depth ? 31 : 40);
        mapleLeaves.push({ x: nx + Math.cos(a) * r, y: ny + Math.sin(a) * r, angle: (seeded(seed + i + 20) - .5) * 2.8, size: .42 + seeded(seed + i + 40) * .28, color: maplePalette[Math.floor(seeded(seed + i + 80) * maplePalette.length)], phase: seeded(seed + i + 100) * 7 });
      }
    }
    if (depth) {
      twig(nx, ny, angle - 23 - seeded(seed + 1) * 11, length * .67, depth - 1, seed * 2 + 5);
      twig(nx, ny, angle + 23 + seeded(seed + 2) * 11, length * .69, depth - 1, seed * 2 + 11);
    }
  }
  [[-145, 202], [-116, 232], [-88, 255], [-62, 227], [-33, 204]].forEach(([angle, length], i) => twig(-8, -270, angle, length, 4, 20 + i * 27));
  // Broad, mature crown above a thick, tapering trunk.
  for (const branch of mapleBranches) for (const p of branch.points) p[0] *= 1.1;
  for (const leaf of mapleLeaves) leaf.x *= 1.1;
  // Sort by depth so nearer warm leaves overlap the darker interior naturally.
  mapleLeaves.sort((a, b) => a.y - b.y);
}
function drawMaple(time) {
  const c = maplePaint, { mapleX, mapleY, mapleScale } = view;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, mapleCanvas.width, mapleCanvas.height);
  c.setTransform(canvasScale * mapleScale, 0, 0, canvasScale * mapleScale, mapleX * canvasScale, mapleY * canvasScale);
  c.fillStyle = '#07181380'; c.beginPath(); c.ellipse(0, 5, 95, 13, 0, 0, Math.PI * 2); c.fill();
  const bend = (x, y) => x + wind * 24 * Math.pow(Math.max(0, -y / 760), 1.9);
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const branch of mapleBranches) {
    c.beginPath(); branch.points.forEach(([x, y], i) => { const bx = bend(x, y); if (i) c.lineTo(bx, y); else c.moveTo(bx, y); });
    c.strokeStyle = branch.width > 12 ? '#795248' : '#795442'; c.lineWidth = branch.width; c.stroke();
  }
  // A broad, gnarled trunk, buttress roots, bark grooves, and an old knot.
  const wood = c.createLinearGradient(-42, 0, 35, 0);
  wood.addColorStop(0, '#47362f'); wood.addColorStop(.4, '#87634d'); wood.addColorStop(.7, '#6d4c3d'); wood.addColorStop(1, '#352b29');
  c.fillStyle = wood;
  c.beginPath(); c.moveTo(-72, 8); c.bezierCurveTo(-37, -14, -37, -51, -39, -108); c.bezierCurveTo(-41, -173, -18, -219, -27, -282);
  c.lineTo(9, -288); c.bezierCurveTo(24, -233, 8, -208, 14, -159); c.bezierCurveTo(19, -98, 13, -31, 67, 9);
  c.bezierCurveTo(31, 4, 18, -6, 6, 0); c.bezierCurveTo(-19, 12, -32, -2, -72, 8); c.closePath(); c.fill();
  c.strokeStyle = '#382c28'; c.lineWidth = 2.3;
  for (let i = 0; i < 9; i++) {
    const x = -29 + i * 7;
    c.beginPath(); c.moveTo(x * 1.6, 1); c.bezierCurveTo(x - 4, -54, x + 6, -99, x * .6 - 7, -151); c.bezierCurveTo(x * .5 - 13, -189, x * .45 - 4, -223, x * .48 - 7, -267); c.stroke();
  }
  c.strokeStyle = '#bb957347'; c.lineWidth = 1.1;
  for (let i = 0; i < 6; i++) {
    const y = -36 - i * 34; c.beginPath(); c.moveTo(-29 + i % 2 * 4, y); c.quadraticCurveTo(-12, y - 11, 8, y - 7); c.stroke();
  }
  c.save(); c.translate(-9, -139); c.rotate(-.16);
  c.fillStyle = '#342a26'; c.beginPath(); c.ellipse(0, 0, 8, 15, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#9a7558'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, 0, 11, 19, 0, 0, Math.PI * 2); c.stroke(); c.restore();
  for (const [side, length] of [[-1, 104], [1, 91]]) {
    c.strokeStyle = '#644a3b'; c.lineWidth = 7; c.beginPath(); c.moveTo(side * 18, -4); c.bezierCurveTo(side * 37, 8, side * 65, -1, side * length, 13); c.stroke();
    c.strokeStyle = '#a27e594d'; c.lineWidth = 1.1; c.stroke();
  }
  // The nest sits securely in a heavy, almost horizontal branch fork.
  c.strokeStyle = '#6d503f'; c.lineWidth = 13; c.beginPath(); c.moveTo(bend(-8, -270), -270); c.bezierCurveTo(bend(83, -330), -330, bend(141, -373), -373, bend(274, -365), -365); c.stroke();
  c.strokeStyle = '#b18c5b55'; c.lineWidth = 1.6; c.stroke();
  c.setTransform(1, 0, 0, 1, 0, 0);
  // Cached leaves are bent in narrow bands; their geometry is never re-created.
  const band = Math.max(1, Math.round(8 * canvasScale));
  for (let y = 0; y < mapleFoliage.height; y += band) {
    const height = Math.min(band, mapleFoliage.height - y);
    const localY = (mapleY - y / canvasScale) / mapleScale;
    const drift = wind * 24 * Math.pow(Math.max(0, localY / 760), 1.9) * mapleScale * canvasScale;
    c.drawImage(mapleFoliage, 0, y, mapleFoliage.width, height, drift, y, mapleFoliage.width, height);
  }
  c.setTransform(canvasScale * mapleScale, 0, 0, canvasScale * mapleScale, mapleX * canvasScale, mapleY * canvasScale);
  drawNest(c, time);

}
function cacheMapleLeaves() {
  const c = foliagePaint, { mapleX, mapleY, mapleScale } = view;
  c.setTransform(canvasScale * mapleScale, 0, 0, canvasScale * mapleScale, mapleX * canvasScale, mapleY * canvasScale);
  for (const leaf of mapleLeaves) {
    c.save(); c.translate(leaf.x, leaf.y); c.rotate(leaf.angle); c.scale(leaf.size, leaf.size);
    c.fillStyle = leaf.color; c.fill(mapleShape); c.strokeStyle = '#ffca8529'; c.lineWidth = .7; c.stroke(mapleShape);
    c.strokeStyle = '#793c313d'; c.beginPath(); c.moveTo(0, 19); c.lineTo(0, -26); c.stroke(); c.restore();
  }
}

const nest = { x: 224, y: -379 };
function mapleBend(x, y) { return x + wind * 24 * Math.pow(Math.max(0, -y / 760), 1.9); }
function nestPoint() { return { x: view.mapleX + mapleBend(nest.x, nest.y) * view.mapleScale, y: view.mapleY + nest.y * view.mapleScale }; }
function drawNest(c, time) {
  c.save(); c.translate(mapleBend(nest.x, nest.y), nest.y);
  // Two chicks peer above the woven rim and lift their beaks as adults return.
  for (let i = 0; i < 2; i++) {
    const x = i ? 9 : -8, y = -10 - Math.max(0, Math.sin(time * 2 + i)) * 2;
    c.fillStyle = '#afa481'; c.beginPath(); c.ellipse(x, y, 5, 5.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ddb76c'; c.beginPath(); c.moveTo(x - 2, y + 1); c.lineTo(x + 2, y + 1); c.lineTo(x, y + 5); c.closePath(); c.fill();
    c.fillStyle = '#1d2020'; c.beginPath(); c.arc(x + 1.8, y - 1.2, .9, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = '#3b2e25'; c.beginPath(); c.ellipse(0, 2, 28, 11, 0, 0, Math.PI); c.quadraticCurveTo(0, 18, -28, 2); c.fill();
  c.fillStyle = '#47362a'; c.beginPath(); c.ellipse(0, 0, 28, 7, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 22; i++) {
    const y = 1 + seeded(i + 4100) * 11, x = -27 + seeded(i + 4200) * 11;
    c.strokeStyle = i % 3 ? '#aa8556' : '#d1ac6e'; c.lineWidth = .8 + seeded(i + 4500);
    c.beginPath(); c.moveTo(x - 3, y - 3); c.quadraticCurveTo(-3 + seeded(i + 4400) * 9, y + 9, 22 + seeded(i + 4300) * 7, y - 2); c.stroke();
  }
  c.strokeStyle = '#bd985c'; c.lineWidth = 1.8; c.beginPath(); c.ellipse(0, 0, 28, 7, 0, 0, Math.PI); c.stroke(); c.restore();
}
function cubicPoint(a, b, c, d, t) { const u = 1 - t; return { x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y }; }
function returningBird(time, index) {
  const phase = (time + index * 8.5) % 42, n = nestPoint();
  const perch = { x: n.x + (index - 1) * 20 * view.mapleScale, y: n.y - 9 * view.mapleScale };
  if (phase < 10) {
    const t = phase / 10, ease = t * t * (3 - 2 * t);
    const p = cubicPoint({ x: view.w * 1.06, y: view.h * (.23 + index * .035) }, { x: view.w * .81, y: view.h * .12 }, { x: n.x + view.w * .18, y: n.y - view.h * .12 }, perch, ease);
    return { ...p, state: 'returning', size: view.mapleScale * (.6 + .4 * t), face: 1, flap: Math.sin(time * 15 + index), landing: Math.max(0, (t - .86) / .14) };
  }
  if (phase < 25) return { ...perch, state: 'perched', size: view.mapleScale, face: index === 1 ? -1 : 1, flap: 0, landing: 1 };
  if (phase < 32) {
    const t = (phase - 25) / 7, ease = t * t * (3 - 2 * t);
    const p = cubicPoint(perch, { x: n.x + view.w * .09, y: n.y - view.h * .19 }, { x: view.w * .8, y: view.h * .25 }, { x: view.w * 1.07, y: view.h * .19 }, ease);
    return { ...p, state: 'leaving', size: view.mapleScale * (1 - t * .4), face: -1, flap: Math.sin(time * 16 + index), landing: 0 };
  }
  return null;
}
function drawNestingBirds(c, time) {
  for (let i = 0; i < 3; i++) {
    const bird = returningBird(time, i); if (!bird) continue;
    c.save(); c.translate(bird.x, bird.y); c.scale(bird.size * bird.face, bird.size);
    if (bird.state === 'perched') {
      c.strokeStyle = '#b49c75'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-1, 5); c.lineTo(-2, 11); c.moveTo(3, 5); c.lineTo(4, 11); c.stroke();
    }
    c.fillStyle = '#61727b'; c.beginPath(); c.moveTo(8, 1); c.lineTo(19, 6); c.lineTo(14, -2); c.closePath(); c.fill();
    c.fillStyle = i === 1 ? '#9b8269' : '#9aaab0'; c.beginPath(); c.ellipse(0, 0, 10, 6, -.15, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#647481'; c.beginPath(); c.ellipse(2, 0, 6, 3.5, .22, 0, Math.PI * 2); c.fill();
    if (bird.state !== 'perched') {
      const wing = (1 - bird.landing) * bird.flap;
      c.fillStyle = '#8198a4'; c.beginPath(); c.moveTo(-1, -1); c.quadraticCurveTo(9, -17 * wing, 19, -22 * wing - 3); c.quadraticCurveTo(8, -4, 2, 3); c.closePath(); c.fill();
    }
    c.fillStyle = '#b2c0c1'; c.beginPath(); c.arc(-7, -5, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#d4ad70'; c.beginPath(); c.moveTo(-11, -6); c.lineTo(-17, -3.5); c.lineTo(-11, -2); c.closePath(); c.fill();
    c.fillStyle = '#15212b'; c.beginPath(); c.arc(-8.5, -6, 1.1, 0, Math.PI * 2); c.fill();
    c.restore();
  }
}

makeMaple();
