# Camello · GitHub Pages

## Publicar

1. Sube el contenido de esta carpeta a la raíz de la rama `main` del repositorio `WebZipe-PLUS`.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/(root)`, y guarda.
5. Espera a que termine la publicación y visita:

   https://miguelloreto1029-boop.github.io/WebZipe-PLUS/

## Qué incluye

- Aplicación web estática en HTML, CSS y JavaScript.
- Manifest e iconos para instalación PWA.
- Service worker con caché y actualización versionada.
- `.nojekyll` para publicación estática directa.

## Limitaciones actuales de esta versión

Esta entrega conserva la lógica de demostración incluida en el ZIP original. Las cuentas, sesiones y pedidos se almacenan en `localStorage` del navegador. Por tanto, no se sincronizan entre personas ni dispositivos. Los maestros, precios y pagos son datos de ejemplo; no hay servidor, base de datos compartida, pasarela de pago ni asignación real de profesionales.

No uses esta versión para gestionar datos personales reales ni pagos. Para convertirla en un servicio multiusuario se necesita un backend seguro y una base de datos.

## Actualizaciones

Cuando publiques una nueva versión, incrementa el valor `VERSION` en `sw.js` (por ejemplo, `camello-v14`) para que el navegador descargue la nueva caché.
