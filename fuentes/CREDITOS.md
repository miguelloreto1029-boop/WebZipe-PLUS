# Fuentes · Camello

Todas las fuentes son **OFL 1.1** y están **autohospedadas** (WOFF2). No hay ninguna
petición a Google Fonts ni a ningún CDN: la CSP del proyecto es `font-src 'self'`.

| Familia | Uso | Pesos | Licencia | Origen |
|---|---|---|---|---|
| **Apfel Grotezk** | Display / marca | 400 · 500 · 600 · 700 · 900 | SIL OFL 1.1 | Collletttivo (Luigi Gorlero) |
| **Mona Sans** | UI, cuerpo, titulares | 300 · 400 · 500 · 600 · 700 · 800 + itálicas 400/700 | SIL OFL 1.1 | GitHub + Degarism |
| **Mona Sans Mono** | Datos, precios, estados | variable 100–900 | SIL OFL 1.1 | GitHub + Degarism |

## Por qué estas y no otras

- **Apfel Grotezk** es redondeada y aérea: es la voz que mejor se aproxima al logotipo
  oficial (sans redondeada, gruesa, amable) sin usar una fuente de Google.
- **Mona Sans** es una grotesca industrial variable: sostiene toda la interfaz con carácter
  y sin ruido, y su eje variable permite jerarquía fina sin cargar más archivos.
- **Mona Sans Mono** da el tono de telemetría a precios, códigos y estados, y pertenece a la
  misma familia, así que el sistema es coherente.

## Descartadas con criterio

- **Fontshare** (Satoshi, Clash Display, Sentient, Boska, Azeret Mono): su licencia
  **ITF Free Font License** prohíbe alojar o servir los archivos de fuente a terceros
  («You may not host, serve, embed…»). En GitHub Pages los archivos los sirve el sitio,
  por lo que autohospedarlos infringiría la licencia. Servirlos por la API de Fontshare
  rompería la CSP y la promesa de «sin dependencias externas».
- **Google Fonts** (Nunito, Quicksand, Varela Round, Archivo, Fraunces, DM Mono, etc.):
  prohibidas por encargo.

## Créditos y licencias

- Apfel Grotezk — Copyright © Collletttivo y Luigi Gorlero. SIL Open Font License 1.1.
  Licencia completa en `LICENSE-ApfelGrotezk.txt`.
- Mona Sans y Mona Sans Mono — Copyright © GitHub, Inc. SIL Open Font License 1.1.
  Licencia completa en `LICENSE-MonaSans.txt`.

La OFL permite usar, modificar y redistribuir las fuentes, con la condición de incluir la
licencia y no vender los archivos por separado. Se añade `CREDITOS.md` al paquete.

## Archivos

```
ApfelGrotezk-Regular.woff2   400
ApfelGrotezk-Mittel.woff2    500
ApfelGrotezk-Brukt.woff2     600
ApfelGrotezk-Fett.woff2      700
ApfelGrotezk-Satt.woff2      900
MonaSans-Light.woff2         300
MonaSans-Regular.woff2       400
MonaSans-Medium.woff2        500
MonaSans-SemiBold.woff2      600
MonaSans-Bold.woff2          700
MonaSans-ExtraBold.woff2     800
MonaSans-Italic.woff2        400 italic
MonaSans-BoldItalic.woff2    700 italic
MonaSansMonoVF.woff2         variable 100–900
```

Los WOFF2 de Mona Sans están subconjuntados a latin / latin-ext / puntuación / flechas /
símbolos usados por la app (≈26 KB por peso) para mantener la carga por debajo de ~320 KB
en total. Si algún carácter falta, regenerar la subconjunto con `fonttools subset`.
