// All six people share one clock and keep stable identities throughout the trip.
const tripSmooth = x => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
let cachedSchoolKey = '', cachedSchool = null;
function schoolTripPhase(time) {
  const duration = TRIP_CONFIG.stages.reduce((sum, stage) => sum + stage.duration, 0);
  let elapsed = ((time + TRIP_CONFIG.initialOffset) % duration + duration) % duration;
  for (const stage of TRIP_CONFIG.stages) {
    if (elapsed < stage.duration) return { ...stage, elapsed, progress: elapsed / stage.duration, startTime: time - elapsed };
    elapsed -= stage.duration;
  }
}
function schoolSwingWeight(time) {
  const phase = schoolTripPhase(time);
  if (phase.name === 'play') return 1;
  if (phase.name === 'disperse') return tripSmooth((phase.elapsed - 4) / 2);
  if (phase.name === 'gather') return 1 - tripSmooth(phase.elapsed / 2);
  return 0;
}
function bridgeFloor(x) {
  const a = bridgePoint(0), b = bridgePoint(1), t = Math.max(0, Math.min(1, (x - a.x) / (b.x - a.x)));
  const p = bridgePoint(t); return p.y + p.width * .12;
}
function tripMetrics() {
  const start = bridgePoint(0), end = bridgePoint(1);
  const height = Math.max(20, Math.min(view.h * .041, view.w * .035));
  const gap = height * .49, tail = gap * TRIP_CONFIG.studentCount, span = end.x - start.x;
  return { start, end, height, gap, tail, span, arrival: span + tail + 35, returnStart: span + 25, returnEnd: -tail - 18 };
}
function classRoute(distance) {
  const { start, end, span } = tripMetrics();
  if (distance < 0) return { x: start.x + distance, y: bridgeFloor(start.x), onBridge: false };
  if (distance <= span) { const p = bridgePoint(distance / span); return { x: p.x, y: p.y + p.width * .12, onBridge: true }; }
  const blend = tripSmooth((distance - span) / Math.max(50, view.w * .065));
  return { x: end.x + distance - span, y: bridgeFloor(end.x) * (1 - blend) + (view.rootY + view.h * .024) * blend, onBridge: false };
}
function personPose(index, ground, time, direction = 1, gait = 0) {
  const height = tripMetrics().height * (index ? TRIP_CONFIG.childHeights[index - 1] : 1);
  const phase = time * 5.7 + index * .42;
  return { id: index, x: ground.x, y: ground.y - Math.sin(phase * 2) * height * .012 * gait,
    groundY: ground.y, height, onBridge: !!ground.onBridge, gait, phase, direction,
    bagColor: index ? TRIP_CONFIG.backpacks[index - 1] : null, seatMix: 0 };
}
function classLine(leaderDistance, direction, time, gait) {
  const { gap } = tripMetrics();
  return Array.from({ length: TRIP_CONFIG.studentCount + 1 }, (_, index) =>
    personPose(index, classRoute(leaderDistance - direction * index * gap), time, direction, gait));
}
function playBall(time) {
  const phase = ((time * .33) % 2 + 2) % 2, progress = phase <= 1 ? phase : 2 - phase;
  const left = view.rootX - view.w * .040, right = view.rootX - view.w * .007;
  const height = tripMetrics().height * .70;
  return { x: left + (right - left) * progress, y: view.rootY + view.h * .024 - height * .52 - Math.sin(progress * Math.PI) * height * .68,
    radius: Math.max(1.9, height * .105) };
}
function islandPlayActors(time) {
  const { rootX: x, rootY: y, w, h } = view, swing = swingPose(time);
  const actors = [
    personPose(0, { x: x - w * .060, y: y + h * .006 }, time),
    personPose(1, { x: swing.seatX, y: swing.seatY + tripMetrics().height * TRIP_CONFIG.childHeights[0] * .40 }, time),
    personPose(2, { x: swing.x - tripMetrics().height * .70, y: swing.y }, time),
    personPose(3, { x: x - w * .040, y: y + h * .024 }, time, 1),
    personPose(4, { x: x - w * .007, y: y + h * .024 }, time, -1),
    personPose(5, { x: x - w * .077 + Math.sin(time * .8) * w * .004, y: y + h * (.014 + Math.cos(time * .8) * .002) }, time, Math.cos(time * .8) >= 0 ? 1 : -1, .55)
  ];
  const seat = actors[1], length = swing.seatY - swing.top, seatWidth = swing.width * .46;
  seat.seatMix = 1;
  seat.armTargets = [-1, 1].map(side => ({ x: swing.x + side * seatWidth * .42 + (swing.seatX - swing.x) * .82, y: swing.top + length * .82 }));
  const push = actors[2];
  push.armTargets = [{ x: swing.seatX - seatWidth * .45, y: swing.seatY - 1 }, { x: swing.seatX - seatWidth * .36, y: swing.seatY }];
  const ball = playBall(time);
  for (const index of [3, 4]) {
    const p = actors[index], toward = Math.sign(ball.x - p.x);
    p.armTargets = [-1, 1].map(side => ({ x: p.x + toward * p.height * .22 + side * 1.5, y: p.groundY - p.height * .51 }));
  }
  const chase = actors[5];
  chase.armTargets = [{ x: chase.x - 3, y: chase.y - chase.height * .60 }, { x: chase.x + 5, y: chase.y - chase.height * .86 }];
  return actors;
}
function blendClass(from, to, progress, time) {
  const t = tripSmooth(progress);
  return from.map((source, index) => {
    const target = to[index];
    const pose = personPose(index, { x: source.x + (target.x - source.x) * t,
      y: source.groundY + (target.groundY - source.groundY) * t }, time,
      target.x < source.x ? -1 : 1, Math.max(source.gait * (1 - t) + target.gait * t, Math.sin(progress * Math.PI) * .85));
    pose.seatMix = source.seatMix * (1 - t) + target.seatMix * t;
    if (progress < .08) pose.armTargets = source.armTargets;
    if (progress > .92) pose.armTargets = target.armTargets;
    return pose;
  });
}
function schoolScene(time) {
  const key = `${time}:${view.w}:${view.h}:${wind}`;
  if (key === cachedSchoolKey) return cachedSchool;
  const stage = schoolTripPhase(time), m = tripMetrics();
  let actors, linksOpacity = 0, ballOpacity = 0;
  const gait = Math.min(1, stage.elapsed / .7, (stage.duration - stage.elapsed) / .7);
  switch (stage.name) {
    case 'outbound':
      actors = classLine(15 + (m.arrival - 15) * stage.progress, 1, time, gait); linksOpacity = 1; break;
    case 'disperse':
      actors = blendClass(classLine(m.arrival, 1, time, 0), islandPlayActors(time), stage.progress, time);
      linksOpacity = 1 - tripSmooth(stage.elapsed / .6); ballOpacity = tripSmooth((stage.elapsed - 5) / 1); break;
    case 'play': actors = islandPlayActors(time); ballOpacity = 1; break;
    case 'gather':
      actors = blendClass(islandPlayActors(stage.startTime), classLine(m.returnStart, -1, time, 0), stage.progress, time);
      linksOpacity = tripSmooth(stage.elapsed - stage.duration + 1); ballOpacity = 1 - tripSmooth(stage.elapsed / .6); break;
    case 'return':
      actors = classLine(m.returnStart + (m.returnEnd - m.returnStart) * stage.progress, -1, time, gait); linksOpacity = 1; break;
    case 'rest': actors = classLine(m.returnEnd, -1, time, 0); linksOpacity = 1; break;
    case 'lineup':
      actors = blendClass(classLine(m.returnEnd, -1, time, 0), classLine(15, 1, time, 0), stage.progress, time); break;
  }
  cachedSchoolKey = key;
  cachedSchool = { stage: stage.name, actors, linksOpacity, ballOpacity, ball: playBall(time) };
  return cachedSchool;
}
function drawWalker(c, p, teacher, phase, direction, walking) {
  const h = p.height; c.save(); c.translate(p.x, p.y); c.scale(direction, 1); c.lineCap = 'round';
  // Each foot samples the curved deck separately, keeping every step on it.
  for (let leg = 0; leg < 2; leg++) {
    const step = phase + leg * Math.PI, idleFoot = (leg ? 1 : -1) * h * .06;
    const footX = idleFoot + (Math.sin(step) * h * .16 - idleFoot) * walking;
    const lift = Math.max(0, Math.cos(step)) * h * .055 * walking;
    const surfaceY = p.onBridge ? bridgeFloor(p.x + direction * footX) : p.groundY;
    const footY = surfaceY - p.y - lift;
    const seated = p.seatMix || 0;
    const hipX = (leg ? 1 : -1) * h * .035, hipY = -h * .40;
    c.strokeStyle = teacher ? (leg ? '#263343' : '#384354') : '#c5ab92'; c.lineWidth = h * .061;
    c.beginPath(); c.moveTo(hipX, hipY); c.quadraticCurveTo((hipX + footX) / 2 + h * (.025 + seated * .16), (hipY + footY) / 2 - seated * h * .08, footX + seated * h * .12, footY); c.stroke();
    c.strokeStyle = '#1d2935'; c.lineWidth = h * .055; c.beginPath(); c.moveTo(footX + seated * h * .12 - h * .012, footY); c.lineTo(footX + seated * h * .12 + h * .075, footY); c.stroke();
  }
  if (teacher) {
    // Long hair and a softly flowing ao dai make the teacher recognizable.
    c.fillStyle = '#302b34'; c.beginPath(); c.ellipse(-h * .025, -h * .855, h * .13, h * .16, -.1, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#b4a2c2'; c.beginPath(); c.moveTo(-h * .10, -h * .77); c.quadraticCurveTo(0, -h * .82, h * .10, -h * .77); c.lineTo(h * .09, -h * .49);
    c.quadraticCurveTo(h * .12 + wind * .5, -h * .30, h * .17 + wind * .7, -h * .17); c.lineTo(h * .025, -h * .20); c.lineTo(0, -h * .38); c.lineTo(-h * .035, -h * .19); c.lineTo(-h * .17, -h * .17); c.lineTo(-h * .08, -h * .50); c.closePath(); c.fill();
    c.strokeStyle = '#e5d3e2'; c.lineWidth = .65; c.beginPath(); c.moveTo(h * .025, -h * .77); c.lineTo(h * .025, -h * .25); c.stroke();
  } else {
    // A small backpack, white shirt, and navy shorts identify the pupil.
    c.fillStyle = p.bagColor || '#aa695b'; c.beginPath(); c.roundRect(-h * .22, -h * .73, h * .18, h * .30, 2); c.fill();
    c.fillStyle = '#d7e1df'; c.beginPath(); c.moveTo(-h * .11, -h * .77); c.lineTo(h * .12, -h * .77); c.lineTo(h * .14, -h * .41); c.lineTo(-h * .11, -h * .41); c.closePath(); c.fill();
    c.fillStyle = '#384860'; c.fillRect(-h * .12, -h * .44, h * .27, h * .12);
    c.strokeStyle = '#916052'; c.lineWidth = 1; c.beginPath(); c.moveTo(-h * .06, -h * .73); c.lineTo(-h * .035, -h * .45); c.stroke();
  }
  const headY = -h * .89;
  c.fillStyle = '#d6b79b'; c.beginPath(); c.ellipse(h * .015, headY, h * .105, h * .12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#302d32'; c.beginPath(); c.ellipse(-h * .006, headY - h * .052, h * .112, h * .082, -.1, Math.PI, Math.PI * 2 + .3); c.fill();
  c.fillStyle = '#d6b79b'; c.beginPath(); c.moveTo(h * .095, headY - h * .01); c.lineTo(h * .14, headY + h * .027); c.lineTo(h * .09, headY + h * .055); c.closePath(); c.fill();
  // A middle child holds two hands; only unoccupied arms swing or play.
  for (const worldSide of [-1, 1]) {
    if (p.linkedSides?.has(worldSide)) continue;
    const side = worldSide * direction;
    const shoulderX = side * h * .085, shoulderY = -h * .735;
    const swing = walking ? Math.sin(phase + (teacher ? 0 : .5)) * h * .035 * walking : 0;
    let tx = side * h * .18 + swing, ty = -h * .40;
    const target = p.armTargets?.[worldSide < 0 ? 0 : 1];
    if (target) { tx = (target.x - p.x) * direction; ty = target.y - p.y; }
    const elbowX = (shoulderX + tx) / 2, elbowY = (shoulderY + ty) / 2 + h * .025;
    c.strokeStyle = teacher ? '#b4a2c2' : '#d7e1df'; c.lineWidth = h * .065;
    c.beginPath(); c.moveTo(shoulderX, shoulderY); c.lineTo(elbowX, elbowY); c.stroke();
    c.strokeStyle = '#d6b79b'; c.lineWidth = h * .047;
    c.beginPath(); c.moveTo(elbowX, elbowY); c.lineTo(tx, ty); c.stroke();
  }
  c.restore();
}
function drawClassHands(c, a, b, opacity) {
  const hand = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - Math.min(a.height, b.height) * .61 };
  c.save(); c.globalAlpha *= opacity;
  for (const p of [a, b]) {
    const shoulder = { x: p.x + Math.sign(hand.x - p.x) * p.height * .09, y: p.y - p.height * .735 };
    const elbow = { x: (shoulder.x + hand.x) / 2, y: hand.y - 1.4 };
    c.strokeStyle = '#d6b79b'; c.lineWidth = p.height * .049; c.lineCap = 'round';
    c.beginPath(); c.moveTo(shoulder.x, shoulder.y); c.quadraticCurveTo(elbow.x, elbow.y, hand.x, hand.y); c.stroke();
    c.strokeStyle = p.id === 0 ? '#b4a2c2' : '#d7e1df'; c.lineWidth = p.height * .069;
    c.beginPath(); c.moveTo(shoulder.x, shoulder.y); c.lineTo(elbow.x, (shoulder.y + elbow.y) / 2); c.stroke();
  }
  c.fillStyle = '#ddc0a2'; c.beginPath(); c.arc(hand.x, hand.y, Math.max(.7, Math.min(a.height, b.height) * .036), 0, Math.PI * 2); c.fill(); c.restore();
}
function drawBridgeWalkers(c, time) {
  const group = schoolScene(time), { actors, linksOpacity } = group;
  for (const p of actors) p.linkedSides = new Set();
  if (linksOpacity > .05) for (let i = 0; i < actors.length - 1; i++) {
    actors[i].linkedSides.add(Math.sign(actors[i + 1].x - actors[i].x));
    actors[i + 1].linkedSides.add(Math.sign(actors[i].x - actors[i + 1].x));
  }
  c.save();
  for (const p of [...actors].sort((a, b) => a.groundY - b.groundY)) {
    c.fillStyle = '#0b1b2438'; c.beginPath(); c.ellipse(p.x, p.groundY + 1, p.height * .15, 1.1, 0, 0, Math.PI * 2); c.fill();
    drawWalker(c, p, p.id === 0, p.phase, p.direction, p.gait);
  }
  if (linksOpacity > .001) for (let i = 0; i < actors.length - 1; i++) drawClassHands(c, actors[i], actors[i + 1], linksOpacity);
  if (group.ballOpacity > .001) {
    const b = group.ball; c.save(); c.globalAlpha *= group.ballOpacity;
    c.fillStyle = '#d5b578'; c.beginPath(); c.arc(b.x, b.y, b.radius, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#9b7053'; c.lineWidth = .65; c.beginPath(); c.arc(b.x, b.y, b.radius * .7, -.9, 1.8); c.stroke(); c.restore();
  }
  c.restore();
}
