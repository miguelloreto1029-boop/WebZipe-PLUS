/**
 * Tema inicial, antes de pintar.
 *
 * Es un script clásico (no un módulo) puesto en el <head>: se ejecuta mientras
 * se lee el HTML y deja activa la hoja de identidad guardada, así no se ve un
 * parpadeo del tema por defecto. El CSP de la app no permite scripts en línea,
 * pero sí los externos del propio sitio, que es justo lo que hace falta aquí.
 *
 * El botón para cambiar de interfaz está en js/interruptor.js.
 */
(function () {
  var COLOR = { cristal: '#160B05', brutal: '#FF4D00', bento: '#16110D' };
  var guardado = 'cristal';
  try {
    guardado = localStorage.getItem('camello:tema') || 'cristal';
  } catch (e) {
    /* sin almacenamiento: se queda el tema por defecto */
  }
  ['cristal', 'brutal', 'bento'].forEach(function (n) {
    var link = document.getElementById('tema-' + n);
    if (link) link.disabled = n !== guardado;
  });
  document.documentElement.setAttribute('data-tema', guardado);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta && COLOR[guardado]) meta.content = COLOR[guardado];
})();
