/**
 * Componentes de movimiento de Camello. Cada uno conserva el nombre de la
 * referencia original (ver ANIMACIONES.md): cmg-number-roll, cmg-confetti-burst,
 * cmg-glass-tilt, hold-down-to-continue y otp-deck.
 */
export const cop = (n) => '$ ' + new Intl.NumberFormat('es-CO').format(n);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** cmg-number-roll: cada dígito es una columna 0-9 que se desplaza hasta su valor. */
export function roll(el, v) {
  const s = cop(v);
  el.setAttribute('aria-label', s);
  const fijar = () => [...el.children].forEach((w, i) => {
    const c = w.firstElementChild;
    if (c && c.classList.contains('rl')) c.style.transform = `translateY(-${s[i]}em)`; else w.textContent = s[i];
  });
  if (el.children.length !== s.length) {
    el.replaceChildren(...[...s].map((ch) => {
      const w = document.createElement('span'); w.className = 'dg'; w.setAttribute('aria-hidden', 'true');
      if (/\d/.test(ch)) { const c = document.createElement('span'); c.className = 'rl'; c.innerHTML = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<i>${n}</i>`).join(''); w.append(c); } else w.textContent = ch;
      return w;
    }));
    requestAnimationFrame(() => requestAnimationFrame(fijar));
  } else fijar();
}

/** cmg-confetti-burst */
export function burst(host, x, y) {
  const cols = ['#FFC83D', '#FF9F1C', '#FF6B1A', '#FFF3E0'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('i'), a = Math.PI * 2 * i / 18 + Math.random() * .4, d = 46 + Math.random() * 70;
    p.className = 'cf';
    p.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % 4]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--r:${Math.random() * 360}deg`;
    host.append(p); setTimeout(() => p.remove(), 1000);
  }
}

/** hold-down-to-continue: el líquido sube mientras se mantiene pulsado; devuelve la función de reinicio. */
export function holdBtn(b, hecho, texto, ms = 1200) {
  let t0 = 0, raf = 0, on = false;
  const t = b.querySelector('.hd-t');
  const set = (p) => { b.style.setProperty('--p', p); b.classList.toggle('hi', p > .5); };
  const parar = (ok) => {
    if (!on) return; on = false; cancelAnimationFrame(raf);
    if (ok) { b.classList.add('done'); t.textContent = '¡Pedido enviado!'; const r = b.getBoundingClientRect(); hecho(r.left + r.width / 2, r.top + r.height / 2); }
    else { b.classList.add('rel'); set(0); }
  };
  const tick = () => { const p = Math.min(1, (performance.now() - t0) / ms); set(p); if (p >= 1) parar(true); else raf = requestAnimationFrame(tick); };
  const ini = () => { if (on || b.classList.contains('done')) return; on = true; b.classList.remove('rel'); t0 = performance.now(); raf = requestAnimationFrame(tick); };
  b.addEventListener('pointerdown', (e) => { if (b.setPointerCapture) b.setPointerCapture(e.pointerId); ini(); });
  ['pointerup', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => parar(false)));
  b.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); ini(); } });
  b.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') parar(false); });
  b.addEventListener('contextmenu', (e) => e.preventDefault());
  return () => { on = false; cancelAnimationFrame(raf); b.classList.remove('done', 'rel', 'hi'); b.style.setProperty('--p', 0); t.textContent = texto; };
}

/** otp-deck: 4 casillas que se abanican, se apilan, comprueban y confirman. */
export function otpDeck(root, verificar, alTerminar) {
  const inp = root.querySelector('input'), sl = [...root.querySelectorAll('.sl')], msg = root.querySelector('.otm');
  let ocupado = false;
  const pintar = () => sl.forEach((s, i) => {
    s.textContent = inp.value[i] || '';
    s.classList.toggle('f', !!inp.value[i]);
    s.classList.toggle('on', i === inp.value.length && document.activeElement === inp);
  });
  inp.addEventListener('focus', pintar); inp.addEventListener('blur', pintar);
  inp.addEventListener('input', async () => {
    inp.value = inp.value.replace(/\D/g, '').slice(0, 4); pintar();
    if (inp.value.length < 4 || ocupado) return;
    ocupado = true; inp.disabled = true; root.classList.remove('bad'); msg.textContent = '';
    root.classList.add('fan'); await wait(420);
    root.classList.remove('fan'); root.classList.add('stack'); await wait(520);
    root.classList.add('chk'); msg.textContent = 'Comprobando…'; await wait(650);
    const r = await verificar(inp.value);
    root.classList.remove('stack', 'chk');
    if (r.ok) { root.classList.add('ok'); msg.textContent = 'Llegada confirmada'; await wait(1100); alTerminar(); }
    else { root.classList.add('bad'); msg.textContent = r.error; inp.value = ''; inp.disabled = false; ocupado = false; pintar(); inp.focus(); }
  });
  return {
    reiniciar() { ocupado = false; inp.disabled = false; inp.value = ''; root.classList.remove('fan', 'stack', 'chk', 'ok', 'bad'); msg.textContent = ''; pintar(); },
    foco() { inp.focus(); },
  };
}

/** cmg-glass-tilt: la tarjeta se inclina hacia el cursor y el reflejo la sigue. */
export function tilt(host, sel) {
  host.addEventListener('pointermove', (e) => {
    const c = host.querySelector(sel); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.setProperty('--rx', -y * 14 + 'deg'); c.style.setProperty('--ry', x * 16 + 'deg');
    c.style.setProperty('--gx', (x + .5) * 100 + '%'); c.style.setProperty('--gy', (y + .5) * 100 + '%');
  });
  host.addEventListener('pointerleave', () => host.querySelectorAll(sel).forEach((c) => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }));
}
