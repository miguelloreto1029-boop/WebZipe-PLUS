/**
 * Movimiento: cifras que suben y revelado de bloques.
 * No toca el modelo: solo cómo se muestra.
 */

/** Pinta un texto (normalmente dinero) como columnas de dígitos que suben. */
export function rodar(el, texto) {
  if (!el) return;
  el.setAttribute('aria-label', texto);
  const fijar = () =>
    [...el.children].forEach((w) => {
      const c = w.firstElementChild;
      if (c && c.classList.contains('col')) c.style.transform = `translateY(-${texto[Number(w.dataset.i)]}em)`;
      else w.textContent = texto[Number(w.dataset.i)];
    });
  if (el.children.length !== texto.length) {
    el.replaceChildren(
      ...[...texto].map((ch, i) => {
        const w = document.createElement('span');
        w.className = 'rola';
        w.dataset.i = String(i);
        w.setAttribute('aria-hidden', 'true');
        if (/\d/.test(ch)) {
          const c = document.createElement('span');
          c.className = 'col';
          c.innerHTML = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<i>${n}</i>`).join('');
          w.append(c);
        } else w.textContent = ch;
        return w;
      })
    );
    requestAnimationFrame(() => requestAnimationFrame(fijar));
  } else fijar();
}

/** Número con formato de la app, listo para `rodar`. */
export const cifra = (n, dinero) => dinero(Math.round(n));
