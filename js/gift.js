// Text is always inserted as text, never as HTML from the editable config.
(() => {
  const config = window.GIFT_CONFIG || {};
  const dialog = document.getElementById('gift-dialog');
  const messageView = document.getElementById('gift-message-view');
  const detailsView = document.getElementById('gift-details-view');
  const message = document.getElementById('gift-message');
  const progress = document.getElementById('gift-progress');
  const previous = document.getElementById('gift-previous');
  const next = document.getElementById('gift-next');
  const password = document.getElementById('gift-password');
  const togglePassword = document.getElementById('gift-toggle-password');
  const text = value => typeof value === 'string' ? value : '';
  const messages = Array.isArray(config.messages) ? config.messages.filter(line => typeof line === 'string' && line.trim()) : [];
  if (!messages.length) messages.push('Em cảm ơn cô đã luôn dìu dắt và đồng hành cùng chúng em.');
  let index = 0, revealed = false;
  document.getElementById('gift-title').textContent = text(config.title) || 'Một món quà nhỏ gửi cô';
  document.getElementById('gift-signature').textContent = text(config.senderName).trim() ? `— ${config.senderName.trim()}` : '— Học trò của cô';
  document.getElementById('gift-username').textContent = text(config.username).trim() || 'Chưa có thông tin';
  password.value = text(config.password);
  togglePassword.disabled = !password.value;
  const rawWebsite = text(config.website).trim();
  const website = document.getElementById('gift-website'), visit = document.getElementById('gift-visit');
  if (rawWebsite) {
    website.textContent = rawWebsite;
    document.getElementById('gift-no-website').hidden = true;
    try {
      const parsed = new URL(/^[a-z][a-z\d+.-]*:/i.test(rawWebsite) ? rawWebsite : `https://${rawWebsite}`);
      if (['https:', 'http:'].includes(parsed.protocol)) {
        website.href = parsed.href; visit.href = parsed.href; visit.hidden = false;
      }
    } catch { /* An invalid address remains readable text, without navigation. */ }
  } else website.hidden = true;
  function maskPassword() { password.type = 'password'; togglePassword.textContent = 'Hiện'; togglePassword.setAttribute('aria-label', 'Hiện mật khẩu'); togglePassword.setAttribute('aria-pressed', 'false'); }
  const dots = messages.map((_, position) => {
    const button = document.createElement('button'); button.type = 'button';
    button.setAttribute('aria-label', `Đọc lời nhắn ${position + 1} trên ${messages.length}`);
    button.addEventListener('click', () => showMessage(position)); progress.append(button); return button;
  });
  function showMessage(position) {
    index = Math.max(0, Math.min(messages.length - 1, position));
    messageView.hidden = false; detailsView.hidden = true; maskPassword();
    message.textContent = messages[index];
    message.classList.remove('gift-message-enter');
    void message.offsetWidth; message.classList.add('gift-message-enter');
    previous.disabled = index === 0;
    next.textContent = index === messages.length - 1 ? 'Nhận món quà →' : 'Tiếp tục →';
    dots.forEach((dot, i) => { if (i === index) dot.setAttribute('aria-current', 'step'); else dot.removeAttribute('aria-current'); });
  }
  function showDetails() { messageView.hidden = true; detailsView.hidden = false; maskPassword(); document.getElementById('gift-reveal').focus(); }
  function openCard() { pauseGiftScene(); showMessage(0); dialog.showModal(); next.focus(); }
  function revealScene() { maskPassword(); dialog.close(); resumeGiftScene(!revealed); revealed = true; }
  previous.addEventListener('click', () => showMessage(index - 1));
  next.addEventListener('click', () => { if (index < messages.length - 1) showMessage(index + 1); else showDetails(); });
  document.getElementById('gift-skip').addEventListener('click', showDetails);
  document.getElementById('gift-read-again').addEventListener('click', () => { showMessage(0); next.focus(); });
  document.getElementById('gift-reveal').addEventListener('click', revealScene);
  document.getElementById('gift-open').addEventListener('click', openCard);
  togglePassword.addEventListener('click', () => {
    const visible = password.type === 'password'; password.type = visible ? 'text' : 'password';
    togglePassword.textContent = visible ? 'Ẩn' : 'Hiện';
    togglePassword.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    togglePassword.setAttribute('aria-pressed', String(visible));
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); revealScene(); });
  dialog.addEventListener('keydown', event => {
    if (messageView.hidden || event.target.tagName === 'INPUT') return;
    if (event.key === 'ArrowRight') { event.preventDefault(); next.click(); }
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); previous.click(); }
  });
  openCard();
})();
