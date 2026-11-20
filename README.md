# Camello · app única de prueba

Una sola app con las **tres interfaces** de la prueba: cristal líquido,
brutalista y bento. Se cambia entre ellas con el botón flotante (el icono de
rodillo) sin recargar y sin tocar los datos.

Entra con la cuenta de ejemplo (**Marta Ruiz**) y los datos de muestra:
pedidos, cupones, maestros, lugares y chat. No necesita servidor ni internet.

## Las tres interfaces

| Nombre | Qué se ve |
|---|---|
| **Cristal líquido** | Vidrio esmerilado sobre ámbar profundo, con formas que respiran |
| **Brutalista** | Cajas duras, borde negro, sombras planas, tipografía enorme |
| **Bento** | Retícula de celdas de colores sobre contenedor oscuro |

La elección se guarda en el navegador (`localStorage`), así que al volver a
abrir la app se mantiene la interfaz elegida.

## Estructura

```
index.html            Tres hojas de identidad cargadas, una activa
css/app.css           Estilos base (estructura y componentes)
css/motion.css        Animaciones
css/cristal.css  }
css/brutal.css   }    Las tres identidades visuales
css/bento.css    }
css/interruptor.css   Botón y hoja de cambio de interfaz
css/movil.css          Optimización automática (solo actúa en táctil)
js/AppOptimizer.js     Núcleo: detecta el dispositivo y da las utilidades
js/tema.js            Deja activa la interfaz guardada antes de pintar
js/interruptor.js     El botón y la hoja de selección
js/...                La app (backend y lógica reales)
```

## Optimización y detección de dispositivo

`js/AppOptimizer.js` se carga en el `<head>` y detecta si se entra desde un
**celular**, una **tablet** o una **computadora** (puntero grueso/fino, puntos
táctiles, tamaño de pantalla y agente; no solo el User-Agent). Marca el
documento con la clase `celular`, `tablet` o `computadora` antes de pintar, y
la cambia si se gira el dispositivo o se redimensiona la ventana.

Con la clase, `css/movil.css` apaga lo que cuesta caro en táctil: el líquido
animado con desenfoque, el `backdrop-filter` de cada tarjeta y las sombras
abiertas. En `computadora` no cambia nada. También respeta
`prefers-reduced-motion`.

El mismo archivo expone `window.CamelloOpt`, que es lo que usa la app para no
trabarse:

| Utilidad | Para qué |
|---|---|
| `debounce` | La búsqueda espera 280 ms (120 en computadora) antes de consultar |
| `carril` | Una búsqueda vieja no pisa a la nueva cuando se sigue escribiendo |
| `cachear` / `olvidar` | La misma consulta no se repite y los datos se reusan |
| `pintarSiCambia` | Solo se toca el DOM cuando el contenido cambió de verdad |
| `conEsqueleto` | El esqueleto sale solo si la carga tarda; no parpadea |
| `config.pagina` | Listas paginadas: 8 en celular, 12 en tablet, 20 en computadora |
| `config.vivoMs` | Cada cuánto se repinta lo que depende del tiempo |
| `oculto` | Con la pestaña guardada no se consulta ni se repinta |
| `imagenesPerezosas` | `loading="lazy"` y `decoding="async"` |

La app de prueba tampoco sale a internet: las direcciones se confirman en el
mapa dibujado y el mapa de seguimiento no descarga teselas de OpenStreetMap.
