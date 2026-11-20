/**
 * AppOptimizer · núcleo de optimización y detección de dispositivo.
 *
 * Va en el <head> como script clásico (el CSP de la app no permite scripts en
 * línea) y hace dos cosas:
 *
 *   1. Detecta si se entra desde un teléfono, una tablet o una computadora y
 *      marca el documento con `celular`, `tablet` o `computadora`. css/movil.css
 *      aplica las optimizaciones según esa marca. La detección se repite al
 *      cambiar la ventana o girar el dispositivo.
 *
 *   2. Expone `window.CamelloOpt`, las utilidades que usa la app para no
 *      trabarse en un teléfono: debounce, deduplicación de llamadas, caché
 *      corta, repintado solo cuando el contenido cambia y paginación.
 *
 * No usa el User-Agent como única señal: combina puntero grueso/fino, puntos
 * táctiles, tamaño de pantalla y el agente. Sin dependencias.
 */
(function () {
  if (window.CamelloOpt) return; // no duplicar la inicialización

  var UA_MOVIL = /Android|iPhone|iPod|Mobile|Opera Mini|IEMobile|Silk|Windows Phone/i;
  var UA_TABLET = /iPad|Tablet|Nexus 7|Nexus 9|KFAPWI|SM-T\d|Lenovo TB|Pixel C/i;

  function mqconsulta(txt) {
    return (window.matchMedia || function () { return { matches: false }; })(txt);
  }

  /** Devuelve 'celular' | 'tablet' | 'computadora'. */
  function medir() {
    var w = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 1200;
    var h = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || 800;
    var corta = Math.min(w, h);
    var gruesa = mqconsulta('(pointer: coarse)').matches; // dedo o lápiz
    var fina = mqconsulta('(pointer: fine)').matches;      // mouse
    var tactil = navigator.maxTouchPoints > 0;
    var ua = navigator.userAgent || '';

    // Con mouse y sin tacto es una computadora; solo el tamaño muy estrecho
    // (ventana angosta o pantalla chica) pide el tratamiento de teléfono.
    if (fina && !gruesa && !tactil) {
      if (corta < 620) return 'celular';
      if (corta < 900) return 'tablet';
      return 'computadora';
    }
    if (UA_TABLET.test(ua)) return 'tablet';
    if (UA_MOVIL.test(ua)) return 'celular';
    if (gruesa && !fina) return corta < 700 ? 'celular' : 'tablet';
    if (tactil) return corta < 620 ? 'celular' : 'tablet';
    return corta < 620 ? 'celular' : corta < 900 ? 'tablet' : 'computadora';
  }

  /** Configuración por dispositivo: cuánto se insiste y cuánto se anima. */
  var CONFIG = {
    computadora: { debounce: 120, pagina: 20, vivoMs: 1000, sondeoMs: 15000, animar: true, desenfoque: true, precargar: true },
    tablet:      { debounce: 200, pagina: 12, vivoMs: 2000, sondeoMs: 20000, animar: true, desenfoque: false, precargar: true },
    celular:     { debounce: 280, pagina: 8,  vivoMs: 3000, sondeoMs: 30000, animar: false, desenfoque: false, precargar: false },
  };

  var dispositivo = medir();
  var config = CONFIG[dispositivo];

  var reducirMovimiento = mqconsulta('(prefers-reduced-motion: reduce)').matches;

  function aplicarMarca() {
    var raiz = document.documentElement;
    var nuevo = medir();
    if (nuevo === dispositivo) return;
    dispositivo = nuevo;
    config = CONFIG[dispositivo];
    raiz.classList.remove('celular', 'tablet', 'computadora');
    raiz.classList.add(dispositivo);
    try { localStorage.setItem('camello:dispositivo', dispositivo); } catch (e) { /* sin almacenamiento */ }
    window.dispatchEvent(new CustomEvent('camello:dispositivo', { detail: dispositivo }));
  }

  // Marca inicial antes de pintar
  document.documentElement.classList.add(dispositivo);
  try { localStorage.setItem('camello:dispositivo', dispositivo); } catch (e) { /* sin almacenamiento */ }

  var reloj = null;
  function alCambiar() {
    clearTimeout(reloj);
    reloj = setTimeout(aplicarMarca, 120);
  }
  window.addEventListener('resize', alCambiar);
  window.addEventListener('orientationchange', alCambiar);

  /* ------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------ */

  /** Repite la llamada hasta que pase `ms` sin que llegue otra. */
  function debounce(fn, ms) {
    var t = 0, args = null;
    function envuelto() {
      args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { t = 0; fn.apply(this, args); }, ms);
    }
    envuelto.cancel = function () { clearTimeout(t); t = 0; };
    return envuelto;
  }

  /**
   * Carril de búsqueda: al crear uno nuevo se cierra el anterior, así un
   * resultado viejo no pisa al nuevo cuando la persona sigue escribiendo.
   */
  function carril() {
    var vivo = { si: true };
    return {
      valido: function () { return vivo.si; },
      cerrar: function () { vivo.si = false; },
    };
  }

  var cachitos = new Map();
  /**
   * Devuelve el resultado de `fn()` y lo guarda `ms`. Si se vuelve a pedir la
   * misma clave antes de eso, devuelve el valor guardado (o la promesa en
   * curso): evita llamadas duplicadas y consultas repetidas.
   */
  function cachear(clave, fn, ms) {
    var hasta = Date.now() + (ms || 1000);
    var guardado = cachitos.get(clave);
    if (guardado && guardado.hasta > Date.now()) return guardado.valor;
    var valor = fn();
    cachitos.set(clave, { valor: valor, hasta: hasta });
    if (cachitos.size > 80) cachitos.delete(cachitos.keys().next().value);
    return valor;
  }
  function limpiarCache() { cachitos.clear(); }
  function olvidar(clave) { cachitos.delete(clave); }

  var vistos = new WeakMap();
  /** Escribe el HTML solo si cambió: evita recalcular el diseño a cada tick. */
  function pintarSiCambia(el, html) {
    if (!el) return false;
    if (vistos.get(el) === html) return false;
    vistos.set(el, html);
    el.innerHTML = html;
    return true;
  }

  /** Primera página de una lista, según el tamaño que toque al dispositivo. */
  function primerPagina(lista, extra) {
    var n = extra || config.pagina;
    return lista.slice(0, n);
  }

  /** Tareas secundarias sin robarle el hilo principal al dibujo. */
  function cuandoLibre(fn) {
    if (window.requestIdleCallback) return window.requestIdleCallback(fn, { timeout: 1200 });
    return setTimeout(fn, 1);
  }

  /** Marca las imágenes de un trozo de DOM para que carguen con pereza. */
  function imagenesPerezosas(raiz) {
    if (!raiz || !raiz.querySelectorAll) return;
    raiz.querySelectorAll('img:not([loading])').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  }

  /**
   * Muestra un esqueleto solo si `promesa` tarda más de `espera` ms. Así no
   * parpadea cuando la respuesta es inmediata (por ejemplo, por caché) y no
   * se queda la pantalla vacía cuando sí cuesta.
   */
  function conEsqueleto(el, htmlEsqueleto, promesa, espera) {
    if (!el) return;
    var t = setTimeout(function () { pintarSiCambia(el, htmlEsqueleto); }, espera || 140);
    Promise.resolve(promesa)
      .then(function () { clearTimeout(t); })
      .catch(function () { clearTimeout(t); });
  }

  /** true si la pestaña no se está viendo: para qué consultar de más. */
  function oculto() {
    return document.hidden || document.visibilityState === 'hidden';
  }

  window.CamelloOpt = {
    dispositivo: function () { return dispositivo; },
    config: config,
    esCelular: function () { return dispositivo === 'celular'; },
    esTablet: function () { return dispositivo === 'tablet'; },
    esComputadora: function () { return dispositivo === 'computadora'; },
    reducirMovimiento: function () { return reducirMovimiento; },
    // En pantallas táctiles no tiene sentido precargar ni animar de más
    animar: function () { return config.animar && !reducirMovimiento; },
    debounce: debounce,
    carril: carril,
    cachear: cachear,
    limpiarCache: limpiarCache,
    olvidar: olvidar,
    pintarSiCambia: pintarSiCambia,
    primerPagina: primerPagina,
    cuandoLibre: cuandoLibre,
    imagenesPerezosas: imagenesPerezosas,
    conEsqueleto: conEsqueleto,
    oculto: oculto,
  };
})();
