function frame(timestamp) {
  if (document.body.classList.contains('gift-open')) { lastFrame = 0; requestAnimationFrame(frame); return; }
  const time = (timestamp - sceneEpoch) / 1000; sceneTime = reducedMotion.matches ? 0 : time;
  const dt = Math.min(.04, lastFrame ? (timestamp - lastFrame) / 1000 : 1 / 60); lastFrame = timestamp;
  if (rendererReady && !ready && timestamp - startedAt >= growthEnd * 1000 + 150) {
    ready = true; gustButton.disabled = reducedMotion.matches; nextGust = time + .8;
    status.textContent = reducedMotion.matches ? 'Cây đã nở' : 'Lướt ngang cây để tạo gió';

  }
  if (ready && !reducedMotion.matches) {
    if (time >= nextGust) startGust(undefined, time);
    let target = 0;
    if (gust) {
      const phase = (time - gust.start) / gust.duration;
      if (phase < 1) target = gust.strength * Math.pow(Math.sin(Math.max(0, phase) * Math.PI), 1.3) * (1 + .12 * Math.sin(time * 5));
      else gust = null;
    }
    target = Math.max(-1.2, Math.min(1.2, target + pointerForce)); pointerForce *= Math.exp(-dt * 2.4);
    // Damped spring provides a soft bend and a slight recoil after each gust.
    windVelocity += ((target - wind) * 8 - windVelocity * 5.8) * dt;
    wind += windVelocity * dt;
    dustBudget += dt * (3 + Math.abs(wind) * 12);
    petalBudget += dt * (.45 + Math.abs(wind) * 5);
    while (dustBudget >= 1) { createParticle(); dustBudget--; }
    while (petalBudget >= 1) { createParticle(true); petalBudget--; }
    moveParticles(dt, time);
    const message = Math.abs(wind) > .12 ? `${wind > 0 ? '→' : '←'}  Gió ${Math.abs(wind) > .65 ? 'mạnh' : 'nhẹ'} · cánh hoa bay theo gió` : 'Lướt ngang cây để tạo gió';
    if (status.textContent !== message) status.textContent = message;
  }
  drawScenery(sceneTime);
  if (rendererReady) {
    growthClock = reducedMotion.matches ? growthEnd : Math.max(0, (timestamp - startedAt) / 1000);
    moveTree();
  }
  requestAnimationFrame(frame);
}
function restart() {
  ready = false; wind = 0; windVelocity = 0; gust = null; nextGust = Infinity; pointerForce = 0; pointer = null;
  rendererReady = false; rendererGeneration++; growthClock = 0; startedAt = Infinity;
  paint.setTransform(1, 0, 0, 1, 0, 0); paint.clearRect(0, 0, windCanvas.width, windCanvas.height);
  particles.forEach(p => p.g.remove()); particles = []; waterRipples = []; dustBudget = 0; petalBudget = 0;
  gustButton.disabled = true; status.textContent = 'Đang nở hoa…';
  build(); prepareRenderer();
  if (reducedMotion.matches) { ready = true; status.textContent = 'Cây đã nở'; }
}
let hideTimer;
function wakeControls() { if (document.body.classList.contains('gift-open')) return; document.body.classList.remove('wallpaper-mode'); clearTimeout(hideTimer); hideTimer = setTimeout(() => document.body.classList.add('wallpaper-mode'), 4500); }
async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { status.textContent = 'Dùng F11 để bật toàn màn hình'; } wakeControls(); }
document.getElementById('fullscreen').addEventListener('click', fullscreen);
document.getElementById('hide-controls').addEventListener('click', () => { clearTimeout(hideTimer); document.body.classList.add('wallpaper-mode'); });
document.addEventListener('pointermove', wakeControls);
document.addEventListener('pointerdown', () => { if (document.body.classList.contains('wallpaper-mode')) wakeControls(); });
document.addEventListener('keydown', e => { if (document.body.classList.contains('gift-open')) return; if (e.key.toLowerCase() === 'f') fullscreen(); if (e.key.toLowerCase() === 'h') { clearTimeout(hideTimer); document.body.classList.toggle('wallpaper-mode'); } if (e.key === 'Escape') wakeControls(); });
wakeControls();
restart(); requestAnimationFrame(frame);
document.getElementById('replay').addEventListener('click', restart);
gustButton.addEventListener('click', () => startGust(random(.8, 1.15) * (wind < 0 ? -1 : 1)));
document.addEventListener('pointermove', event => {
  if (!ready || reducedMotion.matches || document.body.classList.contains('gift-open')) return;
  const now = performance.now();
  if (pointer && now - pointer.time < 160) {
    const speed = (event.clientX - pointer.x) / Math.max(16, now - pointer.time);
    if (Math.abs(speed) > .06) pointerForce = Math.max(-1.1, Math.min(1.1, pointerForce + speed * .35));
  }
  pointer = { x: event.clientX, time: now };
});
garden.addEventListener('pointerleave', () => pointer = null);
window.addEventListener('resize', () => { resizeCanvas(); if (rendererReady) moveTree(); });
document.addEventListener('visibilitychange', () => { lastFrame = 0; pointer = null; });
reducedMotion.addEventListener('change', restart);

function pauseGiftScene() {
  if (giftPausedAt !== null) return;
  giftPausedAt = performance.now();
  clearTimeout(hideTimer); pointer = null;
  document.body.classList.add('gift-open');
}
function resumeGiftScene(firstReveal = false) {
  const now = performance.now();
  if (firstReveal) { sceneEpoch = now; restart(); }
  else if (giftPausedAt !== null) {
    sceneEpoch += now - giftPausedAt;
    if (Number.isFinite(startedAt)) startedAt += now - Math.max(giftPausedAt, startedAt);
  }
  giftPausedAt = null; lastFrame = 0;
  document.body.classList.remove('gift-open');
  wakeControls();
}
