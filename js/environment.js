function startGust(strength = random(.35, .85) * (Math.random() < .5 ? -1 : 1), time = (performance.now() - sceneEpoch) / 1000) {
  if (!ready || reducedMotion.matches) return;
  gust = { start: time, duration: random(3.4, 5.8), strength };
  nextGust = time + gust.duration + random(2.5, 6);
}
function createParticle(petal = false) {
  if (particles.length >= 110) return;
  let x, y;
  if (petal) {
    const source = flowerTips[Math.floor(Math.random() * flowerTips.length)];
    const theta = (source.angle + windAngle(source.x, source.y)) * Math.PI / 180;
    const base = worldPoint(source.x, source.y);
    const p = { x: base.x + Math.sin(theta) * 76 * source.scale, y: base.y - Math.cos(theta) * 76 * source.scale };
    x = p.x; y = p.y;
  } else {
    x = random(100, 875); y = random(85, 700);
  }
  const g = el('g', { class: petal ? 'falling-petal' : 'mote' }, weather);
  const size = petal ? random(.48, 1) : random(.6, 1.5);
  if (petal) el('path', { d: 'M0 -9 C11 -12 14 0 0 12 C-9 5 -10 -4 0 -9', fill: Math.random() < .5 ? '#ff9dd8' : '#ffc9ee' }, g);
  else el('circle', { r: size, fill: Math.random() < .65 ? '#94fff0' : '#ffd3f0' }, g);
  particles.push({ g, x, y, size, petal, age: 0, life: petal ? random(24, 34) : random(9, 16), vx: wind * 65 + random(-9, 9), vy: petal ? random(65, 95) : random(8, 17), rotation: random(0, 360), spin: random(-65, 65), phase: random(0, 7), waterY: (view.rootY + random(.065, .105) * view.h - screenMatrix.f) / screenMatrix.d, onWater: false });
}
function moveParticles(dt, time) {
  for (let i = waterRipples.length - 1; i >= 0; i--) { waterRipples[i].age += dt; if (waterRipples[i].age > waterRipples[i].life) waterRipples.splice(i, 1); }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.age += dt;
    if (p.onWater) {
      p.vx += (wind * 22 - p.vx) * dt * .8; p.x += p.vx * dt; p.rotation += p.spin * dt * .08;
    } else {
      p.vx += (wind * (p.petal ? 100 : 145) - p.vx) * dt * (p.petal ? 1.3 : 1.8);
      p.x += (p.vx + Math.sin(time * 2 + p.phase) * (p.petal ? 12 : 5)) * dt;
      p.vy += dt * (p.petal ? 4 : .25); p.y += p.vy * dt; p.rotation += (p.spin + wind * 75) * dt;
      if (p.petal && p.y >= p.waterY) {
        const x = screenMatrix.a * p.x + screenMatrix.e, y = screenMatrix.d * p.waterY + screenMatrix.f;
        if (lakeTest.isPointInPath(lakeOutline, x, y, 'evenodd')) {
          p.onWater = true; p.y = p.waterY; p.vy = 0; p.vx *= .25; p.age = 0; p.life = random(4, 7);
          waterRipples.push({ x: x / view.w, y: y / view.h, age: 0, life: random(2.4, 3.6) });
          if (waterRipples.length > 45) waterRipples.shift();
        }
      }
    }
    const screenX = screenMatrix.a * p.x + screenMatrix.e, screenY = screenMatrix.d * p.y + screenMatrix.f;
    if (p.age > p.life || screenY > view.h + 20 || screenX < -20 || screenX > view.w + 20) { p.g.remove(); particles.splice(i, 1); continue; }
    p.alpha = Math.min(1, p.onWater ? 1 : p.age * 2, (p.life - p.age) / 2) * (p.petal ? .85 : .65);
  }
}
