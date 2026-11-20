/**
 * MODO DE PRUEBA LOCAL — existe solo en esta carpeta (la versión «cristal»).
 *
 * Esta versión no se publica: se ejecuta en el computador para mirar cómo se
 * ve y cómo se comporta la interfaz. Por eso no hace falta ni descargar nada
 * ni tener internet: los datos de ejemplo y la "nube" viven en el navegador.
 *
 * Qué hace:
 *   - crea una sesión de prueba (camello:nube) con una cuenta de cliente;
 *   - siembra las tablas de la "nube" (camello:demo:*) con pedidos, maestros,
 *     cupones, lugares, chat y pagos de ejemplo;
 *   - dbDemo responde las mismas funciones que services/nube.js, pero con esas
 *     tablas locales. Las pantallas no cambian ni se enteran.
 *
 * El resto de la app (js/services, js/screens, js/ui) es el código real.
 */
import { almacen } from './services/almacen.js';
import { usuarioNube } from './services/nube.js';

export const DEMO = true;
export const ID_DEMO = 'demo-cliente';
const CORREO_DEMO = 'marta@camello.local';
const CLAVE_SESION = 'camello:nube';
const P = 'camello:demo:';

const leerTabla = (t) => {
  try {
    const v = JSON.parse(localStorage.getItem(P + t) || 'null');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const escribirTabla = (t, filas) => {
  try {
    localStorage.setItem(P + t, JSON.stringify(filas));
  } catch {
    /* sin espacio: la prueba se sigue viendo con lo que haya */
  }
};

/* ------------------------------------------------------------------ sesión */

/** Sesión de prueba: la misma forma que devuelve Supabase Auth. */
export function sesion() {
  const texto = JSON.stringify({
    access_token: 'demo',
    refresh_token: 'demo',
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
    user: { id: ID_DEMO, email: CORREO_DEMO, meta: { nombre: 'Marta Ruiz', rol: 'cliente', ciudad: 'cali' } },
  });
  try {
    sessionStorage.setItem(CLAVE_SESION, texto);
    localStorage.setItem(CLAVE_SESION, texto);
  } catch {
    /* sin almacenamiento: la prueba no puede funcionar */
  }
  sembrar();
  return texto;
}

/* ------------------------------------------------------------ datos de prueba */

const MAESTROS = [
  { id: '6f1c2a94-3b7d-4e5f-9a21-0c8d5e7b1101', nombre: 'Édison Ramos', rol: 'trabajador', ciudad: 'cali', categoria: 'cerrajero', anios: 9, conectado: true, calificaciones: 128, calificacion_suma: 587, trabajos: 154 },
  { id: '7a2d3b85-4c8e-4f6a-8b32-1d9e6f8c2202', nombre: 'Julián Ospina', rol: 'trabajador', ciudad: 'cali', categoria: 'plomero', anios: 12, conectado: true, calificaciones: 96, calificacion_suma: 449, trabajos: 121 },
  { id: '8b3e4c96-5d9f-4a7b-9c43-2eaf7a9d3303', nombre: 'Sara Méndez', rol: 'trabajador', ciudad: 'cali', categoria: 'electricista', anios: 7, conectado: true, calificaciones: 54, calificacion_suma: 251, trabajos: 68 },
  { id: '9c4f5da7-6ea0-4b8c-8d54-3fb08bae4404', nombre: 'Andrés Salazar', rol: 'trabajador', ciudad: 'cali', categoria: 'pintor', anios: 15, conectado: false, calificaciones: 71, calificacion_suma: 332, trabajos: 89 },
  { id: 'ad506eb8-7fb1-4c9d-9e65-40c19cbf5505', nombre: 'Lucía Vargas', rol: 'trabajador', ciudad: 'cali', categoria: 'plomero', anios: 5, conectado: true, calificaciones: 12, calificacion_suma: 55, trabajos: 14 },
];

const DIRECCIONES = {
  casa: { texto: 'Calle 16 # 100-20, Ciudad Jardín', detalle: 'Casa', punto: { lat: 3.4102, lng: -76.5531 } },
  trabajo: { texto: 'Cra. 41 # 18-03, Of. 302', detalle: 'Oficina', punto: { lat: 3.4389, lng: -76.5272 } },
};

/** Crea las tablas de la "nube" una sola vez (no borra lo que la persona haya cambiado). */
export function sembrar() {
  if (leerTabla('perfiles').length) return;

  const ahora = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const hace = (ms) => ahora - ms;

  const perfiles = [
    {
      id: ID_DEMO,
      nombre: 'Marta Ruiz',
      rol: 'cliente',
      ciudad: 'cali',
      correo: CORREO_DEMO,
      telefono: '300 123 4567',
      calificaciones: 0,
      calificacion_suma: 0,
      trabajos: 0,
      actualizado: iso(ahora),
    },
    ...MAESTROS.map((m) => ({ ...m, actualizado: iso(ahora) })),
  ];

  const precioBase = (visita, manoObra, recargo = 0) => ({ visita, manoObra, recargo, total: visita + manoObra + recargo });
  const pedido = (p) => ({
    usuarioId: ID_DEMO,
    metodoPago: 'efectivo',
    metodoNombre: 'Efectivo',
    metodoTipo: 'efectivo',
    estado: 'finalizado',
    tiempos: {},
    ...p,
  });

  const pedidos = [
    pedido({
      id: 'p_demo_1',
      numero: '482910',
      trabajadorId: MAESTROS[0].id,
      categoria: 'cerrajero',
      descripcion: 'La chapa de la entrada está dañada y no cierra bien.',
      direccion: DIRECCIONES.casa,
      cuando: { tipo: 'urgente' },
      minutosLlegada: 18,
      precio: precioBase(25000, 60000),
      estado: 'finalizado',
      creado: hace(86400000 * 12),
      tiempos: { buscando: hace(86400000 * 12), aceptado: hace(86400000 * 12 - 120000), en_camino: hace(86400000 * 12 - 900000), en_proceso: hace(86400000 * 12 - 3000000) },
      pago: { id: 'pay_demo_1', metodoId: 'efectivo', metodoNombre: 'Efectivo', tipo: 'efectivo', servicio: 85000, propina: 5000, total: 90000, estado: 'directo', fecha: hace(86400000 * 12 - 2700000) },
      calificacion: { estrellas: 5, etiquetas: ['Puntual', 'Limpio'], comentario: 'Llegó rapidísimo y quedó perfecto.', fecha: iso(hace(86400000 * 12 - 2600000)) },
    }),
    pedido({
      id: 'p_demo_2',
      numero: '482934',
      trabajadorId: MAESTROS[1].id,
      categoria: 'plomero',
      descripcion: 'Hay una fuga de agua bajo el lavamanos del baño.',
      direccion: DIRECCIONES.casa,
      cuando: { tipo: 'urgente' },
      minutosLlegada: 22,
      precio: precioBase(25000, 70000),
      estado: 'finalizado',
      creado: hace(86400000 * 2),
      tiempos: { buscando: hace(86400000 * 2), aceptado: hace(86400000 * 2 - 90000) },
      pago: { id: 'pay_demo_2', metodoId: 'transferencia', metodoNombre: 'Transferencia (Nequi, Daviplata o banco)', tipo: 'transferencia', servicio: 95000, propina: 10000, total: 105000, estado: 'directo', fecha: hace(86400000 * 2 - 600000) },
    }),
    pedido({
      id: 'p_demo_3',
      numero: '482971',
      trabajadorId: MAESTROS[2].id,
      categoria: 'electricista',
      descripcion: 'Se dañó un tomacorriente y saltan los breakers.',
      direccion: DIRECCIONES.trabajo,
      cuando: { tipo: 'urgente' },
      minutosLlegada: 12,
      precio: precioBase(30000, 75000),
      estado: 'en_proceso',
      creado: hace(40 * 60000),
      tiempos: { buscando: hace(40 * 60000), aceptado: hace(34 * 60000), en_camino: hace(28 * 60000), en_proceso: hace(9 * 60000) },
      pin: '4829',
    }),
    pedido({
      id: 'p_demo_4',
      numero: '482955',
      trabajadorId: MAESTROS[3].id,
      categoria: 'pintor',
      descripcion: 'Pintar una pared del salón, aproximadamente 25 m².',
      direccion: DIRECCIONES.casa,
      cuando: { tipo: 'programado', dia: 'viernes', hora: '08:00', fecha: hace(-86400000) },
      minutosLlegada: 25,
      precio: precioBase(0, 450000),
      estado: 'cancelado',
      creado: hace(86400000 * 5),
      cancelado: { motivo: 'No pude estar en la casa.', fecha: hace(86400000 * 4) },
    }),
  ];

  escribirTabla('perfiles', perfiles);
  escribirTabla('privado', [
    {
      id: ID_DEMO,
      telefono: '300 123 4567',
      actualizado: iso(ahora),
      datos: {
        direcciones: [DIRECCIONES.casa, DIRECCIONES.trabajo],
        lugares: { casa: DIRECCIONES.casa, trabajo: DIRECCIONES.trabajo },
        contactos: [
          { id: 'c1', nombre: 'Andrea Ruiz', telefono: '310 555 0142', parentesco: 'Hermana' },
          { id: 'c2', nombre: 'Carlos Ruiz', telefono: '318 555 0198', parentesco: 'Papá' },
        ],
        bloqueados: [],
        metodos: [
          { id: 'efectivo', tipo: 'efectivo', nombre: 'Efectivo' },
          { id: 'transferencia', tipo: 'transferencia', nombre: 'Transferencia (Nequi, Daviplata o banco)' },
        ],
        metodoPreferido: 'efectivo',
        cupones: [
          { codigo: 'BIENVENIDO', agregado: hace(86400000 * 12), usado: { fecha: hace(86400000 * 12 - 2700000), pedidoId: 'p_demo_1' } },
          { codigo: 'CAMELLO10', agregado: hace(86400000 * 2), usado: null },
          { codigo: 'HOGAR5000', agregado: hace(86400000), usado: null },
        ],
        codigoReferido: 'MARTA4821',
        preferencias: { avisos: true, promociones: true, sonido: true },
      },
    },
  ]);
  escribirTabla(
    'pedidos',
    pedidos.map((d) => ({ id: d.id, usuario_id: d.usuarioId, trabajador_id: d.trabajadorId, creado: iso(d.creado), datos: d }))
  );
  escribirTabla('pines', [{ pedido_id: 'p_demo_3', pin: '4829' }]);
  escribirTabla('ubicaciones', MAESTROS.filter((m) => m.conectado).map((m, i) => ({
    maestro_id: m.id,
    lat: 3.42 + i * 0.012,
    lng: -76.54 + i * 0.009,
    actualizado: iso(ahora),
  })));
  escribirTabla('mensajes', [
    { id: 1, pedido_id: 'p_demo_3', rol: 'cliente', autor: ID_DEMO, texto: 'Hola, ya estoy en la recepción.', creado: iso(hace(25 * 60000)) },
    { id: 2, pedido_id: 'p_demo_3', rol: 'trabajador', autor: MAESTROS[2].id, texto: 'Voy en camino, llego en 10 minutos.', creado: iso(hace(24 * 60000)) },
    { id: 3, pedido_id: 'p_demo_3', rol: 'trabajador', autor: MAESTROS[2].id, texto: 'Ya llegué, ¿me confirma el oficina?', creado: iso(hace(9 * 60000)) },
  ]);
  escribirTabla('reportes', []);
}

/** Mantiene "en línea" a los maestros de prueba (el servidor lo haría de verdad). */
export function latido() {
  const ahora = new Date().toISOString();
  const enLinea = leerTabla('perfiles').filter((p) => p.rol === 'trabajador' && p.conectado);
  escribirTabla(
    'perfiles',
    leerTabla('perfiles').map((p) => (p.rol === 'trabajador' && p.conectado ? { ...p, actualizado: ahora } : p))
  );
  escribirTabla(
    'ubicaciones',
    leerTabla('ubicaciones').map((u) => ({ ...u, actualizado: ahora }))
  );

  // Las pantallas leen la copia local: hay que refrescarla también, o los
  // maestros desaparecerían a los pocos minutos por "última señal".
  if (!usuarioNube()) return;
  almacen.usar(ID_DEMO);
  almacen.guardar(
    'usuarios',
    almacen.leer('usuarios', []).map((u) =>
      u.rol === 'trabajador' && u.maestro?.conectado ? { ...u, visto: Date.now() } : u
    )
  );
  enLinea.forEach((m) => {
    const u = almacen.leer(`ubicacion:${m.id}`, null);
    if (u) almacen.guardar(`ubicacion:${m.id}`, { ...u, fecha: Date.now() });
  });
}

/* ---------------------------------------------------------- la "nube" local */

const particiones = (texto) => {
  const out = [];
  let profundidad = 0;
  let actual = '';
  for (const ch of texto) {
    if (ch === '(') profundidad++;
    else if (ch === ')') profundidad--;
    if (ch === ',' && profundidad === 0) {
      out.push(actual);
      actual = '';
      continue;
    }
    actual += ch;
  }
  if (actual) out.push(actual);
  return out;
};

const cumple = (valor, condicion) => {
  if (condicion == null) return true;
  const s = String(condicion);
  let m;
  if ((m = s.match(/^eq\.(.*)$/))) return String(valor) === m[1];
  if ((m = s.match(/^neq\.(.*)$/))) return String(valor) !== m[1];
  if ((m = s.match(/^gte\.(.*)$/))) return Date.parse(valor) >= Date.parse(m[1]);
  if ((m = s.match(/^lte\.(.*)$/))) return Date.parse(valor) <= Date.parse(m[1]);
  if ((m = s.match(/^in\.\((.*)\)$/))) return m[1].split(',').map((x) => x.replace(/^"|"$/g, '')).includes(String(valor));
  return true;
};

const cumpleUna = (fila, regla) => {
  const i = regla.indexOf('.');
  if (i < 0) return true;
  return cumple(fila[regla.slice(0, i)], regla.slice(i + 1));
};

const cumpleOr = (fila, or) => {
  const dentro = String(or).replace(/^\(/, '').replace(/\)$/, '');
  return particiones(dentro).some((parte) => {
    const p = parte.trim();
    if (p.startsWith('and(')) return particiones(p.slice(4, -1)).every((c) => cumpleUna(fila, c.trim()));
    return cumpleUna(fila, p);
  });
};

const comparar = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)));

const ORDEN = ['buscando', 'aceptado', 'en_camino', 'en_proceso', 'finalizado'];

/**
 * Lo mismo que services/nube.js, pero contra las tablas locales.
 * Las pantallas llaman a `db` y no saben la diferencia.
 */
export const dbDemo = {
  async ver(tabla, filtros = {}) {
    let filas = leerTabla(tabla);
    const { select, order, limit, or, ...columnas } = filtros;
    if (or) filas = filas.filter((f) => cumpleOr(f, or));
    for (const [k, v] of Object.entries(columnas)) filas = filas.filter((f) => cumple(f[k], v));
    if (order) {
      const [campo, dir] = order.split('.');
      filas = [...filas].sort((a, b) => (dir === 'desc' ? -comparar(a[campo], b[campo]) : comparar(a[campo], b[campo])));
    }
    if (limit) filas = filas.slice(0, limit);
    if (select && select !== '*') {
      const campos = select.split(',').map((s) => s.trim());
      filas = filas.map((f) => Object.fromEntries(campos.filter((c) => c in f).map((c) => [c, f[c]])));
    }
    return filas;
  },

  async crear(tabla, fila) {
    const filas = leerTabla(tabla);
    const nueva = { ...fila };
    if (!('id' in nueva)) nueva.id = Date.now();
    filas.push(nueva);
    escribirTabla(tabla, filas);
    return [nueva];
  },

  async guardar(tabla, fila) {
    const filas = leerTabla(tabla);
    const clave = ['id', 'maestro_id', 'pedido_id'].find((k) => k in fila) || 'id';
    const i = filas.findIndex((f) => f[clave] === fila[clave]);
    if (i >= 0) filas[i] = { ...filas[i], ...fila };
    else filas.push(fila);
    escribirTabla(tabla, filas);
  },

  async cambiar(tabla, filtros, cambios) {
    const filas = leerTabla(tabla);
    let n = 0;
    for (let i = 0; i < filas.length; i++) {
      const ok = Object.entries(filtros).every(([k, v]) => cumple(filas[i][k], v));
      if (ok) {
        filas[i] = { ...filas[i], ...cambios };
        n++;
      }
    }
    if (n) escribirTabla(tabla, filas);
    return n;
  },

  /** Las funciones del servidor, hechas en el navegador. */
  async funcion(nombre, args = {}) {
    const pedidos = leerTabla('pedidos');
    const filaDe = (id) => pedidos.find((f) => f.id === id);

    if (nombre === 'crear_pedido') {
      const ahora = Date.now();
      const datos = {
        ...args.p_datos,
        id: args.p_id,
        estado: 'buscando',
        creado: ahora,
        tiempos: { buscando: ahora },
      };
      pedidos.unshift({ id: datos.id, usuario_id: datos.usuarioId, trabajador_id: args.p_trabajador, creado: new Date(ahora).toISOString(), datos });
      escribirTabla('pedidos', pedidos);
      // El código lo guarda aparte (tabla `pines`), igual que en el servidor.
      const pines = leerTabla('pines').filter((x) => x.pedido_id !== args.p_id);
      pines.push({ pedido_id: args.p_id, pin: args.p_pin });
      escribirTabla('pines', pines);
      return datos;
    }

    if (nombre === 'actualizar_pedido') {
      const f = filaDe(args.p_id);
      if (!f) return null;
      const d = { ...f.datos };
      const ahora = Date.now();
      if (args.p_accion === 'cancelar') {
        d.estado = 'cancelado';
        d.cancelado = { motivo: args.p_valor?.motivo || '', fecha: ahora };
      } else if (args.p_accion === 'pagar') {
        d.pago = args.p_valor;
      } else if (args.p_accion === 'calificar') {
        d.calificacion = { ...args.p_valor, fecha: ahora };
      }
      f.datos = d;
      escribirTabla('pedidos', pedidos);
      return d;
    }

    if (nombre === 'avanzar_pedido') {
      const f = filaDe(args.p_id);
      if (!f) return { error: 'Ese pedido ya no existe.' };
      const d = { ...f.datos };
      const ahora = Date.now();
      const accion = args.p_accion;
      if (accion === 'aceptar') {
        if (d.estado !== 'buscando') return { error: 'Este pedido ya no está disponible.' };
        d.estado = 'aceptado';
        d.tiempos = { ...(d.tiempos || {}), aceptado: ahora };
      } else if (accion === 'rechazar') {
        d.estado = 'cancelado';
        d.cancelado = { motivo: 'El maestro no pudo atenderlo.', fecha: ahora };
      } else if (accion === 'salir') {
        if (d.estado !== 'aceptado') return { error: 'Primero debes aceptar el pedido.' };
        d.estado = 'en_camino';
        d.tiempos = { ...(d.tiempos || {}), en_camino: ahora };
      } else if (accion === 'llegar') {
        if (d.estado !== 'en_camino') return { error: 'El maestro todavía no salió.' };
        const esperado = leerTabla('pines').find((x) => x.pedido_id === args.p_id)?.pin;
        if (String(args.p_pin || '').trim() !== String(esperado || '')) return { error: 'El código no coincide con el del cliente.' };
        d.estado = 'en_proceso';
        d.tiempos = { ...(d.tiempos || {}), en_proceso: ahora };
      } else if (accion === 'terminar') {
        if (d.estado !== 'en_proceso') return { error: 'El servicio todavía no empezó.' };
        d.estado = 'finalizado';
      } else {
        return { error: 'Acción desconocida.' };
      }
      f.datos = d;
      escribirTabla('pedidos', pedidos);
      return d;
    }

    if (nombre === 'eliminar_mi_cuenta') {
      ['perfiles', 'privado', 'pedidos', 'pines', 'ubicaciones', 'mensajes', 'reportes'].forEach((t) => escribirTabla(t, []));
      return {};
    }

    return null;
  },
};

export const ordenes = ORDEN;
