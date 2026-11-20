/**
 * Interruptor de interfaz.
 *
 * La app carga las tres identidades visuales (cristal, brutal, bento) y deja
 * activa solo la que eligió la persona. Cambiar de una a otra no recarga la
 * página ni toca los datos: solo habilita otra hoja de estilos.
 *
 * Las tres hojas se cargan en index.html con un id (`tema-cristal`, etc.) y
 * con `disabled` las que no tocan; este archivo hace lo mismo en tiempo real.
 */
import { icono } from './ui/iconos.js';

const CLAVE = 'camello:tema';

const TEMAS = [
  {
    id: 'cristal',
    nombre: 'Cristal líquido',
    desc: 'Vidrio esmerilado sobre ámbar profundo',
    color: '#160B05',
    muestra: ['#160B05', '#FF8A1E', '#FFF4E6'],
  },
  {
    id: 'brutal',
    nombre: 'Brutalista',
    desc: 'Cajas duras, planas y sin curvas',
    color: '#FF4D00',
    muestra: ['#FF4D00', '#FFD200', '#14110D'],
  },
  {
    id: 'bento',
    nombre: 'Bento',
    desc: 'Retícula de celdas de color',
    color: '#16110D',
    muestra: ['#16110D', '#FF7E36', '#8FCBFF'],
  },
];

const actual = () => localStorage.getItem(CLAVE) || 'cristal';

/** Activa una sola hoja de identidad y guarda la elección. */
export function aplicarTema(id) {
  if (!TEMAS.some((t) => t.id === id)) return actual();
  TEMAS.forEach((t) => {
    const link = document.getElementById('tema-' + t.id);
    if (link) link.disabled = t.id !== id;
  });
  localStorage.setItem(CLAVE, id);
  document.documentElement.setAttribute('data-tema', id);
  const meta = document.querySelector('meta[name="theme-color"]');
  const tema = TEMAS.find((t) => t.id === id);
  if (meta && tema) meta.content = tema.color;
  return id;
}

/** Para pintar el estado (el check) de cada opción. */
function pintarTarjetas(caja) {
  const ahora = actual();
  caja.querySelectorAll('.tema-opcion').forEach((b) => {
    const on = b.dataset.tema === ahora;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    const checked = b.querySelector('.tema-checked');
    if (checked) checked.innerHTML = on ? icono('check', { tamano: 20 }) : '';
  });
}

const tarjeta = (t) => `
  <button type="button" class="tema-opcion" data-tema="${t.id}" aria-pressed="false">
    <span class="tema-muestras" aria-hidden="true">${t.muestra.map((c) => `<i style="background:${c}"></i>`).join('')}</span>
    <span class="tema-texto"><b>${t.nombre}</b><small>${t.desc}</small></span>
    <span class="tema-checked" aria-hidden="true"></span>
  </button>`;

/** Botón flotante y hoja de selección. Lo pinta dentro de #app. */
export function iniciarInterruptor() {
  const app = document.getElementById('app');
  if (!app || document.querySelector('.tema-boton')) return;

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'tema-boton';
  boton.title = 'Cambiar la interfaz';
  boton.setAttribute('aria-label', 'Cambiar la interfaz');
  boton.innerHTML = icono('rodillo', { tamano: 22 });
  app.appendChild(boton);

  const fondo = document.createElement('div');
  fondo.className = 'tema-fondo';
  fondo.hidden = true;
  fondo.innerHTML = `
    <div class="dialogo-caja tema-caja" role="dialog" aria-modal="true" aria-labelledby="tema-titulo">
      <h2 id="tema-titulo">Elige la interfaz</h2>
      <p class="tenue">Cada una cambia solo la capa visual. La cuenta, los pedidos y los datos de ejemplo son los mismos.</p>
      <div class="tema-lista">${TEMAS.map(tarjeta).join('')}</div>
      <button type="button" class="btn btn-texto btn-bloque" data-cerrar>Listo</button>
    </div>`;
  app.appendChild(fondo);

  boton.addEventListener('click', () => {
    fondo.hidden = false;
    pintarTarjetas(fondo);
  });
  fondo.addEventListener('click', (e) => {
    if (e.target === fondo || e.target.closest('[data-cerrar]')) fondo.hidden = true;
  });
  fondo.querySelectorAll('[data-tema]').forEach((b) =>
    b.addEventListener('click', () => {
      aplicarTema(b.dataset.tema);
      pintarTarjetas(fondo);
    })
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fondo.hidden = true;
  });
}
