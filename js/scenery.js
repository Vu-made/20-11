function resizeCanvas() {
  canvasScale = Math.min(2, devicePixelRatio || 1);
  windCanvas.width = Math.round(innerWidth * canvasScale);
  windCanvas.height = Math.round(innerHeight * canvasScale);
  const w = innerWidth, h = innerHeight, portrait = w / h < 1.1;
  const scale = Math.min(h * (portrait ? .21 : .20) / 790, w * (portrait ? .44 : .16) / 760);
  view = { w, h, scale, rootX: w * (portrait ? .66 : .76), rootY: h * .65, mapleX: w * .08, mapleY: h * .91, mapleScale: Math.min(h * .63 / 1000, w * (portrait ? .64 : .39) / 1200), moonX: w * .77, moonY: h * .19 };
  screenMatrix = { a: scale, b: 0, c: 0, d: scale, e: view.rootX - 492 * scale, f: view.rootY - 835 * scale };
  landscape.width = windCanvas.width; landscape.height = windCanvas.height;
  scenery.width = landscape.width; scenery.height = landscape.height;
  architecture.width = landscape.width; architecture.height = landscape.height;
  bridgeForeground.width = landscape.width; bridgeForeground.height = landscape.height;
  mapleCanvas.width = landscape.width; mapleCanvas.height = landscape.height;
  mapleFoliage.width = landscape.width; mapleFoliage.height = landscape.height; cacheMapleLeaves();
  buildScenery(); buildIslandBridge(); drawScenery(sceneTime);
}
function buildScenery() {
  const { w, h, moonX, moonY } = view, c = backdrop;
  c.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#070e22'); sky.addColorStop(.46, '#172b42'); sky.addColorStop(.68, '#203d4a'); sky.addColorStop(1, '#081522');
  c.fillStyle = sky; c.fillRect(0, 0, w, h);
  const aura = c.createRadialGradient(moonX, moonY, 0, moonX, moonY, h * .21);
  aura.addColorStop(0, '#a2d7ec1c'); aura.addColorStop(1, '#8bc5e000'); c.fillStyle = aura; c.fillRect(0, 0, w, h * .53);
  for (const star of stars) { c.globalAlpha = .22 + seeded(star.phase) * .4; c.fillStyle = '#c6e4f0'; c.beginPath(); c.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1;
  c.shadowColor = '#cce5e9'; c.shadowBlur = 15; c.fillStyle = '#d3e4e3'; c.beginPath(); c.arc(moonX, moonY, h * .026, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
  c.fillStyle = '#98b8bd20'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(moonX + (seeded(i + 12) - .5) * h * .026, moonY + (seeded(i + 22) - .5) * h * .026, h * (.002 + seeded(i + 30) * .004), 0, Math.PI * 2); c.fill(); }
  function ridge(color, base, peaks) {
    c.beginPath(); c.moveTo(-w * .05, h * base);
    for (const [x, y] of peaks) c.lineTo(x * w, y * h);
    c.lineTo(w * 1.05, h * .64); c.lineTo(-w * .05, h * .64); c.closePath(); c.fillStyle = color; c.fill();
  }
  ridge('#243b51', .54, [[-.05, .48], [.06, .39], [.14, .44], [.25, .29], [.34, .39], [.42, .33], [.54, .45], [.66, .32], [.73, .39], [.83, .27], [.96, .43], [1.05, .36]]);
  ridge('#1b3346', .57, [[-.05, .55], [.11, .47], [.22, .53], [.36, .43], [.46, .51], [.57, .39], [.68, .49], [.78, .43], [.9, .48], [1.05, .39]]);
  ridge('#132b3a', .59, [[-.05, .55], [.14, .51], [.3, .55], [.47, .51], [.61, .56], [.75, .49], [.85, .54], [1.05, .47]]);
  // Distant fir silhouettes establish scale on the far bank.
  for (let i = 0; i < 85; i++) {
    const x = i / 84 * w, y = h * (.561 + Math.sin(i * .5) * .003), height = h * (.006 + seeded(i + 90) * .018);
    c.fillStyle = '#102734'; c.beginPath(); c.moveTo(x, y - height); c.lineTo(x - height * .32, y); c.lineTo(x + height * .32, y); c.closePath(); c.fill();
  }
  lakeOutline = new Path2D(); lakeOutline.moveTo(w * .4, h * .565); lakeOutline.lineTo(w, h * .565); lakeOutline.lineTo(w, h); lakeOutline.lineTo(0, h);
  lakeOutline.bezierCurveTo(w * .14, h * .96, w * .31, h * .94, w * .345, h * .86);
  lakeOutline.bezierCurveTo(w * .38, h * .8, w * .21, h * .77, w * .22, h * .71);
  lakeOutline.bezierCurveTo(w * .22, h * .65, w * .37, h * .61, w * .4, h * .565); lakeOutline.closePath();
  const cx = view.rootX, cy = view.rootY + 7, rx = w * (w / h < 1.1 ? .26 : .12), ry = h * .039;
  islandOutline = new Path2D(); islandOutline.moveTo(cx - rx, cy);
  islandOutline.bezierCurveTo(cx - rx * .75, cy - ry * .8, cx - rx * .35, cy - ry * 1.1, cx, cy - ry * .85);
  islandOutline.bezierCurveTo(cx + rx * .38, cy - ry, cx + rx * .83, cy - ry * .5, cx + rx, cy + ry * .1);
  islandOutline.bezierCurveTo(cx + rx * .65, cy + ry, cx - rx * .68, cy + ry * .95, cx - rx, cy); islandOutline.closePath();
  lakeOutline.addPath(islandOutline);
  const land = c.createLinearGradient(0, h * .56, 0, h); land.addColorStop(0, '#0d222d'); land.addColorStop(1, '#07121b'); c.fillStyle = land; c.fillRect(0, h * .568, w, h * .432);
  c.save(); c.clip(lakeOutline, 'evenodd');
  const water = c.createLinearGradient(0, h * .56, 0, h); water.addColorStop(0, '#244552'); water.addColorStop(.35, '#142e40'); water.addColorStop(1, '#0c2132'); c.fillStyle = water; c.fillRect(0, h * .565, w, h * .435);
  // Distant shapes reflect softly in the water, rather than repeating the sky.
  c.fillStyle = '#31536230'; c.beginPath(); c.moveTo(w * .42, h * .566); c.lineTo(w * .57, h * .67); c.lineTo(w * .67, h * .59); c.lineTo(w * .8, h * .66); c.lineTo(w, h * .57); c.closePath(); c.fill(); c.restore();
  c.save(); c.clip(lakeOutline, 'evenodd'); c.strokeStyle = '#5b9a9b38'; c.lineWidth = 1; c.stroke(lakeOutline); c.restore();
  // A low veil of mist separates the distant shore from the foreground.
  const mist = c.createLinearGradient(0, h * .50, 0, h * .65);
  mist.addColorStop(0, '#91b7c400'); mist.addColorStop(.52, '#91b7c410'); mist.addColorStop(1, '#91b7c400');
  c.fillStyle = mist; c.fillRect(0, h * .50, w, h * .15);
  // Rocks and grass sit on the near shore; they stay smaller than the tree.
  for (const [x, y, r] of [[.09, .89, .019], [.15, .85, .012], [.3, .825, .014], [.11, .98, .027], [.32, .84, .009]]) {
    c.fillStyle = '#182c34'; c.beginPath(); c.ellipse(w * x, h * y, h * r * 1.6, h * r * .65, -.12, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#3b626347'; c.lineWidth = 1; c.beginPath(); c.ellipse(w * x, h * y - h * r * .15, h * r * 1.1, h * r * .22, -.12, Math.PI, Math.PI * 1.8); c.stroke();
  }
  // Small clumps grow only on the near bank, never on the water.
  for (let i = 0; i < 26; i++) {
    const x = w * (.018 + seeded(i + 1700) * .30), y = h * (.79 + seeded(i + 1800) * .195);
    if (lakeTest.isPointInPath(lakeOutline, x, y, 'evenodd')) continue;
    drawGrassClump(c, x, y, h * (.014 + seeded(i + 1900) * .022), i);
  }
  for (const [dx, dy] of [[-.036, .01], [.038, .013], [-.012, .023]]) {
    drawGrassClump(c, view.mapleX + w * dx, view.mapleY + h * dy, h * .024, dx * 1000 + 90);
  }
}
function drawGrassClump(c, x, y, height, seed) {
  for (let blade = 0; blade < 7; blade++) {
    const offset = (blade - 3) * height * .13, lean = (blade - 3) * height * .18;
    const top = height * (.50 + seeded(seed + blade + 7100) * .50);
    c.fillStyle = blade % 3 ? '#31584b' : '#466955';
    c.beginPath(); c.moveTo(x + offset, y);
    c.quadraticCurveTo(x + offset + lean * .3, y - top * .65, x + offset + lean, y - top);
    c.quadraticCurveTo(x + offset + lean * .55, y - top * .48, x + offset + 1.7, y); c.fill();
    if (blade % 3 === 0) {
      c.strokeStyle = '#96a87735'; c.lineWidth = .55; c.beginPath(); c.moveTo(x + offset + lean * .36, y - top * .6); c.lineTo(x + offset + lean, y - top); c.stroke();
    }
  }
}
function drawFireflies(c, time) {
  const { w, h, rootX, rootY } = view;
  for (const fly of fireflies) {
    const anchorX = fly.island ? rootX + (fly.x - .5) * w * .17 : w * (.025 + fly.x * .31);
    const anchorY = fly.island ? rootY - h * (.01 + fly.y * .07) : h * (.74 + fly.y * .19);
    const x = anchorX + Math.sin(time * fly.speed * .45 + fly.phase) * w * .006 + wind * 3;
    const y = anchorY + Math.cos(time * fly.speed * .65 + fly.phase) * h * .008;
    const glow = .08 + .72 * Math.pow((Math.sin(time * fly.speed + fly.phase) + 1) / 2, 2);
    const size = (fly.island ? 10 : 14) * fly.size;
    c.save(); c.globalAlpha = glow; c.drawImage(fireflyGlow, x - size / 2, y - size / 2, size, size); c.restore();
  }
}

function bridgePoint(t, side = 0) {
  const { w, h, rootX, rootY } = view;
  const startX = w * .24, endX = rootX - w * (w / h < 1.1 ? .20 : .106);
  const span = endX - startX, rise = Math.min(h * .057, span * .085);
  const radius = span * span / (8 * rise) + rise / 2;
  const offset = (t - .5) * span;
  const arc = Math.sqrt(Math.max(0, radius * radius - offset * offset)) - (radius - rise);
  const width = Math.max(7, w * .009);
  return { x: startX + span * t, y: rootY + h * .012 - arc + side * width / 2, height: h * .017, width };
}
function buildIslandBridge() {
  const c = architecturePaint, { w, h, rootX, rootY } = view;
  c.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  const cx = rootX, cy = rootY + 7, rx = w * (w / h < 1.1 ? .26 : .12);
  const island = c.createLinearGradient(0, cy - h * .016, 0, cy + h * .028);
  island.addColorStop(0, '#39504a'); island.addColorStop(.45, '#243c35'); island.addColorStop(1, '#142e32');
  c.fillStyle = island; c.fill(islandOutline); c.strokeStyle = '#6b8d793b'; c.lineWidth = 1; c.stroke(islandOutline);
  // Small stones, grass, and a narrow earthy path lead from the bridge to the roots.
  c.strokeStyle = '#7f76584a'; c.lineWidth = h * .006; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - w * (w / h < 1.1 ? .20 : .106), cy); c.quadraticCurveTo(cx - w * .05, cy - h * .008, cx, cy - h * .006); c.stroke();
  for (let i = 0; i < 29; i++) {
    const x = cx + (seeded(i + 5100) - .5) * rx * 1.65, y = cy + (seeded(i + 5200) - .5) * h * .014;
    if (i % 4 === 0) { c.fillStyle = '#54716a'; c.beginPath(); c.ellipse(x, y, h * .0028, h * .0014, -.2, 0, Math.PI * 2); c.fill(); }
    else { c.strokeStyle = '#66816788'; c.lineWidth = .65; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 2, y - 2, x + 1, y - h * .006); c.stroke(); }
  }
  // Draw the far handrail before the deck, then the near railing on top.
  const rail = (side) => {
    c.strokeStyle = '#887454'; c.lineWidth = Math.max(1, h * .0017); c.beginPath();
    for (let i = 0; i <= 50; i++) { const p = bridgePoint(i / 50, side); if (i) c.lineTo(p.x, p.y - p.height); else c.moveTo(p.x, p.y - p.height); } c.stroke();
    c.strokeStyle = '#4b5145'; c.lineWidth = Math.max(.65, h * .001); c.beginPath();
    for (let i = 0; i <= 50; i++) { const p = bridgePoint(i / 50, side); if (i) c.lineTo(p.x, p.y - p.height * .48); else c.moveTo(p.x, p.y - p.height * .48); } c.stroke();
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, p = bridgePoint(t, side);
      c.strokeStyle = '#746a52'; c.lineWidth = Math.max(.8, h * .0014); c.beginPath(); c.moveTo(p.x, p.y + 2); c.lineTo(p.x, p.y - p.height); c.stroke();
      c.strokeStyle = '#c0a37870'; c.lineWidth = .6; c.beginPath(); c.moveTo(p.x - .6, p.y - p.height); c.lineTo(p.x + 1.5, p.y - p.height); c.stroke();
    }
  };
  rail(-1);
  c.beginPath(); for (let i = 0; i <= 50; i++) { const p = bridgePoint(i / 50, -1); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }
  for (let i = 50; i >= 0; i--) { const p = bridgePoint(i / 50, 1); c.lineTo(p.x, p.y); } c.closePath();
  const wood = c.createLinearGradient(w, h, w * .8, h * .65); wood.addColorStop(0, '#6b5a45'); wood.addColorStop(1, '#6c6850'); c.fillStyle = wood; c.fill();
  for (let i = 0; i < 41; i++) {
    const t = i / 40, a = bridgePoint(t, -1), b = bridgePoint(t, 1);
    c.strokeStyle = i % 3 ? '#b4a27d40' : '#29393677'; c.lineWidth = .8; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  }
  c.strokeStyle = '#b09a6b70'; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i <= 50; i++) { const p = bridgePoint(i / 50, 1); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); } c.stroke();
  drawBridgeForeground(bridgeForegroundPaint);
  // Bridge legs meet the water, with short, subdued mirrored strokes.
  for (const t of [.16, .84]) for (const side of [-1, 1]) {
    const p = bridgePoint(t, side); c.strokeStyle = '#263b3b'; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x, view.rootY + h * .036); c.stroke();
  }
  drawSwingFrame(c);
}
function drawBridgeForeground(c) {
  const { h } = view; c.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  c.strokeStyle = '#887454'; c.lineWidth = Math.max(1, h * .0017); c.beginPath();
  for (let i = 0; i <= 50; i++) { const p = bridgePoint(i / 50, 1); if (i) c.lineTo(p.x, p.y - p.height); else c.moveTo(p.x, p.y - p.height); } c.stroke();
  c.strokeStyle = '#4b5145'; c.lineWidth = Math.max(.65, h * .001); c.beginPath();
  for (let i = 0; i <= 50; i++) { const p = bridgePoint(i / 50, 1); if (i) c.lineTo(p.x, p.y - p.height * .48); else c.moveTo(p.x, p.y - p.height * .48); } c.stroke();
  for (let i = 0; i <= 10; i++) {
    const p = bridgePoint(i / 10, 1); c.strokeStyle = '#746a52'; c.lineWidth = Math.max(.8, h * .0014);
    c.beginPath(); c.moveTo(p.x, p.y + 2); c.lineTo(p.x, p.y - p.height); c.stroke();
  }
}
function drawScenery(time = 0) {
  if (!view) return;
  const { w, h, moonX, rootY, mapleY } = view, c = scene;
  drawMaple(time);
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(scenery, 0, 0);
  c.setTransform(canvasScale, 0, 0, canvasScale, 0, 0); c.save(); c.clip(lakeOutline, 'evenodd');
  // Reuse the previous complete tree frame for a calm, clipped reflection.
  c.save(); c.translate(0, rootY * 1.68); c.scale(1, -.68); c.globalAlpha = .17; c.drawImage(windCanvas, 0, 0, w, h); c.restore();
  c.save(); c.translate(0, mapleY * 1.68); c.scale(1, -.68); c.globalAlpha = .09; c.drawImage(mapleCanvas, 0, 0, w, h); c.restore();
  // A subdued reflected arch makes the bridge read as a soft ring on the lake.
  c.save(); c.translate(0, (rootY + h * .012) * 1.55); c.scale(1, -.55); c.globalAlpha = .085; c.drawImage(architecture, 0, 0, w, h); c.restore();
  c.save(); c.translate(0, (rootY + h * .012) * 1.55); c.scale(1, -.55); c.globalAlpha = .11; drawBridgeWalkers(c, time); c.restore();
  for (const r of ripples) {
    const depth = .02 + r.y * .98, y = h * (.57 + depth * .42), spread = (.014 + r.width * .07) * w * depth;
    const drift = Math.sin(time * .45 + r.phase) * w * .008 * (1 + Math.abs(wind));
    const x = r.x * w + drift;
    c.strokeStyle = `rgba(121,185,197,${.025 + depth * .055})`; c.lineWidth = .5 + depth * .6;
    c.beginPath(); c.moveTo(x - spread * .5, y); c.quadraticCurveTo(x, y + Math.sin(time * .7 + r.phase) * 1.4, x + spread * .5, y); c.stroke();
  }
  // Broken moonlight stretches toward the foreground.
  for (let i = 0; i < 35; i++) {
    const depth = i / 35, y = h * (.575 + depth * .415), x = moonX + Math.sin(time * .6 + i * 1.3) * w * .009;
    const width = w * (.009 + depth * .10) * (.25 + seeded(i + 2100) * .75);
    c.strokeStyle = `rgba(174,215,216,${.025 + (1 - depth) * .055})`; c.lineWidth = .65 + depth;
    c.beginPath(); c.moveTo(x - width / 2, y); c.lineTo(x + width / 2, y); c.stroke();
  }
  c.restore();
  for (let i = 0; i < 3; i++) {
    const pulse = (time * .12 + i / 3) % 1, radius = 12 + pulse * 27;
    c.save(); c.clip(lakeOutline, 'evenodd'); c.strokeStyle = `rgba(100,210,201,${(1 - pulse) * .12})`; c.lineWidth = .7;
    c.beginPath(); c.ellipse(view.rootX, view.rootY + 1, radius, radius * .18, 0, 0, Math.PI * 2); c.stroke(); c.restore();
  }
  // Petals create expanding rings only where they actually touch the lake.
  c.save(); c.clip(lakeOutline, 'evenodd');
  for (const ripple of waterRipples) {
    const x = ripple.x * w, y = ripple.y * h, fade = Math.max(0, 1 - ripple.age / ripple.life);
    for (let ring = 0; ring < 2; ring++) {
      const radius = 2 + ripple.age * 13 - ring * 4; if (radius <= 0) continue;
      c.strokeStyle = `rgba(166,232,230,${fade * (ring ? .22 : .42)})`; c.lineWidth = .8;
      c.beginPath(); c.ellipse(x, y, radius, radius * .27, 0, 0, Math.PI * 2); c.stroke();
    }
    if (ripple.age < .4) {
      c.fillStyle = `rgba(220,249,246,${(1 - ripple.age / .4) * .8})`;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + (i - 1) * ripple.age * 12, y - Math.sin(ripple.age / .4 * Math.PI) * (3 + i % 2 * 3), .8, 0, Math.PI * 2); c.fill(); }
    }
  }
  c.restore();
  // Birds approach the actual moving nest, fold their wings, then perch.
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(architecture, 0, 0);
  c.setTransform(canvasScale, 0, 0, canvasScale, 0, 0); drawBridgeWalkers(c, time);
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(bridgeForeground, 0, 0);
  c.setTransform(canvasScale, 0, 0, canvasScale, 0, 0); drawSwing(c, time); drawMooredBoat(c, time);
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(mapleCanvas, 0, 0);
  c.setTransform(canvasScale, 0, 0, canvasScale, 0, 0); drawNestingBirds(c, time); drawFireflies(c, time);
}
