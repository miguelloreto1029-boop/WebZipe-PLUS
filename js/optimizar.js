/**
 * Optimización automática para el celular.
 *
 * GitHub Pages es estático y no puede decidir por su cuenta si te estás
 * conectando desde un teléfono o desde un computador, así que la decisión se
 * toma aquí, en el navegador. Este archivo va en el <head> como script clásico
 * (el CSP de la app no permite scripts en línea) y marca el documento con la
 * clase `movil` o `escritorio` antes de pintar.
 *
 * css/movil.css hace el trabajo de verdad: baja el costo de lo que más pesa en
 * un teléfono (desenfoques en vivo, capas de luz animadas, sombras abiertas).
 */
(function () {
  var UA_MOVIL = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|Silk/i;

  function esMovil() {
    var mq = window.matchMedia || function () { return { matches: false }; };
    var gruesa = mq('(pointer: coarse)').matches; // dedo o lápiz
    var fina = mq('(pointer: fine)').matches;      // mouse
    var tactil = navigator.maxTouchPoints > 0;
    var pantalla = Math.min(window.screen ? window.screen.width : 1200, window.screen ? window.screen.height : 1200);
    var estrecho = Math.min(window.innerWidth, window.innerHeight) < 640; // layout de teléfono
    if (fina && !gruesa && !tactil && !estrecho) return false; // escritorio ancho con mouse
    if (gruesa && !fina) return true;                          // teléfono o tablet
    if (UA_MOVIL.test(navigator.userAgent)) return true;
    if (estrecho) return true;                                 // ventana estrecha: layout móvil
    return tactil && pantalla < 820;                           // híbrido pequeño
  }

  function aplicar() {
    var movil = esMovil();
    var raiz = document.documentElement;
    raiz.classList.toggle('movil', movil);
    raiz.classList.toggle('escritorio', !movil);
    try {
      localStorage.setItem('camello:dispositivo', movil ? 'movil' : 'escritorio');
    } catch (e) {
      /* sin almacenamiento: no hace falta */
    }
    return movil;
  }

  aplicar();

  // Al girar el teléfono o cambiar la ventana puede cambiar la respuesta
  var reloj = null;
  var volver = function () {
    clearTimeout(reloj);
    reloj = setTimeout(aplicar, 120);
  };
  window.addEventListener('resize', volver);
  window.addEventListener('orientationchange', volver);
})();
