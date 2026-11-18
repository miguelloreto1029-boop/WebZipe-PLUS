# Camello · rediseño (arcilla → cristal)

Código propio, sin dependencias ni compilación, con la misma estructura del README original.

- `css/app.css` — sistema visual: arcilla (sin cuenta) y cristal (con cuenta), paleta amarillo/ámbar/naranja.
- `js/main.js` — pantallas, transición arcilla→cristal, hoja de maestros, pedidos.
- `js/auth.js` — cuentas reales en localStorage: PBKDF2-SHA256 (210.000), bloqueo 5 intentos / 5 min, sesión de 30 días.
- `js/pedidos.js` — pedidos con 5 estados calculados por tiempo (~45 s), historial máx. 200.
- `sw.js` — versión `camello-v11`; sube el número en cada cambio.

Pendiente / límites:
- Mantén tu carpeta `icons/` (este paquete no la incluye).
- Tipografía: pila del sistema. Para tus fuentes, añade `@font-face` con WOFF2 locales en `css/app.css` y agrégalos a `ARCHIVOS` en `sw.js`. Sin Google Fonts.
- Maestros y precios son de ejemplo; la vista del maestro es una maqueta (las solicitudes reales requieren servidor).
- No incluye todavía: solicitud en 3 pasos, "ofrece tu precio", seguimiento con mapa y chat, propina y calificación, programar, lugares.
