// Servidor local minimo para probar Camello. Solo desarrollo, no para produccion.
// Uso: node servidor.js [puerto]   (por defecto 8099)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = Number(process.argv[2] || process.env.PORT || 8099);
const RAIZ = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.bat': 'text/plain; charset=utf-8'
};

http.createServer((req, res) => {
  let ruta = decodeURIComponent((req.url || '/').split('?')[0]);
  if (ruta === '/' || ruta === '') ruta = '/index.html';
  const archivo = path.normalize(path.join(RAIZ, ruta));
  if (archivo !== RAIZ && !archivo.startsWith(RAIZ + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Prohibido');
  }
  fs.readFile(archivo, (err, datos) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('No encontrado: ' + ruta);
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(archivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(datos);
  });
}).listen(PUERTO, '127.0.0.1', () => {
  console.log('Camello sirviendo ' + RAIZ);
  console.log('Abre: http://127.0.0.1:' + PUERTO + '/');
});
