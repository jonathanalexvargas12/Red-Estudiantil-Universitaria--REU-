// Para que se desplieguen los filtros de busqueda

const btnFiltrarBitacora = document.getElementById('btn-filtrar-bitacora');
const filtrosBusquedaBitacora = document.getElementById('filtros-busqueda-bitacora');

btnFiltrarBitacora.addEventListener('click', () => {
    filtrosBusquedaBitacora.classList.toggle('mostrar');
});


// Busqueda y paginacion

document.addEventListener('DOMContentLoaded', () => {
    const tablaBitacora = document.getElementById('tabla-bitacora').getElementsByTagName('tbody')[0];
    const buscarInput = document.querySelector('.buscar-input-bitacora');
    const usuarioSelect = document.querySelector('.filtro-usuario-bitacora');
    const botonBuscar = document.querySelector('.btn-buscar-bitacora');
    const btnReajustar = document.querySelector('.btn-reajustar-bitacora');

    let filasOriginales = Array.from(tablaBitacora.rows);

    function guardarFilasOriginales() {
        filasOriginales = Array.from(tablaBitacora.rows).map(row => row.cloneNode(true));
    }

    guardarFilasOriginales();

    function filtrarTabla() {
        const textoBusqueda = buscarInput.value.toLowerCase();
        const usuarioSeleccionado = usuarioSelect.value.toLowerCase();

        tablaBitacora.innerHTML = '';

        filasOriginales.forEach(fila => {
            const fecha = fila.cells[1].textContent.toLowerCase();
            const hora = fila.cells[2].textContent.toLowerCase();
            const ip = fila.cells[3].textContent.toLowerCase();
            const usuario = fila.cells[4].textContent.toLowerCase();
            const accion = fila.cells[5].textContent.toLowerCase();

            const coincideBusqueda = textoBusqueda === '' ||
                                     fecha.includes(textoBusqueda) ||
                                     hora.includes(textoBusqueda) ||
                                     ip.includes(textoBusqueda) ||
                                     usuario.includes(textoBusqueda) ||
                                     accion.includes(textoBusqueda);
            const coincideUsuario = usuarioSeleccionado === '' || usuarioSeleccionado === 'todos' || usuario.includes(usuarioSeleccionado);

            if (coincideBusqueda && coincideUsuario) {
                tablaBitacora.appendChild(fila.cloneNode(true));
            }
        });

        actualizarPaginacion();
        asignarEventosPDF(); // Reasignar eventos después de filtrar
    }

    botonBuscar.addEventListener('click', filtrarTabla);

    btnReajustar.addEventListener('click', () => {
        buscarInput.value = '';
        usuarioSelect.selectedIndex = 0;
        tablaBitacora.innerHTML = '';
        filasOriginales.forEach(fila => tablaBitacora.appendChild(fila.cloneNode(true)));
        actualizarPaginacion(); // Reiniciar la paginación después de reajustar
        asignarEventosPDF(); // Reasignar eventos después de reajustar
    });

    // Para que la paginación del CRUD funcione y se muestre de 5 filas en 5 filas
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual
    let totalRows = 0; // Total de filas
    let totalPages = 0; // Total de páginas

    function updateRowCount() {
        totalRows = tablaBitacora.rows.length; // Total de filas
        totalPages = Math.ceil(totalRows / rowsPerPage); // Total de páginas
    }

    function displayRows(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // Ocultar todas las filas
        for (let i = 0; i < tablaBitacora.rows.length; i++) {
            tablaBitacora.rows[i].style.display = 'none';
        }

        // Mostrar solo las filas de la página actual
        for (let i = start; i < end && i < totalRows; i++) {
            tablaBitacora.rows[i].style.display = '';
        }

        // Actualizar la información de paginación
        document.querySelector('.info-paginacion-bitacora').textContent = `${start + 1}-${Math.min(end, totalRows)} de ${totalRows}`;
    }

    function updatePaginationButtons() {
        const prevButton = document.querySelector('.pagina-anterior-bitacora');
        const nextButton = document.querySelector('.pagina-siguiente-bitacora');
        const pageButtonsContainer = document.querySelector('.numeros-pagina-bitacora');

        // Habilitar o deshabilitar el botón anterior
        prevButton.disabled = currentPage === 1;

        // Habilitar o deshabilitar el botón siguiente
        nextButton.disabled = currentPage === totalPages;

        // Limpiar los botones de página existentes
        pageButtonsContainer.innerHTML = '';

        // Crear botones de página dinámicamente
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.classList.add('numero-pagina-bitacora');
            button.textContent = i;
            button.classList.toggle('activo', i === currentPage); // Marcar el botón activo

            // Agregar evento de clic para cambiar de página
            button.addEventListener('click', () => {
                currentPage = i;
                displayRows(currentPage);
                updatePaginationButtons();
            });

            pageButtonsContainer.appendChild(button);
        }
    }

    function actualizarPaginacion() {
        updateRowCount(); // Actualizar el conteo de filas
        currentPage = 1; // Reiniciar a la primera página
        displayRows(currentPage); // Mostrar las filas de la primera página
        updatePaginationButtons(); // Actualizar los botones de paginación
    }

    document.querySelector('.pagina-anterior-bitacora').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    document.querySelector('.pagina-siguiente-bitacora').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRows(currentPage);
            updatePaginationButtons();
        }
    });

    // Inicializar la paginación
    actualizarPaginacion();
});

function asignarEventosPDF() {
    // Asignar eventos a los botones de generar PDF
    const pdfIcons = document.querySelectorAll('.pdf-icono-bitacora');
    pdfIcons.forEach(icon => {
        icon.removeEventListener('click', handleGenerarPDF); // Eliminar eventos anteriores
        icon.addEventListener('click', handleGenerarPDF); // Reasignar eventos
    });

    function handleGenerarPDF(event) {
        const fila = event.target.closest('tr');
        const datosFila = {
            fecha: fila.cells[1].textContent,
            hora: fila.cells[2].textContent,
            ip: fila.cells[3].textContent,
            usuario: fila.cells[4].textContent,
            accion: fila.cells[5].textContent
        };
        console.log('Generar PDF para:', datosFila);
        // Aquí puedes implementar la lógica para generar el PDF
        alert(`Generando PDF para la acción: ${datosFila.accion}`);
    }
}

// Llamar a la función para asignar eventos inicialmente
asignarEventosPDF();