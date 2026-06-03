export function renderizarPaginacion({ sufijo, paginaActual, totalPaginas, alCambiarPagina }) {
    const contenedor = document.querySelector(`.numeros-pagina${sufijo}`);
    const btnAnterior = document.querySelector(`.pagina-anterior${sufijo}`);
    const btnSiguiente = document.querySelector(`.pagina-siguiente${sufijo}`);

    if (!contenedor || !btnAnterior || !btnSiguiente) return;

    btnAnterior.disabled = paginaActual <= 1;
    btnSiguiente.disabled = paginaActual >= totalPaginas;

    contenedor.innerHTML = '';

    const crearBoton = (contenido, irAPagina) => {
        const btn = document.createElement('button');
        btn.classList.add(`numero-pagina${sufijo}`);
        btn.innerHTML = contenido;
        btn.addEventListener('click', () => alCambiarPagina(irAPagina));
        contenedor.appendChild(btn);
        return btn;
    };

    const MAX_VISIBLES = 10;

    // Botón: Primera página
    const btnPrimera = crearBoton('&laquo;', 1);
    btnPrimera.disabled = paginaActual <= 1;
    btnPrimera.title = 'Primera página';

    let inicio = Math.max(1, paginaActual - Math.floor(MAX_VISIBLES / 2));
    let fin = Math.min(totalPaginas, inicio + MAX_VISIBLES - 1);
    if (fin - inicio + 1 < MAX_VISIBLES) {
        inicio = Math.max(1, fin - MAX_VISIBLES + 1);
    }

    for (let i = inicio; i <= fin; i++) {
        const btn = crearBoton(String(i), i);
        btn.classList.toggle('activo', i === paginaActual);
    }

    // Botón: Última página
    const btnUltima = crearBoton('&raquo;', totalPaginas);
    btnUltima.disabled = paginaActual >= totalPaginas;
    btnUltima.title = 'Última página';
}
