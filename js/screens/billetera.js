/**
 * Bolsillo: la vista de billetera de Camello.
 * Métodos de pago, cupones y actividad con datos reales de la cuenta.
 * Estilo de billetera de consumo (Rappi / Uber / Didi): tarjetón de resumen,
 * acciones rápidas, carrusel de métodos y actividad reciente.
 */
import { billetera, tarjetaValida, vencimientoValido, franquicia } from '../services/billetera.js';
import { cupones } from '../services/cupones.js';
import { pedidos } from '../services/pedidos.js';
import { categoriaPorId } from '../data/categorias.js';
import { sesion } from '../estado.js';
import { ir, atras } from '../router.js';
import { navInferior, barra, campo, marcarError, cargando, aviso } from '../ui/componentes.js';
import { icono } from '../ui/iconos.js';
import { esc, dinero, fechaHora } from '../ui/formato.js';
import { rodar } from '../ui/movimiento.js';
import { validarTelefono } from '../services/validar.js';

const TIPO_NOMBRE = { tarjeta: 'Tarjeta', nequi: 'Nequi', efectivo: 'Efectivo', transferencia: 'Transferencia' };
/** Texto grande de la tarjeta: el detalle, no la categoría (que va arriba). */
const detalle = (m) =>
  m.tipo === 'efectivo' ? 'Pago directo' : m.tipo === 'transferencia' ? 'Nequi · Daviplata · banco' : m.nombre;

/** Las tarjetas de método, en un carrusel de dos a la vez. */
const aMetodos = (u) =>
  u.metodos
    .map(
      (m) => `
            <div class="bolsillo-metodo">
              ${m.id === u.metodoPreferido ? '<span class="tag">Predeterminado</span>' : ''}
              <span class="m">${(TIPO_NOMBRE[m.tipo] || 'Método').toUpperCase()}</span>
              <b>${esc(detalle(m))}</b>
              <div class="bolsillo-metodo-acciones">
                ${m.id === u.metodoPreferido ? '' : `<button class="enlace pequeno" data-preferir="${m.id}">Predeterminar</button>`}
                ${m.tipo === 'efectivo' ? '' : `<button class="enlace pequeno peligro" data-quitar="${m.id}">Quitar</button>`}
              </div>
            </div>`
    )
    .join('');

export async function pantallaBilletera(raiz) {
  const u = sesion.usuario;
  const todos = await pedidos.delUsuario(u.id);
  const pagos = todos.filter((p) => p.pago);
  const misCupones = cupones.disponibles(u, { tienePedidos: todos.length > 0 });

  const ahora = new Date();
  const gastoMes = pagos
    .filter((p) => {
      const d = new Date(p.pago.fecha);
      return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
    })
    .reduce((a, p) => a + p.pago.total, 0);
  const gastoTotal = pagos.reduce((a, p) => a + p.pago.total, 0);

  raiz.innerHTML = `
    <main class="contenido con-nav">
      <header class="seccion-cabeza"><h1 tabindex="-1">Bolsillo</h1></header>

      <section class="bolsillo-heroe rev">
        <div class="eyebrow">Camello · Bolsillo</div>
        <div class="monto" data-gasto></div>
        <div class="sub">Total gastado · en ${pagos.length} pago${pagos.length === 1 ? '' : 's'}</div>
        <div class="bolsillo-acciones">
          <a class="bolsillo-accion" href="#/billetera/agregar">${icono('mas', { tamano: 20 })}<span>Agregar</span></a>
          <a class="bolsillo-accion" href="#/cupones">${icono('cupon', { tamano: 20 })}<span>Cupones</span></a>
          <a class="bolsillo-accion" href="#/pedidos">${icono('recibo', { tamano: 20 })}<span>Recibos</span></a>
        </div>
      </section>

      <div class="bolsillo-resumen rev">
      <div class="bolsillo-dato"><b data-gasto-mes></b><span>Gastado el mes</span></div>
      <div class="bolsillo-dato"><b data-n-pagos></b><span>Pagos realizados</span></div>
      <div class="bolsillo-dato"><b data-n-cupones></b><span>${misCupones.length === 1 ? 'Cupón activo' : 'Cupones activos'}</span></div>
      </div>

      <section class="bloque rev">
        <h2>Métodos de pago</h2>
        <div class="bolsillo-carousel">
          ${aMetodos(u)}
        </div>
        <a class="bolsillo-agregar-fila" href="#/billetera/agregar">${icono('mas', { tamano: 20 })}<span>Agregar método de pago</span></a>
        <p class="tenue pequeno">${icono('candado', { tamano: 14 })} Le pagas directamente al maestro cuando termina. Camello no cobra dentro de la app.</p>
      </section>

      <section class="bloque rev">
        <h2>Cupones</h2>
        ${
          misCupones.length
            ? `<div class="lista">${misCupones
                .map(
                  (c) => `
              <a class="cupon" href="#/cupones">
                <span class="promo-ico">${icono('cupon', { tamano: 22 })}</span>
                <span class="fila-texto"><b>${esc(c.titulo)}</b><small>${esc(c.codigo)} · tope ${dinero(c.tope || c.valor || 0)}</small></span>
                <span class="valor">${c.porcentaje ? `${Math.round(c.porcentaje * 100)}%` : dinero(c.valor || 0)}</span>
              </a>`
                )
                .join('')}</div>`
            : '<p class="bolsillo-vacio">Aún no tienes cupones disponibles.<br><a class="enlace" href="#/cupones">Agrega un código</a> y úsalo al confirmar.</p>'
        }
      </section>

      <section class="bloque rev">
        <h2>Actividad reciente</h2>
        <div class="lista" id="pagos"><div class="tarjeta esqueleto"><span class="sk" style="width:70%"></span></div></div>
      </section>
    </main>
    ${navInferior('billetera')}`;

  rodar(raiz.querySelector('[data-gasto]'), dinero(gastoTotal));
  rodar(raiz.querySelector('[data-gasto-mes]'), dinero(gastoMes));
  rodar(raiz.querySelector('[data-n-pagos]'), String(pagos.length));
  rodar(raiz.querySelector('[data-n-cupones]'), String(misCupones.length));

  raiz.querySelectorAll('[data-preferir]').forEach((b) =>
    b.addEventListener('click', () => {
      sesion.set(billetera.preferir(sesion.usuario.id, b.dataset.preferir));
      aviso('Método predeterminado actualizado.', 'exito');
      pantallaBilletera(raiz);
    })
  );
  raiz.querySelectorAll('[data-quitar]').forEach((b) =>
    b.addEventListener('click', () => {
      sesion.set(billetera.eliminar(sesion.usuario.id, b.dataset.quitar));
      aviso('Método de pago eliminado.');
      pantallaBilletera(raiz);
    })
  );

  raiz.querySelector('#pagos').innerHTML = pagos.length
    ? pagos
        .slice()
        .sort((a, b) => b.pago.fecha - a.pago.fecha)
        .map((p, i) => {
          const c = categoriaPorId(p.categoria);
          return `
          <a class="bolsillo-item rev" style="--i:${i}" href="#/recibo/${p.id}">
            <span class="promo-ico">${icono('recibo', { tamano: 20 })}</span>
            <span class="fila-texto"><b>${esc(c.nombreCorto || c.nombre)}</b><time>${esc(fechaHora(p.pago.fecha))} · ${esc(p.pago.metodoNombre)}</time></span>
            <span class="por">${icono('check', { tamano: 12 })} Pagado</span>
            <span class="monto">${dinero(p.pago.total)}</span>
          </a>`;
        })
        .join('')
    : '<p class="bolsillo-vacio">Aquí verás los recibos de tus servicios.<br>Cuando pagues un camello, el comprobante aparece en esta lista.</p>';
}

export function pantallaAgregarMetodo(raiz) {
  // Sin pasarela de pagos no se guardan tarjetas: se vuelve al bolsillo
  return ir('/billetera', { reemplazar: true });

  let tipo = 'tarjeta';

  const pintar = () => {
    raiz.innerHTML = `
      ${barra('Agregar método de pago')}
      <main class="contenido">
        <h1 class="oculto" tabindex="-1">Agregar método de pago</h1>
        <div class="segmentado" role="tablist">
          <button role="tab" aria-selected="${tipo === 'tarjeta'}" data-tipo="tarjeta">${icono('tarjeta', { tamano: 18 })} Tarjeta</button>
          <button role="tab" aria-selected="${tipo === 'nequi'}" data-tipo="nequi">${icono('celular', { tamano: 18 })} Nequi</button>
        </div>
        <form class="formulario" novalidate>
          ${
            tipo === 'tarjeta'
              ? `${campo({ id: 'numero', etiqueta: 'Número de la tarjeta', modo: 'numeric', auto: 'cc-number', max: '23', ayuda: 'Prueba con 4242 4242 4242 4242' })}
                 <div class="campo-doble">
                   ${campo({ id: 'vence', etiqueta: 'Vence (MM/AA)', modo: 'numeric', auto: 'cc-exp', max: '5' })}
                   ${campo({ id: 'cvv', etiqueta: 'CVV', tipo: 'password', modo: 'numeric', auto: 'cc-csc', max: '4' })}
                 </div>
                 ${campo({ id: 'titular', etiqueta: 'Nombre en la tarjeta', auto: 'cc-name', valor: sesion.usuario.nombre })}`
              : campo({ id: 'nequi', etiqueta: 'Celular registrado en Nequi', tipo: 'tel', modo: 'tel', valor: sesion.usuario.telefono })
          }
          <p class="tenue pequeno">${icono('candado', { tamano: 14 })} Demo: no se hacen cobros y solo se guardan los últimos 4 dígitos.</p>
          <button class="btn btn-primario btn-bloque" type="submit">Guardar</button>
        </form>
      </main>`;

    raiz.querySelector('[data-accion="atras"]').addEventListener('click', () => atras('/billetera'));
    raiz.querySelectorAll('[data-tipo]').forEach((b) =>
      b.addEventListener('click', () => {
        tipo = b.dataset.tipo;
        pintar();
      })
    );

    const form = raiz.querySelector('form');
    form.numero?.addEventListener('input', () => {
      const d = form.numero.value.replace(/\D/g, '').slice(0, 19);
      form.numero.value = d.replace(/(.{4})/g, '$1 ').trim();
    });
    form.vence?.addEventListener('input', () => {
      const d = form.vence.value.replace(/\D/g, '').slice(0, 4);
      form.vence.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const boton = form.querySelector('[type="submit"]');
      if (tipo === 'tarjeta') {
        const errores = {
          numero: tarjetaValida(form.numero.value) ? '' : 'Revisa el número de la tarjeta.',
          vence: vencimientoValido(form.vence.value) ? '' : 'Fecha no válida o tarjeta vencida.',
          cvv: /^\d{3,4}$/.test(form.cvv.value) ? '' : 'Son los 3 o 4 números de atrás.',
          titular: form.titular.value.trim().length > 3 ? '' : 'Escribe el nombre como aparece en la tarjeta.',
        };
        Object.entries(errores).forEach(([k, v]) => marcarError(form, k, v));
        const malo = Object.keys(errores).find((k) => errores[k]);
        if (malo) return form[malo].focus();
        cargando(boton, true, `Verificando ${franquicia(form.numero.value)}…`);
        sesion.set(await billetera.agregarTarjeta(sesion.usuario.id, { numero: form.numero.value, nombre: form.titular.value }));
      } else {
        const error = validarTelefono(form.nequi.value);
        marcarError(form, 'nequi', error);
        if (error) return form.nequi.focus();
        cargando(boton, true, 'Conectando con Nequi…');
        sesion.set(await billetera.agregarNequi(sesion.usuario.id, form.nequi.value));
      }
      aviso('Método de pago agregado.', 'exito');
      atras('/billetera');
    });
  };
  pintar();
}
