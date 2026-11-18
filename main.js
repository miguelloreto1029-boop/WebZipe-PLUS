import { sesion, registrar, ingresar, cerrar, claveDebil, alCerrarEnOtraPestana } from './auth.js';
import { ESTADOS, estado, resta, todos, crear, pagar, activos, ganado, confirmarLlegada, delMaestro } from './pedidos.js';
import { cop, roll, burst, holdBtn, otpDeck, tilt } from './motion.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

// Servicios: [nombre, ícono, palabras clave, precio de referencia]
const S = [
  ['Cerrajero', 'key', 'chapa llave puerta cerradura', 'desde $ 35.000'],
  ['Plomero', 'drop', 'fuga tubo agua grifo baño', 'desde $ 40.000'],
  ['Electricista', 'bolt', 'luz corto cable toma', 'desde $ 38.000'],
  ['Pintor', 'roll', 'pared pintura', 'desde $ 60.000'],
  ['Carpintero', 'ham', 'madera puerta mueble', 'desde $ 50.000'],
  ['Limpieza', 'spark', 'aseo limpieza', 'desde $ 45.000'],
  ['Electrodomésticos', 'gear', 'nevera lavadora estufa', 'desde $ 42.000'],
];
// Maestros de ejemplo: [nombre, calificación, distancia, llegada, precio]
const MAE = [['Marta Ruiz', '4,9', '1,2 km', '8 min', 45000], ['Jairo Peña', '4,8', '2,0 km', '12 min', 42000], ['Luz Dary Mora', '4,7', '2,6 km', '15 min', 40000]];
const PAGOS = [['Visa •••• 4242', 'Tarjeta de prueba'], ['Nequi', 'Billetera digital'], ['Efectivo', 'Pago al maestro']];
const IC = { home: 'home', ped: 'list', bil: 'wal', cta: 'usr' };

const c = $('#c'), g = $('#g'), app = $('#app'), sh = $('#sh'), ot = $('#ot'), nav = $('#nav');
let usr = null, mode = 'reg', busy = false, cur = 0, lim = 20, firmaM = '', last, tm, recargando = false, idx = 0, otPed = null, pt = 'mouse', vista = 'home';

// ---------- Construcción ----------
const GC = ['255,200,61', '255,159,28', '255,107,26'];
$('#grid').replaceChildren(...[[0, 1], [2, 3], [4, 5], [6]].map((f, r) => {
  const row = el('div', 'bento-row rev'); row.style.setProperty('--i', r + 5);
  f.forEach((i) => {
    const s = S[i], b = el('button', 'gl tile glowing-corner'), ic = el('span', 'ic'), tt = el('span', 'tt');
    b.dataset.i = i; b.style.setProperty('--gc', GC[i % 3]);
    ic.innerHTML = `<svg class="i"><use href="#${s[1]}"/></svg>`;
    tt.append(el('b', '', s[0]), el('small', '', s[3]), el('span', 'det', s[2].split(' ').slice(0, 3).join(' · ') + ' → Pedir'));
    b.append(ic, tt); row.append(b);
  });
  return row;
}));
$('#of').replaceChildren(...S.map((s) => el('option', '', s[0])));
$('#mrs').replaceChildren(...MAE.map((m, i) => {
  const l = el('label', 'mr glowing-corner'), r = el('input'), d = el('div');
  r.type = 'radio'; r.name = 'mm'; r.checked = !i;
  d.append(el('b', '', m[0]), el('small', '', `★ ${m[1]} · ${m[2]} · llega en ${m[3]}`));
  l.append(r, d, el('b', 'tn', cop(m[4])));
  return l;
}));
$('#sbc').classList.add('only-c');
$('#cs').replaceChildren(...PAGOS.map((p, k) => {
  const w = el('div', 'cs-card'), i = el('div', 'cs-in');
  w.dataset.c = k; w.append(i);
  i.append(el('span', 'cs-tag', 'Predeterminado'), el('span', 'mono', p[1].toUpperCase()), el('b', '', p[0]));
  return w;
}));
tilt($('#cs'), '.cs-card[data-p="0"] .cs-in');

// ---------- Utilidades ----------
function toast(x) { const t = $('#t'); t.textContent = x; t.classList.add('show'); clearTimeout(tm); tm = setTimeout(() => t.classList.remove('show'), 2800); }
const err = (x) => { $('#err').textContent = x; };
function show(id) { $$('.pane').forEach((p) => p.classList.toggle('on', p.id === id)); $('#' + id).querySelector('h1,h2').focus({ preventScroll: true }); }
function setMode(m) {
  mode = m; $('#pa').dataset.mode = m;
  $$('.seg button').forEach((b) => b.setAttribute('aria-selected', b.dataset.m === m));
  $('#go').textContent = m === 'reg' ? 'Crear cuenta' : 'Entrar';
  $('#p').autocomplete = m === 'reg' ? 'new-password' : 'current-password';
  err('');
}
function origin(e) { const b = e.getBoundingClientRect(); g.style.setProperty('--x', b.left + b.width / 2 + 'px'); g.style.setProperty('--y', b.top + b.height / 2 + 'px'); }

// ---------- Navegación (liquid-navigation · animated-navbar · glassy-sidebar-v3) ----------
function go(n, ping) {
  vista = n;
  $$('.v').forEach((v) => { v.hidden = v.id !== 'v-' + n; v.style.display = v.hidden ? '' : 'flex'; });
  $$('#nav button[data-v]').forEach((b) => b.setAttribute('aria-current', b.dataset.v === n ? 'page' : 'false'));
  const bs = $$('#nav button[data-v]').filter((b) => b.offsetParent), liq = $('#liq');
  nav.style.setProperty('--n', bs.length || 4);
  nav.style.setProperty('--pos', Math.max(0, bs.findIndex((b) => b.dataset.v === n)));
  liq.innerHTML = `<svg class="i"><use href="#${IC[n]}"/></svg>`;
  g.dataset.tab = n;
  if (ping) { liq.classList.remove('ping'); void liq.offsetWidth; liq.classList.add('ping'); }
  $('#gs').scrollTo({ top: 0 });
  if (n === 'ped') { const gs = $('#gasto'); gs.classList.remove('go'); void gs.offsetWidth; gs.classList.add('go'); }
  pintar();
}
$$('#nav button[data-v]').forEach((b) => { b.onclick = () => go(b.dataset.v, true); });
$('#rail').onclick = () => {
  const r = nav.classList.toggle('rail'); g.classList.toggle('rail', r);
  $('#rail').setAttribute('aria-expanded', String(!r)); $('#rail').setAttribute('aria-label', r ? 'Expandir menú' : 'Contraer menú');
};
$('#out2').onclick = () => salir(true);

// ---------- Cuentas ----------
$('#toReg').onclick = () => { setMode('reg'); show('pa'); };
$('#toLog').onclick = () => { setMode('login'); show('pa'); };
$('#back').onclick = () => show('pw');
$$('.seg button').forEach((b) => { b.onclick = () => setMode(b.dataset.m); });
$$('input[name=r]').forEach((r) => { r.onchange = () => { $('#pa').dataset.role = r.value; }; });
$('#f').onsubmit = async (e) => {
  e.preventDefault();
  if (busy) return;
  const reg = mode === 'reg', n = $('#n').value.trim().slice(0, 60), m = $('#m').value.trim(), p = $('#p').value;
  let er = '';
  if (!window.crypto || !crypto.subtle) er = 'Tu navegador necesita https o localhost para guardar contraseñas de forma segura.';
  else if (reg && !n) er = 'Escribe tu nombre.';
  else if (!/^\S+@\S+\.\S+$/.test(m)) er = 'Revisa tu correo.';
  else if (reg) er = claveDebil(p, n, m);
  else if (!p) er = 'Escribe tu contraseña.';
  if (er) return err(er);
  busy = true; $('#go').disabled = true; err('');
  const r = reg
    ? await registrar({ nombre: n, correo: m, clave: p, rol: $('input[name=r]:checked').value, oficio: $('#of').value, anios: Math.max(0, Math.min(60, +$('#ye').value || 0)) })
    : await ingresar(m, p);
  busy = false; $('#go').disabled = false;
  if (r.error) return err(r.error);
  enter(r.user, true);
};
function enter(u, anim) {
  usr = u; lim = 20; firmaM = ''; lista.f = '';
  app.dataset.role = u.rol;
  $$('.nm').forEach((x) => { x.textContent = u.nombre; });
  $('#av').textContent = u.nombre[0].toUpperCase();
  $('#hi').textContent = u.rol === 'maestro' ? 'Tu jornada' : '¿Qué necesitas hoy?';
  $('#mail').textContent = u.correo;
  $('#rol').textContent = u.rol === 'maestro' ? 'Maestro' + (u.oficio ? ' · ' + u.oficio : '') : 'Cliente';
  $('#lpn').textContent = u.rol === 'maestro' ? 'Aún no has atendido servicios.' : 'Aún no has pedido nada.';
  $('#sw').setAttribute('aria-checked', 'false'); $('#st').textContent = 'Desconectado';
  idx = Math.min(2, +(localStorage.getItem('camello:pago:' + u.id) || 0)); asignar();
  go('home');
  if (anim) {
    origin($('#go')); c.classList.add('melt'); g.inert = false;
    requestAnimationFrame(() => g.classList.add('on'));
    setTimeout(() => { c.inert = true; c.style.visibility = 'hidden'; $('#hi').focus({ preventScroll: true }); }, 1000);
  } else {
    g.style.transition = 'none'; c.inert = true; c.style.visibility = 'hidden'; g.inert = false; g.classList.add('on');
    requestAnimationFrame(() => requestAnimationFrame(() => { g.style.transition = ''; }));
  }
}
function salir(manual) {
  if (manual) origin($('#out'));
  cerrar(); usr = null;
  c.style.visibility = ''; c.inert = false; c.classList.remove('melt');
  g.classList.remove('on'); g.inert = true;
  [sh, ot].forEach((o) => { o.classList.remove('open'); o.inert = true; });
  $('#f').reset(); $('#pa').dataset.role = 'cliente'; setMode('reg'); show('pw');
}
$('#out').onclick = () => salir(true);
alCerrarEnOtraPestana(() => { if (usr) salir(false); });

// ---------- Pedidos, gasto y panel del maestro ----------
function fila(p, cli) {
  const li = el('div', 'gl li'), d = el('div'), dr = el('div', 'pr'), e = estado(p);
  d.append(el('b', '', `${p.serv} · ${p.mae}`), el('span', '', `${new Date(p.t).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${ESTADOS[e]}${p.pago ? ' · ' + p.pago : ''}`));
  dr.append(el('b', 'tn', cop(p.precio)));
  if (cli && e === 4) {
    if (p.pagado) dr.append(el('span', 'pagado', '✓ Pagado'));
    else {
      const b = el('button', 'cmg-button-pay', 'Pagar'); b.type = 'button';
      b.onclick = () => {
        b.classList.add('busy');
        setTimeout(() => {
          pagar(p.id); const r = b.getBoundingClientRect(); burst(g, r.left + r.width / 2, r.top + r.height / 2);
          b.replaceWith(el('span', 'pagado', '✓ Pagado')); lista.f = ''; toast('Pago simulado realizado');
        }, 1400);
      };
      dr.append(b);
    }
  }
  li.append(d, dr);
  return li;
}
function pintar() {
  if (!usr) return;
  const cli = usr.rol === 'cliente', bdg = $('#bdg');
  if (cli) {
    const l = todos(usr.id), a = l.find((p) => estado(p) < 4), k = $('#cur');
    k.hidden = !a;
    if (a) {
      const e = estado(a);
      $('#curCode').textContent = a.cod; $('#curCode').setAttribute('aria-label', 'Código de seguridad ' + [...a.cod].join(' '));
      $$('#curBar i').forEach((b, i) => b.classList.toggle('on', i <= e));
      $('#curTxt').textContent = `${a.mae} · ${ESTADOS[e]}`; $('#curEta').textContent = `${resta(a)} s`;
    }
    const n = l.filter((p) => estado(p) < 4).length; bdg.hidden = !n; bdg.textContent = n;
    lista(l, true);
    if (vista === 'ped') gasto(l);
  } else {
    const a = activos(), conn = $('#sw').getAttribute('aria-checked') === 'true';
    bdg.hidden = !a.length; bdg.textContent = a.length;
    $('#mq').hidden = !conn;
    const f = a.map((p) => p.id + estado(p)).join();
    if (f !== firmaM) {
      firmaM = f;
      $('#mqL').replaceChildren(...a.map((p) => {
        const e = estado(p), r = el('div', 'mqr'), d = el('div'), b = el('button', 'mq-b', e >= 2 ? 'Confirmar llegada' : 'Esperando…');
        d.append(el('b', '', `${p.serv} · ${p.cli || 'Cliente'}`), el('span', '', `${ESTADOS[e]} · ${cop(p.precio)}`));
        b.type = 'button'; b.disabled = e < 2; b.onclick = () => abrirOtp(p);
        r.append(d, b); return r;
      }));
      $('#mqN').hidden = a.length > 0;
    }
    const gn = ganado(usr.id); roll($('#ganT'), gn.total); $('#ganN').textContent = `${gn.n} servicio${gn.n === 1 ? '' : 's'}`;
    lista(delMaestro(usr.id), false);
  }
}
function lista(l, cli) {
  const q = norm($('#qp').value.trim());
  const vis = l.filter((p) => !q || norm(`${p.serv} ${p.mae} ${p.pago || ''} ${ESTADOS[estado(p)]}`).includes(q));
  const f = vis.length + ':' + lim + ':' + q + ':' + vis.slice(0, lim).map((p) => estado(p) + (p.pagado ? 'p' : '')).join();
  if (f === lista.f) return;
  lista.f = f;
  $('#lpn').hidden = vis.length > 0; $('#mas').hidden = vis.length <= lim;
  $('#lpn').textContent = l.length ? 'Ningún pedido coincide con tu búsqueda.' : (cli ? 'Aún no has pedido nada.' : 'Aún no has atendido servicios.');
  $('#lp').replaceChildren(...vis.slice(0, lim).map((p) => fila(p, cli)));
}
function gasto(l) {
  const dias = [...Array(7)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 6 + i); return d.getTime(); });
  const tot = dias.map((t) => l.filter((p) => p.t >= t && p.t < t + 864e5).reduce((a, p) => a + p.precio, 0)), mx = Math.max(...tot, 1);
  $('#gln').setAttribute('d', tot.map((v, i) => `${i ? 'L' : 'M'}${i * 50} ${62 - v / mx * 54}`).join(''));
  roll($('#gtot'), tot.reduce((a, b) => a + b, 0));
}
setInterval(() => { if (!document.hidden) pintar(); }, 1500);
addEventListener('storage', (e) => { if (usr && e.key && e.key.startsWith('camello:ped')) pintar(); });
$('#mas').onclick = () => { lim += 20; lista.f = ''; pintar(); };
$('#qp').oninput = () => { lista.f = ''; pintar(); };
$('#sw').onclick = (e) => {
  const on = e.currentTarget.getAttribute('aria-checked') !== 'true';
  e.currentTarget.setAttribute('aria-checked', on);
  $('#st').textContent = on ? 'Conectado · recibes servicios' : 'Desconectado'; firmaM = ''; pintar();
};

// ---------- Búsqueda de servicios (modern-searchbar) ----------
const msb = $('#msb');
function minimizar(min) { msb.classList.toggle('min', min); $('#q').disabled = min; $('#msX').disabled = min; $('#msBtn').setAttribute('aria-expanded', String(!min)); }
function filtrar() {
  const v = norm($('#q').value.trim()); let k = 0;
  $$('.tile').forEach((t) => {
    const s = norm(S[+t.dataset.i][0] + ' ' + S[+t.dataset.i][2]);
    const m = !v || s.includes(v) || v.split(/\s+/).some((w) => w.length > 3 && s.includes(w));
    t.hidden = !m; k += m;
  });
  $$('.bento-row').forEach((r) => { r.hidden = [...r.children].every((x) => x.hidden); });
  $('#none').hidden = k > 0;
}
$('#q').oninput = filtrar;
$('#msX').onclick = () => { $('#q').value = ''; filtrar(); minimizar(true); $('#msBtn').focus(); };
$('#msBtn').onclick = () => { if (msb.classList.contains('min')) { minimizar(false); setTimeout(() => $('#q').focus(), 320); } };

// ---------- Hoja de maestros (hold-down-to-continue · cmg-number-roll) ----------
document.addEventListener('pointerdown', (e) => { pt = e.pointerType; }, true);
document.addEventListener('keydown', () => { pt = 'key'; }, true);
const reiniciarHold = holdBtn($('#shOk'), (x, y) => {
  burst(g, x, y);
  const i = Math.max(0, $$('.mr input').findIndex((r) => r.checked)), m = MAE[i];
  crear(usr.id, S[cur][0], m, PAGOS[idx][0], usr.nombre);
  setTimeout(() => { cerrarHoja(); lista.f = ''; pintar(); toast(`Pediste ${S[cur][0]} con ${m[0]} · pago simulado`); }, 900);
}, 'Mantén pulsado para pedir');
function abrir(i) {
  cur = i; last = document.activeElement; $('#shT').textContent = S[i][0];
  $$('.tile.open').forEach((t) => t.classList.remove('open'));
  $$('.mr input').forEach((r, k) => { r.checked = !k; }); roll($('#shTot'), MAE[0][4]); reiniciarHold();
  sh.inert = false; sh.classList.add('open'); $('#shX').focus();
}
function cerrarHoja() { sh.classList.remove('open'); sh.inert = true; if (last) last.focus(); }
$('#mrs').onchange = () => roll($('#shTot'), MAE[Math.max(0, $$('.mr input').findIndex((r) => r.checked))][4]);
$('#grid').onclick = (e) => {
  const t = e.target.closest('.tile'); if (!t) return;
  if (pt === 'touch' && !t.classList.contains('open')) { $$('.tile.open').forEach((x) => x.classList.remove('open')); t.classList.add('open'); return; }
  abrir(+t.dataset.i);
};
$('#shX').onclick = cerrarHoja;
sh.onclick = (e) => { if (e.target === sh) cerrarHoja(); };

// ---------- Código de llegada del maestro (otp-deck) ----------
const deck = otpDeck($('#ot .otp-deck'), async (code) => confirmarLlegada(otPed.id, code, usr.id), () => { cerrarOtp(); lista.f = ''; pintar(); toast('Servicio confirmado'); });
function abrirOtp(p) {
  otPed = p; last = document.activeElement;
  $('#otS').textContent = `${p.serv} · ${p.cli || 'Cliente'}. Pide al cliente su código de 4 números.`;
  deck.reiniciar(); ot.inert = false; ot.classList.add('open'); setTimeout(() => deck.foco(), 350);
}
function cerrarOtp() { ot.classList.remove('open'); ot.inert = true; if (last) last.focus(); }
$('#otX').onclick = cerrarOtp;
ot.onclick = (e) => { if (e.target === ot) cerrarOtp(); };
addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (sh.classList.contains('open')) cerrarHoja(); else if (ot.classList.contains('open')) cerrarOtp(); } });

// ---------- Billetera (card-slider · cmg-glass-tilt) ----------
function asignar() {
  $$('#cs .cs-card').forEach((w, k) => { w.dataset.p = (k - idx + 3) % 3; w.setAttribute('aria-hidden', String((k - idx + 3) % 3 !== 0)); });
  $('#csn').textContent = `Pagarás con ${PAGOS[idx][0]}.`;
}
function ciclar() {
  const top = $('#cs .cs-card[data-p="0"]'); if (!top) return;
  top.classList.add('fly');
  setTimeout(() => {
    top.classList.remove('fly'); idx = (idx + 1) % 3; asignar();
    try { localStorage.setItem('camello:pago:' + usr.id, idx); } catch { /* sin almacenamiento */ }
  }, 260);
}
$('#cs').onclick = ciclar;
$('#cs').onkeydown = (e) => { if (['Enter', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); ciclar(); } };

// ---------- Pasar el cursor: glowing-corner ----------
document.addEventListener('pointermove', (e) => {
  const t = e.target.closest && e.target.closest('.glowing-corner');
  if (t) { const r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); }
});

setMode('reg');
const u0 = sesion();
if (u0) enter(u0, false);

if ('serviceWorker' in navigator) {
  const tenia = navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (tenia && !recargando) { recargando = true; location.reload(); } });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
