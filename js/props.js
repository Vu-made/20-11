function swingGeometry() {
  const { w, h, rootX, rootY } = view, portrait = w / h < 1.1;
  const height = Math.min(h * .078, w * (portrait ? .17 : .07));
  return { x: rootX + w * (portrait ? .18 : .078), y: rootY + h * .012, height, width: height * .77, depth: height * .16 };
}
function drawSwingFrame(c) {
  const { x, y, height: h, width: w, depth } = swingGeometry();
  c.lineCap = 'round';
  // Four legs and a crossbeam give the swing a visible wooden A-frame.
  for (const side of [-1, 1]) {
    const topX = x + side * w * .55;
    c.strokeStyle = '#4b5546'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(topX, y - h); c.lineTo(topX + depth * .55, y - depth * .25); c.stroke();
    c.strokeStyle = '#9a8661'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(topX, y - h); c.lineTo(topX - depth * .55, y + depth * .17); c.stroke();
    c.strokeStyle = '#6c7055'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(topX - depth * .3, y - h * .36); c.lineTo(topX + depth * .35, y - h * .36); c.stroke();
  }
  c.strokeStyle = '#a08b65'; c.lineWidth = 2.7; c.beginPath(); c.moveTo(x - w * .65, y - h); c.lineTo(x + w * .65, y - h); c.stroke();
}
function swingPose(time) {
  const g = swingGeometry(), play = schoolSwingWeight(time);
  const angle = Math.sin(time * .8) * .048 * (1 - play) + Math.sin(time * 1.5) * .20 * play + wind * .07;
  const length = g.height * .69, top = g.y - g.height + 2;
  return { ...g, seatX: g.x + Math.sin(angle) * length, seatY: top + Math.cos(angle) * length, top, angle };
}
function drawSwing(c, time) {
  const { x, width, seatX, seatY, top } = swingPose(time), seatWidth = width * .46;
  c.strokeStyle = '#c1bda07d'; c.lineWidth = .9;
  for (const side of [-1, 1]) { c.beginPath(); c.moveTo(x + side * seatWidth * .42, top); c.lineTo(seatX + side * seatWidth * .46, seatY); c.stroke(); }
  c.fillStyle = '#b29469'; c.fillRect(seatX - seatWidth / 2, seatY - 1.5, seatWidth, 3);
  c.strokeStyle = '#e0c48d70'; c.lineWidth = .6; c.beginPath(); c.moveTo(seatX - seatWidth / 2, seatY - 1); c.lineTo(seatX + seatWidth / 2, seatY - 1); c.stroke();
}
function boatPose(time) {
  const { w, h } = view, portrait = w / h < 1.1;
  return { x: w * (portrait ? .41 : .386) + Math.sin(time * .35) * w * .001,
    y: h * (portrait ? .88 : .864) + Math.sin(time * .9) * h * .0009,
    angle: -.15 + Math.sin(time * .65) * .009 + wind * .006,
    width: Math.min(w * (portrait ? .18 : .075), h * .13), height: h * (portrait ? .013 : .022),
    postX: w * (portrait ? .29 : .315), postY: h * .834 };
}
function drawMooredBoat(c, time) {
  const b = boatPose(time), w = b.width, h = b.height;
  c.save(); c.clip(lakeOutline, 'evenodd');
  c.fillStyle = '#06172066'; c.beginPath(); c.ellipse(b.x, b.y + h * .6, w * .55, h * .6, b.angle, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#739d9c38'; c.lineWidth = .75;
  for (let i = 0; i < 2; i++) { c.beginPath(); c.ellipse(b.x, b.y + h * .5, w * (.63 + i * .09), h * (.8 + i * .27), b.angle, 0, Math.PI * 2); c.stroke(); }
  c.restore(); c.save(); c.translate(b.x, b.y); c.rotate(b.angle);
  const hull = c.createLinearGradient(0, -h * .3, 0, h);
  hull.addColorStop(0, '#8b7357'); hull.addColorStop(.4, '#66503f'); hull.addColorStop(1, '#302b28');
  c.fillStyle = hull; c.beginPath(); c.moveTo(-w * .51, -h * .24); c.bezierCurveTo(-w * .35, h * 1.1, w * .31, h * 1.1, w * .51, -h * .27); c.quadraticCurveTo(0, h * .20, -w * .51, -h * .24); c.fill();
  c.fillStyle = '#2c302b'; c.beginPath(); c.ellipse(0, -h * .20, w * .45, h * .33, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#b09a70'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(0, -h * .23, w * .46, h * .34, 0, 0, Math.PI * 2); c.stroke();
  for (const t of [-.23, .04, .29]) { c.fillStyle = '#95815b'; c.fillRect(w * t - w * .025, -h * .42, w * .05, h * .43); }
  // A resting oar and a small rope coil make the tethered boat readable.
  c.strokeStyle = '#9c8966'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-w * .12, -h * .7); c.lineTo(w * .3, h * .45); c.stroke();
  c.fillStyle = '#a08b68'; c.beginPath(); c.ellipse(w * .3, h * .45, w * .05, h * .12, .3, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#b1a17b'; c.lineWidth = .65; c.beginPath(); c.ellipse(-w * .28, -h * .25, w * .045, h * .10, 0, 0, Math.PI * 2); c.stroke();c.restore();
  // The same fixed post and moving bow are used for the mooring line.
  const bx = -w * .48, by = -h * .2;
  const bowX = b.x + bx * Math.cos(b.angle) - by * Math.sin(b.angle), bowY = b.y + bx * Math.sin(b.angle) + by * Math.cos(b.angle);
  c.strokeStyle = '#8e917776'; c.lineWidth = 1; c.beginPath(); c.moveTo(b.postX, b.postY - 9); c.quadraticCurveTo((b.postX + bowX) / 2, (b.postY + bowY) / 2 + 8, bowX, bowY); c.stroke();
  c.strokeStyle = '#71634e'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(b.postX, b.postY + 3); c.lineTo(b.postX, b.postY - 13); c.stroke();
  c.strokeStyle = '#b2aa8a'; c.lineWidth = .8; c.beginPath(); c.ellipse(b.postX, b.postY - 8, 3, 1.6, 0, 0, Math.PI * 2); c.stroke();
}
