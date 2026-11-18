/**
 * Pedidos de Camello (demo): el estado se calcula con el tiempo transcurrido
 * (unos 45 s en total). Con servidor, `estado()` lo devolvería la API.
 */
const CLAVE = 'camello:pedidos';
export const ESTADOS = ['Buscando maestro', 'Aceptado', 'En camino', 'En proceso', 'Finalizado'];
const INICIO = [0, 8, 18, 30, 45]; // segundos en que empieza cada estado
const MAX = 200;

const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; } };
function guardar(l) {
  try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch {
    try { localStorage.setItem(CLAVE, JSON.stringify(l.slice(0, 100))); } catch { /* almacenamiento lleno */ }
  }
}

export function estado(p) {
  const s = (Date.now() - p.t) / 1000;
  let e = 0;
  INICIO.forEach((t, i) => { if (s >= t) e = i; });
  return e;
}

export const resta = (p) => Math.max(1, Math.ceil(INICIO[4] - (Date.now() - p.t) / 1000));

export const todos = (uid) => leer().filter((p) => p.uid === uid);

export function crear(uid, servicio, maestro, pago, cli) {
  const cod = String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));
  const l = leer();
  l.unshift({ id: crypto.randomUUID(), uid, cli, serv: servicio, mae: maestro[0], precio: maestro[4], pago, t: Date.now(), cod });
  guardar(l.slice(0, MAX));
}

export function pagar(id) {
  const l = leer(), p = l.find((x) => x.id === id);
  if (p && !p.pagado) { p.pagado = Date.now(); guardar(l); }
}

/** Servicios que un maestro todavía puede atender (de todos los clientes de este navegador). */
export const activos = () => leer().filter((p) => !p.llegada && estado(p) < 4);

export function ganado(mid) {
  const hoy = new Date().toDateString();
  const l = leer().filter((p) => p.mid === mid && p.llegada && new Date(p.llegada).toDateString() === hoy);
  return { n: l.length, total: l.reduce((a, p) => a + p.precio, 0) };
}

/** Confirma la llegada con el código de 4 números del cliente: 5 intentos y bloqueo de 5 min. */
export function confirmarLlegada(id, cod, mid) {
  const K = 'camello:otp:' + id;
  let b; try { b = JSON.parse(localStorage.getItem(K)) || { n: 0, h: 0 }; } catch { b = { n: 0, h: 0 }; }
  if (b.h > Date.now()) return { error: `Demasiados intentos. Espera ${Math.ceil((b.h - Date.now()) / 60000)} min.` };
  const l = leer(), p = l.find((x) => x.id === id);
  if (!p || p.llegada) return { error: 'Este servicio ya no está disponible.' };
  if (p.cod !== cod) {
    b.n += 1; let quedan = 5 - b.n;
    if (b.n >= 5) { b = { n: 0, h: Date.now() + 300000 }; quedan = 0; }
    try { localStorage.setItem(K, JSON.stringify(b)); } catch { /* sin almacenamiento */ }
    return { error: quedan ? `Código incorrecto. Te quedan ${quedan} intentos.` : 'Demasiados intentos. Espera 5 min.' };
  }
  p.llegada = Date.now(); p.mid = mid; guardar(l);
  try { localStorage.removeItem(K); } catch { /* sin almacenamiento */ }
  return { ok: true };
}

/** Servicios que este maestro ya atendió (llegada confirmada). */
export const delMaestro = (mid) => leer().filter((p) => p.mid === mid);
