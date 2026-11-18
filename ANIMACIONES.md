# Animaciones integradas · trazabilidad

Cada animación conserva el nombre de la referencia (video) como clase CSS. Todas están conectadas a una función real de Camello y respetan `prefers-reduced-motion`.

| Nomenclatura | Archivo | Dónde se usa | Activación | Función real |
|---|---|---|---|---|
| `liquid-navigation` | `css/motion.css`, `js/main.js` (`go`) | Barra inferior (móvil y tablet) | Clic | Cambia de pestaña; la burbuja sube sobre la activa |
| `animated-navbar` | `css/motion.css`, `js/main.js` (`go`) | Misma barra y menú lateral | Clic | Color de acento por pestaña y anillo al tocar |
| `glassy-sidebar-v3` | `css/motion.css`, `js/main.js` (`#rail`) | Menú lateral (≥ 900 px) | Clic / hover | Navegar, contraer a riel, contador de pedidos y cerrar sesión |
| `bento-row` | `css/motion.css`, `js/main.js` | Servicios del inicio | Hover / primer toque | Abre la hoja de maestros del servicio (en táctil: primer toque expande, segundo pide) |
| `glowing-corner` | `css/motion.css`, `js/main.js` | Servicios, maestros, "Ganado hoy" | Hover | Brillo que sigue al cursor |
| `modern-searchbar` | `css/motion.css`, `js/main.js` (`filtrar`) | Inicio | Clic / escribir | Filtra servicios; la × borra y colapsa |
| `search-bar-css` | `css/motion.css`, `js/main.js` (`lista`) | Pedidos | Foco | Filtra el historial |
| `card-slider` | `css/motion.css`, `js/main.js` (`ciclar`) | Billetera | Clic / Enter / → | Elige el método de pago predeterminado (se guarda) y se usa al pedir |
| `cmg-glass-tilt` | `js/motion.js` (`tilt`) | Tarjeta superior del mazo | Cursor | Inclinación y reflejo |
| `hold-down-to-continue` | `js/motion.js` (`holdBtn`) | Hoja de maestros | Mantener pulsado 1,2 s / Enter / Espacio | Crea el pedido |
| `cmg-number-roll` | `js/motion.js` (`roll`) | Total del pedido, gasto, ganado hoy | Cambio de valor | Cifras reales |
| `cmg-confetti-burst` | `js/motion.js` (`burst`) | Pedido enviado y pago | Evento | Feedback de éxito |
| `cmg-button-pay` | `css/motion.css`, `js/main.js` (`fila`) | Pedidos finalizados | Clic | Marca el pedido como pagado (pago simulado) |
| `cmg-line-draw` | `css/motion.css`, `js/main.js` (`gasto`) | Pedidos (cliente) | Al abrir la pestaña | Gasto de los últimos 7 días |
| `otp-deck` | `js/motion.js` (`otpDeck`) | Inicio del maestro | Escribir 4 dígitos | Confirma llegada con el código del cliente (5 intentos, bloqueo de 5 min) |

Pruebas ejecutadas en Chromium: registro, hold corto (cancela) y largo (crea pedido), billetera, pago, filtro de pedidos, flujo del maestro con código incorrecto y correcto, escritorio y móvil, sin errores en consola.
No probado: Safari/iOS, Firefox, lectores de pantalla ni dispositivos táctiles reales.
