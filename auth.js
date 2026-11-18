/**
 * Cuentas de Camello (demo sin servidor): todo vive en localStorage.
 * - La contraseña nunca se guarda: se guarda PBKDF2-SHA256 (210.000 iteraciones) con sal única.
 * - 5 intentos fallidos bloquean 5 minutos; el mensaje es igual exista o no la cuenta.
 * - La sesión vence a los 30 días sin uso y se cierra en todas las pestañas.
 */
const USUARIOS = 'camello:usuarios';
const SESION = 'camello:sesion';
const BLOQUEO = 'camello:bloqueo';
const COMUNES = ['12345678', 'password1', 'contrasena1', 'contraseña1', 'qwerty123', 'camello123', 'abc12345', 'admin1234'];
const enc = new TextEncoder();

const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const bytes = (h) => Uint8Array.from(h.match(/../g) || [], (x) => parseInt(x, 16));
const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const publico = (u) => ({ id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol, oficio: u.oficio, anios: u.anios });

async function derivar(clave, sal) {
  const k = await crypto.subtle.importKey('raw', enc.encode(clave), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: 210000 }, k, 256));
}

export function claveDebil(p, nombre, correo) {
  if (p.length < 8 || !/[a-zA-Z]/.test(p) || !/\d/.test(p)) return 'La contraseña necesita 8 caracteres, con letras y números.';
  const q = p.toLowerCase();
  if (COMUNES.includes(q) || /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef)/.test(q)) return 'Esa contraseña es muy fácil de adivinar.';
  for (const t of [nombre, correo.split('@')[0]]) {
    if (t.length >= 3 && q.includes(t.toLowerCase())) return 'La contraseña no puede contener tu nombre ni tu correo.';
  }
  return '';
}

export async function registrar(d) {
  const correo = d.correo.trim().toLowerCase();
  const lista = leer(USUARIOS, []);
  if (lista.some((u) => u.correo === correo)) return { error: 'Ese correo ya tiene una cuenta. Prueba a entrar.' };
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const maestro = d.rol === 'maestro';
  const u = {
    id: crypto.randomUUID(), nombre: d.nombre, correo, rol: maestro ? 'maestro' : 'cliente',
    oficio: maestro ? d.oficio : '', anios: maestro ? d.anios : 0,
    sal: hex(sal), clave: await derivar(d.clave, sal), creado: Date.now(),
  };
  lista.push(u);
  if (!guardar(USUARIOS, lista)) return { error: 'No pudimos guardar tu cuenta: el almacenamiento está lleno o bloqueado.' };
  guardar(SESION, { id: u.id, t: Date.now() });
  return { user: publico(u) };
}

export async function ingresar(correo, clave) {
  const m = correo.trim().toLowerCase();
  const bloqueos = leer(BLOQUEO, {});
  const b = bloqueos[m] || { n: 0, h: 0 };
  const falta = b.h - Date.now();
  if (falta > 0) return { error: `Demasiados intentos. Espera ${Math.ceil(falta / 60000)} min.` };
  const u = leer(USUARIOS, []).find((x) => x.correo === m);
  // Se calcula el hash aunque la cuenta no exista, para que tarde lo mismo.
  const h = await derivar(clave, u ? bytes(u.sal) : crypto.getRandomValues(new Uint8Array(16)));
  if (!u || h !== u.clave) {
    b.n += 1;
    if (b.n >= 5) { b.n = 0; b.h = Date.now() + 5 * 60000; }
    bloqueos[m] = b; guardar(BLOQUEO, bloqueos);
    return { error: 'Correo o contraseña incorrectos.' };
  }
  delete bloqueos[m]; guardar(BLOQUEO, bloqueos);
  guardar(SESION, { id: u.id, t: Date.now() });
  return { user: publico(u) };
}

export function sesion() {
  const s = leer(SESION, null);
  if (!s) return null;
  const u = leer(USUARIOS, []).find((x) => x.id === s.id);
  if (!u || Date.now() - s.t > 30 * 864e5) { cerrar(); return null; }
  guardar(SESION, { id: s.id, t: Date.now() });
  return publico(u);
}

export function cerrar() { try { localStorage.removeItem(SESION); } catch { /* sin almacenamiento */ } }

/** Si la sesión se cierra en otra pestaña, avisa para cerrarla también aquí. */
export function alCerrarEnOtraPestana(fn) {
  addEventListener('storage', (e) => { if (e.key === SESION && !e.newValue) fn(); });
}
